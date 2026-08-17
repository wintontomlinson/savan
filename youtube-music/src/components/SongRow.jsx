import { Play, Heart } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration } from '../data/data';

export default function SongRow({ song, index, songList = [] }) {
  const { playSong, currentSong, isPlaying, toggleLike, isLiked } = usePlayer();
  const isActive = currentSong?.id === song.id;
  const liked = isLiked(song.id);

  return (
    <div
      className={`group flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-colors hover:bg-[#282828] cursor-pointer ${isActive ? 'bg-white/5' : ''}`}
      onClick={() => playSong(song, songList)}
    >
      {/* Number */}
      <div className="w-6 sm:w-7 flex-shrink-0 text-center">
        <span className={`text-xs sm:text-sm group-hover:hidden ${isActive ? 'text-[#FF0000]' : 'text-[#AAAAAA]'}`}>
          {isActive && isPlaying ? (
            <span className="flex items-end justify-center gap-[2px] h-3 sm:h-4">
              <span className="w-[2px] sm:w-[3px] bg-[#FF0000] rounded-full animate-wave-1"></span>
              <span className="w-[2px] sm:w-[3px] bg-[#FF0000] rounded-full animate-wave-2"></span>
              <span className="w-[2px] sm:w-[3px] bg-[#FF0000] rounded-full animate-wave-3"></span>
            </span>
          ) : (
            index + 1
          )}
        </span>
        <button onClick={(e) => { e.stopPropagation(); playSong(song, songList); }} className="hidden group-hover:block">
          <Play size={12} className="text-white mx-auto" fill="white" />
        </button>
      </div>

      {/* Thumbnail */}
      <img src={song.image} alt="" className="w-9 h-9 sm:w-10 sm:h-10 rounded object-cover flex-shrink-0" />

      {/* Title & Artist */}
      <div className="flex-1 min-w-0">
        <p className={`text-xs sm:text-sm font-medium truncate ${isActive ? 'text-[#FF0000]' : 'text-white'}`}>{song.title}</p>
        <p className="text-[10px] sm:text-xs text-[#AAAAAA] truncate">{song.artist}</p>
      </div>

      {/* Duration */}
      <span className="text-[10px] sm:text-xs text-[#AAAAAA] flex-shrink-0 hidden sm:block">
        {formatDuration(song.duration)}
      </span>

      {/* Like */}
      <button
        onClick={(e) => { e.stopPropagation(); toggleLike(song); }}
        className={`p-1 rounded-full flex-shrink-0 ${liked ? 'text-[#FF0000]' : 'text-[#AAAAAA] opacity-0 group-hover:opacity-100'}`}
      >
        <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
      </button>
    </div>
  );
}
