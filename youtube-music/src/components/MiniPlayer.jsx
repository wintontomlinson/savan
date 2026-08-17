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
    <div className="fixed bottom-0 lg:bottom-0 left-0 right-0 z-40 bg-[#181818] border-t border-white/5 shadow-2xl animate-fade-in-up">
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
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:scale-125 shadow-lg"></div>
        </div>
      </div>

      <div className="flex items-center h-[72px] px-4">
        {/* Left: Song Info */}
        <div className="flex items-center gap-3 w-[30%] min-w-0">
          <img
            src={currentSong.image}
            alt={currentSong.title}
            className="w-12 h-12 rounded-lg object-cover flex-shrink-0 cursor-pointer hover:opacity-80 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            onClick={() => setIsExpanded(true)}
          />
          <div className="min-w-0 hidden sm:block">
            <p className="text-sm font-medium text-white truncate transition-colors duration-200 hover:text-[#FF0000] cursor-pointer" onClick={() => setIsExpanded(true)}>{currentSong.title}</p>
            <p className="text-xs text-[#AAAAAA] truncate">{currentSong.artist}</p>
          </div>
          <button
            onClick={() => toggleLike(currentSong.id)}
            className={`p-1.5 rounded-full transition-all duration-200 hidden sm:block btn-press ${
              isLiked ? 'text-[#FF0000] animate-heartbeat' : 'text-[#AAAAAA] hover:text-white hover:scale-110'
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
              className={`p-1.5 rounded-full transition-all duration-200 hidden sm:block btn-press hover:scale-110 ${
                shuffleMode ? 'text-[#FF0000]' : 'text-[#AAAAAA] hover:text-white'
              }`}
            >
              <Shuffle size={18} />
            </button>
            <button
              onClick={handlePrevious}
              className="p-1.5 text-white hover:text-[#FF0000] transition-all duration-200 btn-press hover:scale-110"
            >
              <SkipBack size={20} fill="currentColor" />
            </button>
            <button
              onClick={togglePlay}
              className={`w-10 h-10 bg-white rounded-full flex items-center justify-center transition-all duration-200 btn-press hover:scale-110 ${isPlaying ? 'shadow-[0_0_15px_rgba(255,0,0,0.3)]' : ''}`}
            >
              {isPlaying ? (
                <Pause size={20} className="text-black" fill="black" />
              ) : (
                <Play size={20} className="text-black ml-0.5" fill="black" />
              )}
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 text-white hover:text-[#FF0000] transition-all duration-200 btn-press hover:scale-110"
            >
              <SkipForward size={20} fill="currentColor" />
            </button>
            <button
              onClick={toggleRepeat}
              className={`p-1.5 rounded-full transition-all duration-200 hidden sm:block btn-press hover:scale-110 ${
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
              <div className="h-full bg-white/50 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
            <span className="w-10">{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Right: Volume & extras */}
        <div className="flex items-center gap-2 w-[30%] justify-end">
          {/* Mini equalizer when playing */}
          {isPlaying && (
            <div className="hidden lg:flex items-end gap-0.5 h-4 mr-2">
              <div className="w-[3px] bg-[#FF0000] rounded-full animate-wave-1"></div>
              <div className="w-[3px] bg-[#FF0000] rounded-full animate-wave-2"></div>
              <div className="w-[3px] bg-[#FF0000] rounded-full animate-wave-3"></div>
            </div>
          )}
          <button className="p-1.5 text-[#AAAAAA] hover:text-white transition-all duration-200 hidden lg:block hover:scale-110">
            <Mic2 size={18} />
          </button>
          <button
            onClick={() => setIsQueueOpen(!isQueueOpen)}
            className={`p-1.5 transition-all duration-200 hidden lg:block hover:scale-110 ${
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
              className="w-20 h-1 rounded-full appearance-none bg-white/20 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-150"
            />
          </div>
          <button
            onClick={() => setIsExpanded(true)}
            className="p-1.5 text-[#AAAAAA] hover:text-white transition-all duration-200 hover:scale-110"
          >
            <Maximize2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
