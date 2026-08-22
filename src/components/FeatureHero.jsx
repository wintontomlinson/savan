import { Play, Pause, Shuffle } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import Equalizer from './Equalizer';

/**
 * Editorial banner that gives the feed a focal point. The artwork doubles as
 * the background so the card picks up the colour of whatever it is featuring.
 */
export default function FeatureHero({ eyebrow, song, meta, onPlay, onShuffle, shuffleLabel = 'Shuffle mix' }) {
  const { currentSong, isPlaying, togglePlay } = usePlayer();
  const isCurrent = currentSong?.id === song.id;
  const playing = isCurrent && isPlaying;

  return (
    <section className="hero-frame relative mb-10 overflow-hidden rounded-[26px] border border-hair">
      <img
        src={song.thumbnail}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full scale-125 object-cover blur-3xl saturate-150"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/74 to-black/34" />
      <div className="absolute -left-16 -top-24 h-56 w-56 rounded-full bg-accent/20 blur-[90px]" />

      <div className="relative flex flex-col gap-6 p-5 sm:p-8 lg:flex-row lg:items-center lg:gap-12 lg:p-10">
        <img
          src={song.thumbnail}
          alt={song.title}
          className="order-first h-32 w-32 shrink-0 rounded-[22px] object-cover shadow-[0_28px_60px_-14px_rgba(0,0,0,0.95)] ring-1 ring-white/15 sm:h-44 sm:w-44 lg:order-last lg:h-[212px] lg:w-[212px]"
        />

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-accent-hi">
            {eyebrow}
            {playing && <Equalizer className="h-2.5" />}
          </p>

          <h2 className="line-2 mt-2 text-[27px] font-extrabold leading-[1.02] tracking-[-0.045em] sm:text-[34px] lg:text-[42px]">
            {song.title}
          </h2>

          <p className="mt-2 truncate text-[13px] text-white/55 sm:text-[14px]">{song.artist}</p>
          {meta && <p className="mt-1 truncate text-[11.5px] text-white/35">{meta}</p>}

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <button
              onClick={isCurrent ? togglePlay : onPlay}
              className="press flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[13px] font-bold text-black transition-transform hover:scale-[1.03]"
            >
              {playing ? <Pause size={15} fill="black" /> : <Play size={15} fill="black" />}
              {playing ? 'Pause' : 'Play'}
            </button>
            {onShuffle && (
              <button
                onClick={onShuffle}
                className="press flex items-center gap-2 rounded-full border border-hair-strong bg-white/[0.08] px-5 py-3 text-[13px] font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/[0.16]"
              >
                <Shuffle size={14} />
                {shuffleLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
