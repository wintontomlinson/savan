import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Heart, Volume2, VolumeX, ListMusic, ChevronDown } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration } from '../data/data';

export default function ExpandedPlayer() {
  const {
    currentSong, isPlaying, togglePlay, handleNext, handlePrevious,
    shuffleMode, toggleShuffle, repeatMode, toggleRepeat,
    currentTime, duration, seekTo, volume, setVolume,
    toggleLike, isLiked, isExpanded, setIsExpanded, setIsQueueOpen, isBuffering
  } = usePlayer();

  if (!isExpanded || !currentSong) return null;

  const liked = isLiked(currentSong.id);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col animate-slide-in-bottom">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={currentSong.image} alt="" className="w-full h-full object-cover blur-3xl scale-110 opacity-30" />
        <div className="absolute inset-0 bg-black/75"></div>
      </div>

      <div className="relative flex-1 flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <button onClick={() => setIsExpanded(false)} className="p-2 rounded-full hover:bg-white/10 btn-press">
            <ChevronDown size={24} className="text-white" />
          </button>
          <p className="text-sm text-[#AAAAAA]">Now Playing</p>
          <button onClick={() => { setIsQueueOpen(true); setIsExpanded(false); }} className="p-2 rounded-full hover:bg-white/10">
            <ListMusic size={20} className="text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6 pb-8">
          {/* Art */}
          <img src={currentSong.image} alt="" className="w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] rounded-2xl object-cover shadow-2xl" />

          {/* Info */}
          <div className="text-center w-full max-w-md">
            <h1 className="text-2xl font-bold text-white mb-1 truncate">{currentSong.title}</h1>
            <p className="text-base text-[#AAAAAA]">{currentSong.artist}</p>

            {/* Visualizer */}
            {isPlaying && (
              <div className="flex items-end justify-center gap-1 h-5 mt-3">
                <span className="w-1 bg-[#FF0000] rounded-full animate-wave-1"></span>
                <span className="w-1 bg-[#FF0000] rounded-full animate-wave-2"></span>
                <span className="w-1 bg-[#FF0000] rounded-full animate-wave-3"></span>
                <span className="w-1 bg-[#FF0000] rounded-full animate-wave-1" style={{animationDelay:'0.2s'}}></span>
                <span className="w-1 bg-[#FF0000] rounded-full animate-wave-2" style={{animationDelay:'0.3s'}}></span>
              </div>
            )}

            {/* Progress */}
            <div className="mt-6">
              <div className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer group"
                onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); seekTo((e.clientX - r.left) / r.width * duration); }}
              >
                <div className="h-full bg-white rounded-full relative" style={{ width: `${progress}%` }}>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100"></div>
                </div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-[#AAAAAA]">
                <span>{formatDuration(currentTime)}</span>
                <span>{formatDuration(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6 mt-6">
              <button onClick={toggleShuffle} className={`p-2 ${shuffleMode ? 'text-[#FF0000]' : 'text-[#AAAAAA] hover:text-white'}`}>
                <Shuffle size={20} />
              </button>
              <button onClick={handlePrevious} className="p-2 text-white btn-press">
                <SkipBack size={26} fill="currentColor" />
              </button>
              <button onClick={togglePlay} className="w-14 h-14 bg-white rounded-full flex items-center justify-center btn-press">
                {isBuffering ? (
                  <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : isPlaying ? (
                  <Pause size={26} className="text-black" fill="black" />
                ) : (
                  <Play size={26} className="text-black ml-1" fill="black" />
                )}
              </button>
              <button onClick={handleNext} className="p-2 text-white btn-press">
                <SkipForward size={26} fill="currentColor" />
              </button>
              <button onClick={toggleRepeat} className={`p-2 ${repeatMode !== 'none' ? 'text-[#FF0000]' : 'text-[#AAAAAA] hover:text-white'}`}>
                {repeatMode === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
              </button>
            </div>

            {/* Like + Volume */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <button onClick={() => toggleLike(currentSong)} className={`p-2 ${liked ? 'text-[#FF0000]' : 'text-[#AAAAAA] hover:text-white'}`}>
                <Heart size={22} fill={liked ? 'currentColor' : 'none'} />
              </button>
              <div className="flex items-center gap-2">
                <button onClick={() => setVolume(volume > 0 ? 0 : 0.7)} className="p-1 text-[#AAAAAA] hover:text-white">
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
    </div>
  );
}
