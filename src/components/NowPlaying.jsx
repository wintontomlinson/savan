import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  ChevronDown,
  MicVocal,
  ListMusic,
  Check,
  Download,
  Volume1,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { getLyrics } from '../data/api';
import { formatDuration } from '../data/format';
import Seekbar from './Seekbar';
import SleepTimer from './SleepTimer';

export default function NowPlaying() {
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
    downloadedSongs,
    toggleDownload,
    isExpanded,
    setExpanded,
    queue,
    playSong,
    volume,
    setVolume,
  } = usePlayer();

  const [panel, setPanel] = useState(null); // 'lyrics' | 'queue' | null
  const [lyrics, setLyrics] = useState(null);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [closing, setClosing] = useState(false);
  const touchStartY = useRef(0);

  const close = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      setExpanded(false);
      setPanel(null);
    }, 280);
  }, [setExpanded]);

  useEffect(() => {
    if (!isExpanded) return;
    const onKey = (e) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isExpanded, close]);

  useEffect(() => {
    setPanel(null);
    setLyrics(null);
  }, [currentSong?.id]);

  useEffect(() => {
    if (!currentSong || panel !== 'lyrics') return;
    let cancelled = false;
    setLyricsLoading(true);
    setLyrics(null);
    getLyrics(currentSong.id, currentSong.title, currentSong.artist)
      .then((l) => {
        if (!cancelled) {
          setLyrics(l || null);
          setLyricsLoading(false);
        }
      })
      .catch(() => !cancelled && setLyricsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [currentSong, panel]);

  if (!isExpanded || !currentSong) return null;

  const liked = likedSongs.includes(currentSong.id);
  const downloaded = downloadedSongs.includes(currentSong.id);
  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col bg-black ${closing ? 'a-sheet-down' : 'a-sheet-up'}`}>
      {/* Ambient artwork background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <img
          src={currentSong.thumbnail}
          alt=""
          className={`absolute inset-0 h-full w-full scale-[2.2] object-cover blur-[90px] saturate-[1.8] transition-opacity duration-1000 ${
            isPlaying ? 'opacity-40' : 'opacity-15'
          }`}
        />
        <div className="absolute inset-0 bg-black/55" />
        {isPlaying && (
          <>
            <div className="a-drift absolute -left-[15%] -top-[15%] h-[55%] w-[55%] rounded-full bg-accent/[0.07] blur-[120px]" />
            <div
              className="a-drift absolute -bottom-[12%] -right-[12%] h-[50%] w-[50%] rounded-full bg-indigo-500/[0.07] blur-[110px]"
              style={{ animationDelay: '3s' }}
            />
          </>
        )}
      </div>

      {/* Top bar, doubles as the swipe-down handle */}
      <div
        className="relative flex h-14 shrink-0 items-center justify-between px-4 sm:px-6"
        onPointerDown={(e) => {
          touchStartY.current = e.clientY;
        }}
        onPointerUp={(e) => {
          if (e.clientY - touchStartY.current > 70) close();
        }}
      >
        <button
          onClick={close}
          aria-label="Close player"
          className="press flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.08] text-white/80 backdrop-blur-md"
        >
          <ChevronDown size={20} />
        </button>
        <div className="mx-4 min-w-0 flex-1 text-center">
          <p className="text-[9.5px] font-semibold uppercase tracking-[0.22em] text-white/35">Now Playing</p>
          <p className="mx-auto mt-0.5 max-w-[240px] truncate text-[12px] font-medium text-white/60">
            {currentSong.album || 'Music Area'}
          </p>
        </div>
        <SleepTimer />
      </div>

      {/* Body */}
      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-5 pb-5 sm:px-8 lg:flex-row lg:gap-14 lg:px-14 lg:pb-10">
        {/* Lyrics / queue: above the transport on mobile, beside it on desktop */}
        {panel && (
          <div className="order-first min-h-0 w-full flex-1 lg:order-last lg:h-[68vh] lg:max-w-[600px]">
            {panel === 'lyrics' ? (
              <LyricsPane
                loading={lyricsLoading}
                lyrics={lyrics}
                currentTime={currentTime}
                duration={duration}
              />
            ) : (
              <QueuePane queue={queue} onPick={(song) => playSong(song, queue)} />
            )}
          </div>
        )}

        {/* Player column */}
        <div className="flex w-full max-w-[430px] shrink-0 flex-col">
          <div
            className={`mx-auto mb-5 aspect-square w-full transition-all duration-500 ${
              panel ? 'max-w-[84px] lg:max-w-[300px]' : 'max-w-[min(80vw,340px)] lg:max-w-[380px]'
            }`}
          >
            <img
              src={currentSong.thumbnail}
              alt={currentSong.title}
              className={`h-full w-full rounded-3xl object-cover shadow-[0_30px_70px_-20px_rgba(0,0,0,0.9)] ring-1 ring-white/10 transition-transform duration-700 ${
                isPlaying ? 'scale-100' : 'scale-[0.94]'
              }`}
            />
          </div>

          {/* Title */}
          <div className="mb-4 flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-[20px] font-bold leading-tight sm:text-[24px]">{currentSong.title}</h1>
              <p className="mt-1 truncate text-[13.5px] text-white/50">{currentSong.artist}</p>
            </div>
            <button
              onClick={() => toggleLike(currentSong)}
              aria-label={liked ? 'Remove from Liked Songs' : 'Add to Liked Songs'}
              className={`press flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
                liked ? 'bg-accent/15 text-accent' : 'text-white/35 hover:text-white'
              }`}
            >
              <Heart size={21} fill={liked ? 'currentColor' : 'none'} strokeWidth={liked ? 0 : 1.8} />
            </button>
          </div>

          <Seekbar showTimes thickness={5} className="mb-5" />

          {/* Transport */}
          <div className="mb-5 flex items-center justify-between">
            <button
              onClick={toggleShuffle}
              aria-label="Shuffle"
              aria-pressed={shuffleMode}
              className={`press flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                shuffleMode ? 'bg-white/10 text-accent' : 'text-white/40 hover:text-white'
              }`}
            >
              <Shuffle size={19} />
            </button>
            <button onClick={playPrev} aria-label="Previous track" className="press text-white">
              <SkipBack size={27} fill="currentColor" />
            </button>
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="press flex h-[66px] w-[66px] items-center justify-center rounded-full bg-white text-black shadow-[0_6px_28px_rgba(255,255,255,0.16)]"
            >
              {isPlaying ? <Pause size={26} fill="black" /> : <Play size={26} fill="black" className="ml-1" />}
            </button>
            <button onClick={playNext} aria-label="Next track" className="press text-white">
              <SkipForward size={27} fill="currentColor" />
            </button>
            <button
              onClick={cycleRepeat}
              aria-label="Repeat"
              className={`press flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                repeatMode !== 'none' ? 'bg-white/10 text-accent' : 'text-white/40 hover:text-white'
              }`}
            >
              {repeatMode === 'one' ? <Repeat1 size={19} /> : <Repeat size={19} />}
            </button>
          </div>

          {/* Volume: desktop only, phones use hardware keys */}
          <div className="mb-4 hidden items-center gap-3 lg:flex">
            <button
              onClick={() => setVolume(volume === 0 ? 1 : 0)}
              aria-label={volume === 0 ? 'Unmute' : 'Mute'}
              className="press text-white/45 hover:text-white"
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
              className="slider flex-1"
              style={{
                background: `linear-gradient(to right, #fff ${volume * 100}%, rgba(255,255,255,0.14) ${volume * 100}%)`,
              }}
            />
          </div>

          {/* Panels + actions */}
          <div className="flex items-center justify-center gap-2">
            <Pill
              icon={MicVocal}
              label="Lyrics"
              active={panel === 'lyrics'}
              onClick={() => setPanel((p) => (p === 'lyrics' ? null : 'lyrics'))}
            />
            <Pill
              icon={ListMusic}
              label="Queue"
              badge={queue.length || null}
              active={panel === 'queue'}
              onClick={() => setPanel((p) => (p === 'queue' ? null : 'queue'))}
            />
            <Pill
              icon={downloaded ? Check : Download}
              label={downloaded ? 'Saved' : 'Save'}
              active={downloaded}
              onClick={() => toggleDownload(currentSong)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Pill({ icon: Icon, label, active, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`press relative flex items-center gap-1.5 rounded-full border px-3.5 py-2 transition-colors ${
        active
          ? 'border-white/15 bg-white/[0.14] text-white'
          : 'border-transparent bg-white/[0.06] text-white/45 hover:bg-white/[0.1] hover:text-white'
      }`}
    >
      <Icon size={15} />
      <span className="text-[10.5px] font-bold tracking-wide">{label}</span>
      {badge ? (
        <span className="absolute -right-1 -top-1 min-w-[16px] rounded-full bg-accent px-1 text-[8.5px] font-bold leading-4 text-white">
          {badge > 9 ? '9+' : badge}
        </span>
      ) : null}
    </button>
  );
}

/* ---------------- Lyrics ---------------- */

function LyricsPane({ loading, lyrics, currentTime, duration }) {
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/15 border-t-white/80" />
      </div>
    );
  }
  if (!lyrics) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
        <MicVocal size={26} className="text-white/15" />
        <p className="text-[13px] text-white/35">Lyrics not available for this track</p>
      </div>
    );
  }
  return lyrics.synced ? (
    <SyncedLyrics lrc={lyrics.data} currentTime={currentTime} />
  ) : (
    <PlainLyrics text={lyrics.data} currentTime={currentTime} duration={duration} />
  );
}

function LyricLines({ lines, activeIndex }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || activeIndex < 0) return;
    containerRef.current
      .querySelector('[data-active="true"]')
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [activeIndex]);

  return (
    <div ref={containerRef} className="scroll-y h-full space-y-4 px-1 py-8 text-center lg:px-4 lg:text-left">
      {lines.map((line, i) => (
        <p
          key={i}
          data-active={i === activeIndex ? 'true' : undefined}
          className={`text-[17px] font-bold leading-snug transition-all duration-500 sm:text-[20px] lg:text-[26px] ${
            i === activeIndex
              ? 'text-white'
              : i < activeIndex
                ? 'text-white/20'
                : 'text-white/35'
          }`}
        >
          {line}
        </p>
      ))}
    </div>
  );
}

function SyncedLyrics({ lrc, currentTime }) {
  const lines = useMemo(
    () =>
      lrc
        .split('\n')
        .map((raw) => {
          const m = raw.match(/^\[(\d{2}):(\d{2})\.(\d{2,3})\]\s?(.*)$/);
          if (!m) return null;
          const time = parseInt(m[1], 10) * 60 + parseInt(m[2], 10) + parseInt(m[3].padEnd(3, '0'), 10) / 1000;
          const text = m[4].trim();
          return text ? { time, text } : null;
        })
        .filter(Boolean),
    [lrc],
  );

  let activeIndex = -1;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (currentTime >= lines[i].time) {
      activeIndex = i;
      break;
    }
  }

  return <LyricLines lines={lines.map((l) => l.text)} activeIndex={activeIndex} />;
}

/** No timestamps available, so spread lines across the vocal window as an estimate. */
function PlainLyrics({ text, currentTime, duration }) {
  const lines = useMemo(() => text.split('\n').filter((l) => l.trim()), [text]);
  const intro = duration < 150 ? 5 : duration < 240 ? 8 : 12;
  const outro = duration < 150 ? 5 : duration < 240 ? 10 : 15;
  const span = Math.max(1, duration - outro - intro);
  const perLine = span / Math.max(1, lines.length);

  let activeIndex = -1;
  if (duration > 0 && currentTime >= intro) {
    activeIndex = Math.min(lines.length - 1, Math.floor((currentTime - intro) / perLine));
  }

  return <LyricLines lines={lines} activeIndex={activeIndex} />;
}

/* ---------------- Queue ---------------- */

function QueuePane({ queue, onPick }) {
  if (queue.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
        <ListMusic size={26} className="text-white/15" />
        <p className="text-[13px] text-white/35">Queue is empty</p>
      </div>
    );
  }
  return (
    <div className="scroll-y h-full space-y-1 py-4 pr-1">
      <p className="mb-2 px-2 text-[10.5px] font-bold uppercase tracking-[0.14em] text-white/35">
        Next up · {queue.length}
      </p>
      {queue.map((song, i) => (
        <button
          key={`${song.id}-${i}`}
          onClick={() => onPick(song)}
          className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-white/[0.06]"
        >
          <span className="w-4 shrink-0 text-center text-[10px] tabular-nums text-white/25">{i + 1}</span>
          <img src={song.thumbnail} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" loading="lazy" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[12.5px] font-medium text-white/85">{song.title}</span>
            <span className="block truncate text-[11px] text-white/35">{song.artist}</span>
          </span>
          <span className="shrink-0 text-[10.5px] tabular-nums text-white/25">{formatDuration(song.duration)}</span>
        </button>
      ))}
    </div>
  );
}
