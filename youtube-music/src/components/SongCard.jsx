import { Play } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export default function SongCard({ song }) {
  const { playSong, currentSong, isPlaying } = usePlayer();
  const isActive = currentSong?.id === song.id;

  return (
    <div className="group relative flex-shrink-0 w-[150px] sm:w-[170px] card-hover-tilt">
      <div className="relative aspect-square rounded-lg overflow-hidden mb-2">
        <img src={song.image} alt={song.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        {/* Play button */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <button
            onClick={() => playSong(song)}
            className="w-11 h-11 bg-[#FF0000] rounded-full flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-all btn-press"
          >
            <Play size={18} className="text-white ml-0.5" fill="white" />
          </button>
        </div>
        {/* Playing indicator */}
        {isActive && isPlaying && (
          <div className="absolute bottom-2 left-2 flex items-end gap-0.5">
            <span className="w-[3px] bg-[#FF0000] rounded-full animate-wave-1"></span>
            <span className="w-[3px] bg-[#FF0000] rounded-full animate-wave-2"></span>
            <span className="w-[3px] bg-[#FF0000] rounded-full animate-wave-3"></span>
          </div>
        )}
      </div>
      <h3 className={`text-sm font-medium truncate ${isActive ? 'text-[#FF0000]' : 'text-white'}`}>{song.title}</h3>
      <p className="text-xs text-[#AAAAAA] truncate">{song.artist}</p>
    </div>
  );
}
