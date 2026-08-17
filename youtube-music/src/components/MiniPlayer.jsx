import { Play, Pause, SkipBack, SkipForward, Heart, Volume2, VolumeX, ListMusic, Maximize2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration } from '../data/data';

export default function MiniPlayer() {
  const {
    currentSong, isPlaying, togglePlay, handleNext, handlePrevious,
    currentTime, duration, seekTo, volume, setVolume,
    toggleLike, isLiked, setIsExpanded, setIsQueueOpen, isQueueOpen, isBuffering
  } = usePlayer();

  if (!currentSong) return null;

  const liked = isLiked(currentSong.id);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#181818] border-t border-white/5 shadow-2xl animate-fade-in-up">
      {/* Progress */}
      <div className="h-1 w-full bg-white/10 cursor-pointer group"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          seekTo((e.clientX - rect.left) / rect.width * duration);
        }}
      >
        <div className="h-full bg-[#FF0000] transition-all relative" style={{ width: `${progress}%` }}>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100"></div>
        </div>
      </div>

      <div className="flex items-center h-[68px] px-3 sm:px-4">
        {/* Song Info */}
        <div className="flex items-center gap-3 w-[35%] min-w-0">
          <img
            src={currentSong.image}
            alt=""
            className="w-11 h-11 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setIsExpanded(true)}
          />
          <div className="min-w-0 hidden sm:block">
            <p className="text-sm font-medium text-white truncate">{currentSong.title}</p>
            <p className="text-xs text-[#AAAAAA] truncate">{currentSong.artist}</p>
          </div>
          <button
            onClick={() => toggleLike(currentSong)}
            className={`p-1 hidden sm:block ${liked ? 'text-[#FF0000]' : 'text-[#AAAAAA] hover:text-white'}`}
          >
            <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Controls */}
        <div className="flex-1 flex items-center justify-center gap-3">
          <button onClick={handlePrevious} className="p-1 text-white hover:text-[#FF0000] btn-press">
            <SkipBack size={20} fill="currentColor" />
          </button>
          <button onClick={togglePlay} className="w-9 h-9 bg-white rounded-full flex items-center justify-center btn-press">
            {isBuffering ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            ) : isPlaying ? (
              <Pause size={18} className="text-black" fill="black" />
            ) : (
              <Play size={18} className="text-black ml-0.5" fill="black" />
            )}
          </button>
          <button onClick={handleNext} className="p-1 text-white hover:text-[#FF0000] btn-press">
            <SkipForward size={20} fill="currentColor" />
          </button>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 w-[35%] justify-end">
          <span className="text-[10px] text-[#AAAAAA] hidden sm:block">{formatDuration(currentTime)} / {formatDuration(duration)}</span>
          <button onClick={() => setIsQueueOpen(!isQueueOpen)} className={`p-1 hidden lg:block ${isQueueOpen ? 'text-[#FF0000]' : 'text-[#AAAAAA] hover:text-white'}`}>
            <ListMusic size={18} />
          </button>
          <div className="hidden lg:flex items-center gap-1">
            <button onClick={() => setVolume(volume > 0 ? 0 : 0.7)} className="p-1 text-[#AAAAAA] hover:text-white">
              {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input type="range" min="0" max="1" step="0.01" value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-16 h-1 rounded-full appearance-none bg-white/20 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
            />
          </div>
          <button onClick={() => setIsExpanded(true)} className="p-1 text-[#AAAAAA] hover:text-white">
            <Maximize2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
