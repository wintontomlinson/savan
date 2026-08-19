import { useState, useEffect, useRef } from 'react';
import { Moon, X } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

const PRESETS = [5, 10, 15, 20, 30, 45, 60, 90];

export default function SleepTimer() {
  const [open, setOpen] = useState(false);
  const [remaining, setRemaining] = useState(0);
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
          return 0;
        }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [remaining > 0]);

  const start = (mins) => {
    setRemaining(mins * 60);
    showToast(`Sleep timer · ${mins} min`);
    setOpen(false);
  };

  const cancel = () => {
    setRemaining(0);
    showToast('Timer off');
    setOpen(false);
  };

  const mins = Math.ceil(remaining / 60);

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 ${
          remaining > 0
            ? 'bg-white/10 text-white'
            : 'bg-white/[0.05] text-white/35 hover:text-white/60 hover:bg-white/[0.08]'
        }`}>
        <Moon size={16} />
        {remaining > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-white rounded-full flex items-center justify-center text-[9px] text-black font-bold px-1">{mins}</span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[90]" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full right-0 mb-2 w-[200px] bg-[#1a1a1a] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/70 z-[91] animate-scale overflow-hidden">

            {/* Active state */}
            {remaining > 0 && (
              <div className="px-4 pt-4 pb-3 border-b border-white/[0.06]">
                <p className="text-[22px] font-bold text-white tabular-nums">{mins} min</p>
                <p className="text-[11px] text-white/30 mt-0.5">remaining</p>
                <button onClick={cancel} className="mt-2.5 w-full py-2 bg-white/[0.06] hover:bg-white/[0.1] rounded-xl text-[11px] text-white/60 font-medium transition-colors active:scale-95">
                  Turn Off
                </button>
              </div>
            )}

            {/* Presets */}
            <div className="p-2">
              <p className="text-[10px] text-white/25 font-medium uppercase tracking-wider px-2 py-1.5">
                {remaining > 0 ? 'Change' : 'Stop music in'}
              </p>
              <div className="grid grid-cols-2 gap-1">
                {PRESETS.map(m => (
                  <button key={m} onClick={() => start(m)}
                    className="py-2.5 rounded-xl text-[13px] font-semibold text-white/70 hover:bg-white/[0.06] active:bg-white/[0.1] transition-all duration-150 active:scale-95">
                    {m < 60 ? `${m} min` : `${m / 60} hr`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
