import { Play } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import Equalizer from './Equalizer';

export default function SongCard({ song }) {
  const { playSong, currentSong, isPlaying } = usePlayer();
  const isActive = currentSong?.id === song.id;

  return (
    <div className="group flex-shrink-0 w-[130px] sm:w-[150px] md:w-[160px] cursor-pointer active:scale-95 transition-transform" onClick={() => playSong(song)}>
      <div className="relative aspect-square rounded-xl overflow-hidden mb-1.5 shadow-md">
        <img src={song.thumbnail} alt={song.title} className="w-full h-full object-cover" />
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-10 h-10 bg-[#FF0000] rounded-full flex items-center justify-center shadow-lg">
            <Play size={16} className="text-white ml-0.5" fill="white" />
          </div>
        </div>
        {/* Equalizer when playing */}
        {isActive && isPlaying && (
          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1">
            <Equalizer size="sm" />
          </div>
        )}
      </div>
      <p className={`text-[12px] sm:text-[13px] font-medium truncate ${isActive ? 'text-[#FF0000]' : 'text-white'}`}>{song.title}</p>
      <p className="text-[10px] sm:text-[11px] text-[#888] truncate">{song.artist}</p>
    </div>
  );
}
