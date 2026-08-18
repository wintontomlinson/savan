import { useState, useEffect, useRef } from 'react';
import { Moon, X, Clock, Pause, Play } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

const OPTIONS = [
  { label: '5 min', mins: 5, desc: 'Quick nap' },
  { label: '10 min', mins: 10, desc: 'Short rest' },
  { label: '15 min', mins: 15, desc: 'Power nap' },
  { label: '30 min', mins: 30, desc: 'Half hour' },
  { label: '45 min', mins: 45, desc: 'Long rest' },
  { label: '1 hour', mins: 60, desc: 'Full hour' },
  { label: '1.5 hr', mins: 90, desc: 'Deep sleep' },
  { label: '2 hours', mins: 120, desc: 'Full cycle' },
];

export default function SleepTimer() {
  const [open, setOpen] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);
  const { togglePlay, isPlaying, showToast } = usePlayer();

  useEffect(() => {
    if (remaining <= 0 || paused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setRemaining(p => {
        if (p <= 1) {
          clearInterval(timerRef.current);
          if (isPlaying) togglePlay();
          showToast('Sleep timer ended 🌙 Good night!');
          setTotalTime(0);
          return 0;
        }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [remaining > 0, paused]);

  const startTimer = (mins) => {
    setRemaining(mins * 60);
    setTotalTime(mins * 60);
    setPaused(false);
    showToast(`Sleep timer set: ${mins} min 🌙`);
    setOpen(false);
  };

  const cancelTimer = () => {
    setRemaining(0);
    setTotalTime(0);
    setPaused(false);
    showToast('Timer cancelled');
  };

  const togglePause = () => {
    setPaused(!paused);
    showToast(paused ? 'Timer resumed' : 'Timer paused');
  };

  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const progress = totalTime > 0 ? ((totalTime - remaining) / totalTime) * 100 : 0;
  const circumference = 2 * Math.PI * 38;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className={`p-2 rounded-full transition-all active:scale-90 relative ${remaining > 0 ? 'text-violet-400' : 'text-[#777]'}`}>
        <Moon size={20} />
        {remaining > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] text-[9px] bg-gradient-to-r from-violet-500 to-purple-600 text-white px-1 rounded-full font-bold flex items-center justify-center shadow-lg shadow-violet-500/30">
            {Math.ceil(remaining / 60)}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="fixed inset-x-4 bottom-4 z-[91] sm:absolute sm:inset-auto sm:bottom-full sm:right-0 sm:mb-2 sm:w-72 bg-[#0d0d0f] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl shadow-violet-500/10 animate-scale">
            
            {/* Header */}
            <div className="px-5 pt-5 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center border border-violet-500/20">
                  <Moon size={16} className="text-violet-400" />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-white">Sleep Timer</h3>
                  <p className="text-[10px] text-[#666]">Auto-stop playback</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.1] transition-colors">
                <X size={14} className="text-[#999]" />
              </button>
            </div>

            {/* Active Timer Display */}
            {remaining > 0 && (
              <div className="px-5 py-4 mx-4 mb-3 bg-gradient-to-br from-violet-500/10 to-purple-600/5 rounded-2xl border border-violet-500/20">
                <div className="flex items-center gap-4">
                  {/* Circular Progress */}
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <svg className="w-20 h-20 -rotate-90" viewBox="0 0 84 84">
                      <circle cx="42" cy="42" r="38" fill="none" stroke="#1a1a2e" strokeWidth="4" />
                      <circle cx="42" cy="42" r="38" fill="none" stroke="url(#sleepGrad)" strokeWidth="4" strokeLinecap="round"
                        strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-1000 ease-linear" />
                      <defs>
                        <linearGradient id="sleepGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Clock size={18} className="text-violet-400" />
                    </div>
                  </div>

                  {/* Timer Info */}
                  <div className="flex-1">
                    <p className="text-[22px] font-bold text-white tabular-nums tracking-tight">{formatTime(remaining)}</p>
                    <p className="text-[11px] text-violet-300/70 mt-0.5">remaining</p>
                    <div className="flex gap-2 mt-2.5">
                      <button onClick={togglePause}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-500/20 hover:bg-violet-500/30 rounded-lg transition-colors">
                        {paused ? <Play size={12} className="text-violet-300" /> : <Pause size={12} className="text-violet-300" />}
                        <span className="text-[11px] text-violet-300 font-medium">{paused ? 'Resume' : 'Pause'}</span>
                      </button>
                      <button onClick={cancelTimer}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors">
                        <X size={12} className="text-red-400" />
                        <span className="text-[11px] text-red-400 font-medium">Stop</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Timer Options */}
            <div className="px-4 pb-5">
              {remaining > 0 && <p className="text-[10px] text-[#555] uppercase font-medium tracking-wider px-1 mb-2">Change Timer</p>}
              <div className="grid grid-cols-2 gap-2">
                {OPTIONS.map(o => (
                  <button key={o.mins} onClick={() => startTimer(o.mins)}
                    className={`flex flex-col items-start px-3.5 py-3 rounded-xl transition-all duration-200 btn-press border ${
                      remaining > 0 && Math.ceil(totalTime / 60) === o.mins
                        ? 'bg-violet-500/15 border-violet-500/30 shadow-sm'
                        : 'bg-white/[0.03] border-white/[0.04] hover:bg-white/[0.06] hover:border-white/[0.08]'
                    }`}>
                    <span className={`text-[13px] font-semibold ${
                      remaining > 0 && Math.ceil(totalTime / 60) === o.mins ? 'text-violet-300' : 'text-white'
                    }`}>{o.label}</span>
                    <span className="text-[10px] text-[#555] mt-0.5">{o.desc}</span>
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
