import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Heart, Volume2, VolumeX, ChevronDown } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration } from '../data/data';

export default function ExpandedPlayer() {
  const {
    currentSong, isPlaying, togglePlay, handleNext, handlePrevious,
    shuffleMode, toggleShuffle, repeatMode, toggleRepeat,
    currentTime, duration, seekTo, volume, setVolume,
    toggleLike, isLiked, isExpanded, setIsExpanded, isBuffering
  } = usePlayer();

  if (!isExpanded || !currentSong) return null;

  const liked = isLiked(currentSong.id);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[70] flex flex-col animate-slide-up">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={currentSong.image} alt="" className="w-full h-full object-cover blur-[80px] scale-150 opacity-40" />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      <div className="relative flex-1 flex flex-col">
        {/* Handle bar (mobile) + Close */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <button onClick={() => setIsExpanded(false)} className="p-1 active:scale-90 transition-transform">
            <ChevronDown size={28} className="text-white/80" />
          </button>
          <p className="text-[12px] text-white/60 font-medium uppercase tracking-wider">Playing from Library</p>
          <div className="w-8"></div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 sm:px-12 pb-8 gap-6 sm:gap-8">
          {/* Album Art */}
          <div className="w-[240px] h-[240px] sm:w-[300px] sm:h-[300px] md:w-[340px] md:h-[340px] rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            <img src={currentSong.image} alt="" className="w-full h-full object-cover" />
          </div>

          {/* Info + Controls */}
          <div className="w-full max-w-[340px] sm:max-w-[380px]">
            {/* Title & Like */}
            <div className="flex items-start justify-between mb-6">
              <div className="min-w-0 flex-1 mr-4">
                <h1 className="text-[20px] sm:text-[22px] font-bold text-white truncate">{currentSong.title}</h1>
                <p className="text-[15px] text-[#FC3C44] truncate">{currentSong.artist}</p>
              </div>
              <button onClick={() => toggleLike(currentSong)} className={`p-1.5 mt-1 ${liked ? 'text-[#FC3C44]' : 'text-white/40'}`}>
                <Heart size={22} fill={liked ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="w-full h-[4px] bg-white/20 rounded-full cursor-pointer"
                onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); seekTo((e.clientX - r.left) / r.width * duration); }}
              >
                <div className="h-full bg-white rounded-full relative" style={{ width: `${progress}%` }}>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[14px] h-[14px] bg-white rounded-full shadow-md"></div>
                </div>
              </div>
              <div className="flex justify-between mt-1.5 text-[11px] text-white/50 font-medium">
                <span>{formatDuration(currentTime)}</span>
                <span>-{formatDuration(Math.max(0, duration - currentTime))}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={toggleShuffle} className={`p-2 ${shuffleMode ? 'text-[#FC3C44]' : 'text-white/50'}`}>
                <Shuffle size={20} />
              </button>
              <button onClick={handlePrevious} className="p-2 text-white active:scale-90 transition-transform">
                <SkipBack size={30} fill="white" />
              </button>
              <button onClick={togglePlay} className="w-[56px] h-[56px] bg-white rounded-full flex items-center justify-center active:scale-90 transition-transform shadow-xl">
                {isBuffering ? (
                  <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : isPlaying ? (
                  <Pause size={26} className="text-black" fill="black" />
                ) : (
                  <Play size={26} className="text-black ml-1" fill="black" />
                )}
              </button>
              <button onClick={handleNext} className="p-2 text-white active:scale-90 transition-transform">
                <SkipForward size={30} fill="white" />
              </button>
              <button onClick={toggleRepeat} className={`p-2 ${repeatMode !== 'none' ? 'text-[#FC3C44]' : 'text-white/50'}`}>
                {repeatMode === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
              </button>
            </div>

            {/* Volume (desktop) */}
            <div className="hidden sm:flex items-center justify-center gap-3 mt-2">
              <button onClick={() => setVolume(volume > 0 ? 0 : 0.7)} className="text-white/50">
                {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <input type="range" min="0" max="1" step="0.01" value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-28 h-[3px] rounded-full appearance-none bg-white/20 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
