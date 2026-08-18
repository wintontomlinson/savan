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
      <div className="h-[3px] bg-white/[0.06] cursor-pointer group" onClick={e => { const r = e.currentTarget.getBoundingClientRect(); seekTo((e.clientX - r.left) / r.width * duration); }}>
        <div className="h-full bg-gradient-to-r from-rose-500 to-rose-400 progress-bar relative" style={{ width: `${progress}%` }}>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg shadow-rose-500/30 opacity-0 group-hover:opacity-100 transition-all scale-0 group-hover:scale-100 duration-200" />
        </div>
      </div>
      {/* Content */}
      <div className="flex items-center h-[66px] px-3 sm:px-4 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/[0.04]">
        <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer" onClick={() => setExpanded(true)}>
          {/* Thumbnail with glow */}
          <div className="relative">
            <div className={`w-12 h-12 rounded-xl overflow-hidden shadow-lg shrink-0 ring-1 ring-white/[0.08] ${isPlaying ? 'shadow-rose-500/20' : ''}`}>
              <img src={currentSong.thumbnail} alt="" className="w-full h-full object-cover" />
            </div>
            {isPlaying && <div className="absolute -inset-1 rounded-xl bg-rose-500/10 blur-md -z-10 animate-pulse" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-white truncate">{currentSong.title}</p>
            <p className="text-[11px] text-[#666] truncate">{currentSong.artist}</p>
          </div>
          {isPlaying && <div className="shrink-0 hidden sm:block"><Equalizer /></div>}
        </div>
        {/* Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={e => { e.stopPropagation(); toggleLike(currentSong.id); }} className={`p-2 btn-press transition-colors ${liked ? 'text-rose-400' : 'text-[#555] hover:text-white'}`}>
            <Heart size={18} fill={liked ? 'currentColor' : 'none'} strokeWidth={liked ? 0 : 1.5} />
          </button>
          <button onClick={e => { e.stopPropagation(); playPrev(); }} className="p-2 text-[#aaa] hover:text-white hidden sm:block btn-press">
            <SkipBack size={18} fill="currentColor" />
          </button>
          <button onClick={e => { e.stopPropagation(); togglePlay(); }} className="w-11 h-11 rounded-full flex items-center justify-center btn-press ml-1 bg-white shadow-lg shadow-white/10 hover:shadow-white/20 transition-shadow">
            {isPlaying ? <Pause size={18} className="text-black" fill="black" /> : <Play size={18} className="text-black ml-0.5" fill="black" />}
          </button>
          <button onClick={e => { e.stopPropagation(); playNext(); }} className="p-2 text-white btn-press">
            <SkipForward size={18} fill="white" />
          </button>
        </div>
      </div>
    </div>
  );
}
