import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1,
  Heart, Volume2, VolumeX, ListMusic, Maximize2, Mic2
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration } from '../data/data';

export default function MiniPlayer() {
  const {
    currentSong, isPlaying, togglePlay, handleNext, handlePrevious,
    shuffleMode, toggleShuffle, repeatMode, toggleRepeat,
    currentTime, duration, seekTo, volume, setVolume,
    toggleLike, likedSongs, setIsExpanded, setIsQueueOpen, isQueueOpen
  } = usePlayer();

  if (!currentSong) return null;

  const isLiked = likedSongs.includes(currentSong.id);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 lg:bottom-0 left-0 right-0 z-40 bg-[#181818] border-t border-white/5 shadow-2xl">
      {/* Progress bar (top) */}
      <div className="relative h-1 w-full bg-white/10 group cursor-pointer"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const percent = (e.clientX - rect.left) / rect.width;
          seekTo(Math.floor(percent * duration));
        }}
      >
        <div
          className="h-full bg-[#FF0000] transition-all duration-200 relative"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"></div>
        </div>
      </div>

      <div className="flex items-center h-[72px] px-4">
        {/* Left: Song Info */}
        <div className="flex items-center gap-3 w-[30%] min-w-0">
          <img
            src={currentSong.image}
            alt={currentSong.title}
            className="w-12 h-12 rounded-lg object-cover flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setIsExpanded(true)}
          />
          <div className="min-w-0 hidden sm:block">
            <p className="text-sm font-medium text-white truncate">{currentSong.title}</p>
            <p className="text-xs text-[#AAAAAA] truncate">{currentSong.artist}</p>
          </div>
          <button
            onClick={() => toggleLike(currentSong.id)}
            className={`p-1.5 rounded-full transition-colors duration-200 hidden sm:block ${
              isLiked ? 'text-[#FF0000]' : 'text-[#AAAAAA] hover:text-white'
            }`}
          >
            <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Center: Controls */}
        <div className="flex-1 flex flex-col items-center justify-center gap-1">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={toggleShuffle}
              className={`p-1.5 rounded-full transition-colors duration-200 hidden sm:block ${
                shuffleMode ? 'text-[#FF0000]' : 'text-[#AAAAAA] hover:text-white'
              }`}
            >
              <Shuffle size={18} />
            </button>
            <button
              onClick={handlePrevious}
              className="p-1.5 text-white hover:text-[#FF0000] transition-colors duration-200"
            >
              <SkipBack size={20} fill="currentColor" />
            </button>
            <button
              onClick={togglePlay}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform duration-200"
            >
              {isPlaying ? (
                <Pause size={20} className="text-black" fill="black" />
              ) : (
                <Play size={20} className="text-black ml-0.5" fill="black" />
              )}
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 text-white hover:text-[#FF0000] transition-colors duration-200"
            >
              <SkipForward size={20} fill="currentColor" />
            </button>
            <button
              onClick={toggleRepeat}
              className={`p-1.5 rounded-full transition-colors duration-200 hidden sm:block ${
                repeatMode !== 'none' ? 'text-[#FF0000]' : 'text-[#AAAAAA] hover:text-white'
              }`}
            >
              {repeatMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
            </button>
          </div>
          {/* Time */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-[#AAAAAA]">
            <span className="w-10 text-right">{formatDuration(currentTime)}</span>
            <div className="w-[200px] lg:w-[300px] h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-white/50 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
            <span className="w-10">{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Right: Volume & extras */}
        <div className="flex items-center gap-2 w-[30%] justify-end">
          <button className="p-1.5 text-[#AAAAAA] hover:text-white transition-colors duration-200 hidden lg:block">
            <Mic2 size={18} />
          </button>
          <button
            onClick={() => setIsQueueOpen(!isQueueOpen)}
            className={`p-1.5 transition-colors duration-200 hidden lg:block ${
              isQueueOpen ? 'text-[#FF0000]' : 'text-[#AAAAAA] hover:text-white'
            }`}
          >
            <ListMusic size={18} />
          </button>
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={() => setVolume(volume > 0 ? 0 : 0.7)}
              className="p-1.5 text-[#AAAAAA] hover:text-white transition-colors duration-200"
            >
              {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 h-1 rounded-full appearance-none bg-white/20 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
            />
          </div>
          <button
            onClick={() => setIsExpanded(true)}
            className="p-1.5 text-[#AAAAAA] hover:text-white transition-colors duration-200"
          >
            <Maximize2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
