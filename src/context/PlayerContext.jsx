import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { addToHistory, getNextSongs, resetPlayed } from '../data/algorithm';
import { refreshStreamUrl } from '../data/api';

const Ctx = createContext();
export const usePlayer = () => useContext(Ctx);

function getCfSec() { try { return parseInt(localStorage.getItem('crossfade_dur')) || 5; } catch { return 5; } }

export function PlayerProvider({ children }) {
  const audioA = useRef(null);
  const audioB = useRef(null);
  const activeRef = useRef('A');
  const fadingRef = useRef(false);
  const fadeTimerRef = useRef(null);
  const queueRef = useRef([]); // Always fresh queue
  const volumeRef = useRef(1.0);

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
  const [likedSongs, setLikedSongs] = useState(() => { try { return JSON.parse(localStorage.getItem('liked')) || []; } catch { return []; } });
  const [toasts, setToasts] = useState([]);

  // Keep queueRef in sync
  const setQueue = (updater) => {
    _setQueue(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      queueRef.current = next;
      return next;
    });
  };

  const setVolume = useCallback(v => {
    const val = Math.max(0, Math.min(1, v));
    _setVolume(val);
    volumeRef.current = val;
    const a = activeRef.current === 'A' ? audioA.current : audioB.current;
    if (a) a.volume = val;
    // If audio enhancement active, also update gain
    if (gainRef.current && val === 1) {
      // Volume at max, gain handles boost
    }
  }, []);

  // ─── Audio Enhancement (EQ + Volume Boost) ───
  const audioCtxRef = useRef(null);
  const gainRef = useRef(null);
  const eqFiltersRef = useRef([]);
  const enhancedRef = useRef(false);
  const [boostLevel, setBoostLevel] = useState(100);

  // Initialize audio processing chain (called on user action only)
  const initEnhancement = useCallback(() => {
    if (enhancedRef.current) return true;
    try {
      const a = cur();
      if (!a) return false;
      
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;

      // Save current playback state
      const wasPlaying = !a.paused;
      const savedTime = a.currentTime;
      const savedSrc = a.src;
      
      // crossOrigin must be set BEFORE src is loaded
      // If audio is already playing, we need to reload it
      const needsReload = !!a.src;
      
      audioA.current.crossOrigin = 'anonymous';
      audioB.current.crossOrigin = 'anonymous';
      
      // If audio was playing, we need to reload with CORS
      if (needsReload && savedSrc) {
        a.src = savedSrc;
        a.load();
      }
      
      audioCtxRef.current = new AC();
      
      // Create gain node (for volume boost up to 200%)
      gainRef.current = audioCtxRef.current.createGain();
      gainRef.current.gain.value = boostLevel / 100;
      
      // Create 10-band EQ (professional studio frequencies)
      const freqs = [31, 63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
      eqFiltersRef.current = freqs.map((freq, i) => {
        const filter = audioCtxRef.current.createBiquadFilter();
        if (i === 0) filter.type = 'lowshelf';
        else if (i === freqs.length - 1) filter.type = 'highshelf';
        else filter.type = 'peaking';
        filter.frequency.value = freq;
        filter.Q.value = i === 0 || i === freqs.length - 1 ? 0.7 : 1.2;
        filter.gain.value = 0;
        return filter;
      });
      
      // Connect chain: source → eq filters → gain → destination
      const sourceA = audioCtxRef.current.createMediaElementSource(audioA.current);
      const sourceB = audioCtxRef.current.createMediaElementSource(audioB.current);
      
      let prevNode = eqFiltersRef.current[0];
      sourceA.connect(prevNode);
      sourceB.connect(prevNode);
      for (let i = 1; i < eqFiltersRef.current.length; i++) {
        prevNode.connect(eqFiltersRef.current[i]);
        prevNode = eqFiltersRef.current[i];
      }
      prevNode.connect(gainRef.current);
      gainRef.current.connect(audioCtxRef.current.destination);
      
      // Resume AudioContext
      if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
      
      // Restore playback
      if (needsReload && savedSrc) {
        a.currentTime = savedTime;
        if (wasPlaying) {
          // Small delay to let CORS reload complete
          setTimeout(() => { a.play().catch(() => {}); }, 200);
        }
      }
      
      enhancedRef.current = true;
      return true;
    } catch (e) {
      console.warn('Audio enhancement failed:', e);
      return false;
    }
  }, [boostLevel]);

  // Set volume boost (0-200%)
  const setVolumeBoost = useCallback((pct) => {
    setBoostLevel(pct);
    
    if (pct > 100) {
      // Need AudioContext for boost beyond 100%
      if (!enhancedRef.current) {
        const ok = initEnhancement();
        if (!ok) {
          // Fallback — just max out audio.volume
          const a = activeRef.current === 'A' ? audioA.current : audioB.current;
          if (a) a.volume = 1;
          volumeRef.current = 1;
          _setVolume(1);
          return;
        }
      }
      // audio.volume stays at 1, gain amplifies
      const a = activeRef.current === 'A' ? audioA.current : audioB.current;
      if (a) a.volume = 1;
      volumeRef.current = 1;
      _setVolume(1);
      if (gainRef.current) gainRef.current.gain.value = pct / 100;
    } else {
      // 0-100% range
      const val = pct / 100;
      _setVolume(val);
      volumeRef.current = val;
      const a = activeRef.current === 'A' ? audioA.current : audioB.current;
      if (a) a.volume = val;
      if (gainRef.current) gainRef.current.gain.value = 1;
    }
  }, [initEnhancement]);

  // Set EQ band (0-4, gain in dB)
  const setEqBand = useCallback((bandIndex, gainDb) => {
    if (!enhancedRef.current) {
      const ok = initEnhancement();
      if (!ok) return;
    }
    if (eqFiltersRef.current[bandIndex]) {
      eqFiltersRef.current[bandIndex].gain.value = gainDb;
    }
  }, [initEnhancement]);

  // Apply EQ preset
  const applyEqPreset = useCallback((gains) => {
    // gains = [60Hz, 250Hz, 1kHz, 4kHz, 12kHz]
    if (!enhancedRef.current) {
      const ok = initEnhancement();
      if (!ok) return;
    }
    gains.forEach((g, i) => {
      if (eqFiltersRef.current[i]) eqFiltersRef.current[i].gain.value = g;
    });
  }, [initEnhancement]);

  // Bass Boost — pumps 60Hz and 250Hz
  const [bassBoostOn, setBassBoostOn] = useState(false);
  const setBassBoost = useCallback((on) => {
    setBassBoostOn(on);
    if (!enhancedRef.current) {
      const ok = initEnhancement();
      if (!ok) return;
    }
    if (eqFiltersRef.current.length >= 3) {
      eqFiltersRef.current[0].gain.value = on ? 8 : 0;  // 31Hz +8dB
      eqFiltersRef.current[1].gain.value = on ? 6 : 0;  // 63Hz +6dB
      eqFiltersRef.current[2].gain.value = on ? 3 : 0;  // 125Hz +3dB
    }
  }, [initEnhancement]);

  const historyStack = useRef([]);

  const cur = () => activeRef.current === 'A' ? audioA.current : audioB.current;

  // Reset audio settings to defaults
  const resetAudio = useCallback(() => {
    setBoostLevel(100);
    setBassBoostOn(false);
    _setVolume(1.0);
    volumeRef.current = 1.0;
    // Set volume on BOTH audio elements
    if (audioA.current) audioA.current.volume = 1.0;
    if (audioB.current) audioB.current.volume = 1.0;
    // Reset gain to 1 (no amplification, no reduction)
    if (gainRef.current) gainRef.current.gain.value = 1.0;
    // Reset all EQ bands to 0
    if (eqFiltersRef.current.length > 0) {
      eqFiltersRef.current.forEach(f => { f.gain.value = 0; });
    }
    // Reset bass boost filters specifically
    if (enhancedRef.current && eqFiltersRef.current.length >= 3) {
      eqFiltersRef.current[0].gain.value = 0;
      eqFiltersRef.current[1].gain.value = 0;
      eqFiltersRef.current[2].gain.value = 0;
    }
  }, []);

  const playNextRef = useRef(null);
  const playPrevRef = useRef(null);
  const currentSongRef = useRef(null);
  const errorHandlingRef = useRef(false); // Prevent multiple error handlers running

  // Keep currentSongRef always fresh
  useEffect(() => { currentSongRef.current = currentSong; }, [currentSong]);

  // ─── Audio Setup ───
  useEffect(() => {
    audioA.current = new Audio();
    audioB.current = new Audio();
    audioA.current.volume = volumeRef.current;
    audioB.current.volume = 0;

    const onTime = () => {
      const a = cur();
      if (!a || !a.duration) return;
      setCurrentTime(a.currentTime);

      // CROSSFADE CHECK
      const cfSec = getCfSec();
      const left = a.duration - a.currentTime;
      if (cfSec > 0 && a.duration > cfSec + 3 && left <= cfSec && left > 0.3 && !fadingRef.current && queueRef.current.length > 0) {
        startCrossfade();
      }
    };

    const onMeta = () => setDuration(cur()?.duration || 0);
    const onEnd = () => { if (!fadingRef.current && playNextRef.current) playNextRef.current(); };
    const onError = async function(e) {
      const erroredElement = e.target || e.currentTarget;
      // Only care about errors on the ACTIVE audio element
      const activeElement = cur();
      if (erroredElement !== activeElement) return;
      
      const songAtError = currentSongRef.current;
      await new Promise(r => setTimeout(r, 1000));
      if (currentSongRef.current !== songAtError) return;
      
      const a = cur();
      const song = currentSongRef.current;
      if (!a?.src || !song || a.src === '') return;
      if (!a.src.includes('saavncdn.com') && !a.src.includes('.mp4') && !a.src.includes('.m4a')) return;
      if (a.error && a.error.code === 1) return;
      if (errorHandlingRef.current) return;
      errorHandlingRef.current = true;
      console.warn('Audio error, attempting stream URL refresh');
      try {
        const freshUrl = await refreshStreamUrl(song.id);
        if (currentSongRef.current !== song) return;
        if (freshUrl && freshUrl !== a.src) {
          a.src = freshUrl;
          a.load();
          a.play().catch(() => {});
        } else {
          if (playNextRef.current) playNextRef.current();
        }
      } finally {
        setTimeout(() => { errorHandlingRef.current = false; }, 2000);
      }
    };

    [audioA.current, audioB.current].forEach(a => {
      a.addEventListener('timeupdate', onTime);
      a.addEventListener('loadedmetadata', onMeta);
      a.addEventListener('ended', onEnd);
      a.addEventListener('error', onError);
    });

    return () => { audioA.current?.pause(); audioB.current?.pause(); if (fadeTimerRef.current) clearInterval(fadeTimerRef.current); };
  }, []);

  useEffect(() => { try { localStorage.setItem('liked', JSON.stringify(likedSongs)); } catch {} }, [likedSongs]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);
  useEffect(() => { if ('mediaSession' in navigator) navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused'; }, [isPlaying]);
  
  // Update notification seekbar position
  useEffect(() => {
    if ('mediaSession' in navigator && duration > 0) {
      try {
        navigator.mediaSession.setPositionState({
          duration: duration,
          playbackRate: 1,
          position: Math.min(currentTime, duration),
        });
      } catch {}
    }
  }, [currentTime, duration]);

  // Load related when song changes
  useEffect(() => {
    if (!currentSong) return;

    // ─── Media Session API (notification controls) ───
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.title || 'Unknown',
        artist: currentSong.artist || 'Unknown',
        album: currentSong.album || '',
        artwork: [
          { src: currentSong.thumbnail, sizes: '512x512', type: 'image/jpeg' }
        ]
      });
      // Use refs for handlers to avoid stale closures
      navigator.mediaSession.setActionHandler('play', () => {
        const a = activeRef.current === 'A' ? audioA.current : audioB.current;
        if (a?.src) { a.play().then(() => setIsPlaying(true)).catch(() => {}); }
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        const a = activeRef.current === 'A' ? audioA.current : audioB.current;
        if (a) { a.pause(); setIsPlaying(false); }
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => { if (playPrevRef.current) playPrevRef.current(); });
      navigator.mediaSession.setActionHandler('nexttrack', () => { if (playNextRef.current) playNextRef.current(); });
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime != null) {
          const a = activeRef.current === 'A' ? audioA.current : audioB.current;
          if (a) { a.currentTime = details.seekTime; setCurrentTime(details.seekTime); }
        }
      });
    }

    // Update browser tab title
    document.title = `${currentSong.title} - ${currentSong.artist} | Music Area`;

    getNextSongs(currentSong).then(songs => {
      // Deduplicate: remove current song and any already in queue
      const currentQueue = queueRef.current;
      const existingIds = new Set([currentSong.id, ...currentQueue.map(s => s.id)]);
      const unique = songs.filter(s => !existingIds.has(s.id));
      
      // Remove duplicates within the results themselves
      const seen = new Set();
      const deduped = unique.filter(s => { if (seen.has(s.id)) return false; seen.add(s.id); return true; });
      
      setUpNext(deduped);
      if (currentQueue.length === 0) setQueue(deduped);
    });
  }, [currentSong]);

  // ─── CROSSFADE ───
  function startCrossfade() {
    if (fadingRef.current) return;
    const q = queueRef.current;
    if (q.length === 0) return;
    fadingRef.current = true;

    const nextSong = q[0];
    if (!nextSong?.audio) { fadingRef.current = false; return; }

    const outgoing = activeRef.current === 'A' ? audioA.current : audioB.current;
    const incoming = activeRef.current === 'A' ? audioB.current : audioA.current;

    // Start next song silently
    incoming.src = nextSong.audio;
    incoming.volume = 0;
    incoming.play().catch(() => {});

    // Gradual fade
    const cfSec = getCfSec();
    const steps = 30;
    const ms = (cfSec * 1000) / steps;
    let step = 0;
    const vol = volumeRef.current;

    if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);
    fadeTimerRef.current = setInterval(() => {
      step++;
      const pct = step / steps;
      outgoing.volume = Math.max(0, vol * (1 - pct));
      incoming.volume = Math.min(vol, vol * pct);

      if (step >= steps) {
        clearInterval(fadeTimerRef.current);
        fadeTimerRef.current = null;
        outgoing.pause();
        outgoing.src = '';
        incoming.volume = vol;

        activeRef.current = activeRef.current === 'A' ? 'B' : 'A';
        fadingRef.current = false;

        // Remove from queue
        setQueue(prev => prev.slice(1));
        setCurrentSong(nextSong);
        setCurrentTime(incoming.currentTime);
        setDuration(incoming.duration || 0);
        addToHistory(nextSong);
      }
    }, ms);
  }

  function cancelFade() {
    if (fadeTimerRef.current) { clearInterval(fadeTimerRef.current); fadeTimerRef.current = null; }
    fadingRef.current = false;
  }

  function playDirect(song) {
    if (!song) return;
    cancelFade();
    errorHandlingRef.current = false; // Reset error handling on intentional play
    // Resume AudioContext if enhanced mode active
    if (enhancedRef.current && audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    // Push current song to history stack (for prev)
    if (currentSong) historyStack.current.push(currentSong);
    audioA.current.pause(); audioA.current.src = '';
    audioB.current.pause(); audioB.current.src = '';
    activeRef.current = 'A';
    setCurrentSong(song);
    setCurrentTime(0);
    addToHistory(song);
    if (song.audio) {
      const a = audioA.current;
      a.src = song.audio;
      // If boost is active (>100%), volume stays at 1, gain does the rest
      if (enhancedRef.current && gainRef.current && gainRef.current.gain.value > 1) {
        a.volume = 1;
      } else {
        a.volume = volumeRef.current;
      }
      setIsPlaying(true);
      a.play().catch(() => setIsPlaying(false));
    } else {
      setIsPlaying(false);
    }
  }

  // ─── Public actions ───
  const showToast = useCallback((msg, type = 'info') => { const id = Date.now(); setToasts(p => [...p, { id, msg, type }]); setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000); }, []);
  const dismissToast = useCallback(id => setToasts(p => p.filter(t => t.id !== id)), []);

  const playSong = useCallback((song, newQueue) => {
    if (!song) return;
    cancelFade();
    if (newQueue) {
      const seen = new Set([song.id]);
      const deduped = newQueue.filter(s => { if (seen.has(s.id)) return false; seen.add(s.id); return true; });
      setQueue(deduped);
    }
    playDirect(song);
  }, []);

  const togglePlay = useCallback(() => {
    if (!currentSong) return;
    // Resume AudioContext if needed
    if (enhancedRef.current && audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    const a = cur();
    if (isPlaying) { a?.pause(); setIsPlaying(false); }
    else {
      a?.play().then(() => setIsPlaying(true)).catch(() => {
        if (currentSong.audio && a) {
          a.src = currentSong.audio;
          a.volume = enhancedRef.current ? 1 : volumeRef.current;
          a.play().then(() => setIsPlaying(true)).catch(() => {});
        }
      });
    }
  }, [currentSong, isPlaying]);

  const playNext = useCallback(async () => {
    cancelFade();
    const q = queueRef.current;

    if (repeatMode === 'one') { cur().currentTime = 0; cur().play().catch(() => {}); return; }

    if (q.length > 0) {
      const idx = shuffleMode ? Math.floor(Math.random() * q.length) : 0;
      const next = q[idx];
      setQueue(prev => prev.filter((_, i) => i !== idx));
      playDirect(next);
      return;
    }

    if (currentSong) {
      const fresh = await getNextSongs(currentSong);
      // Filter out the current song from fresh results
      const filtered = fresh.filter(s => s.id !== currentSong.id);
      if (filtered.length > 0) { setQueue(filtered.slice(1)); setUpNext(filtered); playDirect(filtered[0]); return; }
      resetPlayed();
      // Try again after reset
      const retry = await getNextSongs(currentSong);
      const retryFiltered = retry.filter(s => s.id !== currentSong.id);
      if (retryFiltered.length > 0) { setQueue(retryFiltered.slice(1)); setUpNext(retryFiltered); playDirect(retryFiltered[0]); return; }
    }
    setIsPlaying(false);
  }, [shuffleMode, repeatMode, currentSong]);

  // Keep ref updated for audio event handler
  useEffect(() => { playNextRef.current = playNext; }, [playNext]);

  const playPrev = useCallback(() => {
    // If more than 3 seconds in, restart current song
    if (currentTime > 3) { cur().currentTime = 0; setCurrentTime(0); return; }
    // Otherwise go to previous song from history
    if (historyStack.current.length > 0) {
      const prev = historyStack.current.pop();
      if (currentSong) setQueue(p => [currentSong, ...p]);
      cancelFade();
      if (enhancedRef.current && audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
      audioA.current.pause(); audioA.current.src = '';
      audioB.current.pause(); audioB.current.src = '';
      activeRef.current = 'A';
      setCurrentSong(prev);
      setCurrentTime(0);
      setIsPlaying(true);
      if (prev.audio) {
        audioA.current.src = prev.audio;
        audioA.current.volume = enhancedRef.current ? 1 : volumeRef.current;
        audioA.current.play().catch(() => setIsPlaying(false));
      }
    } else {
      // No history — just restart
      cur().currentTime = 0; setCurrentTime(0);
    }
  }, [currentTime, currentSong]);
  useEffect(() => { playPrevRef.current = playPrev; }, [playPrev]);
  const seekTo = useCallback(t => { const a = cur(); if (a) { a.currentTime = t; setCurrentTime(t); } }, []);
  const toggleShuffle = useCallback(() => setShuffle(p => !p), []);
  const cycleRepeat = useCallback(() => setRepeat(p => p === 'none' ? 'all' : p === 'all' ? 'one' : 'none'), []);
  const addToQueue = useCallback(song => { setQueue(p => [...p, song]); showToast('Added to queue'); }, [showToast]);
  const removeFromQueue = useCallback(idx => setQueue(p => p.filter((_, i) => i !== idx)), []);
  const clearQueue = useCallback(() => { setQueue([]); showToast('Queue cleared'); }, [showToast]);
  const toggleLike = useCallback(songId => {
    setLikedSongs(p => { if (p.includes(songId)) { showToast('Removed'); return p.filter(id => id !== songId); } showToast('Liked ❤️', 'success'); return [...p, songId]; });
  }, [showToast]);

  return <Ctx.Provider value={{ currentSong, queue, upNext, isPlaying, volume, boostLevel, bassBoostOn, currentTime, duration, shuffleMode, repeatMode, isExpanded, likedSongs, toasts, playSong, togglePlay, playNext, playPrev, seekTo, setVolume, setVolumeBoost, setBassBoost, resetAudio, setEqBand, applyEqPreset, toggleShuffle, cycleRepeat, addToQueue, removeFromQueue, clearQueue, toggleLike, setExpanded, showToast, dismissToast }}>{children}</Ctx.Provider>;
}
