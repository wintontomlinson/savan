import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { addToHistory, getNextSongs, resetPlayed } from '../data/algorithm';
import { refreshStreamUrl, downloadSong } from '../data/api';

const Ctx = createContext();
export const usePlayer = () => useContext(Ctx);

/* Headroom kept before the EQ so boosted bands cannot clip.
   The output stage multiplies it back so 100% output == unity gain. */
const PREAMP = 0.8;
const UNITY_GAIN = 1 / PREAMP;

const EQ_FREQS = [31, 63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

function getCrossfadeSec() {
  try {
    return parseInt(localStorage.getItem('crossfade_dur'), 10) || 0;
  } catch {
    return 0;
  }
}

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

export function PlayerProvider({ children }) {
  const audioA = useRef(null);
  const audioB = useRef(null);
  const activeRef = useRef('A');
  const fadingRef = useRef(false);
  const fadeTimerRef = useRef(null);
  const queueRef = useRef([]);
  const volumeRef = useRef(1.0);
  const historyStack = useRef([]);
  const playNextRef = useRef(null);
  const playPrevRef = useRef(null);
  const currentSongRef = useRef(null);
  const errorHandlingRef = useRef(false);

  const [currentSong, setCurrentSong] = useState(null);
  const [queue, _setQueue] = useState([]);
  const [upNext, setUpNext] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, _setVolume] = useState(1.0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shuffleMode, setShuffle] = useState(false);
  const [repeatMode, setRepeat] = useState('none');
  const [isExpanded, setExpanded] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const [likedSongs, setLikedSongs] = useState(() => readJson('liked', []));
  const [downloadedSongs, setDownloadedSongs] = useState(() => readJson('downloads', []));
  const [toasts, setToasts] = useState([]);

  const cur = () => (activeRef.current === 'A' ? audioA.current : audioB.current);

  const setQueue = (updater) => {
    _setQueue((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      queueRef.current = next;
      return next;
    });
  };

  const setVolume = useCallback((v) => {
    const val = Math.max(0, Math.min(1, v));
    _setVolume(val);
    volumeRef.current = val;
    const a = activeRef.current === 'A' ? audioA.current : audioB.current;
    if (a) a.volume = val;
  }, []);

  /* ---------------- Web Audio chain (EQ + output stage) ---------------- */

  const audioCtxRef = useRef(null);
  const preampRef = useRef(null);
  const gainRef = useRef(null);
  const eqFiltersRef = useRef([]);
  const enhancedRef = useRef(false);
  const [boostLevel, setBoostLevel] = useState(100);

  const initEnhancement = useCallback(() => {
    if (enhancedRef.current) return true;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC || !audioA.current || !audioB.current) return false;

      const ctx = new AC();
      audioCtxRef.current = ctx;

      preampRef.current = ctx.createGain();
      preampRef.current.gain.value = PREAMP;

      gainRef.current = ctx.createGain();
      gainRef.current.gain.value = UNITY_GAIN * (boostLevel / 100);

      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -14;
      compressor.knee.value = 18;
      compressor.ratio.value = 6;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.25;

      eqFiltersRef.current = EQ_FREQS.map((freq, i) => {
        const filter = ctx.createBiquadFilter();
        if (i === 0) filter.type = 'lowshelf';
        else if (i === EQ_FREQS.length - 1) filter.type = 'highshelf';
        else filter.type = 'peaking';
        filter.frequency.value = freq;
        filter.Q.value = i === 0 || i === EQ_FREQS.length - 1 ? 0.7 : 1.2;
        filter.gain.value = 0;
        return filter;
      });

      ctx.createMediaElementSource(audioA.current).connect(preampRef.current);
      ctx.createMediaElementSource(audioB.current).connect(preampRef.current);

      let node = eqFiltersRef.current[0];
      preampRef.current.connect(node);
      for (let i = 1; i < eqFiltersRef.current.length; i++) {
        node.connect(eqFiltersRef.current[i]);
        node = eqFiltersRef.current[i];
      }
      node.connect(compressor);
      compressor.connect(gainRef.current);
      gainRef.current.connect(ctx.destination);

      if (ctx.state === 'suspended') ctx.resume();
      enhancedRef.current = true;
      return true;
    } catch {
      return false;
    }
  }, [boostLevel]);

  const setVolumeBoost = useCallback(
    (pct) => {
      const safe = Math.max(0, Math.min(200, pct));
      setBoostLevel(safe);
      const a = activeRef.current === 'A' ? audioA.current : audioB.current;

      if (safe > 100) {
        if (!enhancedRef.current && !initEnhancement()) return;
        _setVolume(1);
        volumeRef.current = 1;
        if (a) a.volume = 1;
        if (gainRef.current) gainRef.current.gain.value = UNITY_GAIN * (safe / 100);
        return;
      }

      const val = safe / 100;
      _setVolume(val);
      volumeRef.current = val;
      if (a) a.volume = val;
      if (gainRef.current) gainRef.current.gain.value = UNITY_GAIN;
    },
    [initEnhancement],
  );

  const setEqBand = useCallback(
    (bandIndex, gainDb) => {
      if (!enhancedRef.current && !initEnhancement()) return;
      const filter = eqFiltersRef.current[bandIndex];
      if (filter) filter.gain.value = gainDb;
    },
    [initEnhancement],
  );

  const applyEqPreset = useCallback(
    (gains) => {
      if (!enhancedRef.current && !initEnhancement()) return;
      const now = audioCtxRef.current?.currentTime || 0;
      eqFiltersRef.current.forEach((filter, i) => {
        if (!filter) return;
        filter.gain.cancelScheduledValues(now);
        filter.gain.setTargetAtTime(gains[i] ?? 0, now, 0.06);
      });
    },
    [initEnhancement],
  );

  const resetAudio = useCallback(() => {
    setBoostLevel(100);
    _setVolume(1);
    volumeRef.current = 1;
    if (audioA.current) audioA.current.volume = 1;
    if (audioB.current) audioB.current.volume = 1;
    if (gainRef.current) gainRef.current.gain.value = UNITY_GAIN;
    eqFiltersRef.current.forEach((f) => {
      if (f) f.gain.value = 0;
    });
  }, []);

  /* ---------------- Audio element wiring ---------------- */

  useEffect(() => {
    audioA.current = new Audio();
    audioB.current = new Audio();
    [audioA.current, audioB.current].forEach((a) => {
      a.crossOrigin = 'anonymous';
      a.preload = 'auto';
    });
    audioA.current.volume = volumeRef.current;
    audioB.current.volume = 0;

    const onTime = () => {
      const a = cur();
      if (!a || !a.duration) return;
      setCurrentTime(a.currentTime);

      const cf = getCrossfadeSec();
      const left = a.duration - a.currentTime;
      if (cf > 0 && a.duration > cf + 3 && left <= cf && left > 0.3 && !fadingRef.current && queueRef.current.length > 0) {
        startCrossfade();
      }
    };
    const onMeta = () => setDuration(cur()?.duration || 0);
    const onEnd = () => {
      if (!fadingRef.current) playNextRef.current?.();
    };
    const onError = async (e) => {
      if ((e.target || e.currentTarget) !== cur()) return;
      const songAtError = currentSongRef.current;
      await new Promise((r) => setTimeout(r, 1000));
      if (currentSongRef.current !== songAtError) return;

      const a = cur();
      const song = currentSongRef.current;
      if (!a?.src || !song) return;
      if (a.error && a.error.code === 1) return;
      if (errorHandlingRef.current) return;
      errorHandlingRef.current = true;
      try {
        const freshUrl = await refreshStreamUrl(song.id);
        if (currentSongRef.current !== song) return;
        if (freshUrl && freshUrl !== a.src) {
          a.src = freshUrl;
          a.load();
          a.play().catch(() => {});
        } else {
          playNextRef.current?.();
        }
      } finally {
        setTimeout(() => {
          errorHandlingRef.current = false;
        }, 2000);
      }
    };

    [audioA.current, audioB.current].forEach((a) => {
      a.addEventListener('timeupdate', onTime);
      a.addEventListener('loadedmetadata', onMeta);
      a.addEventListener('ended', onEnd);
      a.addEventListener('error', onError);
    });

    return () => {
      audioA.current?.pause();
      audioB.current?.pause();
      if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    currentSongRef.current = currentSong;
  }, [currentSong]);

  useEffect(() => {
    try {
      localStorage.setItem('liked', JSON.stringify(likedSongs));
    } catch {}
  }, [likedSongs]);

  useEffect(() => {
    try {
      localStorage.setItem('downloads', JSON.stringify(downloadedSongs));
    } catch {}
  }, [downloadedSongs]);

  useEffect(() => {
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
  }, [isPlaying]);

  useEffect(() => {
    if ('mediaSession' in navigator && duration > 0) {
      try {
        navigator.mediaSession.setPositionState({
          duration,
          playbackRate: 1,
          position: Math.min(currentTime, duration),
        });
      } catch {}
    }
  }, [currentTime, duration]);

  /* Metadata + related-song prefetch whenever the track changes */
  useEffect(() => {
    if (!currentSong) {
      document.title = 'Music Area';
      return;
    }

    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.title || 'Unknown',
        artist: currentSong.artist || 'Unknown',
        album: currentSong.album || '',
        artwork: [{ src: currentSong.thumbnail, sizes: '512x512', type: 'image/jpeg' }],
      });
      navigator.mediaSession.setActionHandler('play', () => {
        const a = cur();
        if (a?.src) a.play().then(() => setIsPlaying(true)).catch(() => {});
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        const a = cur();
        if (a) {
          a.pause();
          setIsPlaying(false);
        }
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => playPrevRef.current?.());
      navigator.mediaSession.setActionHandler('nexttrack', () => playNextRef.current?.());
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime == null) return;
        const a = cur();
        if (a) {
          a.currentTime = details.seekTime;
          setCurrentTime(details.seekTime);
        }
      });
    }

    document.title = `${currentSong.title} · ${currentSong.artist} — Music Area`;

    let cancelled = false;
    getNextSongs(currentSong).then((songs) => {
      if (cancelled) return;
      const existing = new Set([currentSong.id, ...queueRef.current.map((s) => s.id)]);
      const seen = new Set();
      const deduped = songs.filter((s) => {
        if (existing.has(s.id) || seen.has(s.id)) return false;
        seen.add(s.id);
        return true;
      });
      setUpNext(deduped);
      if (queueRef.current.length === 0) setQueue(deduped);
    });
    return () => {
      cancelled = true;
    };
  }, [currentSong]);

  /* ---------------- Crossfade ---------------- */

  function startCrossfade() {
    if (fadingRef.current) return;
    const q = queueRef.current;
    const nextSong = q[0];
    if (!nextSong?.audio) return;
    fadingRef.current = true;

    const outgoing = cur();
    const incoming = activeRef.current === 'A' ? audioB.current : audioA.current;

    incoming.src = nextSong.audio;
    incoming.volume = 0;
    incoming.play().catch(() => {});

    const steps = 30;
    const ms = (getCrossfadeSec() * 1000) / steps;
    const vol = volumeRef.current;
    let step = 0;

    if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);
    fadeTimerRef.current = setInterval(() => {
      step++;
      const pct = step / steps;
      outgoing.volume = Math.max(0, vol * (1 - pct));
      incoming.volume = Math.min(vol, vol * pct);

      if (step < steps) return;

      clearInterval(fadeTimerRef.current);
      fadeTimerRef.current = null;
      outgoing.pause();
      outgoing.src = '';
      incoming.volume = vol;
      activeRef.current = activeRef.current === 'A' ? 'B' : 'A';
      fadingRef.current = false;

      setQueue((prev) => prev.slice(1));
      historyStack.current.push(currentSongRef.current);
      setCurrentSong(nextSong);
      setCurrentTime(incoming.currentTime);
      setDuration(incoming.duration || 0);
      addToHistory(nextSong);
    }, ms);
  }

  function cancelFade() {
    if (fadeTimerRef.current) {
      clearInterval(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
    fadingRef.current = false;
  }

  function playDirect(song, { pushHistory = true } = {}) {
    if (!song) return;
    cancelFade();
    errorHandlingRef.current = false;
    if (enhancedRef.current && audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
    if (pushHistory && currentSongRef.current) historyStack.current.push(currentSongRef.current);

    audioA.current.pause();
    audioA.current.src = '';
    audioB.current.pause();
    audioB.current.src = '';
    activeRef.current = 'A';

    setCurrentSong(song);
    setCurrentTime(0);
    setDuration(song.duration || 0);
    addToHistory(song);

    if (!song.audio) {
      setIsPlaying(false);
      return;
    }
    const a = audioA.current;
    a.src = song.audio;
    a.volume = volumeRef.current;
    setIsPlaying(true);
    a.play().catch(() => setIsPlaying(false));
  }

  /* ---------------- Public actions ---------------- */

  const showToast = useCallback((msg, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3000);
  }, []);

  const dismissToast = useCallback((id) => setToasts((p) => p.filter((t) => t.id !== id)), []);

  const playSong = useCallback((song, newQueue) => {
    if (!song) return;
    if (newQueue?.length) {
      const seen = new Set([song.id]);
      setQueue(
        newQueue.filter((s) => {
          if (seen.has(s.id)) return false;
          seen.add(s.id);
          return true;
        }),
      );
    }
    playDirect(song);
  }, []);

  const playShuffled = useCallback(
    (list) => {
      if (!list?.length) return;
      const shuffled = [...list].sort(() => Math.random() - 0.5);
      setShuffle(true);
      playSong(shuffled[0], shuffled);
    },
    [playSong],
  );

  const togglePlay = useCallback(() => {
    if (!currentSong) return;
    if (enhancedRef.current && audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
    const a = cur();
    if (isPlaying) {
      a?.pause();
      setIsPlaying(false);
      return;
    }
    a?.play()
      .then(() => setIsPlaying(true))
      .catch(() => {
        if (!currentSong.audio || !a) return;
        a.src = currentSong.audio;
        a.volume = volumeRef.current;
        a.play().then(() => setIsPlaying(true)).catch(() => {});
      });
  }, [currentSong, isPlaying]);

  const playNext = useCallback(async () => {
    cancelFade();
    if (repeatMode === 'one') {
      const a = cur();
      if (a) {
        a.currentTime = 0;
        a.play().catch(() => {});
      }
      return;
    }

    const q = queueRef.current;
    if (q.length > 0) {
      const idx = shuffleMode ? Math.floor(Math.random() * q.length) : 0;
      const next = q[idx];
      setQueue((prev) => prev.filter((_, i) => i !== idx));
      playDirect(next);
      return;
    }

    const song = currentSongRef.current;
    if (song) {
      const fresh = (await getNextSongs(song)).filter((s) => s.id !== song.id);
      if (fresh.length > 0) {
        setQueue(fresh.slice(1));
        setUpNext(fresh);
        playDirect(fresh[0]);
        return;
      }
      resetPlayed();
      const retry = (await getNextSongs(song)).filter((s) => s.id !== song.id);
      if (retry.length > 0) {
        setQueue(retry.slice(1));
        setUpNext(retry);
        playDirect(retry[0]);
        return;
      }
    }
    setIsPlaying(false);
  }, [shuffleMode, repeatMode]);

  useEffect(() => {
    playNextRef.current = playNext;
  }, [playNext]);

  const playPrev = useCallback(() => {
    const a = cur();
    if (currentTime > 3 && a) {
      a.currentTime = 0;
      setCurrentTime(0);
      return;
    }
    const prev = historyStack.current.pop();
    if (!prev) {
      if (a) {
        a.currentTime = 0;
        setCurrentTime(0);
      }
      return;
    }
    if (currentSongRef.current) setQueue((p) => [currentSongRef.current, ...p]);
    playDirect(prev, { pushHistory: false });
  }, [currentTime]);

  useEffect(() => {
    playPrevRef.current = playPrev;
  }, [playPrev]);

  const seekTo = useCallback((t) => {
    const a = cur();
    if (!a) return;
    a.currentTime = t;
    setCurrentTime(t);
  }, []);

  const toggleShuffle = useCallback(() => setShuffle((p) => !p), []);
  const cycleRepeat = useCallback(
    () => setRepeat((p) => (p === 'none' ? 'all' : p === 'all' ? 'one' : 'none')),
    [],
  );

  const addToQueue = useCallback(
    (song) => {
      setQueue((p) => (p.some((s) => s.id === song.id) ? p : [...p, song]));
      showToast(`Added "${song.title}" to queue`);
    },
    [showToast],
  );
  const playNextInQueue = useCallback(
    (song) => {
      setQueue((p) => [song, ...p.filter((s) => s.id !== song.id)]);
      showToast('Playing next');
    },
    [showToast],
  );
  const removeFromQueue = useCallback((idx) => setQueue((p) => p.filter((_, i) => i !== idx)), []);
  const clearQueue = useCallback(() => {
    setQueue([]);
    showToast('Queue cleared');
  }, [showToast]);

  const toggleLike = useCallback((song) => {
    const id = typeof song === 'string' ? song : song?.id;
    if (!id) return;
    const full = typeof song === 'object' ? song : currentSongRef.current?.id === id ? currentSongRef.current : null;

    setLikedSongs((prev) => {
      const has = prev.includes(id);
      const saved = readJson('ma_liked_songs', []);
      try {
        if (has) {
          localStorage.setItem('ma_liked_songs', JSON.stringify(saved.filter((s) => s.id !== id)));
        } else if (full) {
          localStorage.setItem('ma_liked_songs', JSON.stringify([full, ...saved.filter((s) => s.id !== id)].slice(0, 300)));
        }
      } catch {}
      return has ? prev.filter((x) => x !== id) : [...prev, id];
    });
  }, []);

  const downloadToDevice = useCallback(
    async (song) => {
      if (!song) return false;
      showToast(`Downloading "${song.title}"…`);
      try {
        const ok = await downloadSong(song);
        showToast(ok ? `Saved "${song.title}"` : 'Download failed — try again', ok ? 'success' : 'error');
        return ok;
      } catch {
        showToast('Download failed — try again', 'error');
        return false;
      }
    },
    [showToast],
  );

  const toggleDownload = useCallback(
    (song) => {
      const id = typeof song === 'string' ? song : song?.id;
      if (!id) return;
      const full = typeof song === 'object' ? song : currentSongRef.current?.id === id ? currentSongRef.current : null;

      setDownloadedSongs((prev) => {
        const has = prev.includes(id);
        const saved = readJson('ma_downloaded_songs', []);
        try {
          if (has) {
            localStorage.setItem('ma_downloaded_songs', JSON.stringify(saved.filter((s) => s.id !== id)));
          } else if (full) {
            localStorage.setItem(
              'ma_downloaded_songs',
              JSON.stringify([full, ...saved.filter((s) => s.id !== id)].slice(0, 300)),
            );
            downloadToDevice(full);
          }
        } catch {}
        return has ? prev.filter((x) => x !== id) : [...prev, id];
      });
    },
    [downloadToDevice],
  );

  return (
    <Ctx.Provider
      value={{
        // state
        currentSong,
        queue,
        upNext,
        isPlaying,
        volume,
        boostLevel,
        currentTime,
        duration,
        shuffleMode,
        repeatMode,
        isExpanded,
        queueOpen,
        likedSongs,
        downloadedSongs,
        toasts,
        // transport
        playSong,
        playShuffled,
        togglePlay,
        playNext,
        playPrev,
        seekTo,
        toggleShuffle,
        cycleRepeat,
        // audio
        setVolume,
        setVolumeBoost,
        setEqBand,
        applyEqPreset,
        resetAudio,
        // queue
        addToQueue,
        playNextInQueue,
        removeFromQueue,
        clearQueue,
        // library
        toggleLike,
        toggleDownload,
        downloadToDevice,
        // ui
        setExpanded,
        setQueueOpen,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
