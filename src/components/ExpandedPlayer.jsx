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
  const hasPanel = activePanel !== null;

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col bg-[#050505] ${closing ? 'animate-[slideDown_0.35s_cubic-bezier(0.16,1,0.3,1)_forwards]' : 'player-expanded-enter'}`}
      onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      
      {/* Background — dynamic color from album art */}
      <div className="absolute inset-0 overflow-hidden">
        <img src={currentSong.thumbnail} alt="" className="absolute inset-0 w-full h-full object-cover blur-[150px] scale-[2] opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-[#050505]/70 to-[#050505]" />
        {/* Audio Visualizer Bars — behind everything */}
        {isPlaying && !hasPanel && <AudioVisualizer />}
        {/* Animated disco glow orbs */}
        {isPlaying && (
          <>
            <div className="absolute top-[20%] left-[10%] w-[200px] h-[200px] bg-rose-500/[0.08] rounded-full blur-[80px] animate-float" />
            <div className="absolute bottom-[30%] right-[5%] w-[180px] h-[180px] bg-purple-500/[0.06] rounded-full blur-[80px] animate-float" style={{ animationDelay: '1.5s' }} />
            <div className="absolute top-[50%] right-[20%] w-[120px] h-[120px] bg-blue-500/[0.05] rounded-full blur-[60px] animate-float" style={{ animationDelay: '3s' }} />
          </>
        )}
      </div>

      <div className="relative flex-1 flex flex-col min-h-0">
        
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 sm:px-5 pt-3 sm:pt-4 pb-1 sm:pb-2 shrink-0">
          <button onClick={handleClose} className="w-9 h-9 rounded-full bg-white/[0.08] backdrop-blur-md flex items-center justify-center active:scale-90 transition-all duration-200 border border-white/[0.06]">
            <ChevronDown size={20} className="text-white/90" />
          </button>
          <div className="text-center flex-1 mx-4">
            <p className="text-[9px] text-white/40 uppercase tracking-[0.25em] font-medium">Now Playing</p>
            <p className="text-[11px] text-white/70 font-medium mt-0.5 max-w-[200px] mx-auto truncate">{currentSong.album || 'Library'}</p>
          </div>
          <button onClick={() => togglePanel('volume')}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 backdrop-blur-md border border-white/[0.06] ${
              activePanel === 'volume' ? 'bg-white/15 text-white' : 'bg-white/[0.08] text-white/50 hover:text-white/80'
            }`}>
            <Volume2 size={16} />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center px-5 sm:px-10 gap-2 min-h-0 overflow-hidden">
          
          {/* Album Art — vinyl/disco style */}
          <div className={`relative transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] shrink-0 ${
            hasPanel ? 'w-[70px] h-[70px] sm:w-[90px] sm:h-[90px]' : 'w-[200px] h-[200px] sm:w-[250px] sm:h-[250px] md:w-[280px] md:h-[280px]'
          }`}>
            {/* Vinyl disc behind album art */}
            {!hasPanel && isPlaying && (
              <div className="absolute inset-[-15%] rounded-full bg-gradient-to-br from-[#1a1a1a] via-[#111] to-[#0a0a0a] border border-white/[0.05] animate-[spin_8s_linear_infinite]">
                <div className="absolute inset-[35%] rounded-full border border-white/[0.08]" />
                <div className="absolute inset-[45%] rounded-full bg-[#080808] border border-white/[0.06]" />
              </div>
            )}
            {/* Shadow */}
            {!hasPanel && (
              <div className="absolute inset-2 rounded-full bg-black/70 blur-[25px] -z-10" />
            )}
            {/* Album art image */}
            <div className={`relative w-full h-full rounded-full overflow-hidden ring-2 ring-white/[0.08] transition-all duration-600 ${
              isPlaying ? 'shadow-2xl shadow-rose-500/10 animate-[spin_20s_linear_infinite]' : 'shadow-xl shadow-black/60'
            }`}>
              <img src={currentSong.thumbnail} alt="" className="w-full h-full object-cover" />
              {/* Center hole */}
              <div className="absolute inset-[42%] rounded-full bg-[#0a0a0a] ring-2 ring-white/[0.1] shadow-inner" />
            </div>
            {/* Glow ring when playing */}
            {isPlaying && !hasPanel && (
              <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-rose-500/[0.12] via-purple-500/[0.08] to-rose-500/[0.12] blur-2xl playing-pulse -z-10" />
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

        {/* Bottom Controls */}
        <div className="shrink-0 px-5 sm:px-8 pb-3 sm:pb-5 pt-0">
          
          {/* Song Info Row */}
          <div className="flex items-center justify-between mb-2 sm:mb-4 max-w-sm mx-auto">
            <div className="min-w-0 flex-1 mr-3">
              <h1 className="text-[17px] sm:text-[22px] font-bold text-white truncate leading-tight tracking-tight">{currentSong.title}</h1>
              <p className="text-[12px] sm:text-[13px] text-white/40 truncate mt-0.5">{currentSong.artist}</p>
            </div>
            <button onClick={() => toggleLike(currentSong.id)} 
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-250 active:scale-85 ${
                liked ? 'text-rose-500 bg-rose-500/[0.12]' : 'text-white/20 bg-white/[0.04] hover:bg-white/[0.08] hover:text-white/40'
              }`}>
              <Heart size={20} fill={liked ? 'currentColor' : 'none'} strokeWidth={liked ? 0 : 1.5} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="max-w-sm mx-auto mb-3 sm:mb-5">
            <div ref={progressRef}
              className="player-progress-track w-full h-[5px] bg-white/[0.08] rounded-full group"
              onMouseDown={handleSeekStart}
              onTouchStart={handleSeekStart}>
              <div className={`h-full rounded-full relative transition-[width] duration-100 ease-linear ${isDragging ? 'bg-rose-400' : 'bg-white'}`}
                style={{ width: `${displayProgress * 100}%` }}>
                <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-[16px] h-[16px] bg-white rounded-full shadow-lg shadow-black/40 transition-all duration-150 ${
                  isDragging ? 'scale-[1.3] opacity-100' : 'scale-100 opacity-0 group-hover:opacity-100'
                }`} />
              </div>
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-white/30 tabular-nums font-medium">
              <span>{formatDuration(displayTime)}</span>
              <span>-{formatDuration(Math.max(0, duration - displayTime))}</span>
            </div>
          </div>

          {/* Main Playback Controls */}
          <div className="flex items-center justify-between max-w-[260px] sm:max-w-[280px] mx-auto mb-3 sm:mb-5">
            <button onClick={toggleShuffle} className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200 active:scale-85 ${
              shuffleMode ? 'text-rose-400 bg-rose-500/10' : 'text-white/30 hover:text-white/60'
            }`}>
              <Shuffle size={16} />
            </button>
            <button onClick={handlePrev} className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white active:scale-85 transition-all duration-150 hover:bg-white/[0.06]">
              <SkipBack size={24} fill="white" />
            </button>
            <button onClick={togglePlay} className={`w-[62px] h-[62px] sm:w-[72px] sm:h-[72px] rounded-full flex items-center justify-center active:scale-90 transition-all duration-200 hover:scale-[1.03] ${
              isPlaying 
                ? 'bg-white shadow-[0_0_30px_rgba(255,255,255,0.2),0_0_60px_rgba(225,29,72,0.1)]' 
                : 'bg-white shadow-[0_8px_30px_rgba(255,255,255,0.15)]'
            }`}>
              {isPlaying ? <Pause size={26} className="text-black" fill="black" /> : <Play size={26} className="text-black ml-1" fill="black" />}
            </button>
            <button onClick={handleNext} className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white active:scale-85 transition-all duration-150 hover:bg-white/[0.06]">
              <SkipForward size={24} fill="white" />
            </button>
            <button onClick={cycleRepeat} className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200 active:scale-85 ${
              repeatMode !== 'none' ? 'text-rose-400 bg-rose-500/10' : 'text-white/30 hover:text-white/60'
            }`}>
              {repeatMode === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
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
          <div className="flex items-center justify-center gap-2.5 max-w-sm mx-auto">
            <ActionPill icon={Mic2} label="Lyrics" active={activePanel === 'lyrics'} onClick={() => togglePanel('lyrics')} />
            <ActionPill icon={ListMusic} label="Queue" active={activePanel === 'queue'} onClick={() => togglePanel('queue')} badge={queue.length > 0 ? queue.length : null} />
            <ActionPill icon={downloaded ? Check : Download} label={downloaded ? 'Saved' : 'Download'} active={downloaded} onClick={() => toggleDownload(currentSong.id)} />
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



// Audio Visualizer — animated bars that simulate music reaction
function AudioVisualizer() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-[40%] flex items-end justify-center gap-[3px] px-4 opacity-40 pointer-events-none">
      {Array.from({ length: 32 }).map((_, i) => (
        <div
          key={i}
          className="flex-1 max-w-[8px] rounded-t-full bg-gradient-to-t from-rose-500/60 to-purple-500/30"
          style={{
            animation: `visualizerBar ${0.8 + Math.random() * 0.8}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.05}s`,
            height: `${15 + Math.random() * 40}%`,
          }}
        />
      ))}
    </div>
  );
}
