import { usePlayer } from '../context/PlayerContext';
import Equalizer from './Equalizer';
import ContextMenu from './ContextMenu';
import { formatDuration } from '../data/format';

/**
 * Ranked chart. Split into two explicit halves so the numbers read top to
 * bottom down the left column and then down the right, the way a chart should,
 * rather than snaking across the grid.
 */
export default function ChartList({ songs, className = '' }) {
  if (!songs?.length) return null;

  const half = Math.ceil(songs.length / 2);
  const columns = [
    { offset: 0, items: songs.slice(0, half) },
    { offset: half, items: songs.slice(half) },
  ];

  return (
    <div className={`grid gap-x-7 md:grid-cols-2 ${className}`}>
      {columns.map((column) => (
        <div key={column.offset}>
          {column.items.map((song, i) => (
            <ChartRow key={`${song.id}-${i}`} song={song} rank={column.offset + i + 1} songList={songs} />
          ))}
        </div>
      ))}
    </div>
  );
}

function ChartRow({ song, rank, songList }) {
  const { playSong, togglePlay, currentSong, isPlaying } = usePlayer();
  const isCurrent = currentSong?.id === song.id;

  const activate = () => (isCurrent ? togglePlay() : playSong(song, songList));

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
      className={`group grid cursor-pointer grid-cols-[26px_44px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-1.5 py-2 transition-colors duration-150 sm:px-2.5 ${
        isCurrent ? 'bg-accent/[0.09]' : 'hover:bg-white/[0.05]'
      }`}
    >
      <div className="flex justify-center">
        {isCurrent && isPlaying ? (
          <Equalizer className="h-3.5" />
        ) : (
          <span
            className={`text-[14px] font-bold tabular-nums ${
              isCurrent ? 'text-accent' : rank <= 3 ? 'text-accent/70' : 'text-white/25'
            }`}
          >
            {rank}
          </span>
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

      <div className="flex items-center gap-1 justify-self-end">
        <span className="hidden w-9 text-right text-[11.5px] tabular-nums text-white/25 sm:block">
          {formatDuration(song.duration)}
        </span>
        <ContextMenu song={song} />
      </div>
    </div>
  );
}
