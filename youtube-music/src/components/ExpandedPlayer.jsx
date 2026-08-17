import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1,
  Heart, Volume2, VolumeX, ListMusic, ChevronDown, Download,
  PlusCircle, Mic2, Lock
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration } from '../data/data';

export default function ExpandedPlayer() {
  const {
    currentSong, isPlaying, togglePlay, handleNext, handlePrevious,
    shuffleMode, toggleShuffle, repeatMode, toggleRepeat,
    currentTime, duration, seekTo, volume, setVolume,
    toggleLike, likedSongs, isExpanded, setIsExpanded,
    setIsQueueOpen, showToast
  } = usePlayer();

  if (!isExpanded || !currentSong) return null;

  const isLiked = likedSongs.includes(currentSong.id);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col animate-slide-in-bottom">
      {/* Blurred Background */}
      <div className="absolute inset-0">
        <img
          src={currentSong.image}
          alt=""
          className="w-full h-full object-cover blur-3xl scale-110 opacity-30 animate-fade-in"
        />
        <div className="absolute inset-0 bg-black/70"></div>
      </div>

      {/* Content */}
      <div className="relative flex-1 flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 animate-fade-in-up">
          <button
            onClick={() => setIsExpanded(false)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors btn-press"
          >
            <ChevronDown size={24} className="text-white" />
          </button>
          <p className="text-sm text-[#AAAAAA] font-medium">Now Playing</p>
          <button
            onClick={() => {
              setIsQueueOpen(true);
              setIsExpanded(false);
            }}
            className="p-2 rounded-full hover:bg-white/10 transition-colors btn-press"
          >
            <ListMusic size={20} className="text-white" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 px-6 pb-8">
          {/* Album Art */}
          <div className="flex-shrink-0 animate-scale-in">
            <div className={`w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] lg:w-[380px] lg:h-[380px] rounded-2xl overflow-hidden shadow-2xl relative ${isPlaying ? 'animate-pulse-glow' : ''}`}>
              {/* Vinyl effect behind album art */}
              <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-gray-800 to-black transform ${isPlaying ? 'animate-vinyl' : 'animate-vinyl animate-vinyl-paused'}`}
                style={{ margin: '10%', borderRadius: '50%', zIndex: 0 }}>
                <div className="absolute inset-[30%] rounded-full bg-gray-900 border-4 border-gray-700"></div>
              </div>
              <img
                src={currentSong.image}
                alt={currentSong.title}
                className={`w-full h-full object-cover relative z-10 rounded-2xl transition-transform duration-1000 ${isPlaying ? 'scale-100' : 'scale-95'}`}
              />
            </div>
          </div>

          {/* Song Info & Controls */}
          <div className="flex flex-col items-center lg:items-start gap-6 w-full max-w-md animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {/* Song Info */}
            <div className="text-center lg:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 animate-text-reveal">{currentSong.title}</h1>
              <p className="text-lg text-[#AAAAAA] transition-all duration-300 hover:text-white cursor-pointer">{currentSong.artist}</p>
              <p className="text-sm text-[#AAAAAA]/70 mt-1">{currentSong.album}</p>
            </div>

            {/* Audio Visualizer */}
            {isPlaying && (
              <div className="flex items-end gap-1 h-6">
                <div className="w-1 bg-[#FF0000] rounded-full animate-wave-1"></div>
                <div className="w-1 bg-[#FF0000] rounded-full animate-wave-2"></div>
                <div className="w-1 bg-[#FF0000] rounded-full animate-wave-3"></div>
                <div className="w-1 bg-[#FF0000] rounded-full animate-wave-4"></div>
                <div className="w-1 bg-[#FF0000] rounded-full animate-wave-5"></div>
                <div className="w-1 bg-[#FF0000] rounded-full animate-wave-1" style={{ animationDelay: '0.3s' }}></div>
                <div className="w-1 bg-[#FF0000] rounded-full animate-wave-3" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1 bg-[#FF0000] rounded-full animate-wave-2" style={{ animationDelay: '0.5s' }}></div>
                <div className="w-1 bg-[#FF0000] rounded-full animate-wave-4" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1 bg-[#FF0000] rounded-full animate-wave-5" style={{ animationDelay: '0.4s' }}></div>
              </div>
            )}

            {/* Progress Bar */}
            <div className="w-full">
              <div
                className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer group"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const percent = (e.clientX - rect.left) / rect.width;
                  seekTo(Math.floor(percent * duration));
                }}
              >
                <div
                  className="h-full bg-[#FF0000] rounded-full relative transition-all animate-progress-glow"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:scale-125"></div>
                </div>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-[#AAAAAA]">{formatDuration(currentTime)}</span>
                <span className="text-xs text-[#AAAAAA]">{formatDuration(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6 w-full justify-center lg:justify-start">
              <button
                onClick={toggleShuffle}
                className={`p-2 rounded-full transition-all duration-200 btn-press hover:scale-110 ${
                  shuffleMode ? 'text-[#FF0000]' : 'text-[#AAAAAA] hover:text-white'
                }`}
              >
                <Shuffle size={22} />
              </button>
              <button
                onClick={handlePrevious}
                className="p-2 text-white hover:text-[#FF0000] transition-all duration-200 btn-press hover:scale-110"
              >
                <SkipBack size={28} fill="currentColor" />
              </button>
              <button
                onClick={togglePlay}
                className={`w-14 h-14 bg-white rounded-full flex items-center justify-center transition-all duration-200 shadow-xl btn-press hover:scale-110 ${isPlaying ? 'animate-pulse-glow' : ''}`}
              >
                {isPlaying ? (
                  <Pause size={28} className="text-black" fill="black" />
                ) : (
                  <Play size={28} className="text-black ml-1" fill="black" />
                )}
              </button>
              <button
                onClick={handleNext}
                className="p-2 text-white hover:text-[#FF0000] transition-all duration-200 btn-press hover:scale-110"
              >
                <SkipForward size={28} fill="currentColor" />
              </button>
              <button
                onClick={toggleRepeat}
                className={`p-2 rounded-full transition-all duration-200 btn-press hover:scale-110 ${
                  repeatMode !== 'none' ? 'text-[#FF0000]' : 'text-[#AAAAAA] hover:text-white'
                }`}
              >
                {repeatMode === 'one' ? <Repeat1 size={22} /> : <Repeat size={22} />}
              </button>
            </div>

            {/* Actions Row */}
            <div className="flex items-center gap-4 w-full justify-center lg:justify-start">
              <button
                onClick={() => toggleLike(currentSong.id)}
                className={`p-2 rounded-full transition-all duration-200 btn-press ${
                  isLiked ? 'text-[#FF0000] animate-heartbeat' : 'text-[#AAAAAA] hover:text-white hover:scale-110'
                }`}
              >
                <Heart size={22} fill={isLiked ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={() => showToast('Added to playlist')}
                className="p-2 text-[#AAAAAA] hover:text-white rounded-full transition-all duration-200 btn-press hover:scale-110"
              >
                <PlusCircle size={22} />
              </button>
              <button className="p-2 text-[#AAAAAA] hover:text-white rounded-full transition-all duration-200 btn-press hover:scale-110">
                <Mic2 size={22} />
              </button>
              <button
                onClick={() => showToast('Premium feature')}
                className="p-2 text-[#AAAAAA] hover:text-white rounded-full transition-all duration-200 relative btn-press hover:scale-110"
              >
                <Download size={22} />
                <Lock size={10} className="absolute top-1 right-1 text-[#AAAAAA]" />
              </button>
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => setVolume(volume > 0 ? 0 : 0.7)}
                  className="p-2 text-[#AAAAAA] hover:text-white transition-colors duration-200"
                >
                  {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-24 h-1 rounded-full appearance-none bg-white/20 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-150"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
