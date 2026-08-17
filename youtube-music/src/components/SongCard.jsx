import { Play } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export default function SongCard({ song }) {
  const { playSong, currentSong, isPlaying } = usePlayer();
  const isActive = currentSong?.id === song.id;

  return (
    <div className="group relative flex-shrink-0 w-[140px] sm:w-[160px] md:w-[170px]">
      <div className="relative aspect-square rounded-xl overflow-hidden mb-2 shadow-lg shadow-black/30">
        <img src={song.image} alt={song.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={() => playSong(song)}
            className="w-11 h-11 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl active:scale-90 transition-transform"
          >
            <Play size={18} className="text-black ml-0.5" fill="black" />
          </button>
        </div>
        {/* Playing */}
        {isActive && isPlaying && (
          <div className="absolute bottom-2 left-2 flex items-end gap-[2px] bg-black/50 backdrop-blur-sm rounded-full px-1.5 py-1">
            <span className="w-[2px] bg-[#FC3C44] rounded-full animate-wave-1"></span>
            <span className="w-[2px] bg-[#FC3C44] rounded-full animate-wave-2"></span>
            <span className="w-[2px] bg-[#FC3C44] rounded-full animate-wave-3"></span>
          </div>
        )}
      </div>
      <h3 className={`text-[13px] font-medium truncate ${isActive ? 'text-[#FC3C44]' : 'text-white'}`}>{song.title}</h3>
      <p className="text-[11px] text-[#98989F] truncate">{song.artist}</p>
    </div>
  );
}
