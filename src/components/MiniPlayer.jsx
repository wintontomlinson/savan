import { Play, Pause, SkipForward, Heart, SkipBack } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import Equalizer from './Equalizer';
import { useRef } from 'react';

export default function MiniPlayer() {
  const { currentSong, isPlaying, togglePlay, playNext, playPrev, currentTime, duration, seekTo, toggleLike, likedSongs, setExpanded } = usePlayer();
  const touchY = useRef(0);

  if (!currentSong) return null;
  const liked = likedSongs.includes(currentSong.id);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-[52px] md:bottom-0 left-0 md:left-[72px] lg:left-[240px] right-0 z-40 animate-fade"
      onTouchStart={e => { touchY.current = e.touches[0].clientY; }}
      onTouchEnd={e => { if (touchY.current - e.changedTouches[0].clientY > 50) setExpanded(true); }}>
      {/* Progress */}
      <div className="h-[2.5px] bg-white/[0.06] cursor-pointer group" onClick={e => { const r = e.currentTarget.getBoundingClientRect(); seekTo((e.clientX - r.left) / r.width * duration); }}>
        <div className="h-full bg-gradient-to-r from-rose-500 to-rose-400 progress-bar relative" style={{ width: `${progress}%` }}>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity scale-0 group-hover:scale-100 transition-transform duration-150" />
        </div>
      </div>
      {/* Content */}
      <div className="flex items-center h-[62px] px-3 sm:px-4 glass border-t border-white/[0.04]">
        <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer" onClick={() => setExpanded(true)}>
          {/* Spinning thumbnail */}
          <div className={`w-11 h-11 rounded-full overflow-hidden shadow-lg ring-2 ring-white/[0.06] shrink-0 ${isPlaying ? 'animate-[spin_8s_linear_infinite]' : ''}`} style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}>
            <img src={currentSong.thumbnail} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-white truncate">{currentSong.title}</p>
            <p className="text-[11px] text-[#777] truncate">{currentSong.artist}</p>
          </div>
          {isPlaying && <div className="shrink-0 hidden sm:block"><Equalizer /></div>}
        </div>
        {/* Controls */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button onClick={e => { e.stopPropagation(); toggleLike(currentSong.id); }} className={`p-2.5 btn-press transition-colors duration-150 ${liked ? 'text-rose-400' : 'text-[#555]'}`}>
            <Heart size={17} fill={liked ? 'currentColor' : 'none'} strokeWidth={liked ? 0 : 1.5} />
          </button>
          <button onClick={e => { e.stopPropagation(); playPrev(); }} className="p-2 text-[#aaa] hover:text-white hidden sm:block btn-press">
            <SkipBack size={16} fill="currentColor" />
          </button>
          <button onClick={e => { e.stopPropagation(); togglePlay(); }} className={`w-10 h-10 rounded-full flex items-center justify-center btn-press shadow-lg ml-1 ${isPlaying ? 'bg-white animate-glow' : 'bg-white'}`}>
            {isPlaying ? <Pause size={16} className="text-[#060606]" fill="#060606" /> : <Play size={16} className="text-[#060606] ml-0.5" fill="#060606" />}
          </button>
          <button onClick={e => { e.stopPropagation(); playNext(); }} className="p-2.5 text-white btn-press">
            <SkipForward size={17} fill="white" />
          </button>
        </div>
      </div>
    </div>
  );
}
