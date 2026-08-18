import { Play, Pause, SkipForward, Heart, SkipBack } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration } from '../data/mockData';
import Equalizer from './Equalizer';
import { useRef } from 'react';

export default function MiniPlayer() {
  const { currentSong, isPlaying, togglePlay, playNext, playPrev, currentTime, duration, seekTo, toggleLike, likedSongs, setExpanded } = usePlayer();
  const touchStartY = useRef(0);

  if (!currentSong) return null;
  const liked = likedSongs.includes(currentSong.id);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const onTouchStart = e => { touchStartY.current = e.touches[0].clientY; };
  const onTouchEnd = e => { if (touchStartY.current - e.changedTouches[0].clientY > 50) setExpanded(true); };

  return (
    <div className="fixed bottom-[52px] md:bottom-0 left-0 md:left-[220px] right-0 z-40" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      {/* Progress */}
      <div className="h-[2px] bg-white/[0.06] cursor-pointer group" onClick={e => { const r = e.currentTarget.getBoundingClientRect(); seekTo((e.clientX - r.left) / r.width * duration); }}>
        <div className="h-full bg-violet-500 transition-[width] duration-150 relative" style={{ width: `${progress}%` }}>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
      
      {/* Content */}
      <div className="flex items-center h-[64px] px-4 glass border-t border-white/[0.04]">
        {/* Song Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer" onClick={() => setExpanded(true)}>
          <img src={currentSong.thumbnail} alt="" className="w-11 h-11 rounded-lg object-cover shadow-lg" loading="lazy" />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-white truncate">{currentSong.title}</p>
            <p className="text-[11px] text-[#71717A] truncate">{currentSong.artist}</p>
          </div>
          {isPlaying && <div className="shrink-0 hidden sm:block"><Equalizer /></div>}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={e => { e.stopPropagation(); toggleLike(currentSong.id); }} className={`p-2 transition-fast ${liked ? 'text-violet-400' : 'text-[#71717A] hover:text-white'}`}>
            <Heart size={16} fill={liked ? 'currentColor' : 'none'} strokeWidth={liked ? 0 : 1.5} />
          </button>
          <button onClick={e => { e.stopPropagation(); playPrev(); }} className="p-2 text-[#A1A1AA] hover:text-white hidden sm:block transition-fast">
            <SkipBack size={16} fill="currentColor" />
          </button>
          <button onClick={e => { e.stopPropagation(); togglePlay(); }} className="w-9 h-9 bg-white rounded-full flex items-center justify-center active:scale-95 transition-fast ml-1">
            {isPlaying ? <Pause size={15} className="text-[#0A0A0B]" fill="#0A0A0B" /> : <Play size={15} className="text-[#0A0A0B] ml-0.5" fill="#0A0A0B" />}
          </button>
          <button onClick={e => { e.stopPropagation(); playNext(); }} className="p-2 text-[#A1A1AA] hover:text-white transition-fast">
            <SkipForward size={16} fill="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
}
