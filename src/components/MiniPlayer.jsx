import { Play, Pause, SkipForward, Heart, SkipBack } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import Equalizer from './Equalizer';
import { useRef, useState, useCallback } from 'react';

export default function MiniPlayer() {
  const { currentSong, isPlaying, togglePlay, playNext, playPrev, currentTime, duration, seekTo, toggleLike, likedSongs, setExpanded } = usePlayer();
  const touchY = useRef(0);
  const progressRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);

  // Drag-to-seek on mini progress bar
  const handleSeekStart = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);
    const rect = progressRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setDragProgress(pct);

    const onMove = (ev) => {
      ev.preventDefault();
      const cx = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const p = Math.max(0, Math.min(1, (cx - rect.left) / rect.width));
      setDragProgress(p);
    };
    const onEnd = (ev) => {
      const cx = ev.changedTouches ? ev.changedTouches[0].clientX : ev.clientX;
      const p = Math.max(0, Math.min(1, (cx - rect.left) / rect.width));
      seekTo(p * duration);
      setIsDragging(false);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
  }, [duration, seekTo]);

  if (!currentSong) return null;
  const liked = likedSongs.includes(currentSong.id);
  const progress = isDragging ? dragProgress * 100 : (duration > 0 ? (currentTime / duration) * 100 : 0);

  return (
    <div className="fixed bottom-[56px] md:bottom-0 left-0 md:left-[72px] lg:left-[240px] right-0 z-40 animate-mini-enter"
      onTouchStart={e => { touchY.current = e.touches[0].clientY; }}
      onTouchEnd={e => { if (touchY.current - e.changedTouches[0].clientY > 50) setExpanded(true); }}>
      
      {/* Progress Bar — draggable */}
      <div ref={progressRef}
        className="player-progress-track h-[3px] bg-white/[0.06] group"
        onMouseDown={handleSeekStart}
        onTouchStart={handleSeekStart}>
        <div className="h-full bg-gradient-to-r from-rose-500 to-rose-400 relative transition-[width] duration-100 ease-linear" style={{ width: `${progress}%` }}>
          <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg shadow-rose-500/30 transition-all duration-150 ${isDragging ? 'scale-[1.4] opacity-100' : 'scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100'}`} />
        </div>
      </div>

      {/* Content */}
      <div className="flex items-center h-[64px] px-3 sm:px-4 md:px-6 bg-[#0a0a0a]/95 backdrop-blur-2xl border-t border-white/[0.04]">
        
        {/* Song Info — tap to expand */}
        <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer active:opacity-80 transition-opacity" onClick={() => setExpanded(true)}>
          <div className="relative shrink-0">
            <div className={`w-11 h-11 rounded-xl overflow-hidden shadow-lg ring-1 ring-white/[0.06] transition-all duration-300 ${isPlaying ? 'shadow-rose-500/15' : ''}`}>
              <img src={currentSong.thumbnail} alt="" className="w-full h-full object-cover" />
            </div>
            {isPlaying && <div className="absolute -inset-0.5 rounded-xl bg-rose-500/10 blur-md -z-10 playing-pulse" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-white truncate leading-tight">{currentSong.title}</p>
            <p className="text-[11px] text-white/40 truncate mt-0.5">{currentSong.artist}</p>
          </div>
          {isPlaying && <div className="shrink-0 hidden sm:block mr-2"><Equalizer /></div>}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-0.5 shrink-0 ml-2">
          <button onClick={e => { e.stopPropagation(); toggleLike(currentSong.id); }} 
            className={`p-2 rounded-full transition-all duration-200 hidden md:flex items-center justify-center ${liked ? 'text-rose-400' : 'text-white/30 hover:text-white/60'}`}>
            <Heart size={17} fill={liked ? 'currentColor' : 'none'} strokeWidth={liked ? 0 : 1.5} />
          </button>
          <button onClick={e => { e.stopPropagation(); playPrev(); }} className="p-2 text-white/60 hover:text-white hidden md:flex items-center justify-center transition-colors duration-150 active:scale-90">
            <SkipBack size={17} fill="currentColor" />
          </button>
          <button onClick={e => { e.stopPropagation(); togglePlay(); }} className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-lg shadow-white/10 hover:shadow-white/20 transition-all duration-200 active:scale-90 hover:scale-[1.03]">
            {isPlaying ? <Pause size={16} className="text-black" fill="black" /> : <Play size={16} className="text-black ml-0.5" fill="black" />}
          </button>
          <button onClick={e => { e.stopPropagation(); playNext(); }} className="p-2 text-white/80 hover:text-white flex items-center justify-center transition-colors duration-150 active:scale-90">
            <SkipForward size={17} fill="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
}
