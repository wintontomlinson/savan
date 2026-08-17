import { Play } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export default function SongCard({ song }) {
  const { playSong, currentSong, isPlaying } = usePlayer();
  const isActive = currentSong?.id === song.id;

  return (
    <div className="group relative flex-shrink-0 w-[130px] sm:w-[150px] md:w-[160px]">
      <div className="relative aspect-square rounded-lg overflow-hidden mb-1.5">
        <img src={song.image} alt={song.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        {/* Play button */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={() => playSong(song)}
            className="w-10 h-10 sm:w-11 sm:h-11 bg-[#1DB954] rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
          >
            <Play size={16} className="text-white ml-0.5" fill="white" />
          </button>
        </div>
        {/* Playing indicator */}
        {isActive && isPlaying && (
          <div className="absolute bottom-1.5 left-1.5 flex items-end gap-[2px]">
            <span className="w-[2px] bg-[#1DB954] rounded-full animate-wave-1"></span>
            <span className="w-[2px] bg-[#1DB954] rounded-full animate-wave-2"></span>
            <span className="w-[2px] bg-[#1DB954] rounded-full animate-wave-3"></span>
          </div>
        )}
      </div>
      <h3 className={`text-xs sm:text-sm font-medium truncate ${isActive ? 'text-[#1DB954]' : 'text-white'}`}>{song.title}</h3>
      <p className="text-[10px] sm:text-xs text-[#AAAAAA] truncate">{song.artist}</p>
    </div>
  );
}
