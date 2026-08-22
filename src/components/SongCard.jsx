import { Play, Pause } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import Equalizer from './Equalizer';

/**
 * Artwork tile used across the shelves. Apple Music proportions with a
 * Spotify-style play affordance that rises out of the corner on hover.
 */
export default function SongCard({ song, songList, subtitle }) {
  const { playSong, togglePlay, currentSong, isPlaying } = usePlayer();
  const isCurrent = currentSong?.id === song.id;

  const onPlay = (e) => {
    e.stopPropagation();
    if (isCurrent) togglePlay();
    else playSong(song, songList);
  };

  return (
    <button
      onClick={onPlay}
      className="group w-[152px] shrink-0 text-left sm:w-[174px]"
      aria-label={`Play ${song.title} by ${song.artist}`}
    >
      <div
        className={`art relative mb-3 aspect-square overflow-hidden rounded-2xl transition-shadow duration-300 ${
          isCurrent ? 'ring-2 ring-accent' : 'ring-1 ring-white/[0.06]'
        }`}
      >
        <img
          src={song.thumbnail}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <span className="absolute bottom-3 right-3 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-accent text-white opacity-0 shadow-xl shadow-black/50 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          {isCurrent && isPlaying ? <Pause size={17} fill="white" /> : <Play size={17} fill="white" className="ml-0.5" />}
        </span>

        {isCurrent && isPlaying && (
          <span className="absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-full bg-black/70 px-2 py-1 backdrop-blur-md">
            <Equalizer className="h-2.5" />
          </span>
        )}
      </div>

      <p
        className={`truncate text-[13px] font-semibold leading-tight ${
          isCurrent ? 'text-accent' : 'text-white/90 group-hover:text-white'
        }`}
      >
        {song.title}
      </p>
      <p className="mt-1 truncate text-[11.5px] text-white/40">{subtitle || song.artist}</p>
    </button>
  );
}
