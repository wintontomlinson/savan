import { useState, useEffect, useRef } from 'react';
import { Moon, X } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

const OPTIONS = [
  { label: '5 min', mins: 5 },
  { label: '10 min', mins: 10 },
  { label: '15 min', mins: 15 },
  { label: '30 min', mins: 30 },
  { label: '45 min', mins: 45 },
  { label: '1 hour', mins: 60 },
];

export default function SleepTimer() {
  const [open, setOpen] = useState(false);
  const [remaining, setRemaining] = useState(0); // seconds
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
          showToast('Sleep timer ended 🌙');
          return 0;
        }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [remaining > 0]);

  const startTimer = (mins) => {
    setRemaining(mins * 60);
    showToast(`Sleep timer: ${mins} min`);
    setOpen(false);
  };

  const cancelTimer = () => {
    setRemaining(0);
    showToast('Timer cancelled');
    setOpen(false);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className={`p-2 rounded-full transition-all active:scale-90 ${remaining > 0 ? 'text-[#FF0000]' : 'text-[#777]'}`}>
        <Moon size={20} />
        {remaining > 0 && <span className="absolute -top-1 -right-1 text-[8px] bg-[#FF0000] text-white px-1 rounded-full font-bold">{Math.ceil(remaining / 60)}</span>}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[90]" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full right-0 mb-2 w-44 bg-[#1a1a1a] border border-[#333] rounded-2xl overflow-hidden shadow-2xl z-[91] animate-scale">
            <p className="text-[11px] text-[#666] uppercase font-medium px-4 pt-3 pb-1">Sleep Timer</p>
            {remaining > 0 && (
              <div className="px-4 py-2 border-b border-[#222]">
                <p className="text-[12px] text-[#FF0000] font-bold">{formatTime(remaining)} left</p>
                <button onClick={cancelTimer} className="text-[11px] text-[#999] mt-0.5">Cancel</button>
              </div>
            )}
            {OPTIONS.map(o => (
              <button key={o.mins} onClick={() => startTimer(o.mins)}
                className="w-full px-4 py-2.5 text-[13px] text-white text-left hover:bg-[#222] active:bg-[#333] transition-colors">
                {o.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
