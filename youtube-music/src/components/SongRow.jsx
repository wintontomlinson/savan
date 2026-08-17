import { Play, Heart } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration } from '../data/data';
import ContextMenu from './ContextMenu';

export default function SongRow({ song, index, showAlbum = true, songList = [] }) {
  const { playSong, currentSong, isPlaying, toggleLike, isLiked } = usePlayer();
  const isActive = currentSong?.id === song.id;
  const liked = isLiked(song.id);

  return (
    <div
      className={`group flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 hover:bg-[#282828] cursor-pointer ${isActive ? 'bg-white/5' : ''}`}
      onClick={() => playSong(song, songList)}
    >
      {/* Number / Play */}
      <div className="w-7 flex-shrink-0 text-center">
        <span className={`text-sm group-hover:hidden ${isActive ? 'text-[#FF0000]' : 'text-[#AAAAAA]'}`}>
          {isActive && isPlaying ? (
            <span className="flex items-end justify-center gap-0.5 h-4">
              <span className="w-[3px] bg-[#FF0000] rounded-full animate-wave-1"></span>
              <span className="w-[3px] bg-[#FF0000] rounded-full animate-wave-2"></span>
              <span className="w-[3px] bg-[#FF0000] rounded-full animate-wave-3"></span>
            </span>
          ) : (
            index + 1
          )}
        </span>
        <button onClick={(e) => { e.stopPropagation(); playSong(song, songList); }} className="hidden group-hover:block">
          <Play size={14} className="text-white mx-auto" fill="white" />
        </button>
      </div>

      {/* Thumbnail */}
      <img src={song.image} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />

      {/* Title & Artist */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isActive ? 'text-[#FF0000]' : 'text-white'}`}>{song.title}</p>
        <p className="text-xs text-[#AAAAAA] truncate">{song.artist}</p>
      </div>

      {/* Album */}
      {showAlbum && song.album && (
        <p className="hidden md:block text-xs text-[#AAAAAA] truncate w-28 lg:w-40 flex-shrink-0">{song.album}</p>
      )}

      {/* Duration */}
      <span className="text-xs text-[#AAAAAA] w-10 text-right flex-shrink-0">
        {formatDuration(song.duration)}
      </span>

      {/* Like */}
      <button
        onClick={(e) => { e.stopPropagation(); toggleLike(song); }}
        className={`p-1 rounded-full transition-all duration-200 ${liked ? 'text-[#FF0000]' : 'text-[#AAAAAA] opacity-0 group-hover:opacity-100 hover:text-[#FF0000]'}`}
      >
        <Heart size={15} fill={liked ? 'currentColor' : 'none'} />
      </button>

      {/* Menu */}
      <div className="opacity-0 group-hover:opacity-100" onClick={e => e.stopPropagation()}>
        <ContextMenu song={song} />
      </div>
    </div>
  );
}
