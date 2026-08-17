import { Play, Pause, SkipBack, SkipForward, Heart, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration } from '../data/data';

export default function MiniPlayer() {
  const {
    currentSong, isPlaying, togglePlay, handleNext, handlePrevious,
    currentTime, duration, seekTo, volume, setVolume,
    toggleLike, isLiked, setIsExpanded, isBuffering
  } = usePlayer();

  if (!currentSong) return null;

  const liked = isLiked(currentSong.id);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-[52px] lg:bottom-0 left-0 right-0 z-40 bg-[#181818] border-t border-white/5">
      {/* Progress bar */}
      <div className="h-[3px] w-full bg-white/10 cursor-pointer group"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          seekTo((e.clientX - rect.left) / rect.width * duration);
        }}
      >
        <div className="h-full bg-[#FF0000] relative" style={{ width: `${progress}%` }}>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
      </div>

      <div className="flex items-center h-[56px] sm:h-[64px] px-2 sm:px-4">
        {/* Left - Song Info */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 mr-2">
          <img
            src={currentSong.image}
            alt=""
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg object-cover cursor-pointer active:scale-95 transition-transform"
            onClick={() => setIsExpanded(true)}
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-white truncate">{currentSong.title}</p>
            <p className="text-[10px] sm:text-xs text-[#AAAAAA] truncate">{currentSong.artist}</p>
          </div>
          <button
            onClick={() => toggleLike(currentSong)}
            className={`p-1.5 flex-shrink-0 ${liked ? 'text-[#FF0000]' : 'text-[#AAAAAA]'}`}
          >
            <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Center - Controls */}
        <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
          <button onClick={handlePrevious} className="p-1.5 text-white hidden sm:block btn-press">
            <SkipBack size={18} fill="currentColor" />
          </button>
          <button onClick={togglePlay} className="w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center btn-press flex-shrink-0">
            {isBuffering ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            ) : isPlaying ? (
              <Pause size={16} className="text-black" fill="black" />
            ) : (
              <Play size={16} className="text-black ml-0.5" fill="black" />
            )}
          </button>
          <button onClick={handleNext} className="p-1.5 text-white btn-press">
            <SkipForward size={18} fill="currentColor" />
          </button>
        </div>

        {/* Right - Volume & Expand */}
        <div className="flex items-center gap-1 sm:gap-2 ml-2 flex-shrink-0">
          <span className="text-[9px] text-[#AAAAAA] hidden md:block whitespace-nowrap">{formatDuration(currentTime)}/{formatDuration(duration)}</span>
          <div className="hidden lg:flex items-center gap-1">
            <button onClick={() => setVolume(volume > 0 ? 0 : 0.7)} className="p-1 text-[#AAAAAA] hover:text-white">
              {volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
            <input type="range" min="0" max="1" step="0.01" value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-14 h-1 rounded-full appearance-none bg-white/20 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
            />
          </div>
          <button onClick={() => setIsExpanded(true)} className="p-1.5 text-[#AAAAAA] hover:text-white">
            <Maximize2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
