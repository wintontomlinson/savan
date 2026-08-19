import { Play } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import Equalizer from './Equalizer';

export default function SongCard({ song }) {
  const { playSong, currentSong, isPlaying } = usePlayer();
  const isActive = currentSong?.id === song.id;

  return (
    <div className="group flex-shrink-0 w-[130px] sm:w-[150px] md:w-[160px] cursor-pointer" onClick={() => playSong(song)}>
      <div className="relative aspect-square rounded-2xl overflow-hidden mb-2.5 card-hover bg-[#111] ring-1 ring-white/[0.04]">
        <img src={song.thumbnail} alt="" className="w-full h-full object-cover transition-all duration-400 group-hover:scale-[1.06] group-hover:brightness-[0.7]" loading="lazy" />
        
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-250">
          <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-xl shadow-black/30 scale-75 group-hover:scale-100 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-90">
            <Play size={16} className="text-black ml-0.5" fill="black" />
          </div>
        </div>

        {/* Playing indicator */}
        {isActive && isPlaying && (
          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md rounded-full px-2 py-1">
            <Equalizer />
          </div>
        )}

        {/* Active glow */}
        {isActive && (
          <div className="absolute inset-0 ring-2 ring-rose-500/30 rounded-2xl pointer-events-none" />
        )}
      </div>

      <p className={`text-[12px] sm:text-[13px] font-medium truncate leading-tight transition-colors duration-200 ${isActive ? 'text-rose-400' : 'text-white/90 group-hover:text-white'}`}>{song.title}</p>
      <p className="text-[10px] sm:text-[11px] text-white/30 truncate mt-0.5">{song.artist}</p>
    </div>
  );
}
