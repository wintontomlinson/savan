import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { addToHistory, getNextSongs, resetPlayed } from '../data/algorithm';

const Ctx = createContext();
export const usePlayer = () => useContext(Ctx);

function getCrossfadeSec() {
  try { return parseInt(localStorage.getItem('crossfade_dur')) || 5; } catch { return 5; }
}

export function PlayerProvider({ children }) {
  const audioA = useRef(null);
  const audioB = useRef(null);
  const active = useRef('A');
  const fading = useRef(false);
  const fadeInterval = useRef(null);

  const [currentSong, setCurrentSong] = useState(null);
  const [queue, setQueue] = useState([]);
  const [upNext, setUpNext] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVol] = useState(() => { try { return parseFloat(localStorage.getItem('vol')) || 0.7; } catch { return 0.7; } });
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shuffleMode, setShuffle] = useState(false);
  const [repeatMode, setRepeat] = useState('none');
  const [isExpanded, setExpanded] = useState(false);
  const [likedSongs, setLikedSongs] = useState(() => { try { return JSON.parse(localStorage.getItem('liked')) || []; } catch { return []; } });
  const [toasts, setToasts] = useState([]);

  const cur = () => active.current === 'A' ? audioA.current : audioB.current;
  const other = () => active.current === 'A' ? audioB.current : audioA.current;

  useEffect(() => {
    audioA.current = new Audio();
    audioB.current = new Audio();
    audioA.current.volume = volume;
    audioB.current.volume = 0;

    const tick = () => {
      const a = cur();
      if (!a) return;
      setCurrentTime(a.currentTime);

      // Crossfade trigger: when time left <= crossfade seconds
      const cfSec = getCrossfadeSec();
      if (cfSec > 0 && a.duration && a.duration > cfSec + 3) {
        const left = a.duration - a.currentTime;
        if (left <= cfSec && left > 0.5 && !fading.current && queue.length > 0) {
          doCrossfade();
        }
      }
    };
    const onMeta = () => setDuration(cur()?.duration || 0);
    const onEnd = () => { if (!fading.current) doNext(); };
    const onErr = () => doNext();

    [audioA.current, audioB.current].forEach(a => {
      a.addEventListener('timeupdate', tick);
      a.addEventListener('loadedmetadata', onMeta);
      a.addEventListener('ended', onEnd);
      a.addEventListener('error', onErr);
    });

    return () => {
      audioA.current?.pause();
      audioB.current?.pause();
      if (fadeInterval.current) clearInterval(fadeInterval.current);
    };
  }, []);

  useEffect(() => { try { localStorage.setItem('liked', JSON.stringify(likedSongs)); } catch {} }, [likedSongs]);
  useEffect(() => { try { localStorage.setItem('vol', volume.toString()); } catch {} }, [volume]);

  // Load up next when song changes
  useEffect(() => {
    if (!currentSong) return;
    getNextSongs(currentSong).then(songs => {
      setUpNext(songs);
      setQueue(prev => prev.length > 0 ? prev : songs);
    });
  }, [currentSong]);

  // ──── CROSSFADE: next song fades in while current fades out ────
  const doCrossfade = useCallback(() => {
    if (fading.current || queue.length === 0) return;
    fading.current = true;

    const nextSong = queue[0];
    if (!nextSong?.audio) { fading.current = false; return; }

    const outgoing = cur();
    const incoming = other();

    // Load next song on incoming audio
    incoming.src = nextSong.audio;
    incoming.volume = 0;
    incoming.play().catch(() => {});

    // Fade over crossfade duration
    const cfSec = getCrossfadeSec();
    const steps = 25;
    const interval = (cfSec * 1000) / steps;
    let step = 0;

    if (fadeInterval.current) clearInterval(fadeInterval.current);
    fadeInterval.current = setInterval(() => {
      step++;
      const pct = step / steps;
      outgoing.volume = Math.max(0, volume * (1 - pct));
      incoming.volume = Math.min(volume, volume * pct);

      if (step >= steps) {
        clearInterval(fadeInterval.current);
        fadeInterval.current = null;
        outgoing.pause();
        outgoing.src = '';
        incoming.volume = volume;

        // Swap
        active.current = active.current === 'A' ? 'B' : 'A';
        fading.current = false;

        // Update state
        setQueue(prev => prev.slice(1));
        setCurrentSong(nextSong);
        setCurrentTime(incoming.currentTime);
        setDuration(incoming.duration || 0);
        addToHistory(nextSong);
      }
    }, interval);
  }, [queue, volume]);

  // ──── Normal next (skip / queue empty) ────
  const doNext = useCallback(async () => {
    if (fadeInterval.current) { clearInterval(fadeInterval.current); fadeInterval.current = null; }
    fading.current = false;

    if (repeatMode === 'one') { cur().currentTime = 0; cur().play().catch(() => {}); return; }

    if (queue.length > 0) {
      const idx = shuffleMode ? Math.floor(Math.random() * queue.length) : 0;
      const next = queue[idx];
      setQueue(p => p.filter((_, i) => i !== idx));
      playSongDirect(next);
      return;
    }

    // Fetch more
    if (currentSong) {
      const fresh = await getNextSongs(currentSong);
      if (fresh.length > 0) { setQueue(fresh.slice(1)); setUpNext(fresh); playSongDirect(fresh[0]); return; }
      resetPlayed();
    }
    setIsPlaying(false);
  }, [queue, shuffleMode, repeatMode, currentSong]);

  const playSongDirect = (song) => {
    if (!song) return;
    audioA.current.pause(); audioA.current.src = '';
    audioB.current.pause(); audioB.current.src = '';
    active.current = 'A';
    setCurrentSong(song);
    setCurrentTime(0);
    setIsPlaying(true);
    addToHistory(song);
    if (song.audio) { audioA.current.src = song.audio; audioA.current.volume = volume; audioA.current.play().catch(() => {}); }
  };

  // ──── Public API ────
  const showToast = useCallback((msg, type = 'info') => { const id = Date.now(); setToasts(p => [...p, { id, msg, type }]); setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000); }, []);
  const dismissToast = useCallback(id => setToasts(p => p.filter(t => t.id !== id)), []);

  const playSong = useCallback((song, newQueue) => {
    if (!song) return;
    if (fadeInterval.current) { clearInterval(fadeInterval.current); fadeInterval.current = null; }
    fading.current = false;
    if (newQueue) setQueue(newQueue.filter(s => s.id !== song.id));
    playSongDirect(song);
  }, [volume]);

  const togglePlay = useCallback(() => {
    if (!currentSong) return;
    const a = cur();
    if (isPlaying) { a?.pause(); setIsPlaying(false); }
    else { a?.play().catch(() => {}); setIsPlaying(true); }
  }, [currentSong, isPlaying]);

  const playPrev = useCallback(() => { const a = cur(); if (a) { a.currentTime = 0; setCurrentTime(0); } }, []);
  const seekTo = useCallback(t => { const a = cur(); if (a) { a.currentTime = t; setCurrentTime(t); } }, []);
  const setVolume = useCallback(v => { const val = Math.max(0, Math.min(1, v)); setVol(val); const a = cur(); if (a) a.volume = val; }, []);
  const toggleShuffle = useCallback(() => setShuffle(p => !p), []);
  const cycleRepeat = useCallback(() => setRepeat(p => p === 'none' ? 'all' : p === 'all' ? 'one' : 'none'), []);
  const addToQueue = useCallback(song => { setQueue(p => [...p, song]); showToast('Added to queue'); }, [showToast]);
  const removeFromQueue = useCallback(idx => setQueue(p => p.filter((_, i) => i !== idx)), []);
  const clearQueue = useCallback(() => { setQueue([]); showToast('Queue cleared'); }, [showToast]);
  const toggleLike = useCallback(songId => {
    setLikedSongs(p => { if (p.includes(songId)) { showToast('Removed'); return p.filter(id => id !== songId); } showToast('Liked ❤️', 'success'); return [...p, songId]; });
  }, [showToast]);

  return <Ctx.Provider value={{ currentSong, queue, upNext, isPlaying, volume, currentTime, duration, shuffleMode, repeatMode, isExpanded, likedSongs, toasts, playSong, togglePlay, playNext: doNext, playPrev, seekTo, setVolume, toggleShuffle, cycleRepeat, addToQueue, removeFromQueue, clearQueue, toggleLike, setExpanded, showToast, dismissToast }}>{children}</Ctx.Provider>;
}
