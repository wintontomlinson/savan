import { useState, useEffect, useRef } from 'react';
import { Moon, Clock, X } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

const OPTIONS = [
  { label: '5 min', mins: 5, desc: 'Quick nap' },
  { label: '10 min', mins: 10, desc: 'Short rest' },
  { label: '15 min', mins: 15, desc: 'Power nap' },
  { label: '30 min', mins: 30, desc: 'Half hour' },
  { label: '45 min', mins: 45, desc: 'Deep rest' },
  { label: '1 hour', mins: 60, desc: 'Full sleep' },
  { label: '90 min', mins: 90, desc: 'Sleep cycle' },
];

export default function SleepTimer() {
  const [open, setOpen] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const timerRef = useRef(null);
  const { togglePlay, isPlaying, showToast } = usePlayer();

  useEffect(() => {
    if (remaining <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setRemaining(p => {
        if (p <= 1) {
          clearInterval(timerRef.current);
          if (isPlaying) togglePlay();
          showToast('Good night 🌙');
          setTotalDuration(0);
          return 0;
        }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [remaining > 0]);

  const startTimer = (mins) => {
    setRemaining(mins * 60);
    setTotalDuration(mins * 60);
    showToast(`Sleep in ${mins} min 🌙`);
    setOpen(false);
  };

  const cancelTimer = () => {
    setRemaining(0);
    setTotalDuration(0);
    showToast('Timer cancelled');
    setOpen(false);
  };

  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const progress = totalDuration > 0 ? ((totalDuration - remaining) / totalDuration) * 100 : 0;

  return (
    <div className="relative">
      {/* Timer button */}
      <button onClick={() => setOpen(!open)} 
        className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 ${
          remaining > 0 
            ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20' 
            : 'bg-white/[0.06] text-white/40 border border-transparent hover:bg-white/[0.1] hover:text-white/60'
        }`}>
        <Moon size={16} />
        {/* Active indicator dot */}
        {remaining > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-indigo-400 rounded-full border-2 border-[#0a0a0a] animate-pulse" />
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-[90]" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full right-0 mb-3 w-56 bg-[#141414]/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl shadow-black/60 z-[91] animate-scale">
            
            {/* Header */}
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/15 flex items-center justify-center">
                  <Moon size={13} className="text-indigo-400" />
                </div>
                <div>
                  <p className="text-[12px] text-white font-semibold">Sleep Timer</p>
                  <p className="text-[9px] text-white/30">Music fades away</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.1] transition-colors active:scale-90">
                <X size={12} className="text-white/40" />
              </button>
            </div>

            {/* Active Timer Display */}
            {remaining > 0 && (
              <div className="mx-3 mt-2 mb-3 p-3 bg-indigo-500/[0.08] rounded-xl border border-indigo-500/[0.12]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock size={12} className="text-indigo-400" />
                    <span className="text-[13px] text-indigo-300 font-bold tabular-nums">{formatTime(remaining)}</span>
                  </div>
                  <button onClick={cancelTimer} className="px-2.5 py-1 bg-white/[0.06] hover:bg-white/[0.1] rounded-lg text-[9px] text-white/50 font-medium transition-colors active:scale-95">
                    Cancel
                  </button>
                </div>
                {/* Progress bar */}
                <div className="w-full h-[3px] bg-white/[0.06] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full transition-[width] duration-1000 ease-linear" 
                    style={{ width: `${100 - progress}%` }} />
                </div>
                <p className="text-[9px] text-indigo-300/50 mt-1.5">{Math.ceil(remaining / 60)} min remaining</p>
              </div>
            )}

            {/* Options */}
            <div className="px-2 pb-2 pt-1">
              <div className="grid grid-cols-2 gap-1.5">
                {OPTIONS.map(o => (
                  <button key={o.mins} onClick={() => startTimer(o.mins)}
                    className="flex flex-col items-start px-3 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] active:bg-white/[0.08] border border-white/[0.04] hover:border-white/[0.08] transition-all duration-150 active:scale-95 text-left">
                    <span className="text-[12px] text-white font-semibold">{o.label}</span>
                    <span className="text-[9px] text-white/25">{o.desc}</span>
                  </button>
                ))}
              </div>
              
              {/* End of song option */}
              <button onClick={() => { showToast('Will stop after this song'); setOpen(false); }}
                className="w-full mt-1.5 px-3 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] hover:border-white/[0.08] transition-all duration-150 active:scale-95 text-left flex items-center gap-2">
                <span className="text-[11px]">🎵</span>
                <div>
                  <span className="text-[11px] text-white/70 font-medium">After this song</span>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
