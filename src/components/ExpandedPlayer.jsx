import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Heart, ChevronDown, Download, Share2, Mic2, Volume2, VolumeX, ListMusic, X } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration } from '../data/mockData';
import { downloadSong, getLyrics } from '../data/api';
import SleepTimer from './SleepTimer';
import { useState, useRef, useEffect, useCallback } from 'react';

export default function ExpandedPlayer() {
  const { currentSong, isPlaying, togglePlay, playNext, playPrev, currentTime, duration, seekTo, shuffleMode, toggleShuffle, repeatMode, cycleRepeat, toggleLike, likedSongs, isExpanded, setExpanded, showToast, queue, volume, setVolume, playSong } = usePlayer();
  const [showLyrics, setShowLyrics] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [lyrics, setLyrics] = useState(null);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);
  const [closing, setClosing] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const touchStartY = useRef(0);
  const progressRef = useRef(null);
  const volumeRef = useRef(null);

  // Fetch lyrics
  useEffect(() => {
    if (!currentSong || !showLyrics) return;
    setLyricsLoading(true);
    setLyrics(null);
    getLyrics(currentSong.id).then(l => { setLyrics(l || null); setLyricsLoading(false); }).catch(() => setLyricsLoading(false));
  }, [currentSong?.id, showLyrics]);

  // Close lyrics/queue when song changes
  useEffect(() => {
    setShowLyrics(false);
    setLyrics(null);
    setShowQueue(false);
  }, [currentSong?.id]);

  // Close with animation
  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      setExpanded(false);
    }, 350);
  }, [setExpanded]);

  // Touch gestures
  const onTouchStart = (e) => { touchStartY.current = e.touches[0].clientY; };
  const onTouchEnd = (e) => { if (e.changedTouches[0].clientY - touchStartY.current > 80) handleClose(); };

  // Drag-to-seek
  const handleSeekStart = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
    const rect = progressRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setDragProgress(pct);

    const onMove = (ev) => {
      const cx = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const p = Math.max(0, Math.min(1, (cx - rect.left) / rect.width));
      setDragProgress(p);
    };
    const onEnd = (ev) => {
      const cx = ev.changedTouches ? ev.changedTouches[0].clientX : ev.clientX;
      const p = Math.max(0, Math.min(1, (cx - rect.left) / rect.width));
      seekTo(p * duration);
      setIsDragging(false);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
  }, [duration, seekTo]);

  // Volume drag
  const handleVolumeStart = useCallback((e) => {
    e.preventDefault();
    const rect = volumeRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setVolume(pct);

    const onMove = (ev) => {
      const cx = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const p = Math.max(0, Math.min(1, (cx - rect.left) / rect.width));
      setVolume(p);
    };
    const onEnd = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
  }, [setVolume]);

  const shareSong = async () => {
    const text = `${currentSong.title} - ${currentSong.artist}`;
    if (navigator.share) {
      try { await navigator.share({ title: currentSong.title, text }); } catch {}
    } else {
      await navigator.clipboard?.writeText(text);
      showToast('Copied!');
    }
  };

  if (!isExpanded || !currentSong) return null;
  const liked = likedSongs.includes(currentSong.id);
  const displayProgress = isDragging ? dragProgress : (duration > 0 ? currentTime / duration : 0);
  const displayTime = isDragging ? dragProgress * duration : currentTime;

  return (
    <div className={`fixed inset-0 z-[70] flex flex-col ${closing ? 'animate-[slideDown_0.35s_cubic-bezier(0.22,1,0.36,1)_forwards]' : 'player-expanded-enter'}`}
      onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      
      {/* Background — cinematic blur */}
      <div className="absolute inset-0 overflow-hidden">
        <img src={currentSong.thumbnail} alt="" className="w-full h-full object-cover blur-[100px] scale-[1.4] opacity-25 transition-[src] duration-700" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-[#0a0a0a]/80 to-[#0a0a0a]/95" />
      </div>

      <div className="relative flex-1 flex flex-col min-h-0">
        
        {/* Top Bar */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2 shrink-0">
          <button onClick={handleClose} className="w-10 h-10 rounded-full bg-white/[0.08] flex items-center justify-center active:scale-90 transition-all duration-200 backdrop-blur-md hover:bg-white/[0.12]">
            <ChevronDown size={22} className="text-white" />
          </button>
          <div className="text-center flex-1 mx-4">
            <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-medium">Now Playing</p>
            <p className="text-[12px] text-white/70 font-medium mt-0.5 max-w-[200px] mx-auto truncate">{currentSong.album || 'Library'}</p>
          </div>
          <SleepTimer />
        </div>

        {/* Main Content — scrollable area */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-10 gap-4 min-h-0 scroll-y">
          
          {/* Album Art */}
          <div className={`relative transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            showLyrics || showQueue ? 'w-[90px] h-[90px] sm:w-[110px] sm:h-[110px]' : 'w-[250px] h-[250px] sm:w-[280px] sm:h-[280px] md:w-[320px] md:h-[320px]'
          }`}>
            <div className={`w-full h-full rounded-[28px] overflow-hidden shadow-2xl shadow-black/80 ring-1 ring-white/[0.06] transition-all duration-500 ${isPlaying ? 'scale-100' : 'scale-[0.95]'}`}>
              <img src={currentSong.thumbnail} alt="" className="w-full h-full object-cover" />
            </div>
            {/* Glow effect when playing */}
            {isPlaying && !showLyrics && !showQueue && (
              <div className="absolute -inset-4 rounded-[36px] bg-gradient-to-b from-rose-500/10 to-transparent blur-2xl playing-pulse -z-10" />
            )}
          </div>

          {/* Lyrics Panel */}
          {showLyrics && (
            <div className="w-full max-w-sm max-h-[32vh] scroll-y animate-scale" id="lyrics-container">
              {lyricsLoading && (
                <div className="flex justify-center py-8">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                </div>
              )}
              {!lyricsLoading && !lyrics && (
                <p className="text-[14px] text-white/30 text-center py-8">Lyrics not available</p>
              )}
              {!lyricsLoading && lyrics && (
                <SyncedLyrics lyrics={lyrics} currentTime={currentTime} duration={duration} />
              )}
            </div>
          )}

          {/* Queue Panel */}
          {showQueue && (
            <div className="w-full max-w-sm max-h-[32vh] scroll-y animate-scale">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[13px] font-semibold text-white/70">Up Next</h3>
                <span className="text-[11px] text-white/30">{queue.length} songs</span>
              </div>
              {queue.length === 0 ? (
                <p className="text-[13px] text-white/30 text-center py-6">Queue is empty</p>
              ) : (
                <div className="space-y-1">
                  {queue.slice(0, 15).map((song, i) => (
                    <button key={song.id + i} onClick={() => playSong(song, queue)}
                      className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-white/[0.05] active:bg-white/[0.08] transition-all duration-150 text-left">
                      <img src={song.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0 ring-1 ring-white/[0.06]" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-white truncate">{song.title}</p>
                        <p className="text-[10px] text-white/40 truncate">{song.artist}</p>
                      </div>
                      <span className="text-[10px] text-white/20 tabular-nums shrink-0">{formatDuration(song.duration)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Controls Section — always visible */}
        <div className="shrink-0 px-6 sm:px-10 pb-6 pt-2">
          {/* Song Info */}
          <div className="flex items-center justify-between mb-4 max-w-sm mx-auto">
            <div className="min-w-0 flex-1 mr-4">
              <h1 className="text-[20px] sm:text-[22px] font-bold text-white truncate leading-tight">{currentSong.title}</h1>
              <p className="text-[14px] text-white/50 truncate mt-1">{currentSong.artist}</p>
            </div>
            <button onClick={() => toggleLike(currentSong.id)} className={`p-2.5 rounded-full transition-all duration-200 active:scale-90 ${liked ? 'text-rose-500 bg-rose-500/10' : 'text-white/30 hover:text-white/60'}`}>
              <Heart size={22} fill={liked ? 'currentColor' : 'none'} strokeWidth={liked ? 0 : 1.5} />
            </button>
          </div>

          {/* Progress Bar — drag-to-seek */}
          <div className="max-w-sm mx-auto mb-4">
            <div ref={progressRef}
              className="player-progress-track w-full h-[5px] bg-white/[0.1] rounded-full group"
              onMouseDown={handleSeekStart}
              onTouchStart={handleSeekStart}>
              <div className="h-full bg-white rounded-full relative transition-[width] duration-100 ease-linear" 
                style={{ width: `${displayProgress * 100}%` }}>
                <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-[16px] h-[16px] bg-white rounded-full shadow-lg shadow-black/30 seek-thumb transition-all duration-150 ${isDragging ? 'scale-[1.3] opacity-100' : 'scale-100 opacity-0 group-hover:opacity-100'}`} />
              </div>
            </div>
            <div className="flex justify-between mt-2 text-[11px] text-white/35 tabular-nums font-medium">
              <span>{formatDuration(displayTime)}</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-between max-w-[320px] mx-auto mb-4">
            <button onClick={toggleShuffle} className={`p-2.5 rounded-full transition-all duration-200 active:scale-90 ${shuffleMode ? 'text-white bg-white/[0.1]' : 'text-white/30 hover:text-white/60'}`}>
              <Shuffle size={20} />
            </button>
            <button onClick={playPrev} className="p-2.5 text-white active:scale-90 transition-all duration-150 hover:text-white/80">
              <SkipBack size={28} fill="white" />
            </button>
            <button onClick={togglePlay} className="w-[68px] h-[68px] bg-white rounded-full flex items-center justify-center active:scale-90 transition-all duration-200 shadow-2xl shadow-white/15 hover:shadow-white/25 hover:scale-[1.03]">
              {isPlaying ? <Pause size={28} className="text-black" fill="black" /> : <Play size={28} className="text-black ml-1" fill="black" />}
            </button>
            <button onClick={playNext} className="p-2.5 text-white active:scale-90 transition-all duration-150 hover:text-white/80">
              <SkipForward size={28} fill="white" />
            </button>
            <button onClick={cycleRepeat} className={`p-2.5 rounded-full transition-all duration-200 active:scale-90 ${repeatMode !== 'none' ? 'text-white bg-white/[0.1]' : 'text-white/30 hover:text-white/60'}`}>
              {repeatMode === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
            </button>
          </div>

          {/* Volume Slider */}
          {showVolume && (
            <div className="max-w-[280px] mx-auto mb-4 flex items-center gap-3 animate-scale">
              <VolumeX size={14} className="text-white/30 shrink-0" />
              <div ref={volumeRef} className="flex-1 h-[4px] bg-white/[0.1] rounded-full cursor-pointer relative"
                onMouseDown={handleVolumeStart} onTouchStart={handleVolumeStart}>
                <div className="h-full bg-white/70 rounded-full" style={{ width: `${(volume || 1) * 100}%` }}>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[12px] h-[12px] bg-white rounded-full shadow-md" 
                    style={{ left: `${(volume || 1) * 100}%`, transform: 'translate(-50%, -50%)' }} />
                </div>
              </div>
              <Volume2 size={14} className="text-white/30 shrink-0" />
            </div>
          )}

          {/* Bottom Actions */}
          <div className="flex items-center justify-center gap-5 max-w-sm mx-auto">
            <button onClick={() => { setShowLyrics(!showLyrics); setShowQueue(false); }} 
              className={`flex flex-col items-center gap-1.5 transition-all duration-200 active:scale-90 ${showLyrics ? 'text-white' : 'text-white/30 hover:text-white/60'}`}>
              <Mic2 size={18} />
              <span className="text-[9px] font-medium">Lyrics</span>
            </button>
            <button onClick={() => { setShowQueue(!showQueue); setShowLyrics(false); }}
              className={`flex flex-col items-center gap-1.5 transition-all duration-200 active:scale-90 ${showQueue ? 'text-white' : 'text-white/30 hover:text-white/60'}`}>
              <ListMusic size={18} />
              <span className="text-[9px] font-medium">Queue</span>
            </button>
            <button onClick={() => setShowVolume(!showVolume)}
              className={`flex flex-col items-center gap-1.5 transition-all duration-200 active:scale-90 ${showVolume ? 'text-white' : 'text-white/30 hover:text-white/60'}`}>
              <Volume2 size={18} />
              <span className="text-[9px] font-medium">Volume</span>
            </button>
            <button onClick={shareSong} className="flex flex-col items-center gap-1.5 text-white/30 hover:text-white/60 active:scale-90 transition-all duration-200">
              <Share2 size={18} />
              <span className="text-[9px] font-medium">Share</span>
            </button>
            <button onClick={async () => { showToast('Downloading...'); const ok = await downloadSong(currentSong); showToast(ok ? 'Downloaded ✓' : 'Failed'); }}
              className="flex flex-col items-center gap-1.5 text-white/30 hover:text-white/60 active:scale-90 transition-all duration-200">
              <Download size={18} />
              <span className="text-[9px] font-medium">Save</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


// Synced lyrics component
function SyncedLyrics({ lyrics, currentTime, duration }) {
  const containerRef = useRef(null);
  const lines = lyrics.split('\n').filter(l => l.trim());

  const startTime = duration * 0.05;
  const endTime = duration * 0.92;
  const activeRange = endTime - startTime;
  const timePerLine = activeRange / lines.length;

  const activeIndex = Math.min(
    lines.length - 1,
    Math.max(0, Math.floor((currentTime - startTime) / timePerLine))
  );

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current.querySelector('[data-active="true"]');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [activeIndex]);

  return (
    <div ref={containerRef} className="space-y-3.5 text-center py-3">
      {lines.map((line, i) => (
        <p key={i}
          data-active={i === activeIndex ? 'true' : undefined}
          className={`text-[15px] sm:text-[17px] font-semibold leading-relaxed transition-all duration-400 ${
            i === activeIndex
              ? 'text-white scale-[1.02]'
              : i < activeIndex
                ? 'text-white/20'
                : 'text-white/40'
          }`}>
          {line}
        </p>
      ))}
    </div>
  );
}
