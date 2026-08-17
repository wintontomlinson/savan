import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { songs } from '../data/data';

const PlayerContext = createContext();

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used within PlayerProvider');
  return context;
};

export const PlayerProvider = ({ children }) => {
  const audioRef = useRef(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queue, setQueue] = useState([]);
  const [shuffleMode, setShuffleMode] = useState(false);
  const [repeatMode, setRepeatMode] = useState('none'); // none, one, all
  const [isExpanded, setIsExpanded] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [likedSongs, setLikedSongs] = useState(() => {
    const saved = localStorage.getItem('likedSongs');
    return saved ? JSON.parse(saved) : [];
  });
  const [toast, setToast] = useState(null);

  // Save liked songs to localStorage
  useEffect(() => {
    localStorage.setItem('likedSongs', JSON.stringify(likedSongs));
  }, [likedSongs]);

  // Save last played to localStorage
  useEffect(() => {
    if (currentSong) {
      localStorage.setItem('lastPlayed', JSON.stringify(currentSong));
    }
  }, [currentSong]);

  // Simulate time progress
  useEffect(() => {
    let interval;
    if (isPlaying && currentSong) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= currentSong.duration) {
            handleNext();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentSong]);

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
          setVolume((prev) => (prev > 0 ? 0 : 0.7));
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

  const playSong = useCallback((song, songList = null) => {
    setCurrentSong(song);
    setCurrentTime(0);
    setDuration(song.duration);
    setIsPlaying(true);

    if (songList) {
      const currentIndex = songList.findIndex((s) => s.id === song.id);
      const upNext = songList.slice(currentIndex + 1);
      setQueue(upNext);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (!currentSong) {
      // Play first song if nothing is selected
      if (songs.length > 0) {
        playSong(songs[0], songs);
      }
      return;
    }
    setIsPlaying((prev) => !prev);
  }, [currentSong, playSong]);

  const handleNext = useCallback(() => {
    if (repeatMode === 'one' && currentSong) {
      setCurrentTime(0);
      return;
    }

    if (queue.length > 0) {
      if (shuffleMode) {
        const randomIndex = Math.floor(Math.random() * queue.length);
        const nextSong = queue[randomIndex];
        const newQueue = queue.filter((_, i) => i !== randomIndex);
        setCurrentSong(nextSong);
        setCurrentTime(0);
        setDuration(nextSong.duration);
        setQueue(newQueue);
      } else {
        const [nextSong, ...rest] = queue;
        setCurrentSong(nextSong);
        setCurrentTime(0);
        setDuration(nextSong.duration);
        setQueue(rest);
      }
    } else if (repeatMode === 'all') {
      // Restart from beginning
      const allSongs = songs;
      if (allSongs.length > 0) {
        playSong(allSongs[0], allSongs);
      }
    } else {
      setIsPlaying(false);
    }
  }, [queue, shuffleMode, repeatMode, currentSong, playSong]);

  const handlePrevious = useCallback(() => {
    if (currentTime > 3) {
      setCurrentTime(0);
    } else {
      // Find current song in all songs and go back
      const currentIndex = songs.findIndex((s) => s.id === currentSong?.id);
      if (currentIndex > 0) {
        const prevSong = songs[currentIndex - 1];
        setCurrentSong(prevSong);
        setCurrentTime(0);
        setDuration(prevSong.duration);
      }
    }
  }, [currentTime, currentSong]);

  const seekTo = useCallback((time) => {
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
    // State
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
    audioRef,

    // Actions
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
