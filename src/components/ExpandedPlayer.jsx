import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Heart, ChevronDown, Volume2, Download, Settings } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration } from '../data/mockData';
import { downloadSong, getQuality, setQuality } from '../data/api';
import Equalizer from './Equalizer';
import AudioSettings from './AudioSettings';
import { useState } from 'react';

export default function ExpandedPlayer() {
  const { currentSong, isPlaying, togglePlay, playNext, playPrev, currentTime, duration, seekTo, volume, setVolume, shuffleMode, toggleShuffle, repeatMode, cycleRepeat, toggleLike, likedSongs, isExpanded, setExpanded, showToast } = usePlayer();
  const [showQuality, setShowQuality] = useState(false);
  const [quality, setQualityState] = useState(getQuality());

  if (!isExpanded || !currentSong) return null;
  const liked = likedSongs.includes(currentSong.id);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[70] flex flex-col animate-up">
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
          {isPlaying && <Equalizer />}
          <AudioSettings />
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 sm:px-12 pb-8 gap-6">
          {/* Art */}
          <div className="relative">
            <img src={currentSong.thumbnail} alt="" className="w-[220px] h-[220px] sm:w-[280px] sm:h-[280px] md:w-[320px] md:h-[320px] rounded-3xl object-cover shadow-2xl shadow-black/50 ring-1 ring-white/10" />
            {isPlaying && <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-red-500/20 to-transparent animate-pulse pointer-events-none" />}
          </div>

          {/* Info */}
          <div className="w-full max-w-xs sm:max-w-sm text-center">
            <h1 className="text-lg sm:text-xl font-bold text-white truncate">{currentSong.title}</h1>
            <p className="text-[14px] text-[#aaa] truncate mt-0.5">{currentSong.artist}</p>
          </div>

          {/* Progress */}
          <div className="w-full max-w-xs sm:max-w-sm">
            <div className="w-full h-[5px] bg-white/10 rounded-full cursor-pointer group" onClick={e => { const r = e.currentTarget.getBoundingClientRect(); seekTo((e.clientX - r.left) / r.width * duration); }}>
              <div className="h-full bg-gradient-to-r from-[#FF0000] to-[#ff4444] rounded-full relative transition-[width] duration-200" style={{ width: `${progress}%` }}>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <div className="flex justify-between mt-2 text-[11px] text-[#666] tabular-nums">
              <span>{formatDuration(currentTime)}</span>
              <span>{formatDuration(duration)}</span>
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
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <button onClick={() => toggleLike(currentSong.id)} className={`p-2.5 rounded-full transition-all active:scale-90 ${liked ? 'text-[#FF0000] bg-red-500/10' : 'text-[#777]'}`}>
              <Heart size={22} fill={liked ? 'currentColor' : 'none'} />
            </button>
            <button onClick={async () => { showToast('Downloading...'); const ok = await downloadSong(currentSong); showToast(ok ? 'Downloaded ✓' : 'Failed', ok ? 'success' : 'error'); }}
              className="p-2.5 text-[#777] hover:text-white active:scale-90 transition-all rounded-full">
              <Download size={20} />
            </button>
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
            <div className="hidden sm:flex items-center gap-2">
              <Volume2 size={15} className="text-[#666]" />
              <input type="range" min="0" max="1" step="0.01" value={volume} onChange={e => setVolume(parseFloat(e.target.value))}
                className="w-20 h-1 rounded-full appearance-none bg-white/10 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
