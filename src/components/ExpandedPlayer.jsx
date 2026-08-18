import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Heart, ChevronDown, Download, Share2, Mic2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration } from '../data/mockData';
import { downloadSong, getLyrics } from '../data/api';
import SleepTimer from './SleepTimer';
import { useState, useRef, useEffect } from 'react';

export default function ExpandedPlayer() {
  const { currentSong, isPlaying, togglePlay, playNext, playPrev, currentTime, duration, seekTo, shuffleMode, toggleShuffle, repeatMode, cycleRepeat, toggleLike, likedSongs, isExpanded, setExpanded, showToast, queue } = usePlayer();
  const [showLyrics, setShowLyrics] = useState(false);
  const [lyrics, setLyrics] = useState(null);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const touchStartY = useRef(0);

  // Fetch lyrics when user opens lyrics panel
  useEffect(() => {
    if (!currentSong || !showLyrics) return;
    setLyricsLoading(true);
    setLyrics(null);
    getLyrics(currentSong.id).then(l => { setLyrics(l || null); setLyricsLoading(false); }).catch(() => setLyricsLoading(false));
  }, [currentSong?.id, showLyrics]);

  // Close lyrics when song changes
  useEffect(() => {
    setShowLyrics(false);
    setLyrics(null);
  }, [currentSong?.id]);

  if (!isExpanded || !currentSong) return null;
  const liked = likedSongs.includes(currentSong.id);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const onTouchStart = (e) => { touchStartY.current = e.touches[0].clientY; };
  const onTouchEnd = (e) => { if (e.changedTouches[0].clientY - touchStartY.current > 80) setExpanded(false); };

  const shareSong = async () => {
    const text = `${currentSong.title} - ${currentSong.artist}`;
    if (navigator.share) {
      try { await navigator.share({ title: currentSong.title, text }); } catch {}
    } else {
      await navigator.clipboard?.writeText(text);
      showToast('Copied!');
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex flex-col" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      {/* Background */}
      <div className="absolute inset-0">
        <img src={currentSong.thumbnail} alt="" className="w-full h-full object-cover blur-[80px] scale-125 opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-[#0a0a0a]/85 to-[#0a0a0a]" />
      </div>

      <div className="relative flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
          <button onClick={() => setExpanded(false)} className="w-10 h-10 rounded-full bg-white/[0.08] flex items-center justify-center active:scale-90 transition-transform backdrop-blur-md">
            <ChevronDown size={22} className="text-white" />
          </button>
          <div className="text-center">
            <p className="text-[10px] text-white/50 uppercase tracking-[0.15em] font-medium">Playing from</p>
            <p className="text-[12px] text-white/80 font-medium mt-0.5 max-w-[180px] truncate">{currentSong.album || 'Library'}</p>
          </div>
          <div className="flex items-center">
            <SleepTimer />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 sm:px-14 gap-6">
          
          {/* Album Art */}
          <div className={`relative transition-all duration-700 ease-out ${showLyrics ? 'w-[100px] h-[100px] sm:w-[120px] sm:h-[120px]' : 'w-[260px] h-[260px] sm:w-[300px] sm:h-[300px] md:w-[340px] md:h-[340px]'}`}>
            <div className={`w-full h-full rounded-3xl overflow-hidden shadow-2xl shadow-black/70 ring-1 ring-white/[0.08] transition-transform duration-500 ${isPlaying ? 'scale-100' : 'scale-[0.96]'}`}>
              <img src={currentSong.thumbnail} alt="" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Lyrics */}
          {showLyrics && (
            <div className="w-full max-w-sm max-h-[30vh] scroll-y animate-in" id="lyrics-container">
              {lyricsLoading && (
                <div className="flex justify-center py-8">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
              {!lyricsLoading && !lyrics && (
                <p className="text-[14px] text-white/40 text-center py-8">Lyrics not available</p>
              )}
              {!lyricsLoading && lyrics && (
                <SyncedLyrics lyrics={lyrics} currentTime={currentTime} duration={duration} />
              )}
            </div>
          )}

          {/* Song Info */}
          <div className="w-full max-w-sm">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 mr-4">
                <h1 className="text-[20px] sm:text-[22px] font-bold text-white truncate">{currentSong.title}</h1>
                <p className="text-[14px] text-white/60 truncate mt-0.5">{currentSong.artist}</p>
              </div>
              <button onClick={() => toggleLike(currentSong.id)} className={`p-2 rounded-full transition-all active:scale-90 ${liked ? 'text-rose-500' : 'text-white/40'}`}>
                <Heart size={24} fill={liked ? 'currentColor' : 'none'} strokeWidth={liked ? 0 : 1.5} />
              </button>
            </div>
          </div>

          {/* Progress */}
          <div className="w-full max-w-sm">
            <div className="w-full h-[4px] bg-white/[0.12] rounded-full cursor-pointer group" onClick={e => { const r = e.currentTarget.getBoundingClientRect(); seekTo((e.clientX - r.left) / r.width * duration); }}>
              <div className="h-full bg-white rounded-full relative transition-[width] duration-150 ease-linear" style={{ width: `${progress}%` }}>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[14px] h-[14px] bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity" />
              </div>
            </div>
            <div className="flex justify-between mt-2.5 text-[11px] text-white/40 tabular-nums font-medium">
              <span>{formatDuration(currentTime)}</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between w-full max-w-[320px]">
            <button onClick={toggleShuffle} className={`p-2.5 rounded-full transition-all ${shuffleMode ? 'text-white bg-white/[0.1]' : 'text-white/40'}`}>
              <Shuffle size={20} />
            </button>
            <button onClick={playPrev} className="p-2 text-white active:scale-90 transition-transform">
              <SkipBack size={32} fill="white" />
            </button>
            <button onClick={togglePlay} className="w-[72px] h-[72px] bg-white rounded-full flex items-center justify-center active:scale-90 transition-all shadow-2xl shadow-white/20 hover:shadow-white/30">
              {isPlaying ? <Pause size={30} className="text-black" fill="black" /> : <Play size={30} className="text-black ml-1" fill="black" />}
            </button>
            <button onClick={playNext} className="p-2 text-white active:scale-90 transition-transform">
              <SkipForward size={32} fill="white" />
            </button>
            <button onClick={cycleRepeat} className={`p-2.5 rounded-full transition-all ${repeatMode !== 'none' ? 'text-white bg-white/[0.1]' : 'text-white/40'}`}>
              {repeatMode === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
            </button>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-center gap-6 pb-4">
            <button onClick={() => setShowLyrics(!showLyrics)} className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${showLyrics ? 'text-white' : 'text-white/40'}`}>
              <Mic2 size={20} />
              <span className="text-[9px] font-medium">Lyrics</span>
            </button>
            <button onClick={shareSong} className="flex flex-col items-center gap-1 text-white/40 active:scale-90 transition-all">
              <Share2 size={20} />
              <span className="text-[9px] font-medium">Share</span>
            </button>
            <button onClick={async () => { showToast('Downloading...'); const ok = await downloadSong(currentSong); showToast(ok ? 'Downloaded ✓' : 'Failed'); }}
              className="flex flex-col items-center gap-1 text-white/40 active:scale-90 transition-all">
              <Download size={20} />
              <span className="text-[9px] font-medium">Download</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


// Synced lyrics — highlights line by line based on song progress
function SyncedLyrics({ lyrics, currentTime, duration }) {
  const containerRef = useRef(null);
  const lines = lyrics.split('\n').filter(l => l.trim());

  // Distribute lines across song duration (skip intro/outro)
  const startTime = duration * 0.05;
  const endTime = duration * 0.92;
  const activeRange = endTime - startTime;
  const timePerLine = activeRange / lines.length;

  const activeIndex = Math.min(
    lines.length - 1,
    Math.max(0, Math.floor((currentTime - startTime) / timePerLine))
  );

  // Auto-scroll to active line
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current.querySelector('[data-active="true"]');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [activeIndex]);

  return (
    <div ref={containerRef} className="space-y-4 text-center py-4">
      {lines.map((line, i) => (
        <p key={i}
          data-active={i === activeIndex ? 'true' : undefined}
          className={`text-[16px] sm:text-[18px] font-semibold leading-relaxed transition-all duration-300 ${
            i === activeIndex
              ? 'text-white scale-[1.03]'
              : i < activeIndex
                ? 'text-white/25'
                : 'text-white/45'
          }`}>
          {line}
        </p>
      ))}
    </div>
  );
}
