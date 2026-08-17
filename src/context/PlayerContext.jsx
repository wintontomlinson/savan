import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { addToHistory, getNextSongs, resetPlayed } from '../data/algorithm';

const Ctx = createContext();
export const usePlayer = () => useContext(Ctx);

const CROSSFADE_DURATION = 5; // seconds before end to start crossfade

export function PlayerProvider({ children }) {
  // Two audio elements for crossfade
  const audioA = useRef(null);
  const audioB = useRef(null);
  const activeAudio = useRef('A'); // which one is currently playing
  const crossfadeTimer = useRef(null);
  const isCrossfading = useRef(false);

  const [currentSong, setCurrentSong] = useState(null);
  const [queue, setQueue] = useState([]);
  const [upNext, setUpNext] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVol] = useState(() => { try { return parseFloat(localStorage.getItem('vol')) || 0.7 } catch { return 0.7 } });
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shuffleMode, setShuffle] = useState(false);
  const [repeatMode, setRepeat] = useState('none');
  const [isExpanded, setExpanded] = useState(false);
  const [likedSongs, setLikedSongs] = useState(() => { try { return JSON.parse(localStorage.getItem('liked')) || [] } catch { return [] } });
  const [toasts, setToasts] = useState([]);

  const getActive = () => activeAudio.current === 'A' ? audioA.current : audioB.current;
  const getInactive = () => activeAudio.current === 'A' ? audioB.current : audioA.current;

  // Setup both audio elements
  useEffect(() => {
    audioA.current = new Audio();
    audioB.current = new Audio();
    audioA.current.volume = volume;
    audioB.current.volume = 0;

    const onTimeUpdate = () => {
      const a = getActive();
      if (!a) return;
      setCurrentTime(a.currentTime);

      // Start crossfade when approaching end
      if (a.duration && a.duration > CROSSFADE_DURATION + 2) {
        const timeLeft = a.duration - a.currentTime;
        if (timeLeft <= CROSSFADE_DURATION && timeLeft > 0 && !isCrossfading.current) {
          startCrossfade();
        }
      }
    };

    const onMeta = () => { setDuration(getActive()?.duration || 0); };
    const onEnded = () => { if (!isCrossfading.current) handleNext(); };
    const onError = () => { handleNext(); };

    audioA.current.addEventListener('timeupdate', onTimeUpdate);
    audioA.current.addEventListener('loadedmetadata', onMeta);
    audioA.current.addEventListener('ended', onEnded);
    audioA.current.addEventListener('error', onError);

    audioB.current.addEventListener('timeupdate', onTimeUpdate);
    audioB.current.addEventListener('loadedmetadata', onMeta);
    audioB.current.addEventListener('ended', onEnded);
    audioB.current.addEventListener('error', onError);

    return () => {
      audioA.current?.pause();
      audioB.current?.pause();
      if (crossfadeTimer.current) clearInterval(crossfadeTimer.current);
    };
  }, []);

  useEffect(() => { try { localStorage.setItem('liked', JSON.stringify(likedSongs)) } catch {} }, [likedSongs]);
  useEffect(() => { try { localStorage.setItem('vol', volume.toString()) } catch {} }, [volume]);

  // Load next songs when current changes
  useEffect(() => {
    if (!currentSong) return;
    getNextSongs(currentSong).then(songs => {
      setUpNext(songs);
      setQueue(prev => prev.length > 0 ? prev : songs);
    });
  }, [currentSong]);

  // Crossfade logic
  const startCrossfade = useCallback(() => {
    if (isCrossfading.current) return;
    isCrossfading.current = true;

    // Get next song
    const nextSong = queue[0];
    if (!nextSong || !nextSong.audio) {
      isCrossfading.current = false;
      return;
    }

    // Prepare inactive audio with next song
    const incoming = getInactive();
    const outgoing = getActive();
    incoming.src = nextSong.audio;
    incoming.volume = 0;
    incoming.play().catch(() => {});

    // Fade: outgoing down, incoming up over CROSSFADE_DURATION seconds
    const steps = 20; // fade steps
    const interval = (CROSSFADE_DURATION * 1000) / steps;
    let step = 0;

    if (crossfadeTimer.current) clearInterval(crossfadeTimer.current);
    crossfadeTimer.current = setInterval(() => {
      step++;
      const progress = step / steps;
      outgoing.volume = Math.max(0, volume * (1 - progress));
      incoming.volume = Math.min(volume, volume * progress);

      if (step >= steps) {
        clearInterval(crossfadeTimer.current);
        crossfadeTimer.current = null;
        outgoing.pause();
        outgoing.src = '';
        outgoing.volume = 0;
        incoming.volume = volume;

        // Swap active
        activeAudio.current = activeAudio.current === 'A' ? 'B' : 'A';
        isCrossfading.current = false;

        // Update state
        setQueue(prev => prev.filter((_, i) => i !== 0));
        setCurrentSong(nextSong);
        setCurrentTime(incoming.currentTime);
        setDuration(incoming.duration || 0);
        addToHistory(nextSong);
      }
    }, interval);
  }, [queue, volume]);

  const showToast = useCallback((msg, type = 'info') => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  }, []);
  const dismissToast = useCallback((id) => setToasts(p => p.filter(t => t.id !== id)), []);

  // Play a song (immediate, no crossfade)
  const playSong = useCallback((song, newQueue) => {
    if (!song) return;
    // Stop any crossfade in progress
    if (crossfadeTimer.current) { clearInterval(crossfadeTimer.current); crossfadeTimer.current = null; }
    isCrossfading.current = false;

    // Stop both audios
    audioA.current.pause(); audioA.current.src = '';
    audioB.current.pause(); audioB.current.src = '';

    // Play on audio A
    activeAudio.current = 'A';
    setCurrentSong(song);
    setCurrentTime(0);
    setIsPlaying(true);
    addToHistory(song);
    if (newQueue) setQueue(newQueue.filter(s => s.id !== song.id));
    if (song.audio) {
      audioA.current.src = song.audio;
      audioA.current.volume = volume;
      audioA.current.play().catch(() => {});
    }
  }, [volume]);

  const togglePlay = useCallback(() => {
    if (!currentSong) return;
    const a = getActive();
    if (isPlaying) { a?.pause(); setIsPlaying(false); }
    else { a?.play().catch(() => {}); setIsPlaying(true); }
  }, [currentSong, isPlaying]);

  // Manual next (skip, no crossfade)
  const handleNext = useCallback(async () => {
    if (crossfadeTimer.current) { clearInterval(crossfadeTimer.current); crossfadeTimer.current = null; }
    isCrossfading.current = false;

    if (repeatMode === 'one' && currentSong) {
      const a = getActive();
      a.currentTime = 0;
      a.play().catch(() => {});
      return;
    }

    if (queue.length > 0) {
      const idx = shuffleMode ? Math.floor(Math.random() * queue.length) : 0;
      const next = queue[idx];
      setQueue(p => p.filter((_, i) => i !== idx));

      // Stop both, play on A fresh
      audioA.current.pause(); audioA.current.src = '';
      audioB.current.pause(); audioB.current.src = '';
      activeAudio.current = 'A';

      setCurrentSong(next);
      setCurrentTime(0);
      setIsPlaying(true);
      addToHistory(next);
      if (next.audio) {
        audioA.current.src = next.audio;
        audioA.current.volume = volume;
        audioA.current.play().catch(() => {});
      }
      return;
    }

    // Queue empty — fetch fresh
    if (currentSong) {
      const fresh = await getNextSongs(currentSong);
      if (fresh.length > 0) {
        const next = fresh[0];
        setQueue(fresh.slice(1));
        setUpNext(fresh);

        audioA.current.pause(); audioA.current.src = '';
        audioB.current.pause(); audioB.current.src = '';
        activeAudio.current = 'A';

        setCurrentSong(next);
        setCurrentTime(0);
        setIsPlaying(true);
        addToHistory(next);
        if (next.audio) {
          audioA.current.src = next.audio;
          audioA.current.volume = volume;
          audioA.current.play().catch(() => {});
        }
        return;
      }
      resetPlayed();
    }
    setIsPlaying(false);
  }, [queue, shuffleMode, repeatMode, currentSong, volume]);

  const playPrev = useCallback(() => {
    const a = getActive();
    if (a) { a.currentTime = 0; setCurrentTime(0); }
  }, []);

  const seekTo = useCallback((t) => { const a = getActive(); if (a) { a.currentTime = t; setCurrentTime(t); } }, []);
  const setVolume = useCallback((v) => { const val = Math.max(0, Math.min(1, v)); setVol(val); const a = getActive(); if (a) a.volume = val; }, []);
  const toggleShuffle = useCallback(() => setShuffle(p => !p), []);
  const cycleRepeat = useCallback(() => setRepeat(p => p === 'none' ? 'all' : p === 'all' ? 'one' : 'none'), []);
  const addToQueue = useCallback((song) => { setQueue(p => [...p, song]); showToast('Added to queue'); }, [showToast]);
  const removeFromQueue = useCallback((idx) => setQueue(p => p.filter((_, i) => i !== idx)), []);
  const clearQueue = useCallback(() => { setQueue([]); showToast('Queue cleared'); }, [showToast]);
  const toggleLike = useCallback((songId) => {
    setLikedSongs(p => {
      if (p.includes(songId)) { showToast('Removed'); return p.filter(id => id !== songId); }
      showToast('Liked ❤️', 'success'); return [...p, songId];
    });
  }, [showToast]);

  return <Ctx.Provider value={{ currentSong, queue, upNext, isPlaying, volume, currentTime, duration, shuffleMode, repeatMode, isExpanded, likedSongs, toasts, playSong, togglePlay, playNext: handleNext, playPrev, seekTo, setVolume, toggleShuffle, cycleRepeat, addToQueue, removeFromQueue, clearQueue, toggleLike, setExpanded, showToast, dismissToast }}>{children}</Ctx.Provider>;
}
