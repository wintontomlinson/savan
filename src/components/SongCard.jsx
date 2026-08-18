import { Play } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import Equalizer from './Equalizer';

function formatPlays(n) {
  if (!n) return '';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
  return n.toString();
}

export default function SongCard({ song }) {
  const { playSong, currentSong, isPlaying } = usePlayer();
  const isActive = currentSong?.id === song.id;

  return (
    <div className="group flex-shrink-0 w-[130px] sm:w-[150px] md:w-[160px] cursor-pointer" onClick={() => playSong(song)}>
      <div className="relative aspect-square rounded-2xl overflow-hidden mb-2 shadow-lg shadow-black/40 ring-1 ring-white/5 transition-transform duration-200 group-active:scale-95 group-hover:ring-white/10">
        <img src={song.thumbnail} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="w-11 h-11 bg-[#FF0000] rounded-full flex items-center justify-center shadow-xl shadow-red-500/30 transform scale-75 group-hover:scale-100 transition-transform duration-200">
            <Play size={18} className="text-white ml-0.5" fill="white" />
          </div>
        </div>
        {/* Playing badge */}
        {isActive && isPlaying && (
          <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1">
            <Equalizer />
          </div>
        )}
        {/* Plays badge */}
        {song.plays > 0 && (
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-full px-1.5 py-0.5 text-[9px] text-white/80 font-medium">
            {formatPlays(song.plays)} ▶
          </div>
        )}
      </div>
      <p className={`text-[12px] sm:text-[13px] font-medium truncate transition-colors ${isActive ? 'text-[#FF0000]' : 'text-white'}`}>{song.title}</p>
      <p className="text-[10px] sm:text-[11px] text-[#666] truncate">{song.artist}</p>
    </div>
  );
}
