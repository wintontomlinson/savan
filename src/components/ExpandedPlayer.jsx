import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Heart, ChevronDown, Volume2, Download, Settings, Share2, Mic2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration } from '../data/mockData';
import { downloadSong, getQuality, setQuality, getLyrics } from '../data/api';
import Equalizer from './Equalizer';
import AudioSettings from './AudioSettings';
import SleepTimer from './SleepTimer';
import { useState, useRef, useEffect } from 'react';

export default function ExpandedPlayer() {
  const { currentSong, isPlaying, togglePlay, playNext, playPrev, currentTime, duration, seekTo, volume, setVolume, shuffleMode, toggleShuffle, repeatMode, cycleRepeat, toggleLike, likedSongs, isExpanded, setExpanded, showToast, queue } = usePlayer();
  const [showQuality, setShowQuality] = useState(false);
  const [quality, setQualityState] = useState(getQuality());
  const [showLyrics, setShowLyrics] = useState(false);
  const [lyrics, setLyrics] = useState(null);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const touchStartY = useRef(0);

  // Fetch lyrics when song changes or lyrics panel opened
  useEffect(() => {
    if (!currentSong || !showLyrics) return;
    setLyricsLoading(true);
    setLyrics(null);
    
    // If song has lyrics flag, fetch directly
    if (currentSong.hasLyrics) {
      getLyrics(currentSong.id).then(l => { setLyrics(l); setLyricsLoading(false); });
    } else {
      // Try anyway — sometimes hasLyrics is false but lyrics exist
      getLyrics(currentSong.id).then(l => {
        if (l) { setLyrics(l); }
        else { setLyrics(null); }
        setLyricsLoading(false);
      });
    }
  }, [currentSong?.id, showLyrics]);

  if (!isExpanded || !currentSong) return null;
  const liked = likedSongs.includes(currentSong.id);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Swipe down to close
  const onTouchStart = (e) => { touchStartY.current = e.touches[0].clientY; };
  const onTouchEnd = (e) => { if (e.changedTouches[0].clientY - touchStartY.current > 80) setExpanded(false); };

  // Share
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
    <div className="fixed inset-0 z-[70] flex flex-col animate-up" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      {/* BG */}
      <div className="absolute inset-0">
        <img src={currentSong.thumbnail} alt="" className="w-full h-full object-cover blur-[100px] scale-150 opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black" />
      </div>

      <div className="relative flex-1 flex flex-col scroll-y">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
          <button onClick={() => setExpanded(false)} className="p-2 -ml-2 active:scale-90 transition-transform rounded-full hover:bg-white/10">
            <ChevronDown size={26} className="text-white/80" />
          </button>
          <div className="flex items-center gap-1">
            {isPlaying && <Equalizer />}
            {queue.length > 0 && <span className="text-[10px] text-[#666] ml-2">{queue.length} in queue</span>}
          </div>
          <div className="flex items-center gap-0.5">
            <SleepTimer />
            <AudioSettings />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 sm:px-12 pb-8 gap-5">
          {/* Art with vinyl effect */}
          <div className="relative">
            <div className={`w-[220px] h-[220px] sm:w-[280px] sm:h-[280px] md:w-[320px] md:h-[320px] rounded-full overflow-hidden shadow-2xl shadow-black/60 ring-4 ring-white/5 ${isPlaying ? 'animate-[spin_20s_linear_infinite]' : ''}`} style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}>
              <img src={currentSong.thumbnail} alt="" className="w-full h-full object-cover" />
              {/* Vinyl hole */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-black/80 ring-2 ring-white/10" />
              </div>
            </div>
            {/* Glow */}
            {isPlaying && <div className="absolute -inset-3 rounded-full bg-red-500/10 blur-xl animate-pulse pointer-events-none" />}
          </div>

          {/* Song Info */}
          <div className="w-full max-w-xs sm:max-w-sm text-center mt-2">
            <h1 className="text-lg sm:text-xl font-bold text-white truncate">{currentSong.title}</h1>
            <p className="text-[14px] text-[#aaa] truncate mt-0.5">{currentSong.artist}</p>
            {currentSong.language && <span className="inline-block mt-1.5 text-[10px] bg-white/10 text-[#888] px-2 py-0.5 rounded-full capitalize">{currentSong.language}</span>}
          </div>

          {/* Progress */}
          <div className="w-full max-w-xs sm:max-w-sm">
            <div className="w-full h-[5px] bg-white/10 rounded-full cursor-pointer group" onClick={e => { const r = e.currentTarget.getBoundingClientRect(); seekTo((e.clientX - r.left) / r.width * duration); }}>
              <div className="h-full bg-gradient-to-r from-[#FF0000] to-[#ff4444] rounded-full relative transition-[width] duration-200" style={{ width: `${progress}%` }}>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity" />
              </div>
            </div>
            <div className="flex justify-between mt-2 text-[11px] text-[#666] tabular-nums">
              <span>{formatDuration(currentTime)}</span>
              <span>-{formatDuration(Math.max(0, duration - currentTime))}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between w-full max-w-[300px]">
            <button onClick={toggleShuffle} className={`p-2 transition-colors ${shuffleMode ? 'text-[#FF0000]' : 'text-[#777]'}`}><Shuffle size={20} /></button>
            <button onClick={playPrev} className="p-2 text-white active:scale-90 transition-transform"><SkipBack size={28} fill="white" /></button>
            <button onClick={togglePlay} className="w-16 h-16 bg-white rounded-full flex items-center justify-center active:scale-90 transition-transform shadow-xl shadow-white/10">
              {isPlaying ? <Pause size={28} className="text-black" fill="black" /> : <Play size={28} className="text-black ml-1" fill="black" />}
            </button>
            <button onClick={playNext} className="p-2 text-white active:scale-90 transition-transform"><SkipForward size={28} fill="white" /></button>
            <button onClick={cycleRepeat} className={`p-2 transition-colors ${repeatMode !== 'none' ? 'text-[#FF0000]' : 'text-[#777]'}`}>
              {repeatMode === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <button onClick={() => toggleLike(currentSong.id)} className={`p-2.5 rounded-full transition-all active:scale-90 ${liked ? 'text-[#FF0000] bg-red-500/10' : 'text-[#777]'}`}>
              <Heart size={22} fill={liked ? 'currentColor' : 'none'} />
            </button>
            <button onClick={shareSong} className="p-2.5 text-[#777] hover:text-white active:scale-90 transition-all rounded-full">
              <Share2 size={20} />
            </button>
            <button onClick={() => setShowLyrics(!showLyrics)} className={`p-2.5 active:scale-90 transition-all rounded-full ${showLyrics ? 'text-[#FF0000] bg-red-500/10' : 'text-[#777]'}`}>
              <Mic2 size={20} />
            </button>
            <button onClick={async () => { showToast('Downloading...'); const ok = await downloadSong(currentSong); showToast(ok ? 'Downloaded ✓' : 'Failed', ok ? 'success' : 'error'); }}
              className="p-2.5 text-[#777] hover:text-white active:scale-90 transition-all rounded-full">
              <Download size={20} />
            </button>
            {/* Quality */}
            <div className="relative">
              <button onClick={() => setShowQuality(!showQuality)} className="flex items-center gap-1 px-3 py-1.5 bg-white/5 rounded-full text-[11px] text-[#aaa] border border-white/10">
                <Settings size={11} />{quality}
              </button>
              {showQuality && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#151515] border border-[#222] rounded-2xl overflow-hidden shadow-2xl z-10 w-32 animate-scale">
                  {['320kbps', '160kbps', '96kbps', '48kbps'].map(q => (
                    <button key={q} onClick={() => { setQuality(q); setQualityState(q); setShowQuality(false); showToast(`Quality: ${q}`); }}
                      className={`w-full px-4 py-2.5 text-[12px] text-left ${quality === q ? 'text-[#FF0000] bg-red-500/10' : 'text-white hover:bg-white/5'}`}>
                      {q}{q === '320kbps' ? ' HD' : ''}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Volume (desktop) */}
            <div className="hidden sm:flex items-center gap-2">
              <Volume2 size={15} className="text-[#666]" />
              <input type="range" min="0" max="1" step="0.01" value={volume} onChange={e => setVolume(parseFloat(e.target.value))}
                className="w-20 h-1 rounded-full appearance-none bg-white/10 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white" />
            </div>
          </div>

          {/* Lyrics Panel */}
          {showLyrics && (
            <div className="w-full max-w-xs sm:max-w-sm mt-4 mb-4 bg-white/5 rounded-2xl p-5 max-h-[250px] scroll-y border border-white/5">
              {lyricsLoading && (
                <div className="flex items-center justify-center py-6">
                  <div className="w-5 h-5 border-2 border-[#FF0000] border-t-transparent rounded-full animate-spin" />
                  <span className="ml-2 text-[12px] text-[#888]">Loading lyrics...</span>
                </div>
              )}
              {!lyricsLoading && !lyrics && (
                <p className="text-[13px] text-[#666] text-center py-6">Lyrics not available for this song</p>
              )}
              {!lyricsLoading && lyrics && (
                <div className="space-y-2">
                  {lyrics.split('\n').map((line, i) => (
                    <p key={i} className={`text-[14px] leading-relaxed ${line.trim() ? 'text-white/90' : 'h-3'}`}>{line || ' '}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
