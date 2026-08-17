import { Play } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { songs } from '../data/data';
import ContextMenu from './ContextMenu';

export default function SongCard({ song }) {
  const { playSong, currentSong, isPlaying } = usePlayer();
  const isActive = currentSong?.id === song.id;

  return (
    <div className="group relative flex-shrink-0 w-[160px] sm:w-[180px]">
      <div className="relative aspect-square rounded-lg overflow-hidden mb-2">
        <img
          src={song.image}
          alt={song.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <button
            onClick={() => playSong(song, songs)}
            className="w-12 h-12 bg-[#FF0000] rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-200"
          >
            <Play size={20} className="text-white ml-0.5" fill="white" />
          </button>
        </div>
        {/* Active indicator */}
        {isActive && isPlaying && (
          <div className="absolute bottom-2 left-2 flex items-end gap-0.5">
            <div className="equalizer-bar w-[3px] bg-[#FF0000] rounded-full"></div>
            <div className="equalizer-bar w-[3px] bg-[#FF0000] rounded-full"></div>
            <div className="equalizer-bar w-[3px] bg-[#FF0000] rounded-full"></div>
          </div>
        )}
        {/* Context menu */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ContextMenu song={song} />
        </div>
      </div>
      <h3 className={`text-sm font-medium truncate ${isActive ? 'text-[#FF0000]' : 'text-white'}`}>
        {song.title}
      </h3>
      <p className="text-xs text-[#AAAAAA] truncate">{song.artist}</p>
    </div>
  );
}
