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
    <div className="fixed inset-0 z-[70] flex flex-col animate-slide-in-bottom">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={currentSong.image} alt="" className="w-full h-full object-cover blur-3xl scale-125 opacity-30" />
        <div className="absolute inset-0 bg-black/80"></div>
      </div>

      <div className="relative flex-1 flex flex-col overflow-y-auto safe-area-inset">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2 sm:pt-6">
          <button onClick={() => setIsExpanded(false)} className="p-2 -ml-2 rounded-full hover:bg-white/10 active:scale-90 transition-transform">
            <ChevronDown size={26} className="text-white" />
          </button>
          <p className="text-xs sm:text-sm text-[#AAAAAA] font-medium">Now Playing</p>
          <div className="w-10"></div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-8 pb-6 gap-5 sm:gap-8">
          {/* Album Art */}
          <img
            src={currentSong.image}
            alt=""
            className="w-[220px] h-[220px] sm:w-[280px] sm:h-[280px] md:w-[320px] md:h-[320px] rounded-2xl object-cover shadow-2xl"
          />

          {/* Song Info */}
          <div className="text-center w-full max-w-sm sm:max-w-md">
            <h1 className="text-lg sm:text-2xl font-bold text-white mb-0.5 truncate px-2">{currentSong.title}</h1>
            <p className="text-sm sm:text-base text-[#AAAAAA] truncate">{currentSong.artist}</p>

            {/* Visualizer */}
            {isPlaying && (
              <div className="flex items-end justify-center gap-[3px] h-4 mt-3">
                <span className="w-[3px] bg-[#1DB954] rounded-full animate-wave-1"></span>
                <span className="w-[3px] bg-[#1DB954] rounded-full animate-wave-2"></span>
                <span className="w-[3px] bg-[#1DB954] rounded-full animate-wave-3"></span>
                <span className="w-[3px] bg-[#1DB954] rounded-full animate-wave-1" style={{animationDelay:'0.2s'}}></span>
                <span className="w-[3px] bg-[#1DB954] rounded-full animate-wave-2" style={{animationDelay:'0.4s'}}></span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-sm sm:max-w-md">
            <div className="w-full h-[5px] bg-white/20 rounded-full cursor-pointer group"
              onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); seekTo((e.clientX - r.left) / r.width * duration); }}
            >
              <div className="h-full bg-white rounded-full relative" style={{ width: `${progress}%` }}>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 sm:opacity-100"></div>
              </div>
            </div>
            <div className="flex justify-between mt-1.5 text-[11px] text-[#AAAAAA]">
              <span>{formatDuration(currentTime)}</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-5 sm:gap-7 w-full">
            <button onClick={toggleShuffle} className={`p-2 ${shuffleMode ? 'text-[#1DB954]' : 'text-[#AAAAAA]'}`}>
              <Shuffle size={18} />
            </button>
            <button onClick={handlePrevious} className="p-2 text-white active:scale-90 transition-transform">
              <SkipBack size={24} sm:size={28} fill="currentColor" />
            </button>
            <button onClick={togglePlay} className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center active:scale-90 transition-transform shadow-xl">
              {isBuffering ? (
                <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : isPlaying ? (
                <Pause size={24} className="text-black" fill="black" />
              ) : (
                <Play size={24} className="text-black ml-1" fill="black" />
              )}
            </button>
            <button onClick={handleNext} className="p-2 text-white active:scale-90 transition-transform">
              <SkipForward size={24} fill="currentColor" />
            </button>
            <button onClick={toggleRepeat} className={`p-2 ${repeatMode !== 'none' ? 'text-[#1DB954]' : 'text-[#AAAAAA]'}`}>
              {repeatMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
            </button>
          </div>

          {/* Like + Volume */}
          <div className="flex items-center justify-center gap-5 w-full">
            <button onClick={() => toggleLike(currentSong)} className={`p-2 ${liked ? 'text-[#1DB954]' : 'text-[#AAAAAA]'}`}>
              <Heart size={22} fill={liked ? 'currentColor' : 'none'} />
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <button onClick={() => setVolume(volume > 0 ? 0 : 0.7)} className="p-1 text-[#AAAAAA]">
                {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input type="range" min="0" max="1" step="0.01" value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-24 h-1 rounded-full appearance-none bg-white/20 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
