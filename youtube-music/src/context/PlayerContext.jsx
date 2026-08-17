import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { addToHistory, getNextSongs, resetPlayed, isPlayed } from '../data/algorithm';

const Ctx = createContext();
export const usePlayer = () => useContext(Ctx);

export function PlayerProvider({ children }) {
  const audioRef = useRef(null);
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

  // Audio setup
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;
    const a = audioRef.current;
    a.addEventListener('timeupdate', () => setCurrentTime(a.currentTime));
    a.addEventListener('loadedmetadata', () => setDuration(a.duration));
    a.addEventListener('ended', () => handleNext());
    a.addEventListener('error', () => handleNext());
    return () => { a.pause(); a.src = ''; }
  }, []);

  useEffect(() => { try { localStorage.setItem('liked', JSON.stringify(likedSongs)) } catch {} }, [likedSongs]);
  useEffect(() => { try { localStorage.setItem('vol', volume.toString()) } catch {} }, [volume]);

  // When song changes → load next songs
  useEffect(() => {
    if (!currentSong) return;
    getNextSongs(currentSong).then(songs => {
      setUpNext(songs);
      // Only fill queue if it's empty
      setQueue(prev => prev.length > 0 ? prev : songs);
    });
  }, [currentSong]);

  const showToast = useCallback((msg, type = 'info') => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  }, []);
  const dismissToast = useCallback((id) => setToasts(p => p.filter(t => t.id !== id)), []);

  // Play a song
  const playSong = useCallback((song, newQueue) => {
    if (!song) return;
    setCurrentSong(song);
    setCurrentTime(0);
    setIsPlaying(true);
    addToHistory(song);
    if (newQueue) setQueue(newQueue.filter(s => s.id !== song.id));
    if (audioRef.current && song.audio) {
      audioRef.current.src = song.audio;
      audioRef.current.play().catch(() => {});
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (!currentSong) return;
    if (isPlaying) { audioRef.current?.pause(); setIsPlaying(false); }
    else { audioRef.current?.play().catch(() => {}); setIsPlaying(true); }
  }, [currentSong, isPlaying]);

  // NEXT: play from queue, if empty fetch fresh related songs
  const handleNext = useCallback(async () => {
    if (repeatMode === 'one' && currentSong) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
      return;
    }

    if (queue.length > 0) {
      const idx = shuffleMode ? Math.floor(Math.random() * queue.length) : 0;
      const next = queue[idx];
      const newQueue = queue.filter((_, i) => i !== idx);
      setQueue(newQueue);
      setCurrentSong(next);
      setCurrentTime(0);
      setIsPlaying(true);
      addToHistory(next);
      if (audioRef.current && next.audio) {
        audioRef.current.src = next.audio;
        audioRef.current.play().catch(() => {});
      }
      return;
    }

    // Queue khatam — fresh songs lao
    if (currentSong) {
      const fresh = await getNextSongs(currentSong);
      if (fresh.length > 0) {
        const next = fresh[0];
        setQueue(fresh.slice(1));
        setUpNext(fresh);
        setCurrentSong(next);
        setCurrentTime(0);
        setIsPlaying(true);
        addToHistory(next);
        if (audioRef.current && next.audio) {
          audioRef.current.src = next.audio;
          audioRef.current.play().catch(() => {});
        }
        return;
      }
      // Sab sun liye — reset aur band
      resetPlayed();
    }
    setIsPlaying(false);
  }, [queue, shuffleMode, repeatMode, currentSong]);

  const playPrev = useCallback(() => {
    if (audioRef.current) { audioRef.current.currentTime = 0; setCurrentTime(0); }
  }, []);

  const seekTo = useCallback((t) => { if (audioRef.current) { audioRef.current.currentTime = t; setCurrentTime(t); } }, []);
  const setVolume = useCallback((v) => { const val = Math.max(0, Math.min(1, v)); setVol(val); if (audioRef.current) audioRef.current.volume = val; }, []);
  const toggleShuffle = useCallback(() => setShuffle(p => !p), []);
  const cycleRepeat = useCallback(() => setRepeat(p => p === 'none' ? 'all' : p === 'all' ? 'one' : 'none'), []);
  const addToQueue = useCallback((song) => { setQueue(p => [...p, song]); showToast('Added to queue'); }, [showToast]);
  const removeFromQueue = useCallback((idx) => setQueue(p => p.filter((_, i) => i !== idx)), []);
  const clearQueue = useCallback(() => { setQueue([]); showToast('Queue cleared'); }, [showToast]);
  const toggleLike = useCallback((songId) => {
    setLikedSongs(p => {
      if (p.includes(songId)) { showToast('Removed from Liked'); return p.filter(id => id !== songId); }
      showToast('Liked ❤️', 'success'); return [...p, songId];
    });
  }, [showToast]);

  return <Ctx.Provider value={{ currentSong, queue, upNext, isPlaying, volume, currentTime, duration, shuffleMode, repeatMode, isExpanded, likedSongs, toasts, playSong, togglePlay, playNext: handleNext, playPrev, seekTo, setVolume, toggleShuffle, cycleRepeat, addToQueue, removeFromQueue, clearQueue, toggleLike, setExpanded, showToast, dismissToast }}>{children}</Ctx.Provider>;
}
