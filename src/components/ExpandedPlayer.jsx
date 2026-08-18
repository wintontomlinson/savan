import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Heart, ChevronDown, Download, Share2, Mic2, MessageCircle } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration } from '../data/mockData';
import { downloadSong, getLyrics } from '../data/api';
import AudioSettings from './AudioSettings';
import SleepTimer from './SleepTimer';
import { useState, useRef, useEffect } from 'react';

export default function ExpandedPlayer() {
  const { currentSong, isPlaying, togglePlay, playNext, playPrev, currentTime, duration, seekTo, shuffleMode, toggleShuffle, repeatMode, cycleRepeat, toggleLike, likedSongs, isExpanded, setExpanded, showToast, queue } = usePlayer();
  const [lyrics, setLyrics] = useState(null);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [showLyrics, setShowLyrics] = useState(true); // Resso: lyrics visible by default
  const touchStartY = useRef(0);
  const lyricsRef = useRef(null);

  // Auto-fetch lyrics when song changes
  useEffect(() => {
    if (!currentSong) return;
    setLyricsLoading(true);
    setLyrics(null);
    getLyrics(currentSong.id).then(l => {
      setLyrics(l || null);
      setLyricsLoading(false);
    }).catch(() => setLyricsLoading(false));
  }, [currentSong?.id]);

  if (!isExpanded || !currentSong) return null;
  const liked = likedSongs.includes(currentSong.id);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const onTouchStart = (e) => { touchStartY.current = e.touches[0].clientY; };
  const onTouchEnd = (e) => { if (e.changedTouches[0].clientY - touchStartY.current > 100) setExpanded(false); };

  const shareSong = async () => {
    const text = `🎵 ${currentSong.title} - ${currentSong.artist}`;
    if (navigator.share) {
      try { await navigator.share({ title: currentSong.title, text }); } catch {}
    } else {
      await navigator.clipboard?.writeText(text);
      showToast('Copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex flex-col" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      {/* Full-screen album art background — Resso style */}
      <div className="absolute inset-0">
        <img src={currentSong.thumbnail} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/95" />
      </div>

      <div className="relative flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
          <button onClick={() => setExpanded(false)} className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform">
            <ChevronDown size={20} className="text-white" />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-white/60 uppercase tracking-widest font-medium">Now Playing</span>
            {queue.length > 0 && <span className="text-[9px] text-white/40">{queue.length} in queue</span>}
          </div>
          <div className="flex items-center gap-1">
            <SleepTimer />
            <AudioSettings />
          </div>
        </div>

        {/* Main Content — Lyrics + Art */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-10 pb-4">
          {/* Lyrics overlay — Resso signature feature */}
          {showLyrics && lyrics && !lyricsLoading && (
            <div ref={lyricsRef} className="w-full max-w-sm max-h-[35vh] scroll-y mb-6 px-2">
              <div className="space-y-3">
                {lyrics.split('\n').map((line, i) => (
                  <p key={i} className={`text-[18px] sm:text-[20px] font-bold leading-snug transition-all duration-300 ${
                    line.trim() ? 'text-white/90 drop-shadow-lg' : 'h-4'
                  }`}>{line || ' '}</p>
                ))}
              </div>
            </div>
          )}

          {/* Loading lyrics */}
          {showLyrics && lyricsLoading && (
            <div className="mb-6">
              <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            </div>
          )}

          {/* Album Art — smaller when lyrics visible, larger when not */}
          {(!showLyrics || !lyrics) && (
            <div className="relative mb-6">
              <div className={`w-[240px] h-[240px] sm:w-[300px] sm:h-[300px] rounded-3xl overflow-hidden shadow-2xl shadow-black/80 ring-1 ring-white/10 ${isPlaying ? 'scale-100' : 'scale-95'} transition-transform duration-500`}>
                <img src={currentSong.thumbnail} alt="" className="w-full h-full object-cover" />
              </div>
              {isPlaying && <div className="absolute -inset-4 rounded-3xl bg-white/5 blur-2xl -z-10 animate-pulse" />}
            </div>
          )}

          {/* Song Info */}
          <div className="w-full max-w-sm text-center mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-white truncate drop-shadow-lg">{currentSong.title}</h1>
            <p className="text-[14px] text-white/70 truncate mt-1">{currentSong.artist}</p>
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-sm mb-4">
            <div className="w-full h-[4px] bg-white/20 rounded-full cursor-pointer group" onClick={e => { const r = e.currentTarget.getBoundingClientRect(); seekTo((e.clientX - r.left) / r.width * duration); }}>
              <div className="h-full bg-white rounded-full relative transition-[width] duration-200" style={{ width: `${progress}%` }}>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg scale-0 group-hover:scale-100 transition-transform" />
              </div>
            </div>
            <div className="flex justify-between mt-2 text-[11px] text-white/50 tabular-nums">
              <span>{formatDuration(currentTime)}</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between w-full max-w-[320px] mb-4">
            <button onClick={toggleShuffle} className={`p-2.5 rounded-full transition-all ${shuffleMode ? 'text-white bg-white/10' : 'text-white/50'}`}>
              <Shuffle size={20} />
            </button>
            <button onClick={playPrev} className="p-2 text-white active:scale-90 transition-transform">
              <SkipBack size={30} fill="white" />
            </button>
            <button onClick={togglePlay} className="w-[68px] h-[68px] bg-white rounded-full flex items-center justify-center active:scale-90 transition-transform shadow-2xl shadow-white/20">
              {isPlaying ? <Pause size={30} className="text-black" fill="black" /> : <Play size={30} className="text-black ml-1" fill="black" />}
            </button>
            <button onClick={playNext} className="p-2 text-white active:scale-90 transition-transform">
              <SkipForward size={30} fill="white" />
            </button>
            <button onClick={cycleRepeat} className={`p-2.5 rounded-full transition-all ${repeatMode !== 'none' ? 'text-white bg-white/10' : 'text-white/50'}`}>
              {repeatMode === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
            </button>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-center gap-4">
            <button onClick={() => toggleLike(currentSong.id)} className={`p-3 rounded-full transition-all active:scale-90 ${liked ? 'text-rose-400 bg-rose-500/20' : 'text-white/60 bg-white/5'}`}>
              <Heart size={22} fill={liked ? 'currentColor' : 'none'} />
            </button>
            <button onClick={() => setShowLyrics(!showLyrics)} className={`p-3 rounded-full transition-all active:scale-90 ${showLyrics ? 'text-white bg-white/15' : 'text-white/60 bg-white/5'}`}>
              <Mic2 size={20} />
            </button>
            <button onClick={shareSong} className="p-3 rounded-full text-white/60 bg-white/5 active:scale-90 transition-all">
              <Share2 size={20} />
            </button>
            <button onClick={async () => { showToast('Downloading...'); const ok = await downloadSong(currentSong); showToast(ok ? 'Downloaded ✓' : 'Failed'); }}
              className="p-3 rounded-full text-white/60 bg-white/5 active:scale-90 transition-all">
              <Download size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
