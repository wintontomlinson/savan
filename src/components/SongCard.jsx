import { Play } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import Equalizer from './Equalizer';

export default function SongCard({ song }) {
  const { playSong, currentSong, isPlaying } = usePlayer();
  const isActive = currentSong?.id === song.id;

  return (
    <div className="group flex-shrink-0 w-[130px] sm:w-[150px] md:w-[160px] cursor-pointer" onClick={() => playSong(song)}>
      <div className={`relative aspect-square rounded-2xl overflow-hidden mb-2.5 bg-[#111] hover-glow transition-all duration-300 ${isActive ? 'ring-2 ring-fuchsia-500/30' : 'ring-1 ring-white/[0.04]'}`}>
        <img src={song.thumbnail} alt="" className="w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.08] group-hover:brightness-[0.65]" loading="lazy" />
        
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-12 h-12 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl scale-50 group-hover:scale-100 transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]">
            <Play size={18} className="text-black ml-0.5" fill="black" />
          </div>
        </div>

        {/* Playing indicator */}
        {isActive && isPlaying && (
          <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md rounded-full px-2.5 py-1.5 animate-breathe">
            <Equalizer />
          </div>
        )}
      </div>

      <p className={`text-[12px] sm:text-[13px] font-semibold truncate leading-tight transition-colors duration-200 ${isActive ? 'text-fuchsia-400' : 'text-white/90 group-hover:text-white'}`}>{song.title}</p>
      <p className="text-[10px] sm:text-[11px] text-white/35 truncate mt-1">{song.artist}</p>
    </div>
  );
}
