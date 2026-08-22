import { useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  ListMusic,
  Volume2,
  Volume1,
  VolumeX,
  ChevronUp,
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import Seekbar from './Seekbar';
import { formatDuration } from '../data/format';

export default function PlayerBar() {
  const {
    currentSong,
    isPlaying,
    togglePlay,
    playNext,
    playPrev,
    currentTime,
    duration,
    shuffleMode,
    toggleShuffle,
    repeatMode,
    cycleRepeat,
    likedSongs,
    toggleLike,
    setExpanded,
    queueOpen,
    setQueueOpen,
    queue,
    volume,
    setVolume,
  } = usePlayer();

  const touchStart = useRef(0);

  if (!currentSong) return null;

  const liked = likedSongs.includes(currentSong.id);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <>
      <div
        className="player-dock chrome border-t border-hair md:hidden"
        onPointerDown={(e) => {
          touchStart.current = e.clientY;
        }}
        onPointerUp={(e) => {
          if (touchStart.current - e.clientY > 45) setExpanded(true);
        }}
      >
        <div className="h-[2px] w-full bg-white/[0.12]">
          <div className="h-full bg-accent transition-[width] duration-200 ease-linear" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex h-[60px] items-center gap-3 px-3">
          <button
            onClick={() => setExpanded(true)}
            className="flex min-w-0 flex-1 items-center gap-3 text-left"
            aria-label="Open now playing"
          >
            <img
              src={currentSong.thumbnail}
              alt=""
              className="art h-10 w-10 shrink-0 rounded-lg object-cover"
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-semibold leading-tight">{currentSong.title}</span>
              <span className="block truncate text-[11px] leading-tight text-white/45">{currentSong.artist}</span>
            </span>
          </button>
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="press flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-black"
          >
            {isPlaying ? <Pause size={16} fill="black" /> : <Play size={16} fill="black" className="ml-0.5" />}
          </button>
          <button
            onClick={playNext}
            aria-label="Next track"
            className="press flex h-9 w-9 shrink-0 items-center justify-center text-white/80"
          >
            <SkipForward size={19} fill="currentColor" />
          </button>
        </div>
      </div>

      <div className="player-dock chrome hidden h-[88px] items-center gap-4 border-t border-hair px-5 md:flex lg:px-8">
        {/* Now playing */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            onClick={() => setExpanded(true)}
            className="group relative shrink-0"
            aria-label="Open full screen player"
          >
            <img src={currentSong.thumbnail} alt="" className="art h-14 w-14 rounded-2xl object-cover ring-1 ring-white/10" />
            <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/55 opacity-0 transition-opacity group-hover:opacity-100">
              <ChevronUp size={20} />
            </span>
          </button>
          <div className="min-w-0">
            <p className="truncate text-[13.5px] font-semibold leading-tight">{currentSong.title}</p>
            <p className="mt-0.5 truncate text-[11.5px] leading-tight text-white/45">{currentSong.artist}</p>
          </div>
          <button
            onClick={() => toggleLike(currentSong)}
            aria-label={liked ? 'Remove from Liked Songs' : 'Add to Liked Songs'}
            className={`press ml-1 shrink-0 rounded-full p-2 transition-colors ${
              liked ? 'text-accent' : 'text-white/35 hover:text-white'
            }`}
          >
            <Heart size={17} fill={liked ? 'currentColor' : 'none'} strokeWidth={liked ? 0 : 1.8} />
          </button>
        </div>

        {/* Transport */}
        <div className="flex w-full max-w-[520px] shrink-0 flex-col items-center gap-1.5">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleShuffle}
              aria-label="Shuffle"
              aria-pressed={shuffleMode}
              className={`press relative transition-colors ${shuffleMode ? 'text-accent' : 'text-white/45 hover:text-white'}`}
            >
              <Shuffle size={17} />
              {shuffleMode && <span className="absolute -bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-accent" />}
            </button>
            <button onClick={playPrev} aria-label="Previous track" className="press text-white/80 hover:text-white">
              <SkipBack size={20} fill="currentColor" />
            </button>
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="press flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-105"
            >
              {isPlaying ? <Pause size={18} fill="black" /> : <Play size={18} fill="black" className="ml-0.5" />}
            </button>
            <button onClick={playNext} aria-label="Next track" className="press text-white/80 hover:text-white">
              <SkipForward size={20} fill="currentColor" />
            </button>
            <button
              onClick={cycleRepeat}
              aria-label="Repeat"
              className={`press relative transition-colors ${
                repeatMode !== 'none' ? 'text-accent' : 'text-white/45 hover:text-white'
              }`}
            >
              {repeatMode === 'one' ? <Repeat1 size={17} /> : <Repeat size={17} />}
              {repeatMode !== 'none' && (
                <span className="absolute -bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-accent" />
              )}
            </button>
          </div>

          <div className="flex w-full items-center gap-2.5">
            <span className="w-9 shrink-0 text-right text-[10.5px] font-medium tabular-nums text-white/40">
              {formatDuration(currentTime)}
            </span>
            <Seekbar className="flex-1" thickness={4} />
            <span className="w-9 shrink-0 text-[10.5px] font-medium tabular-nums text-white/40">
              {formatDuration(duration)}
            </span>
          </div>
        </div>

        {/* Secondary controls */}
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          <button
            onClick={() => setQueueOpen(!queueOpen)}
            aria-label="Toggle queue"
            aria-pressed={queueOpen}
            className={`press relative hidden rounded-lg p-2 transition-colors lg:block ${
              queueOpen ? 'bg-white/[0.1] text-accent' : 'text-white/45 hover:text-white'
            }`}
          >
            <ListMusic size={17} />
            {queue.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 min-w-[15px] rounded-full bg-accent px-1 text-[9px] font-bold leading-[15px] text-white">
                {queue.length > 9 ? '9+' : queue.length}
              </span>
            )}
          </button>

          <div className="group flex items-center gap-2">
            <button
              onClick={() => setVolume(volume === 0 ? 1 : 0)}
              aria-label={volume === 0 ? 'Unmute' : 'Mute'}
              className="press text-white/45 transition-colors hover:text-white"
            >
              <VolumeIcon size={17} />
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              aria-label="Volume"
              className="slider w-[84px] lg:w-[104px]"
              style={{
                background: `linear-gradient(to right, #fff ${volume * 100}%, rgba(255,255,255,0.14) ${volume * 100}%)`,
              }}
            />
          </div>

        </div>
      </div>
    </>
  );
}
