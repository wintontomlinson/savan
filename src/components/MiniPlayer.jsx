import { Play, Pause, SkipForward, Heart } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import Equalizer from './Equalizer';

export default function MiniPlayer() {
  const { currentSong, isPlaying, togglePlay, playNext, currentTime, duration, seekTo, toggleLike, likedSongs, setExpanded } = usePlayer();
  if (!currentSong) return null;
  const liked = likedSongs.includes(currentSong.id);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-14 md:bottom-0 left-0 md:left-[72px] lg:left-[240px] right-0 z-40">
      <div className="h-[3px] bg-[#222]" onClick={e => { const r = e.currentTarget.getBoundingClientRect(); seekTo((e.clientX - r.left) / r.width * duration); }}>
        <div className="h-full bg-[#FF0000]" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex items-center h-[58px] px-3 bg-[#111] border-t border-[#1a1a1a]">
        <div className="flex items-center gap-3 flex-1 min-w-0" onClick={() => setExpanded(true)}>
          <img src={currentSong.thumbnail} alt="" className="w-11 h-11 rounded-lg object-cover shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-white truncate">{currentSong.title}</p>
            <p className="text-[11px] text-[#777] truncate">{currentSong.artist}</p>
          </div>
          {isPlaying && <div className="shrink-0 hidden sm:block"><Equalizer /></div>}
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <button onClick={e => { e.stopPropagation(); toggleLike(currentSong.id); }} className={`p-2.5 ${liked ? 'text-[#FF0000]' : 'text-[#555]'}`}>
            <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
          </button>
          <button onClick={e => { e.stopPropagation(); togglePlay(); }} className="w-10 h-10 bg-white rounded-full flex items-center justify-center active:scale-90 transition-transform">
            {isPlaying ? <Pause size={17} className="text-black" fill="black" /> : <Play size={17} className="text-black ml-0.5" fill="black" />}
          </button>
          <button onClick={e => { e.stopPropagation(); playNext(); }} className="p-2.5 text-white">
            <SkipForward size={20} fill="white" />
          </button>
        </div>
      </div>
    </div>
  );
}
