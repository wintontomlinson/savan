import { Play, Heart, Download } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration } from '../data/mockData';
import { downloadSong } from '../data/api';
import Equalizer from './Equalizer';

export default function SongRow({ song, index, songList = [], onPlay }) {
  const { playSong, currentSong, isPlaying, toggleLike, likedSongs, showToast } = usePlayer();
  const isActive = currentSong?.id === song.id;
  const liked = likedSongs.includes(song.id);

  const handleClick = () => {
    if (onPlay) onPlay();
    else playSong(song, songList);
  };

  return (
    <div className={`group flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-3 rounded-xl transition-all duration-150 cursor-pointer animate-in ${isActive ? 'bg-rose-500/[0.06] ring-1 ring-rose-500/10' : 'hover:bg-white/[0.03]'}`}
      onClick={handleClick} style={{ animationDelay: `${index * 30}ms` }}>
      {/* # or EQ */}
      <div className="w-6 shrink-0 flex justify-center">
        {isActive && isPlaying ? <Equalizer /> :
          <span className={`text-[12px] tabular-nums group-hover:hidden ${isActive ? 'text-rose-400 font-semibold' : 'text-[#555]'}`}>{index + 1}</span>}
        {!(isActive && isPlaying) && <Play size={12} className="hidden group-hover:block text-white" fill="white" />}
      </div>
      {/* Art */}
      <img src={song.thumbnail} alt="" className="w-11 h-11 rounded-lg object-cover shrink-0 shadow-sm ring-1 ring-white/[0.05] transition-transform duration-200 group-hover:scale-105" loading="lazy" />
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`text-[13px] font-medium truncate leading-tight ${isActive ? 'text-rose-400' : 'text-white'}`}>{song.title}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <p className="text-[11px] text-[#777] truncate">{song.artist}</p>
          {song.ytOnly && <span className="text-[8px] bg-red-500/20 text-red-400 px-1 py-0.5 rounded shrink-0 leading-none">YT</span>}
        </div>
      </div>
      {/* Duration */}
      <span className="text-[11px] text-[#555] tabular-nums shrink-0 hidden sm:block">{formatDuration(song.duration)}</span>
      {/* Download */}
      <button onClick={async e => { e.stopPropagation(); showToast('Downloading...'); const ok = await downloadSong(song); showToast(ok ? 'Downloaded ✓' : 'Failed', ok ? 'success' : 'error'); }}
        className="p-1.5 shrink-0 text-[#444] hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-150 btn-press">
        <Download size={13} />
      </button>
      {/* Like */}
      <button onClick={e => { e.stopPropagation(); toggleLike(song.id); }}
        className={`p-1.5 shrink-0 transition-all duration-150 btn-press ${liked ? 'text-rose-400' : 'text-[#444] sm:opacity-0 sm:group-hover:opacity-100 hover:text-white'}`}>
        <Heart size={13} fill={liked ? 'currentColor' : 'none'} strokeWidth={liked ? 0 : 1.5} />
      </button>
    </div>
  );
}
