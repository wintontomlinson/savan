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
    <div className={`group flex items-center gap-3 px-3 sm:px-4 py-2.5 rounded-lg transition-fast cursor-pointer ${isActive ? 'bg-violet-500/[0.06]' : 'hover:bg-white/[0.03]'}`}
      onClick={() => playSong(song, songList)}>
      {/* Number / EQ */}
      <div className="w-6 shrink-0 flex justify-center">
        {isActive && isPlaying ? <Equalizer /> :
          <span className={`text-[12px] tabular-nums group-hover:hidden ${isActive ? 'text-violet-400 font-medium' : 'text-[#52525B]'}`}>{index + 1}</span>}
        {!(isActive && isPlaying) && <Play size={12} className="hidden group-hover:block text-white" fill="white" />}
      </div>
      {/* Artwork */}
      <img src={song.thumbnail} alt="" className="w-10 h-10 rounded-md object-cover shrink-0 shadow-sm" loading="lazy" />
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`text-[13px] font-medium truncate leading-tight ${isActive ? 'text-violet-400' : 'text-white'}`}>{song.title}</p>
        <p className="text-[11px] text-[#71717A] truncate mt-0.5">{song.artist}</p>
      </div>
      {/* Duration */}
      <span className="text-[11px] text-[#52525B] tabular-nums shrink-0 hidden sm:block">{formatDuration(song.duration)}</span>
      {/* Actions */}
      <button onClick={async e => { e.stopPropagation(); showToast('Downloading...'); const ok = await downloadSong(song); showToast(ok ? 'Downloaded' : 'Failed', ok ? 'success' : 'error'); }}
        className="p-1.5 shrink-0 text-[#3F3F46] hover:text-white opacity-0 group-hover:opacity-100 transition-fast">
        <Download size={13} />
      </button>
      <button onClick={e => { e.stopPropagation(); toggleLike(song.id); }}
        className={`p-1.5 shrink-0 transition-fast ${liked ? 'text-violet-400' : 'text-[#3F3F46] sm:opacity-0 sm:group-hover:opacity-100 hover:text-white'}`}>
        <Heart size={13} fill={liked ? 'currentColor' : 'none'} strokeWidth={liked ? 0 : 1.5} />
      </button>
    </div>
  );
}
