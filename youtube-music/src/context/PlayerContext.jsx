import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { searchSongs } from '../data/api';

const PlayerContext = createContext();

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used within PlayerProvider');
  return context;
};

export const PlayerProvider = ({ children }) => {
  const audioRef = useRef(new Audio());
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queue, setQueue] = useState([]);
  const [shuffleMode, setShuffleMode] = useState(false);
  const [repeatMode, setRepeatMode] = useState('none');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [toast, setToast] = useState(null);

  // Liked songs - full objects
  const [likedSongs, setLikedSongs] = useState(() => {
    try {
      const saved = localStorage.getItem('yt_liked_songs');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Recently played - full objects
  const [recentlyPlayed, setRecentlyPlayed] = useState(() => {
    try {
      const saved = localStorage.getItem('yt_recently_played');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Persist
  useEffect(() => {
    try { localStorage.setItem('yt_liked_songs', JSON.stringify(likedSongs)); } catch {}
  }, [likedSongs]);

  useEffect(() => {
    try { localStorage.setItem('yt_recently_played', JSON.stringify(recentlyPlayed)); } catch {}
  }, [recentlyPlayed]);

  // Audio events
  useEffect(() => {
    const audio = audioRef.current;
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoaded = () => { setDuration(audio.duration); setIsBuffering(false); };
    const onEnded = () => handleNext();
    const onWaiting = () => setIsBuffering(true);
    const onCanPlay = () => setIsBuffering(false);
    const onError = () => setIsBuffering(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('error', onError);
    };
  }, []);

  useEffect(() => { audioRef.current.volume = volume; }, [volume]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      switch (e.code) {
        case 'Space': e.preventDefault(); togglePlay(); break;
        case 'ArrowRight': e.preventDefault(); seekTo(Math.min(currentTime + 10, duration)); break;
        case 'ArrowLeft': e.preventDefault(); seekTo(Math.max(currentTime - 10, 0)); break;
        case 'KeyM': setVolumeState(v => v > 0 ? 0 : 0.7); break;
        case 'KeyL': if (currentSong) toggleLike(currentSong); break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentTime, duration, currentSong]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };
  const setVolume = useCallback((v) => { setVolumeState(v); audioRef.current.volume = v; }, []);

  // Fetch related songs when queue is empty (same artist or language)
  const fetchRelatedSongs = useCallback(async (song) => {
    if (!song) return [];
    try {
      // Search by artist name first
      const artistName = song.artist?.split(',')[0]?.trim();
      const results = await searchSongs(artistName, 15);
      // Filter out the current song
      const filtered = results.filter(s => s.id !== song.id);
      if (filtered.length > 0) return filtered;

      // Fallback: search by language
      if (song.language) {
        const langResults = await searchSongs(`${song.language} songs`, 10);
        return langResults.filter(s => s.id !== song.id);
      }
      return [];
    } catch {
      return [];
    }
  }, []);

  const playSong = useCallback((song, songList = null) => {
    if (!song) return;
    const audio = audioRef.current;
    setCurrentSong(song);
    setCurrentTime(0);
    setIsPlaying(true);
    setIsBuffering(true);

    // Add to recently played (max 30, no duplicates)
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(s => s.id !== song.id);
      return [song, ...filtered].slice(0, 30);
    });

    if (song.audio) {
      audio.src = song.audio;
      audio.load();
      audio.play().catch(() => setIsBuffering(false));
    } else {
      setIsBuffering(false);
    }

    // Set queue from songList (remaining songs after current)
    if (songList && songList.length > 0) {
      const idx = songList.findIndex(s => s.id === song.id);
      const remaining = idx >= 0 ? songList.slice(idx + 1) : songList;
      setQueue(remaining);
    }
  }, []);

  const handleNext = useCallback(async () => {
    if (repeatMode === 'one' && currentSong) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
      return;
    }

    if (queue.length > 0) {
      // Play from queue
      const idx = shuffleMode ? Math.floor(Math.random() * queue.length) : 0;
      const next = queue[idx];
      setQueue(prev => prev.filter((_, i) => i !== idx));
      // Don't call playSong to avoid resetting queue — play directly
      setCurrentSong(next);
      setCurrentTime(0);
      setIsPlaying(true);
      setIsBuffering(true);
      setRecentlyPlayed(prev => [next, ...prev.filter(s => s.id !== next.id)].slice(0, 30));
      if (next.audio) {
        audioRef.current.src = next.audio;
        audioRef.current.load();
        audioRef.current.play().catch(() => setIsBuffering(false));
      }
    } else {
      // Queue empty — auto-fetch related songs and play
      if (currentSong) {
        const related = await fetchRelatedSongs(currentSong);
        if (related.length > 0) {
          const next = related[0];
          setQueue(related.slice(1));
          setCurrentSong(next);
          setCurrentTime(0);
          setIsPlaying(true);
          setIsBuffering(true);
          setRecentlyPlayed(prev => [next, ...prev.filter(s => s.id !== next.id)].slice(0, 30));
          if (next.audio) {
            audioRef.current.src = next.audio;
            audioRef.current.load();
            audioRef.current.play().catch(() => setIsBuffering(false));
          }
          showToast('Playing similar songs');
        } else if (repeatMode === 'all') {
          // Repeat all from recently played
          if (recentlyPlayed.length > 0) playSong(recentlyPlayed[0], recentlyPlayed);
        } else {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      }
    }
  }, [queue, shuffleMode, repeatMode, currentSong, fetchRelatedSongs, recentlyPlayed, playSong]);

  const handlePrevious = useCallback(() => {
    if (currentTime > 3) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    } else if (recentlyPlayed.length > 1) {
      // Play the previous song from history
      const prev = recentlyPlayed[1];
      if (prev) {
        setCurrentSong(prev);
        setCurrentTime(0);
        setIsPlaying(true);
        setIsBuffering(true);
        if (prev.audio) {
          audioRef.current.src = prev.audio;
          audioRef.current.load();
          audioRef.current.play().catch(() => setIsBuffering(false));
        }
      }
    }
  }, [currentTime, recentlyPlayed]);

  const togglePlay = useCallback(() => {
    if (!currentSong) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { audioRef.current.play().catch(() => {}); setIsPlaying(true); }
  }, [currentSong, isPlaying]);

  const seekTo = useCallback((t) => { audioRef.current.currentTime = t; setCurrentTime(t); }, []);
  const addToQueue = useCallback((song) => { setQueue(prev => [...prev, song]); showToast('Added to queue'); }, []);
  const removeFromQueue = useCallback((idx) => { setQueue(prev => prev.filter((_, i) => i !== idx)); }, []);
  const clearQueue = useCallback(() => { setQueue([]); showToast('Queue cleared'); }, []);

  const toggleLike = useCallback((song) => {
    if (!song) return;
    setLikedSongs(prev => {
      const exists = prev.find(s => s.id === song.id);
      if (exists) { showToast('Removed from liked'); return prev.filter(s => s.id !== song.id); }
      else { showToast('Liked ❤️'); return [song, ...prev]; }
    });
  }, []);

  const isLiked = useCallback((songId) => likedSongs.some(s => s.id === songId), [likedSongs]);

  const toggleShuffle = useCallback(() => {
    setShuffleMode(p => !p);
    showToast(shuffleMode ? 'Shuffle off' : 'Shuffle on');
  }, [shuffleMode]);

  const toggleRepeat = useCallback(() => {
    setRepeatMode(p => {
      const modes = ['none', 'all', 'one'];
      const next = modes[(modes.indexOf(p) + 1) % 3];
      showToast(`Repeat: ${next === 'none' ? 'off' : next}`);
      return next;
    });
  }, []);

  return (
    <PlayerContext.Provider value={{
      currentSong, isPlaying, volume, currentTime, duration,
      queue, shuffleMode, repeatMode, isExpanded, isQueueOpen,
      likedSongs, recentlyPlayed, toast, isBuffering,
      playSong, togglePlay, handleNext, handlePrevious, seekTo,
      setVolume, addToQueue, removeFromQueue, clearQueue,
      toggleLike, isLiked, toggleShuffle, toggleRepeat,
      setIsExpanded, setIsQueueOpen, showToast,
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export default PlayerContext;
