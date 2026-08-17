import { Play, Pause, SkipForward, Heart } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration } from '../data/mockData';
import Equalizer from './Equalizer';

export default function MiniPlayer() {
  const { currentSong, isPlaying, togglePlay, playNext, currentTime, duration, seekTo, toggleLike, likedSongs, setExpanded } = usePlayer();

  if (!currentSong) return null;

  const liked = likedSongs.includes(currentSong.id);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-14 md:bottom-0 left-0 right-0 z-40 md:ml-[72px] lg:ml-[240px]">
      {/* Progress bar */}
      <div className="h-[3px] bg-[#1A1A1A] cursor-pointer" onClick={e => { const r = e.currentTarget.getBoundingClientRect(); seekTo((e.clientX - r.left) / r.width * duration); }}>
        <div className="h-full bg-[#FF0000] transition-[width] duration-200" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex items-center h-[60px] px-3 sm:px-4 bg-[#181818] border-t border-[#1A1A1A]">
        {/* Left: art + info + eq */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0 mr-2" onClick={() => setExpanded(true)}>
          <img src={currentSong.thumbnail} alt="" className="w-11 h-11 rounded-lg object-cover shrink-0 cursor-pointer active:scale-95 transition-transform" />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-white truncate">{currentSong.title}</p>
            <p className="text-[11px] text-[#888] truncate">{currentSong.artist}</p>
          </div>
          {isPlaying && <div className="shrink-0 hidden sm:block"><Equalizer size="sm" /></div>}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <button onClick={() => toggleLike(currentSong.id)} className={`p-2 ${liked ? 'text-[#FF0000]' : 'text-[#666]'}`}>
            <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
          </button>
          <button onClick={togglePlay} className="w-10 h-10 bg-white rounded-full flex items-center justify-center active:scale-90 transition-transform">
            {isPlaying ? <Pause size={18} className="text-black" fill="black" /> : <Play size={18} className="text-black ml-0.5" fill="black" />}
          </button>
          <button onClick={playNext} className="p-2 text-white active:scale-90 transition-transform">
            <SkipForward size={20} fill="white" />
          </button>
        </div>
      </div>
    </div>
  );
}
