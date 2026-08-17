import { Play, Heart } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration } from '../data/data';

export default function SongRow({ song, index, songList = [] }) {
  const { playSong, currentSong, isPlaying, toggleLike, isLiked } = usePlayer();
  const isActive = currentSong?.id === song.id;
  const liked = isLiked(song.id);

  return (
    <div
      className={`group flex items-center gap-3 px-3 sm:px-4 py-2.5 transition-colors hover:bg-white/5 cursor-pointer rounded-xl ${isActive ? 'bg-white/5' : ''}`}
      onClick={() => playSong(song, songList)}
    >
      {/* Number */}
      <div className="w-6 text-center flex-shrink-0">
        <span className={`text-[13px] group-hover:hidden ${isActive ? 'text-[#FC3C44]' : 'text-[#636366]'}`}>
          {isActive && isPlaying ? (
            <span className="flex items-end justify-center gap-[2px] h-3.5">
              <span className="w-[2px] bg-[#FC3C44] rounded-full animate-wave-1"></span>
              <span className="w-[2px] bg-[#FC3C44] rounded-full animate-wave-2"></span>
              <span className="w-[2px] bg-[#FC3C44] rounded-full animate-wave-3"></span>
            </span>
          ) : index + 1}
        </span>
        <button onClick={(e) => { e.stopPropagation(); playSong(song, songList); }} className="hidden group-hover:block">
          <Play size={12} className="text-white mx-auto" fill="white" />
        </button>
      </div>

      {/* Art */}
      <img src={song.image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0 shadow-sm" />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`text-[13px] sm:text-[14px] font-medium truncate ${isActive ? 'text-[#FC3C44]' : 'text-white'}`}>{song.title}</p>
        <p className="text-[11px] sm:text-[12px] text-[#98989F] truncate">{song.artist}</p>
      </div>

      {/* Duration */}
      <span className="text-[11px] text-[#636366] flex-shrink-0 hidden sm:block">{formatDuration(song.duration)}</span>

      {/* Like */}
      <button
        onClick={(e) => { e.stopPropagation(); toggleLike(song); }}
        className={`p-1.5 rounded-full flex-shrink-0 transition-all ${liked ? 'text-[#FC3C44]' : 'text-[#636366] opacity-0 group-hover:opacity-100'}`}
      >
        <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
      </button>
    </div>
  );
}
