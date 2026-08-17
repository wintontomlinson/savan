import { Play, Heart } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration } from '../data/data';
import ContextMenu from './ContextMenu';

export default function SongRow({ song, index, showAlbum = true, songList = [] }) {
  const { playSong, currentSong, isPlaying, toggleLike, likedSongs } = usePlayer();
  const isActive = currentSong?.id === song.id;
  const isLiked = likedSongs.includes(song.id);
  const list = songList;

  return (
    <div
      className={`group flex items-center gap-4 px-4 py-2 rounded-lg transition-all duration-200 hover:bg-[#282828] cursor-pointer ${
        isActive ? 'bg-white/5' : ''
      }`}
      onClick={() => playSong(song, list)}
      style={{ animationDelay: `${index * 0.03}s` }}
    >
      {/* Number / Play button */}
      <div className="w-8 flex-shrink-0 text-center">
        <span className={`text-sm group-hover:hidden ${isActive ? 'text-[#FF0000]' : 'text-[#AAAAAA]'}`}>
          {isActive && isPlaying ? (
            <div className="flex items-end justify-center gap-0.5 h-4">
              <div className="w-[3px] bg-[#FF0000] rounded-full animate-wave-1"></div>
              <div className="w-[3px] bg-[#FF0000] rounded-full animate-wave-2"></div>
              <div className="w-[3px] bg-[#FF0000] rounded-full animate-wave-3"></div>
            </div>
          ) : (
            index + 1
          )}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); playSong(song, list); }}
          className="hidden group-hover:block transition-transform duration-200 hover:scale-125"
        >
          <Play size={16} className="text-white mx-auto" fill="white" />
        </button>
      </div>

      {/* Thumbnail */}
      <img
        src={song.image}
        alt={song.title}
        className="w-10 h-10 rounded object-cover flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
      />

      {/* Title & Artist */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate transition-colors duration-200 ${isActive ? 'text-[#FF0000]' : 'text-white group-hover:text-[#FF0000]'}`}>
          {song.title}
        </p>
        <p className="text-xs text-[#AAAAAA] truncate">{song.artist}</p>
      </div>

      {/* Album */}
      {showAlbum && (
        <p className="hidden md:block text-sm text-[#AAAAAA] truncate w-32 lg:w-48 flex-shrink-0 transition-colors duration-200 hover:text-white">
          {song.album}
        </p>
      )}

      {/* Duration */}
      <span className="text-sm text-[#AAAAAA] w-12 text-right flex-shrink-0">
        {formatDuration(song.duration)}
      </span>

      {/* Like button */}
      <button
        onClick={(e) => { e.stopPropagation(); toggleLike(song.id); }}
        className={`p-1.5 rounded-full transition-all duration-200 btn-press ${
          isLiked ? 'text-[#FF0000] animate-heartbeat' : 'text-[#AAAAAA] opacity-0 group-hover:opacity-100 hover:text-[#FF0000] hover:scale-110'
        }`}
      >
        <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
      </button>

      {/* Context menu */}
      <div className="opacity-0 group-hover:opacity-100 transition-all duration-200" onClick={(e) => e.stopPropagation()}>
        <ContextMenu song={song} />
      </div>
    </div>
  );
}
