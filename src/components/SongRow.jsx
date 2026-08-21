import { Play, Pause, Heart, X } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration } from '../data/format';
import Equalizer from './Equalizer';
import ContextMenu from './ContextMenu';

export default function SongRow({
  song,
  index,
  songList = [],
  showAlbum = true,
  showDuration = true,
  onRemove,
}) {
  const { playSong, togglePlay, currentSong, isPlaying, toggleLike, likedSongs } = usePlayer();
  const isCurrent = currentSong?.id === song.id;
  const liked = likedSongs.includes(song.id);

  const activate = () => {
    if (isCurrent) togglePlay();
    else playSong(song, songList);
  };

  return (
    <div
      onClick={activate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activate();
        }
      }}
      role="button"
      tabIndex={0}
      className={`group grid cursor-pointer grid-cols-[24px_44px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-2 py-2 transition-colors duration-150 sm:px-3 ${
        isCurrent ? 'bg-accent/[0.09]' : 'hover:bg-white/[0.05]'
      } ${showAlbum ? 'md:grid-cols-[24px_44px_minmax(0,1fr)_minmax(0,0.7fr)_auto]' : ''}`}
    >
      {/* Index / state */}
      <div className="flex justify-center">
        {isCurrent && isPlaying ? (
          <Equalizer className="h-3.5" />
        ) : (
          <>
            <span
              className={`text-[12px] tabular-nums group-hover:hidden ${
                isCurrent ? 'font-semibold text-accent' : 'text-white/25'
              }`}
            >
              {index + 1}
            </span>
            <span className="hidden text-white group-hover:block">
              {isCurrent ? <Pause size={13} fill="white" /> : <Play size={13} fill="white" />}
            </span>
          </>
        )}
      </div>

      <img
        src={song.thumbnail}
        alt=""
        className={`h-11 w-11 rounded-lg object-cover ring-1 ${isCurrent ? 'ring-accent/30' : 'ring-white/[0.06]'}`}
        loading="lazy"
      />

      <div className="min-w-0">
        <p className={`truncate text-[13.5px] font-medium leading-tight ${isCurrent ? 'text-accent' : 'text-white'}`}>
          {song.title}
        </p>
        <p className="mt-0.5 truncate text-[11.5px] leading-tight text-white/40">{song.artist}</p>
      </div>

      {showAlbum && (
        <p className="hidden min-w-0 truncate text-[12px] text-white/35 md:block">{song.album || ''}</p>
      )}

      <div className="flex items-center gap-1 justify-self-end">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleLike(song);
          }}
          aria-label={liked ? 'Remove from Liked Songs' : 'Add to Liked Songs'}
          className={`press rounded-full p-1.5 transition-all ${
            liked ? 'text-accent' : 'text-white/20 hover:text-white sm:opacity-0 sm:group-hover:opacity-100'
          }`}
        >
          <Heart size={15} fill={liked ? 'currentColor' : 'none'} strokeWidth={liked ? 0 : 1.8} />
        </button>
        {showDuration && (
          <span className="hidden w-9 text-right text-[11.5px] tabular-nums text-white/25 sm:block">
            {formatDuration(song.duration)}
          </span>
        )}
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(song);
            }}
            aria-label={`Remove ${song.title}`}
            className="press rounded-full p-1.5 text-white/25 transition-all hover:text-red-400 sm:opacity-0 sm:group-hover:opacity-100"
          >
            <X size={15} />
          </button>
        )}
        <ContextMenu song={song} />
      </div>
    </div>
  );
}
