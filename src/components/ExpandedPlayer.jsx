import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Heart, ChevronDown, Volume2, VolumeX, Download, Settings } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration } from '../data/mockData';
import { downloadSong, getQuality, setQuality } from '../data/api';
import Equalizer from './Equalizer';
import AudioSettings, { connectAudio } from './AudioSettings';
import { useState } from 'react';

export default function ExpandedPlayer() {
  const { currentSong, isPlaying, togglePlay, playNext, playPrev, currentTime, duration, seekTo, volume, setVolume, shuffleMode, toggleShuffle, repeatMode, cycleRepeat, toggleLike, likedSongs, isExpanded, setExpanded, showToast } = usePlayer();
  const [showQuality, setShowQuality] = useState(false);
  const [quality, setQualityState] = useState(getQuality());

  if (!isExpanded || !currentSong) return null;
  const liked = likedSongs.includes(currentSong.id);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[70] flex flex-col" style={{ animation: 'slideUp 0.35s ease-out' }}>
      {/* BG */}
      <div className="absolute inset-0">
        <img src={currentSong.thumbnail} alt="" className="w-full h-full object-cover blur-[80px] scale-150 opacity-30" />
        <div className="absolute inset-0 bg-black/75" />
      </div>

      <div className="relative flex-1 flex flex-col overflow-y-auto safe-area-inset">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-3 pb-1 shrink-0">
          <button onClick={() => setExpanded(false)} className="p-2 -ml-2 active:scale-90 transition-transform">
            <ChevronDown size={28} className="text-white/80" />
          </button>
          {isPlaying && <Equalizer size="md" />}
          <div className="w-10" />
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-10 pb-6 gap-5">
          {/* Art */}
          <img src={currentSong.thumbnail} alt="" className="w-[200px] h-[200px] sm:w-[260px] sm:h-[260px] md:w-[300px] md:h-[300px] rounded-2xl object-cover shadow-2xl" />

          {/* Info */}
          <div className="w-full max-w-xs sm:max-w-sm text-center">
            <h1 className="text-lg sm:text-xl font-bold text-white truncate">{currentSong.title}</h1>
            <p className="text-sm text-[#AAAAAA] truncate">{currentSong.artist}</p>
          </div>

          {/* Progress */}
          <div className="w-full max-w-xs sm:max-w-sm">
            <div className="w-full h-[5px] bg-white/15 rounded-full cursor-pointer" onClick={e => { const r = e.currentTarget.getBoundingClientRect(); seekTo((e.clientX - r.left) / r.width * duration); }}>
              <div className="h-full bg-white rounded-full relative" style={{ width: `${progress}%` }}>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md" />
              </div>
            </div>
            <div className="flex justify-between mt-1.5 text-[11px] text-[#888]">
              <span>{formatDuration(currentTime)}</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between w-full max-w-[280px] sm:max-w-[320px]">
            <button onClick={toggleShuffle} className={`p-2 ${shuffleMode ? 'text-[#FF0000]' : 'text-[#888]'}`}><Shuffle size={20} /></button>
            <button onClick={playPrev} className="p-2 text-white active:scale-90 transition-transform"><SkipBack size={28} fill="white" /></button>
            <button onClick={togglePlay} className="w-16 h-16 bg-white rounded-full flex items-center justify-center active:scale-90 transition-transform shadow-xl">
              {isPlaying ? <Pause size={28} className="text-black" fill="black" /> : <Play size={28} className="text-black ml-1" fill="black" />}
            </button>
            <button onClick={playNext} className="p-2 text-white active:scale-90 transition-transform"><SkipForward size={28} fill="white" /></button>
            <button onClick={cycleRepeat} className={`p-2 ${repeatMode !== 'none' ? 'text-[#FF0000]' : 'text-[#888]'}`}>
              {repeatMode === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
            </button>
          </div>

          {/* Like + Download + Quality + Volume */}
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <button onClick={() => toggleLike(currentSong.id)} className={`p-2 ${liked ? 'text-[#FF0000]' : 'text-[#888]'}`}>
              <Heart size={24} fill={liked ? 'currentColor' : 'none'} />
            </button>
            <button onClick={async () => { showToast('Downloading 320kbps...'); const ok = await downloadSong(currentSong); if (ok) showToast('Downloaded ✓', 'success'); else showToast('Failed', 'error'); }}
              className="p-2 text-[#888] hover:text-white active:scale-90 transition-transform">
              <Download size={22} />
            </button>
            {/* Quality selector */}
            <div className="relative">
              <button onClick={() => setShowQuality(!showQuality)} className="flex items-center gap-1 px-2.5 py-1.5 bg-[#1A1A1A] rounded-full text-[11px] text-[#aaa] hover:text-white border border-[#333]">
                <Settings size={12} />{quality}
              </button>
              {showQuality && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#1A1A1A] border border-[#333] rounded-xl overflow-hidden shadow-2xl z-10 w-32">
                  {['320kbps', '160kbps', '96kbps', '48kbps'].map(q => (
                    <button key={q} onClick={() => { setQuality(q); setQualityState(q); setShowQuality(false); showToast(`Quality: ${q}`); }}
                      className={`w-full px-4 py-2.5 text-[12px] text-left transition-colors ${quality === q ? 'text-[#FF0000] bg-[#FF0000]/10' : 'text-white hover:bg-[#272727]'}`}>
                      {q} {q === '320kbps' && <span className="text-[10px] text-[#888]">HD</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Volume2 size={16} className="text-[#888]" />
              <input type="range" min="0" max="1" step="0.01" value={volume} onChange={e => setVolume(parseFloat(e.target.value))}
                className="w-24 h-1 rounded-full appearance-none bg-white/20 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white" />
            </div>
            <AudioSettings />
          </div>
        </div>
      </div>
    </div>
  );
}
