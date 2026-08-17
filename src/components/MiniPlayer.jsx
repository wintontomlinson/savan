import { Play, Pause, SkipForward, Heart } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import Equalizer from './Equalizer';

export default function MiniPlayer() {
  const { currentSong, isPlaying, togglePlay, playNext, currentTime, duration, seekTo, toggleLike, likedSongs, setExpanded } = usePlayer();
  if (!currentSong) return null;
  const liked = likedSongs.includes(currentSong.id);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-[52px] md:bottom-0 left-0 md:left-[72px] lg:left-[240px] right-0 z-40 animate-in">
      {/* Progress */}
      <div className="h-[3px] bg-white/5 cursor-pointer group" onClick={e => { const r = e.currentTarget.getBoundingClientRect(); seekTo((e.clientX - r.left) / r.width * duration); }}>
        <div className="h-full bg-[#FF0000] transition-[width] duration-300 relative" style={{ width: `${progress}%` }}>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
      {/* Content */}
      <div className="flex items-center h-[60px] px-3 sm:px-4 glass border-t border-white/5">
        <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer" onClick={() => setExpanded(true)}>
          <img src={currentSong.thumbnail} alt="" className="w-11 h-11 rounded-xl object-cover shadow-md ring-1 ring-white/10 active:scale-95 transition-transform" />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-white truncate">{currentSong.title}</p>
            <p className="text-[11px] text-[#777] truncate">{currentSong.artist}</p>
          </div>
          {isPlaying && <div className="shrink-0 hidden sm:block"><Equalizer /></div>}
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <button onClick={e => { e.stopPropagation(); toggleLike(currentSong.id); }}
            className={`p-2.5 transition-all active:scale-90 ${liked ? 'text-[#FF0000]' : 'text-[#555]'}`}>
            <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
          </button>
          <button onClick={e => { e.stopPropagation(); togglePlay(); }}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center active:scale-90 transition-transform shadow-lg">
            {isPlaying ? <Pause size={17} className="text-black" fill="black" /> : <Play size={17} className="text-black ml-0.5" fill="black" />}
          </button>
          <button onClick={e => { e.stopPropagation(); playNext(); }}
            className="p-2.5 text-white active:scale-90 transition-transform">
            <SkipForward size={20} fill="white" />
          </button>
        </div>
      </div>
    </div>
  );
}
