import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Heart, ChevronDown, Mic2, Volume2, VolumeX, ListMusic, Plus, Check, Download } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration } from '../data/mockData';
import { getLyrics } from '../data/api';
import SleepTimer from './SleepTimer';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';

export default function ExpandedPlayer() {
  const { currentSong, isPlaying, togglePlay, playNext, playPrev, currentTime, duration, seekTo, shuffleMode, toggleShuffle, repeatMode, cycleRepeat, toggleLike, likedSongs, downloadedSongs, toggleDownload, isExpanded, setExpanded, showToast, queue, volume, setVolume, playSong } = usePlayer();
  
  // Panel state — only one panel can be open at a time
  const [activePanel, setActivePanel] = useState(null); // 'lyrics' | 'queue' | 'volume' | null
  const [lyrics, setLyrics] = useState(null);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);
  const [closing, setClosing] = useState(false);
  const touchStartY = useRef(0);
  const progressRef = useRef(null);
  const volumeRef = useRef(null);

  // Toggle panel — auto-closes others
  const togglePanel = useCallback((panel) => {
    setActivePanel(prev => prev === panel ? null : panel);
  }, []);

  // Auto-hide volume after 3s of no interaction
  const volumeTimerRef = useRef(null);
  useEffect(() => {
    if (activePanel === 'volume') {
      if (volumeTimerRef.current) clearTimeout(volumeTimerRef.current);
      volumeTimerRef.current = setTimeout(() => setActivePanel(null), 3000);
    }
    return () => { if (volumeTimerRef.current) clearTimeout(volumeTimerRef.current); };
  }, [activePanel, volume]);

  // Close all panels
  const closePanels = useCallback(() => {
    setActivePanel(null);
  }, []);

  // Fetch lyrics — try LRCLIB synced first, then JioSaavn plain
  useEffect(() => {
    if (!currentSong || activePanel !== 'lyrics') return;
    setLyricsLoading(true);
    setLyrics(null);
    getLyrics(currentSong.id, currentSong.title, currentSong.artist)
      .then(l => { setLyrics(l || null); setLyricsLoading(false); })
      .catch(() => setLyricsLoading(false));
  }, [currentSong?.id, activePanel]);

  // Close panels when song changes
  useEffect(() => {
    closePanels();
    setLyrics(null);
  }, [currentSong?.id]);

  // Close with animation
  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      setExpanded(false);
      closePanels();
    }, 350);
  }, [setExpanded, closePanels]);

  // Touch gestures — swipe down to close
  const onTouchStart = (e) => { touchStartY.current = e.touches[0].clientY; };
  const onTouchEnd = (e) => { if (e.changedTouches[0].clientY - touchStartY.current > 80) handleClose(); };

  // Drag-to-seek on progress bar
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

  // Volume drag — improved with larger touch area
  const handleVolumeStart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = volumeRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setVolume(pct);

    const onMove = (ev) => {
      ev.preventDefault();
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

  // Play next — auto-close panels
  const handleNext = useCallback(() => {
    closePanels();
    playNext();
  }, [playNext, closePanels]);

  // Play prev — auto-close panels
  const handlePrev = useCallback(() => {
    closePanels();
    playPrev();
  }, [playPrev, closePanels]);

  if (!isExpanded || !currentSong) return null;
  const liked = likedSongs.includes(currentSong.id);
  const downloaded = downloadedSongs.includes(currentSong.id);
  const displayProgress = isDragging ? dragProgress : (duration > 0 ? currentTime / duration : 0);
  const displayTime = isDragging ? dragProgress * duration : currentTime;
  const hasPanel = activePanel === 'lyrics' || activePanel === 'queue';

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col bg-[#020202] ${closing ? 'animate-[slideDown_0.35s_cubic-bezier(0.16,1,0.3,1)_forwards]' : 'player-expanded-enter'}`}
      onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      
      {/* Background — premium animated mesh */}
      <div className="absolute inset-0 overflow-hidden">
        <img src={currentSong.thumbnail} alt="" className={`absolute inset-0 w-full h-full object-cover blur-[80px] scale-[2.5] saturate-200 transition-opacity duration-1000 ${isPlaying ? 'opacity-30' : 'opacity-8'}`} />
        <div className="absolute inset-0 bg-[#020202]/60" />
        {/* Animated moving gradient mesh */}
        {isPlaying && (
          <>
            <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-rose-500/[0.06] rounded-full blur-[120px] animate-float" style={{ animationDuration: '6s' }} />
            <div className="absolute bottom-[-10%] right-[-15%] w-[50%] h-[50%] bg-purple-600/[0.05] rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s', animationDuration: '7s' }} />
            <div className="absolute top-[40%] left-[50%] w-[30%] h-[30%] bg-blue-500/[0.04] rounded-full blur-[80px] animate-float" style={{ animationDelay: '4s', animationDuration: '8s' }} />
          </>
        )}
        {/* Subtle noise texture */}
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
      </div>

      <div className="relative flex-1 flex flex-col min-h-0">
        
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 sm:px-5 pt-3 sm:pt-4 pb-1 sm:pb-2 shrink-0">
          <button onClick={handleClose} className="w-9 h-9 rounded-full bg-white/[0.06] backdrop-blur-md flex items-center justify-center active:scale-90 transition-all duration-200 border border-white/[0.05]">
            <ChevronDown size={20} className="text-white/80" />
          </button>
          <div className="text-center flex-1 mx-4">
            <p className="text-[9px] text-white/35 uppercase tracking-[0.25em] font-medium">Now Playing</p>
            <p className="text-[11px] text-white/60 font-medium mt-0.5 max-w-[200px] mx-auto truncate">{currentSong.album || 'Library'}</p>
          </div>
          <button onClick={() => togglePanel('volume')}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 backdrop-blur-md border border-white/[0.05] ${
              activePanel === 'volume' ? 'bg-white/12 text-white' : 'bg-white/[0.06] text-white/50 hover:text-white/70'
            }`}>
            <Volume2 size={16} />
          </button>
        </div>

        {/* Main Content Area — vertical on mobile, horizontal on desktop */}
        <div className="flex-1 flex flex-col lg:flex-row items-center justify-center px-5 sm:px-10 lg:px-16 gap-3 lg:gap-12 min-h-0 overflow-hidden max-w-[900px] mx-auto w-full">
          
          {/* Album Art — premium with effects */}
          <div className={`relative transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] shrink-0 ${
            hasPanel ? 'w-[70px] h-[70px] sm:w-[90px] sm:h-[90px]' : 'w-[200px] h-[200px] sm:w-[260px] sm:h-[260px] lg:w-[320px] lg:h-[320px]'
          }`}>
            {/* Rotating outer glow ring */}
            {isPlaying && !hasPanel && (
              <div className="absolute -inset-4 rounded-[30px] animate-[spin_12s_linear_infinite] -z-10" 
                style={{ background: 'conic-gradient(from 0deg, rgba(225,29,72,0.08), transparent, rgba(147,51,234,0.06), transparent, rgba(225,29,72,0.08))' }} />
            )}
            {/* Pulsing ring */}
            {isPlaying && !hasPanel && (
              <div className="absolute -inset-2 rounded-[26px] border border-white/[0.04] animate-breathe" />
            )}
            {/* Shadow */}
            {!hasPanel && (
              <div className={`absolute inset-4 rounded-[24px] blur-[35px] -z-20 transition-all duration-700 ${isPlaying ? 'bg-black/80 translate-y-6 scale-90' : 'bg-black/40 translate-y-2'}`} />
            )}
            {/* Album Art */}
            <div className={`w-full h-full rounded-[24px] overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isPlaying ? 'scale-100 ring-1 ring-white/[0.08] shadow-2xl' : 'scale-[0.92] ring-1 ring-white/[0.04] shadow-lg'
            }`}>
              <img src={currentSong.thumbnail} alt="" className={`w-full h-full object-cover transition-all duration-700 ${isPlaying ? 'scale-100 brightness-100' : 'scale-[1.08] brightness-[0.6]'}`} />
            </div>
            {/* Ambient glow */}
            {isPlaying && !hasPanel && (
              <div className="absolute -inset-10 rounded-[44px] -z-10 playing-pulse" style={{ background: 'radial-gradient(ellipse at center, rgba(225,29,72,0.07) 0%, rgba(147,51,234,0.03) 40%, transparent 70%)' }} />
            )}
          </div>

          {/* Active Panel Content */}
          {activePanel === 'lyrics' && (
            <div className="w-full max-w-sm max-h-[28vh] sm:max-h-[35vh] scroll-y animate-scale" id="lyrics-container">
              {lyricsLoading && (
                <div className="flex justify-center py-10">
                  <div className="w-5 h-5 border-2 border-white/15 border-t-white/80 rounded-full animate-spin" />
                </div>
              )}
              {!lyricsLoading && !lyrics && (
                <div className="text-center py-10">
                  <Mic2 size={24} className="text-white/15 mx-auto mb-2" />
                  <p className="text-[13px] text-white/25">Lyrics not available</p>
                </div>
              )}
              {!lyricsLoading && lyrics && lyrics.synced && (
                <SyncedLyrics lrcData={lyrics.data} currentTime={currentTime} />
              )}
              {!lyricsLoading && lyrics && !lyrics.synced && (
                <PlainLyrics text={lyrics.data} currentTime={currentTime} duration={duration} />
              )}
            </div>
          )}

          {activePanel === 'queue' && (
            <div className="w-full max-w-sm max-h-[28vh] sm:max-h-[35vh] scroll-y animate-scale">
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-[12px] font-semibold text-white/50 uppercase tracking-wider">Up Next</h3>
                <span className="text-[10px] text-white/25 bg-white/[0.05] px-2 py-0.5 rounded-full">{queue.length} songs</span>
              </div>
              {queue.length === 0 ? (
                <div className="text-center py-10">
                  <ListMusic size={24} className="text-white/15 mx-auto mb-2" />
                  <p className="text-[13px] text-white/25">Queue is empty</p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {queue.slice(0, 12).map((song, i) => (
                    <button key={song.id + i} onClick={() => { playSong(song, queue); closePanels(); }}
                      className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-white/[0.04] active:bg-white/[0.07] transition-all duration-150 text-left group">
                      <span className="text-[10px] text-white/20 w-4 shrink-0 text-center tabular-nums">{i + 1}</span>
                      <img src={song.thumbnail} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0 ring-1 ring-white/[0.05] group-hover:ring-white/[0.1] transition-all" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-white/80 truncate">{song.title}</p>
                        <p className="text-[9px] text-white/30 truncate">{song.artist}</p>
                      </div>
                      <span className="text-[9px] text-white/15 tabular-nums shrink-0">{formatDuration(song.duration)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Controls — on desktop these sit to the right of art */}
        <div className="shrink-0 lg:flex-1 px-5 sm:px-8 lg:px-0 pb-4 sm:pb-6 pt-1 lg:pt-0 lg:flex lg:flex-col lg:justify-center">
          
          {/* Song Info Row */}
          <div className="flex items-center justify-between mb-3 sm:mb-4 max-w-sm mx-auto">
            <div className="min-w-0 flex-1 mr-3">
              <h1 className="text-[18px] sm:text-[22px] font-bold text-white truncate leading-tight">{currentSong.title}</h1>
              <p className="text-[13px] text-white/45 truncate mt-1">{currentSong.artist}</p>
            </div>
            <button onClick={() => toggleLike(currentSong.id)} 
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-250 active:scale-85 ${
                liked ? 'text-rose-500 bg-rose-500/[0.1]' : 'text-white/25 hover:text-white/50'
              }`}>
              <Heart size={22} fill={liked ? 'currentColor' : 'none'} strokeWidth={liked ? 0 : 1.5} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="max-w-sm mx-auto mb-4 sm:mb-5">
            <div ref={progressRef}
              className="player-progress-track w-full h-[4px] bg-white/[0.1] rounded-full group"
              onMouseDown={handleSeekStart}
              onTouchStart={handleSeekStart}>
              <div className={`h-full rounded-full relative transition-[width] duration-100 ease-linear ${isDragging ? 'bg-white' : 'bg-white/80'}`}
                style={{ width: `${displayProgress * 100}%` }}>
                <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-[14px] h-[14px] bg-white rounded-full shadow-md transition-all duration-150 ${
                  isDragging ? 'scale-[1.3] opacity-100' : 'scale-100 opacity-0 group-hover:opacity-100'
                }`} />
              </div>
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-white/30 tabular-nums font-medium">
              <span>{formatDuration(displayTime)}</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>

          {/* Main Playback Controls */}
          <div className="flex items-center justify-between max-w-[280px] sm:max-w-[300px] mx-auto mb-4 sm:mb-5">
            <button onClick={toggleShuffle} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 active:scale-85 ${
              shuffleMode ? 'text-white' : 'text-white/30 hover:text-white/60'
            }`}>
              <Shuffle size={18} />
            </button>
            <button onClick={handlePrev} className="w-12 h-12 rounded-full flex items-center justify-center text-white active:scale-85 transition-all duration-150">
              <SkipBack size={26} fill="white" />
            </button>
            <button onClick={togglePlay} className="w-16 h-16 sm:w-[72px] sm:h-[72px] bg-white rounded-full flex items-center justify-center active:scale-90 transition-all duration-200 shadow-[0_4px_24px_rgba(255,255,255,0.12)]">
              {isPlaying ? <Pause size={28} className="text-black" fill="black" /> : <Play size={28} className="text-black ml-1" fill="black" />}
            </button>
            <button onClick={handleNext} className="w-12 h-12 rounded-full flex items-center justify-center text-white active:scale-85 transition-all duration-150">
              <SkipForward size={26} fill="white" />
            </button>
            <button onClick={cycleRepeat} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 active:scale-85 ${
              repeatMode !== 'none' ? 'text-white' : 'text-white/30 hover:text-white/60'
            }`}>
              {repeatMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
            </button>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-center gap-2.5 max-w-sm mx-auto">
            <ActionPill icon={Mic2} label="Lyrics" active={activePanel === 'lyrics'} onClick={() => togglePanel('lyrics')} />
            <ActionPill icon={ListMusic} label="Queue" active={activePanel === 'queue'} onClick={() => togglePanel('queue')} badge={queue.length > 0 ? queue.length : null} />
            <ActionPill icon={downloaded ? Check : Download} label={downloaded ? 'Saved' : 'Download'} active={downloaded} onClick={() => toggleDownload(currentSong.id)} />
            <SleepTimer />
          </div>
        </div>
      </div>

      {/* Volume — auto-hide side bar */}
      {activePanel === 'volume' && (
        <div className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 w-[36px] h-[220px] sm:h-[280px] flex flex-col items-center py-4 z-10"
          style={{ animation: 'scaleIn 0.3s cubic-bezier(0.22,1,0.36,1) both' }}>
          
          <Volume2 size={13} className="text-white/40 mb-3 shrink-0" />

          <div ref={volumeRef} className="flex-1 w-[36px] flex items-center justify-center cursor-pointer relative touch-none"
            onMouseDown={(e) => {
              e.preventDefault();
              if (volumeTimerRef.current) clearTimeout(volumeTimerRef.current);
              const rect = volumeRef.current.getBoundingClientRect();
              const pct = 1 - Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
              setVolume(pct);
              const onMove = (ev) => { const p = 1 - Math.max(0, Math.min(1, (ev.clientY - rect.top) / rect.height)); setVolume(p); };
              const onEnd = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onEnd); volumeTimerRef.current = setTimeout(() => setActivePanel(null), 3000); };
              document.addEventListener('mousemove', onMove);
              document.addEventListener('mouseup', onEnd);
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              if (volumeTimerRef.current) clearTimeout(volumeTimerRef.current);
              const rect = volumeRef.current.getBoundingClientRect();
              const pct = 1 - Math.max(0, Math.min(1, (e.touches[0].clientY - rect.top) / rect.height));
              setVolume(pct);
              const onMove = (ev) => { ev.preventDefault(); const p = 1 - Math.max(0, Math.min(1, (ev.touches[0].clientY - rect.top) / rect.height)); setVolume(p); };
              const onEnd = () => { document.removeEventListener('touchmove', onMove); document.removeEventListener('touchend', onEnd); volumeTimerRef.current = setTimeout(() => setActivePanel(null), 3000); };
              document.addEventListener('touchmove', onMove, { passive: false });
              document.addEventListener('touchend', onEnd);
            }}>
            <div className="absolute inset-y-0 w-[4px] bg-white/[0.08] rounded-full left-1/2 -translate-x-1/2" />
            <div className="absolute bottom-0 w-[4px] bg-white rounded-full left-1/2 -translate-x-1/2 transition-[height] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ height: `${volume * 100}%` }} />
            <div className="absolute w-[14px] h-[14px] bg-white rounded-full left-1/2 -translate-x-1/2 shadow-md transition-[bottom] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ bottom: `calc(${volume * 100}% - 7px)` }} />
          </div>

          <span className="text-[10px] text-white/40 font-bold mt-3 tabular-nums shrink-0">{Math.round(volume * 100)}</span>
        </div>
      )}
    </div>
  );
}

// Premium action pill button
function ActionPill({ icon: Icon, label, active, onClick, badge }) {
  return (
    <button onClick={onClick} className={`relative flex items-center gap-1.5 px-3 py-2 rounded-full transition-all duration-250 active:scale-90 ${
      active 
        ? 'bg-white/[0.12] text-white border border-white/[0.1]' 
        : 'bg-white/[0.04] text-white/35 border border-transparent hover:bg-white/[0.07] hover:text-white/60'
    }`}>
      <Icon size={14} />
      <span className="text-[9px] font-semibold tracking-wide">{label}</span>
      {badge && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center text-[8px] font-bold text-white">{badge > 9 ? '9+' : badge}</span>
      )}
    </button>
  );
}

// SYNCED LYRICS — highlights active line based on real timestamps
function SyncedLyrics({ lrcData, currentTime }) {
  const containerRef = useRef(null);

  const lines = useMemo(() => {
    return lrcData.split('\n')
      .map(line => {
        const match = line.match(/^\[(\d{2}):(\d{2})\.(\d{2,3})\]\s?(.*)$/);
        if (!match) return null;
        const mins = parseInt(match[1]);
        const secs = parseInt(match[2]);
        const ms = parseInt(match[3].padEnd(3, '0'));
        const time = mins * 60 + secs + ms / 1000;
        const text = match[4].trim();
        return text ? { time, text } : null;
      })
      .filter(Boolean);
  }, [lrcData]);

  // Find active line
  let activeIndex = -1;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (currentTime >= lines[i].time) {
      activeIndex = i;
      break;
    }
  }

  useEffect(() => {
    if (!containerRef.current || activeIndex < 0) return;
    const el = containerRef.current.querySelector('[data-active="true"]');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [activeIndex]);

  return (
    <div ref={containerRef} className="space-y-3 text-center py-2">
      {lines.map((line, i) => (
        <p key={i}
          data-active={i === activeIndex ? 'true' : undefined}
          className={`text-[14px] sm:text-[16px] font-semibold leading-relaxed transition-all duration-400 ${
            i === activeIndex
              ? 'text-white scale-[1.02]'
              : i < activeIndex
                ? 'text-white/20'
                : 'text-white/40'
          }`}>
          {line.text}
        </p>
      ))}
    </div>
  );
}

// PLAIN LYRICS fallback — highlights with estimation
function PlainLyrics({ text, currentTime, duration }) {
  const containerRef = useRef(null);
  const lines = text.split('\n').filter(l => l.trim());
  const totalLines = lines.length;

  const introSec = duration < 150 ? 5 : duration < 240 ? 8 : 12;
  const outroSec = duration < 150 ? 5 : duration < 240 ? 10 : 15;
  const vocalStart = introSec;
  const vocalEnd = duration - outroSec;
  const timePerLine = (vocalEnd - vocalStart) / totalLines;

  let activeIndex = -1;
  if (currentTime >= vocalStart) {
    activeIndex = Math.min(totalLines - 1, Math.floor((currentTime - vocalStart) / timePerLine));
  }
  if (currentTime >= vocalEnd && totalLines > 0) activeIndex = totalLines - 1;

  useEffect(() => {
    if (!containerRef.current || activeIndex < 0) return;
    const el = containerRef.current.querySelector('[data-active="true"]');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [activeIndex]);

  return (
    <div ref={containerRef} className="space-y-3 text-center py-2">
      {lines.map((line, i) => (
        <p key={i}
          data-active={i === activeIndex ? 'true' : undefined}
          className={`text-[14px] sm:text-[16px] font-semibold leading-relaxed transition-all duration-400 ${
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


// End of file
