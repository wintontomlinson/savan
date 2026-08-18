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
  const volumeRef = useRef(0.7);

  const [currentSong, setCurrentSong] = useState(null);
  const [queue, _setQueue] = useState([]);
  const [upNext, setUpNext] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, _setVolume] = useState(() => { try { return parseFloat(localStorage.getItem('vol')) || 0.7; } catch { return 0.7; } });
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
  }, []);

  const historyStack = useRef([]); // Stack of previously played songs

  const cur = () => activeRef.current === 'A' ? audioA.current : audioB.current;

  const playNextRef = useRef(null);

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
    const onError = async (e) => {
      const a = cur();
      if (!a?.src || !currentSong) return;
      console.warn('Audio error, attempting stream URL refresh');
      // Try to get a fresh stream URL
      const freshUrl = await refreshStreamUrl(currentSong.id);
      if (freshUrl && freshUrl !== a.src) {
        a.src = freshUrl;
        a.load();
        a.play().catch(() => {});
      } else {
        // Can't recover — skip to next
        if (playNextRef.current) playNextRef.current();
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
  useEffect(() => { try { localStorage.setItem('vol', volume.toString()); } catch {} }, [volume]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);

  // Load related when song changes
  useEffect(() => {
    if (!currentSong) return;
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
      a.volume = volumeRef.current;
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
    const a = cur();
    if (isPlaying) { a?.pause(); setIsPlaying(false); }
    else {
      a?.play().then(() => setIsPlaying(true)).catch(() => {
        // If src not set, re-set it
        if (currentSong.audio && a) {
          a.src = currentSong.audio;
          a.volume = volumeRef.current;
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
      if (fresh.length > 0) { setQueue(fresh.slice(1)); setUpNext(fresh); playDirect(fresh[0]); return; }
      resetPlayed();
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
      // Put current song back at front of queue
      if (currentSong) setQueue(p => [currentSong, ...p]);
      // Play previous directly
      cancelFade();
      audioA.current.pause(); audioA.current.src = '';
      audioB.current.pause(); audioB.current.src = '';
      activeRef.current = 'A';
      setCurrentSong(prev);
      setCurrentTime(0);
      setIsPlaying(true);
      if (prev.audio) {
        audioA.current.src = prev.audio;
        audioA.current.volume = volumeRef.current;
        audioA.current.play().catch(() => setIsPlaying(false));
      }
    } else {
      // No history — just restart
      cur().currentTime = 0; setCurrentTime(0);
    }
  }, [currentTime, currentSong]);
  const seekTo = useCallback(t => { const a = cur(); if (a) { a.currentTime = t; setCurrentTime(t); } }, []);
  const toggleShuffle = useCallback(() => setShuffle(p => !p), []);
  const cycleRepeat = useCallback(() => setRepeat(p => p === 'none' ? 'all' : p === 'all' ? 'one' : 'none'), []);
  const addToQueue = useCallback(song => { setQueue(p => [...p, song]); showToast('Added to queue'); }, [showToast]);
  const removeFromQueue = useCallback(idx => setQueue(p => p.filter((_, i) => i !== idx)), []);
  const clearQueue = useCallback(() => { setQueue([]); showToast('Queue cleared'); }, [showToast]);
  const toggleLike = useCallback(songId => {
    setLikedSongs(p => { if (p.includes(songId)) { showToast('Removed'); return p.filter(id => id !== songId); } showToast('Liked ❤️', 'success'); return [...p, songId]; });
  }, [showToast]);

  return <Ctx.Provider value={{ currentSong, queue, upNext, isPlaying, volume, currentTime, duration, shuffleMode, repeatMode, isExpanded, likedSongs, toasts, playSong, togglePlay, playNext, playPrev, seekTo, setVolume, toggleShuffle, cycleRepeat, addToQueue, removeFromQueue, clearQueue, toggleLike, setExpanded, showToast, dismissToast }}>{children}</Ctx.Provider>;
}
