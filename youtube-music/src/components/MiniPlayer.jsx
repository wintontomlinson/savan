import { Play, Pause, SkipForward, Heart, Maximize2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export default function MiniPlayer() {
  const {
    currentSong, isPlaying, togglePlay, handleNext,
    currentTime, duration, seekTo,
    toggleLike, isLiked, setIsExpanded, isBuffering
  } = usePlayer();

  if (!currentSong) return null;

  const liked = isLiked(currentSong.id);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-[50px] lg:bottom-0 left-0 lg:left-[260px] right-0 z-40 mx-2 lg:mx-3 mb-1 lg:mb-2 rounded-2xl overflow-hidden glass border border-white/10 shadow-2xl">
      {/* Progress */}
      <div className="h-[2px] w-full bg-white/10 cursor-pointer"
        onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); seekTo((e.clientX - r.left) / r.width * duration); }}
      >
        <div className="h-full bg-[#FC3C44]" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="flex items-center h-[56px] px-3">
        {/* Song */}
        <div className="flex items-center gap-3 flex-1 min-w-0 mr-3" onClick={() => setIsExpanded(true)}>
          <img src={currentSong.image} alt="" className="w-10 h-10 rounded-lg object-cover shadow-md cursor-pointer" />
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-white truncate">{currentSong.title}</p>
            <p className="text-[11px] text-[#98989F] truncate">{currentSong.artist}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <button onClick={() => toggleLike(currentSong)} className={`p-2 ${liked ? 'text-[#FC3C44]' : 'text-[#98989F]'}`}>
            <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
          </button>
          <button onClick={togglePlay} className="p-2 text-white active:scale-90 transition-transform">
            {isBuffering ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : isPlaying ? (
              <Pause size={22} fill="white" />
            ) : (
              <Play size={22} fill="white" />
            )}
          </button>
          <button onClick={handleNext} className="p-2 text-white active:scale-90 transition-transform">
            <SkipForward size={20} fill="white" />
          </button>
        </div>
      </div>
    </div>
  );
}
