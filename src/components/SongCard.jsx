import { Play, Pause } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import Equalizer from './Equalizer';

export default function SongCard({ song, songList, subtitle }) {
  const { playSong, togglePlay, currentSong, isPlaying } = usePlayer();
  const isCurrent = currentSong?.id === song.id;
  const onPlay = (event) => {
    event.stopPropagation();
    if (isCurrent) togglePlay();
    else playSong(song, songList);
  };

  return (
    <button onClick={onPlay} className="song-card group w-[158px] shrink-0 text-left sm:w-[184px]" aria-label={`Play ${song.title} by ${song.artist}`}>
      <div className={`song-card-art relative mb-3 aspect-square overflow-hidden ${isCurrent ? 'song-card-active' : ''}`}>
        <img src={song.thumbnail} alt="" className="h-full w-full object-cover" loading="lazy" />
        <span className="song-card-shade absolute inset-0" />
        <span className="song-card-play absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full">
          {isCurrent && isPlaying ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" className="ml-0.5" />}
        </span>
        {isCurrent && isPlaying && <span className="absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-full bg-black/55 px-2 py-1 backdrop-blur-md"><Equalizer className="h-2.5" /></span>}
      </div>
      <p className={`truncate text-[13px] font-bold leading-tight ${isCurrent ? 'text-[#bc99ff]' : 'text-white/90'}`}>{song.title}</p>
      <p className="mt-1 truncate text-[11.5px] text-white/42">{subtitle || song.artist}</p>
    </button>
  );
}
