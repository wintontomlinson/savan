import { Play } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import ContextMenu from './ContextMenu';

export default function SongCard({ song }) {
  const { playSong, currentSong, isPlaying } = usePlayer();
  const isActive = currentSong?.id === song.id;

  return (
    <div className="group relative flex-shrink-0 w-[160px] sm:w-[180px] card-hover-tilt">
      <div className="relative aspect-square rounded-lg overflow-hidden mb-2">
        <img
          src={song.image}
          alt={song.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={() => playSong(song)}
            className="w-12 h-12 bg-[#FF0000] rounded-full flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-all duration-300 btn-press hover:bg-[#CC0000]"
          >
            <Play size={20} className="text-white ml-0.5" fill="white" />
          </button>
        </div>
        {/* Active indicator */}
        {isActive && isPlaying && (
          <div className="absolute bottom-2 left-2 flex items-end gap-0.5">
            <div className="w-[3px] bg-[#FF0000] rounded-full animate-wave-1"></div>
            <div className="w-[3px] bg-[#FF0000] rounded-full animate-wave-2"></div>
            <div className="w-[3px] bg-[#FF0000] rounded-full animate-wave-3"></div>
          </div>
        )}
        {/* Context menu */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
          <ContextMenu song={song} />
        </div>
      </div>
      <h3 className={`text-sm font-medium truncate transition-colors duration-200 ${isActive ? 'text-[#FF0000]' : 'text-white group-hover:text-[#FF0000]'}`}>
        {song.title}
      </h3>
      <p className="text-xs text-[#AAAAAA] truncate">{song.artist}</p>
    </div>
  );
}
