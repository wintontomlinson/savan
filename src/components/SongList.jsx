import SongRow from './SongRow';

/** Rounded list container shared by every page that renders tracks. */
export default function SongList({ songs, showAlbum = true, onRemove, className = '' }) {
  if (!songs?.length) return null;
  return (
    <div className={`overflow-hidden rounded-2xl border border-hair bg-surface-2/40 p-1.5 ${className}`}>
      {songs.map((song, i) => (
        <SongRow
          key={`${song.id}-${i}`}
          song={song}
          index={i}
          songList={songs}
          showAlbum={showAlbum}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}
