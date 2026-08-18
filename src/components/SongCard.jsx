import { Play } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import Equalizer from './Equalizer';

export default function SongCard({ song }) {
  const { playSong, currentSong, isPlaying } = usePlayer();
  const isActive = currentSong?.id === song.id;

  return (
    <div className="group flex-shrink-0 w-[130px] sm:w-[150px] md:w-[160px] cursor-pointer" onClick={() => playSong(song)}>
      <div className="relative aspect-square rounded-2xl overflow-hidden mb-2 card-hover bg-[#111] ring-1 ring-white/[0.04]">
        <img src={song.thumbnail} alt="" className="w-full h-full object-cover transition-all duration-300 group-hover:scale-[1.05] group-hover:brightness-75" loading="lazy" />
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
          <div className="w-11 h-11 bg-[#e11d48] rounded-full flex items-center justify-center shadow-xl shadow-rose-500/20 scale-75 group-hover:scale-100 transition-transform duration-200 btn-press">
            <Play size={16} className="text-white ml-0.5" fill="white" />
          </div>
        </div>
        {/* Playing indicator */}
        {isActive && isPlaying && (
          <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md rounded-full px-2 py-1">
            <Equalizer />
          </div>
        )}
      </div>
      <p className={`text-[12px] sm:text-[13px] font-medium truncate leading-tight ${isActive ? 'text-rose-400' : 'text-white'}`}>{song.title}</p>
      <p className="text-[10px] sm:text-[11px] text-[#666] truncate mt-0.5">{song.artist}</p>
    </div>
  );
}
