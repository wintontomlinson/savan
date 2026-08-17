import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { songs } from '../data/data';

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
  const [repeatMode, setRepeatMode] = useState('none'); // none, one, all
  const [isExpanded, setIsExpanded] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [likedSongs, setLikedSongs] = useState(() => {
    try {
      const saved = localStorage.getItem('likedSongs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [toast, setToast] = useState(null);
  const [isBuffering, setIsBuffering] = useState(false);

  // Save liked songs to localStorage
  useEffect(() => {
    try { localStorage.setItem('likedSongs', JSON.stringify(likedSongs)); } catch {}
  }, [likedSongs]);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsBuffering(false);
    };

    const handleEnded = () => {
      handleNext();
    };

    const handleWaiting = () => {
      setIsBuffering(true);
    };

    const handleCanPlay = () => {
      setIsBuffering(false);
    };

    const handleError = (e) => {
      console.warn('Audio error:', e);
      setIsBuffering(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  // Volume control
  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          seekTo(Math.min(currentTime + 10, duration));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seekTo(Math.max(currentTime - 10, 0));
          break;
        case 'KeyM':
          setVolumeState((prev) => (prev > 0 ? 0 : 0.7));
          break;
        case 'KeyL':
          if (currentSong) toggleLike(currentSong.id);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTime, duration, currentSong]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const setVolume = useCallback((val) => {
    setVolumeState(val);
    audioRef.current.volume = val;
  }, []);

  const playSong = useCallback((song, songList = null) => {
    const audio = audioRef.current;

    // Set song state
    setCurrentSong(song);
    setCurrentTime(0);
    setIsPlaying(true);
    setIsBuffering(true);

    // Load and play audio
    if (song.audio) {
      audio.src = song.audio;
      audio.load();
      audio.play().catch((err) => {
        console.warn('Playback failed:', err.message);
        setIsBuffering(false);
      });
    }

    // Set queue from song list
    if (songList) {
      const currentIndex = songList.findIndex((s) => s.id === song.id);
      const upNext = songList.slice(currentIndex + 1);
      setQueue(upNext);
    }
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;

    if (!currentSong) {
      if (songs.length > 0) {
        playSong(songs[0], songs);
      }
      return;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch((err) => console.warn('Play failed:', err.message));
      setIsPlaying(true);
    }
  }, [currentSong, isPlaying, playSong]);

  const handleNext = useCallback(() => {
    if (repeatMode === 'one' && currentSong) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
      return;
    }

    if (queue.length > 0) {
      if (shuffleMode) {
        const randomIndex = Math.floor(Math.random() * queue.length);
        const nextSong = queue[randomIndex];
        const newQueue = queue.filter((_, i) => i !== randomIndex);
        setQueue(newQueue);
        playSong(nextSong);
      } else {
        const [nextSong, ...rest] = queue;
        setQueue(rest);
        playSong(nextSong);
      }
    } else if (repeatMode === 'all') {
      playSong(songs[0], songs);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [queue, shuffleMode, repeatMode, currentSong, playSong]);

  const handlePrevious = useCallback(() => {
    if (currentTime > 3) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    } else {
      const currentIndex = songs.findIndex((s) => s.id === currentSong?.id);
      if (currentIndex > 0) {
        playSong(songs[currentIndex - 1]);
      }
    }
  }, [currentTime, currentSong, playSong]);

  const seekTo = useCallback((time) => {
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  const addToQueue = useCallback((song) => {
    setQueue((prev) => [...prev, song]);
    showToast('Added to queue');
  }, []);

  const removeFromQueue = useCallback((index) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
    showToast('Queue cleared');
  }, []);

  const toggleLike = useCallback((songId) => {
    setLikedSongs((prev) => {
      if (prev.includes(songId)) {
        showToast('Removed from liked songs');
        return prev.filter((id) => id !== songId);
      } else {
        showToast('Added to liked songs');
        return [...prev, songId];
      }
    });
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffleMode((prev) => !prev);
    showToast(shuffleMode ? 'Shuffle off' : 'Shuffle on');
  }, [shuffleMode]);

  const toggleRepeat = useCallback(() => {
    setRepeatMode((prev) => {
      const modes = ['none', 'all', 'one'];
      const currentIndex = modes.indexOf(prev);
      const next = modes[(currentIndex + 1) % modes.length];
      showToast(`Repeat: ${next === 'none' ? 'off' : next}`);
      return next;
    });
  }, []);

  const value = {
    currentSong,
    isPlaying,
    volume,
    currentTime,
    duration,
    queue,
    shuffleMode,
    repeatMode,
    isExpanded,
    isQueueOpen,
    likedSongs,
    toast,
    isBuffering,
    audioRef,

    playSong,
    togglePlay,
    handleNext,
    handlePrevious,
    seekTo,
    setVolume,
    addToQueue,
    removeFromQueue,
    clearQueue,
    toggleLike,
    toggleShuffle,
    toggleRepeat,
    setIsExpanded,
    setIsQueueOpen,
    showToast,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};

export default PlayerContext;
