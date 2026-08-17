import { Play, Heart } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { songs, formatDuration } from '../data/data';
import ContextMenu from './ContextMenu';

export default function SongRow({ song, index, showAlbum = true, songList = null }) {
  const { playSong, currentSong, isPlaying, toggleLike, likedSongs } = usePlayer();
  const isActive = currentSong?.id === song.id;
  const isLiked = likedSongs.includes(song.id);
  const list = songList || songs;

  return (
    <div
      className={`group flex items-center gap-4 px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-[#282828] ${
        isActive ? 'bg-white/5' : ''
      }`}
    >
      {/* Number / Play button */}
      <div className="w-8 flex-shrink-0 text-center">
        <span className={`text-sm group-hover:hidden ${isActive ? 'text-[#FF0000]' : 'text-[#AAAAAA]'}`}>
          {isActive && isPlaying ? (
            <div className="flex items-end justify-center gap-0.5 h-4">
              <div className="equalizer-bar w-[3px] bg-[#FF0000] rounded-full"></div>
              <div className="equalizer-bar w-[3px] bg-[#FF0000] rounded-full"></div>
              <div className="equalizer-bar w-[3px] bg-[#FF0000] rounded-full"></div>
            </div>
          ) : (
            index + 1
          )}
        </span>
        <button
          onClick={() => playSong(song, list)}
          className="hidden group-hover:block"
        >
          <Play size={16} className="text-white mx-auto" fill="white" />
        </button>
      </div>

      {/* Thumbnail */}
      <img
        src={song.image}
        alt={song.title}
        className="w-10 h-10 rounded object-cover flex-shrink-0"
      />

      {/* Title & Artist */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isActive ? 'text-[#FF0000]' : 'text-white'}`}>
          {song.title}
        </p>
        <p className="text-xs text-[#AAAAAA] truncate">{song.artist}</p>
      </div>

      {/* Album */}
      {showAlbum && (
        <p className="hidden md:block text-sm text-[#AAAAAA] truncate w-32 lg:w-48 flex-shrink-0">
          {song.album}
        </p>
      )}

      {/* Duration */}
      <span className="text-sm text-[#AAAAAA] w-12 text-right flex-shrink-0">
        {formatDuration(song.duration)}
      </span>

      {/* Like button */}
      <button
        onClick={() => toggleLike(song.id)}
        className={`p-1.5 rounded-full transition-colors duration-200 ${
          isLiked ? 'text-[#FF0000]' : 'text-[#AAAAAA] opacity-0 group-hover:opacity-100'
        } hover:text-[#FF0000]`}
      >
        <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
      </button>

      {/* Context menu */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <ContextMenu song={song} />
      </div>
    </div>
  );
}
