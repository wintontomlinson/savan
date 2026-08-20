import { useState, useEffect, useRef } from 'react';
import { Moon } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

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
          showToast('Music stopped · Good night 🌙');
          setSelected(0);
          return 0;
        }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [remaining > 0]);

const start = (mins) => {
     setRemaining(mins * 60);
     showToast(`Sleep · ${mins} min`);
     setOpen(false);
   };

const cancel = () => {
     setRemaining(0);
     showToast('Timer off');
     setOpen(false);
   };

  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  const timeStr = `${m}:${s.toString().padStart(2, '0')}`;

  return (
    <div className="relative">
      {/* Trigger */}
<button onClick={() => setOpen(!open)}
         className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 ${
           remaining > 0
             ? 'bg-violet-500/20 text-violet-300'
             : 'bg-white/[0.05] text-white/35 hover:text-white/60 hover:bg-white/[0.08]'
         }`}>
        <Moon size={16} />
        {remaining > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-violet-400 rounded-full" />
        )}
      </button>

      {/* Panel */}
      {open && (
        <>
          <div className="fixed inset-0 z-[110]" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full right-0 mb-3 w-[220px] max-w-[90vw] bg-[#111] rounded-2xl shadow-2xl shadow-black/80 border border-white/[0.06] z-[111] animate-scale overflow-hidden">

            {/* Timer active — countdown */}
            {remaining > 0 ? (
              <div className="p-5 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-violet-500/10 flex items-center justify-center mb-3">
                  <Moon size={20} className="text-violet-400" />
                </div>
                <p className="text-[24px] sm:text-[28px] font-bold text-white tabular-nums tracking-tight">{timeStr}</p>
                <p className="text-[10px] sm:text-[11px] text-white/30 mt-1">Music will stop</p>
                <div className="flex gap-2 mt-4">
<button onClick={cancel}
             className="flex-1 py-2 sm:py-2.5 rounded-xl bg-white/[0.06] text-[11px] sm:text-[12px] text-white/60 font-medium hover:bg-white/[0.1] transition-colors active:scale-95">
            Cancel
          </button>
          <button onClick={() => { setOpen(false); }}
             className="flex-1 py-2 sm:py-2.5 rounded-xl bg-violet-500/20 text-[11px] sm:text-[12px] text-violet-300 font-medium hover:bg-violet-500/30 transition-colors active:scale-95">
            Done
          </button>
                </div>
              </div>
            ) : (
              /* Timer off — selection */
              <div className="p-3 sm:p-4">
                <div className="flex items-center gap-2 px-2 mb-3">
                  <Moon size={14} className="text-violet-400" />
                  <p className="text-[11px] sm:text-[12px] text-white font-semibold">Sleep Timer</p>
                </div>
                <div className="space-y-0.5">
                  {[5, 10, 15, 30, 45, 60, 90, 120].map(mins => (
<button key={mins} onClick={() => start(mins)}
                       className="w-full flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-left hover:bg-white/[0.05] active:bg-white/[0.08] transition-all duration-150 active:scale-[0.98]">
                      <span className="text-[12px] sm:text-[13px] text-white/80 font-medium">
                        {mins < 60 ? `${mins} minutes` : mins === 60 ? '1 hour' : `${mins / 60} hours`}
                      </span>
                      <span className="text-[10px] sm:text-[11px] text-white/20">{mins < 60 ? `${mins}m` : `${mins/60}h`}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
