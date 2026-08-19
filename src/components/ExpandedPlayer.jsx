import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Heart, ChevronDown, Download, Mic2, Volume2, VolumeX, ListMusic } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration } from '../data/mockData';
import { downloadSong, getLyrics } from '../data/api';
import SleepTimer from './SleepTimer';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';

export default function ExpandedPlayer() {
  const { currentSong, isPlaying, togglePlay, playNext, playPrev, currentTime, duration, seekTo, shuffleMode, toggleShuffle, repeatMode, cycleRepeat, toggleLike, likedSongs, isExpanded, setExpanded, showToast, queue, volume, setVolume, playSong } = usePlayer();
  
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
  const displayProgress = isDragging ? dragProgress : (duration > 0 ? currentTime / duration : 0);
  const displayTime = isDragging ? dragProgress * duration : currentTime;
  const hasPanel = activePanel !== null;

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col bg-[#080808] ${closing ? 'animate-[slideDown_0.35s_cubic-bezier(0.16,1,0.3,1)_forwards]' : 'player-expanded-enter'}`}
      onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      
      {/* Background — subtle album art color tint */}
      <div className="absolute inset-0 bg-[#080808]">
        <img src={currentSong.thumbnail} alt="" className="w-full h-full object-cover blur-[120px] scale-[1.5] opacity-10" />
        <div className="absolute inset-0 bg-[#080808]/90" />
      </div>

      <div className="relative flex-1 flex flex-col min-h-0">
        
        {/* Top Bar — close left, volume right */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
          <button onClick={handleClose} className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center active:scale-90 transition-all duration-200 backdrop-blur-sm border border-white/[0.04]">
            <ChevronDown size={20} className="text-white/80" />
          </button>
          <div className="text-center flex-1 mx-4">
            <p className="text-[9px] text-white/30 uppercase tracking-[0.25em] font-medium">Now Playing</p>
            <p className="text-[11px] text-white/60 font-medium mt-0.5 max-w-[200px] mx-auto truncate">{currentSong.album || 'Library'}</p>
          </div>
          <button onClick={() => togglePanel('volume')}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 ${
              activePanel === 'volume' ? 'bg-white/10 text-white' : 'bg-white/[0.06] text-white/40 hover:text-white/60'
            }`}>
            <Volume2 size={16} />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-10 gap-3 min-h-0 scroll-y">
          
          {/* Album Art — premium with depth */}
          <div className={`relative transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            hasPanel ? 'w-[80px] h-[80px] sm:w-[100px] sm:h-[100px]' : 'w-[240px] h-[240px] sm:w-[270px] sm:h-[270px] md:w-[300px] md:h-[300px]'
          }`}>
            {/* Shadow layer */}
            {!hasPanel && (
              <div className="absolute inset-4 rounded-[24px] bg-black/60 blur-[30px] -z-10 transition-all duration-500" />
            )}
            <div className={`w-full h-full rounded-[24px] overflow-hidden ring-1 ring-white/[0.06] transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isPlaying ? 'scale-100 shadow-2xl shadow-black/80' : 'scale-[0.94] shadow-xl shadow-black/60'
            }`}>
              <img src={currentSong.thumbnail} alt="" className="w-full h-full object-cover" />
            </div>
            {/* Premium glow ring when playing */}
            {isPlaying && !hasPanel && (
              <>
                <div className="absolute -inset-3 rounded-[32px] bg-gradient-to-b from-white/[0.04] to-transparent blur-xl playing-pulse -z-10" />
                <div className="absolute -inset-6 rounded-[40px] bg-gradient-to-b from-rose-500/[0.06] to-transparent blur-2xl -z-20 opacity-60" />
              </>
            )}
          </div>

          {/* Active Panel Content */}
          {activePanel === 'lyrics' && (
            <div className="w-full max-w-sm max-h-[35vh] scroll-y animate-scale" id="lyrics-container">
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
            <div className="w-full max-w-sm max-h-[35vh] scroll-y animate-scale">
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

        {/* Bottom Controls — premium glass section */}
        <div className="shrink-0 px-5 sm:px-8 pb-5 pt-1">
          
          {/* Song Info Row */}
          <div className="flex items-center justify-between mb-3 max-w-sm mx-auto">
            <div className="min-w-0 flex-1 mr-3">
              <h1 className="text-[18px] sm:text-[20px] font-bold text-white truncate leading-tight tracking-tight">{currentSong.title}</h1>
              <p className="text-[13px] text-white/40 truncate mt-0.5">{currentSong.artist}</p>
            </div>
            <button onClick={() => toggleLike(currentSong.id)} 
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-250 active:scale-85 ${
                liked ? 'text-rose-500 bg-rose-500/[0.12] shadow-lg shadow-rose-500/10' : 'text-white/25 bg-white/[0.04] hover:bg-white/[0.08] hover:text-white/50'
              }`}>
              <Heart size={20} fill={liked ? 'currentColor' : 'none'} strokeWidth={liked ? 0 : 1.5} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="max-w-sm mx-auto mb-3">
            <div ref={progressRef}
              className="player-progress-track w-full h-[5px] bg-white/[0.08] rounded-full group"
              onMouseDown={handleSeekStart}
              onTouchStart={handleSeekStart}>
              <div className="h-full bg-gradient-to-r from-white/90 to-white rounded-full relative transition-[width] duration-100 ease-linear" 
                style={{ width: `${displayProgress * 100}%` }}>
                <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-[14px] h-[14px] bg-white rounded-full shadow-lg shadow-black/40 transition-all duration-150 ${
                  isDragging ? 'scale-[1.4] opacity-100' : 'scale-100 opacity-0 group-hover:opacity-100'
                }`} />
              </div>
            </div>
            <div className="flex justify-between mt-1.5 text-[10px] text-white/25 tabular-nums font-medium">
              <span>{formatDuration(displayTime)}</span>
              <span>-{formatDuration(Math.max(0, duration - displayTime))}</span>
            </div>
          </div>

          {/* Main Playback Controls */}
          <div className="flex items-center justify-between max-w-[300px] mx-auto mb-4">
            <button onClick={toggleShuffle} className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 active:scale-85 ${
              shuffleMode ? 'text-white bg-white/[0.1]' : 'text-white/25 hover:text-white/50'
            }`}>
              <Shuffle size={17} />
            </button>
            <button onClick={handlePrev} className="w-11 h-11 rounded-full flex items-center justify-center text-white active:scale-85 transition-all duration-150 hover:bg-white/[0.04]">
              <SkipBack size={24} fill="white" />
            </button>
            <button onClick={togglePlay} className="w-[64px] h-[64px] bg-white rounded-full flex items-center justify-center active:scale-90 transition-all duration-200 shadow-2xl shadow-white/10 hover:shadow-white/20 hover:scale-[1.02]">
              {isPlaying ? <Pause size={26} className="text-black" fill="black" /> : <Play size={26} className="text-black ml-0.5" fill="black" />}
            </button>
            <button onClick={handleNext} className="w-11 h-11 rounded-full flex items-center justify-center text-white active:scale-85 transition-all duration-150 hover:bg-white/[0.04]">
              <SkipForward size={24} fill="white" />
            </button>
            <button onClick={cycleRepeat} className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 active:scale-85 ${
              repeatMode !== 'none' ? 'text-white bg-white/[0.1]' : 'text-white/25 hover:text-white/50'
            }`}>
              {repeatMode === 'one' ? <Repeat1 size={17} /> : <Repeat size={17} />}
            </button>
          </div>

          {/* Volume Slider — full-width, easy to use */}
          {activePanel === 'volume' && (
            <div className="max-w-[300px] mx-auto mb-4 animate-scale">
              {/* Volume level display */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] text-white/40 font-medium">Volume</span>
                <span className="text-[14px] text-white font-bold tabular-nums">{Math.round(volume * 100)}%</span>
              </div>
              {/* Slider track — large touch area */}
              <div className="flex items-center gap-3">
                <button onClick={() => setVolume(0)} className="shrink-0 w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center active:scale-90 transition-all hover:bg-white/[0.1]">
                  <VolumeX size={14} className={volume === 0 ? 'text-white' : 'text-white/30'} />
                </button>
                <div ref={volumeRef} className="flex-1 h-[40px] flex items-center cursor-pointer relative touch-none"
                  onMouseDown={handleVolumeStart} onTouchStart={handleVolumeStart}>
                  {/* Background track */}
                  <div className="absolute inset-x-0 h-[6px] bg-white/[0.08] rounded-full top-1/2 -translate-y-1/2" />
                  {/* Filled track */}
                  <div className="absolute left-0 h-[6px] bg-gradient-to-r from-white/60 to-white/80 rounded-full top-1/2 -translate-y-1/2 transition-[width] duration-75" 
                    style={{ width: `${volume * 100}%` }} />
                  {/* Thumb — big and easy to grab */}
                  <div className="absolute top-1/2 -translate-y-1/2 w-[20px] h-[20px] bg-white rounded-full shadow-lg shadow-black/30 transition-all duration-75 active:scale-110" 
                    style={{ left: `calc(${volume * 100}% - 10px)` }} />
                </div>
                <button onClick={() => setVolume(1)} className="shrink-0 w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center active:scale-90 transition-all hover:bg-white/[0.1]">
                  <Volume2 size={14} className={volume >= 0.95 ? 'text-white' : 'text-white/30'} />
                </button>
              </div>
              {/* Quick volume presets */}
              <div className="flex items-center justify-between mt-3 gap-2">
                {[25, 50, 75, 100].map(pct => (
                  <button key={pct} onClick={() => setVolume(pct / 100)}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all duration-150 active:scale-95 ${
                      Math.round(volume * 100) === pct 
                        ? 'bg-white/[0.12] text-white border border-white/[0.1]' 
                        : 'bg-white/[0.04] text-white/30 hover:bg-white/[0.07] hover:text-white/50'
                    }`}>
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-center gap-2 max-w-sm mx-auto">
            <ActionPill icon={Mic2} label="Lyrics" active={activePanel === 'lyrics'} onClick={() => togglePanel('lyrics')} />
            <ActionPill icon={ListMusic} label="Queue" active={activePanel === 'queue'} onClick={() => togglePanel('queue')} badge={queue.length > 0 ? queue.length : null} />
            <ActionPill icon={Download} label="Offline" onClick={async () => { closePanels(); showToast('Saving offline...'); const ok = await downloadSong(currentSong); showToast(ok ? 'Saved ✓' : 'Failed', ok ? 'success' : 'error'); }} />
            <SleepTimer />
          </div>
        </div>
      </div>
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
