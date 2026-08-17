import { Play, Heart, Download } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration } from '../data/mockData';
import { downloadSong } from '../data/api';
import Equalizer from './Equalizer';

export default function SongRow({ song, index, songList = [] }) {
  const { playSong, currentSong, isPlaying, toggleLike, likedSongs, showToast } = usePlayer();
  const isActive = currentSong?.id === song.id;
  const liked = likedSongs.includes(song.id);

  const handleDownload = async (e) => {
    e.stopPropagation();
    showToast('Downloading...');
    const ok = await downloadSong(song);
    if (ok) showToast('Downloaded ✓', 'success');
    else showToast('Download failed', 'error');
  };

  return (
    <div className={`group flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 transition-colors active:bg-[#272727] hover:bg-[#1F1F1F] cursor-pointer ${isActive ? 'bg-[#1A1A1A]' : ''}`}
      onClick={() => playSong(song, songList)}>
      {/* # or Equalizer */}
      <div className="w-6 shrink-0 flex justify-center">
        {isActive && isPlaying ? <Equalizer size="sm" /> :
          <span className={`text-xs group-hover:hidden ${isActive ? 'text-[#FF0000]' : 'text-[#666]'}`}>{index + 1}</span>}
        {!(isActive && isPlaying) && <Play size={12} className="hidden group-hover:block text-white" fill="white" />}
      </div>
      {/* Art */}
      <img src={song.thumbnail} alt="" className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg object-cover shrink-0" />
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`text-[13px] font-medium truncate ${isActive ? 'text-[#FF0000]' : 'text-white'}`}>{song.title}</p>
        <p className="text-[11px] text-[#888] truncate">{song.artist}</p>
      </div>
      {/* Duration */}
      <span className="text-[11px] text-[#666] shrink-0 hidden sm:block">{formatDuration(song.duration)}</span>
      {/* Download */}
      <button onClick={handleDownload} className="p-1.5 shrink-0 text-[#555] hover:text-white sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <Download size={14} />
      </button>
      {/* Like */}
      <button onClick={e => { e.stopPropagation(); toggleLike(song.id); }}
        className={`p-1.5 shrink-0 ${liked ? 'text-[#FF0000]' : 'text-[#555] sm:opacity-0 sm:group-hover:opacity-100'}`}>
        <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
      </button>
    </div>
  );
}
