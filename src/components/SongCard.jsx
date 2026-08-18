import { Play } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import Equalizer from './Equalizer';

export default function SongCard({ song }) {
  const { playSong, currentSong, isPlaying } = usePlayer();
  const isActive = currentSong?.id === song.id;

  return (
    <div className="group flex-shrink-0 w-[140px] sm:w-[160px] lg:w-[170px] cursor-pointer" onClick={() => playSong(song)}>
      <div className="relative aspect-square rounded-xl overflow-hidden mb-2.5 bg-[#18181B] shadow-sm shadow-black/20 ring-1 ring-white/[0.04]">
        <img src={song.thumbnail} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" loading="lazy" />
        {/* Hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="w-10 h-10 bg-violet-500 rounded-full flex items-center justify-center shadow-lg shadow-violet-500/25 scale-90 group-hover:scale-100 transition-transform duration-200">
            <Play size={16} className="text-white ml-0.5" fill="white" />
          </div>
        </div>
        {/* Playing */}
        {isActive && isPlaying && (
          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md rounded-full px-2 py-1">
            <Equalizer />
          </div>
        )}
      </div>
      <p className={`text-[12px] sm:text-[13px] font-medium truncate leading-tight ${isActive ? 'text-violet-400' : 'text-white'}`}>{song.title}</p>
      <p className="text-[11px] text-[#71717A] truncate mt-0.5">{song.artist}</p>
    </div>
  );
}
