import { Play, Heart } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration } from '../data/mockData';
import Equalizer from './Equalizer';

export default function SongRow({ song, index, songList = [] }) {
  const { playSong, currentSong, isPlaying, toggleLike, likedSongs } = usePlayer();
  const isActive = currentSong?.id === song.id;
  const liked = likedSongs.includes(song.id);

  return (
    <div className={`group flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-3 transition-all duration-200 cursor-pointer ${
      isActive ? 'bg-rose-500/[0.06]' : 'hover:bg-white/[0.03] active:bg-white/[0.06]'
    }`}
      onClick={() => playSong(song, songList)} 
      style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}>
      
      {/* # or EQ */}
      <div className="w-6 shrink-0 flex justify-center">
        {isActive && isPlaying ? <Equalizer /> : (
          <>
            <span className={`text-[12px] tabular-nums group-hover:hidden ${isActive ? 'text-rose-400 font-semibold' : 'text-white/20'}`}>{index + 1}</span>
            {!(isActive && isPlaying) && <Play size={12} className="hidden group-hover:block text-white" fill="white" />}
          </>
        )}
      </div>

      {/* Art */}
      <div className="relative shrink-0">
        <img src={song.thumbnail} alt="" className={`w-11 h-11 rounded-lg object-cover ring-1 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg ${
          isActive ? 'ring-rose-500/20 shadow-rose-500/10' : 'ring-white/[0.05]'
        }`} loading="lazy" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`text-[13px] font-medium truncate leading-tight transition-colors duration-200 ${isActive ? 'text-rose-400' : 'text-white group-hover:text-white'}`}>{song.title}</p>
        <p className="text-[11px] text-white/35 truncate mt-0.5">{song.artist}</p>
      </div>

      {/* Duration */}
      <span className="text-[11px] text-white/20 tabular-nums shrink-0 hidden sm:block">{formatDuration(song.duration)}</span>

      {/* Like */}
      <button onClick={e => { e.stopPropagation(); toggleLike(song.id); }}
        className={`p-1.5 shrink-0 transition-all duration-200 active:scale-90 rounded-full ${
          liked ? 'text-rose-400' : 'text-white/15 sm:opacity-0 sm:group-hover:opacity-100 hover:text-white/50'
        }`}>
        <Heart size={14} fill={liked ? 'currentColor' : 'none'} strokeWidth={liked ? 0 : 1.5} />
      </button>
    </div>
  );
}
