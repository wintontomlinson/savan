import { Play, Heart, Download } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration } from '../data/mockData';
import { downloadSong } from '../data/api';
import Equalizer from './Equalizer';

export default function SongRow({ song, index, songList = [] }) {
  const { playSong, currentSong, isPlaying, toggleLike, likedSongs, showToast } = usePlayer();
  const isActive = currentSong?.id === song.id;
  const liked = likedSongs.includes(song.id);

  return (
    <div className={`group flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 transition-all duration-150 active:bg-white/5 hover:bg-white/[0.03] cursor-pointer rounded-xl ${isActive ? 'bg-white/[0.04]' : ''}`}
      onClick={() => playSong(song, songList)}>
      {/* # / EQ */}
      <div className="w-6 shrink-0 flex justify-center">
        {isActive && isPlaying ? <Equalizer /> :
          <span className={`text-[12px] group-hover:hidden ${isActive ? 'text-[#FF0000] font-bold' : 'text-[#555]'}`}>{index + 1}</span>}
        {!(isActive && isPlaying) && <Play size={12} className="hidden group-hover:block text-white" fill="white" />}
      </div>
      {/* Art */}
      <img src={song.thumbnail} alt="" className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover shrink-0 shadow-sm ring-1 ring-white/5" loading="lazy" />
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`text-[13px] sm:text-[14px] font-medium truncate ${isActive ? 'text-[#FF0000]' : 'text-white'}`}>{song.title}</p>
        <p className="text-[11px] sm:text-[12px] text-[#777] truncate">{song.artist}</p>
      </div>
      {/* Duration */}
      <span className="text-[11px] text-[#555] shrink-0 hidden sm:block tabular-nums">{formatDuration(song.duration)}</span>
      {/* Download */}
      <button onClick={async e => { e.stopPropagation(); showToast('Downloading...'); const ok = await downloadSong(song); showToast(ok ? 'Downloaded ✓' : 'Failed', ok ? 'success' : 'error'); }}
        className="p-1.5 shrink-0 text-[#444] hover:text-white opacity-0 group-hover:opacity-100 transition-opacity active:scale-90">
        <Download size={14} />
      </button>
      {/* Like */}
      <button onClick={e => { e.stopPropagation(); toggleLike(song.id); }}
        className={`p-1.5 shrink-0 transition-all active:scale-90 ${liked ? 'text-[#FF0000]' : 'text-[#444] sm:opacity-0 sm:group-hover:opacity-100'}`}>
        <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
      </button>
    </div>
  );
}
