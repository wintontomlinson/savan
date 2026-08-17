import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

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
  const [history, setHistory] = useState([]); // played songs
  const [shuffleMode, setShuffleMode] = useState(false);
  const [repeatMode, setRepeatMode] = useState('none');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [toast, setToast] = useState(null);

  // Liked songs - store full song objects
  const [likedSongs, setLikedSongs] = useState(() => {
    try {
      const saved = localStorage.getItem('yt_liked_songs');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Recently played - store full song objects
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

  const playSong = useCallback((song, songList = null) => {
    if (!song) return;
    const audio = audioRef.current;
    setCurrentSong(song);
    setCurrentTime(0);
    setIsPlaying(true);
    setIsBuffering(true);

    // Add to recently played (max 30)
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

    if (songList) {
      const idx = songList.findIndex(s => s.id === song.id);
      setQueue(songList.slice(idx + 1));
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (!currentSong) return;
    const audio = audioRef.current;
    if (isPlaying) { audio.pause(); setIsPlaying(false); }
    else { audio.play().catch(() => {}); setIsPlaying(true); }
  }, [currentSong, isPlaying]);

  const handleNext = useCallback(() => {
    if (repeatMode === 'one' && currentSong) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
      return;
    }
    if (queue.length > 0) {
      const idx = shuffleMode ? Math.floor(Math.random() * queue.length) : 0;
      const next = queue[idx];
      setQueue(prev => prev.filter((_, i) => i !== idx));
      playSong(next);
    } else if (repeatMode === 'all' && history.length > 0) {
      playSong(history[0], history);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [queue, shuffleMode, repeatMode, currentSong, history, playSong]);

  const handlePrevious = useCallback(() => {
    if (currentTime > 3) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    } else if (recentlyPlayed.length > 1) {
      playSong(recentlyPlayed[1]);
    }
  }, [currentTime, recentlyPlayed, playSong]);

  const seekTo = useCallback((t) => { audioRef.current.currentTime = t; setCurrentTime(t); }, []);

  const addToQueue = useCallback((song) => {
    setQueue(prev => [...prev, song]);
    showToast('Added to queue');
  }, []);

  const removeFromQueue = useCallback((idx) => {
    setQueue(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const clearQueue = useCallback(() => { setQueue([]); showToast('Queue cleared'); }, []);

  // Like - stores full song object
  const toggleLike = useCallback((song) => {
    if (!song) return;
    setLikedSongs(prev => {
      const exists = prev.find(s => s.id === song.id);
      if (exists) {
        showToast('Removed from liked');
        return prev.filter(s => s.id !== song.id);
      } else {
        showToast('Liked ❤️');
        return [song, ...prev];
      }
    });
  }, []);

  const isLiked = useCallback((songId) => {
    return likedSongs.some(s => s.id === songId);
  }, [likedSongs]);

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
