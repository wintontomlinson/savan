import { useState, useEffect, useRef } from 'react';
import { Moon, X } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

const OPTIONS = [10, 15, 30, 45, 60, 90];

export default function SleepTimer() {
  const { togglePlay, isPlaying, showToast } = usePlayer();
  const [open, setOpen] = useState(false);
  const [deadline, setDeadline] = useState(null);
  const [remaining, setRemaining] = useState(0);

  // Latest playback state, so the expiry callback never fires on stale values.
  const latest = useRef({ togglePlay, isPlaying, showToast });
  useEffect(() => {
    latest.current = { togglePlay, isPlaying, showToast };
  }, [togglePlay, isPlaying, showToast]);

  useEffect(() => {
    if (!deadline) {
      setRemaining(0);
      return;
    }
    const tick = () => {
      const left = Math.max(0, Math.round((deadline - Date.now()) / 1000));
      setRemaining(left);
      if (left > 0) return;
      setDeadline(null);
      if (latest.current.isPlaying) latest.current.togglePlay();
      latest.current.showToast('Sleep timer finished. Good night');
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const active = remaining > 0;
  const label = `${Math.floor(remaining / 60)}:${(remaining % 60).toString().padStart(2, '0')}`;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        aria-label="Sleep timer"
        aria-expanded={open}
        className={`press flex h-9 items-center justify-center gap-1.5 rounded-full transition-colors ${
          active
            ? 'bg-accent/15 px-3 text-accent'
            : 'w-9 bg-white/[0.08] text-white/50 hover:text-white'
        }`}
      >
        <Moon size={16} />
        {active && <span className="text-[11px] font-bold tabular-nums">{label}</span>}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[110]" onClick={() => setOpen(false)} />
          <div className="a-pop absolute right-0 top-[calc(100%+8px)] z-[111] w-[212px] overflow-hidden rounded-2xl border border-hair bg-surface-2/95 shadow-2xl shadow-black/70 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-hair px-3.5 py-2.5">
              <span className="flex items-center gap-2 text-[12px] font-bold">
                <Moon size={13} className="text-accent" /> Sleep Timer
              </span>
              <button onClick={() => setOpen(false)} aria-label="Close" className="press text-white/35 hover:text-white">
                <X size={14} />
              </button>
            </div>

            {active ? (
              <div className="p-4 text-center">
                <p className="text-[30px] font-bold tabular-nums leading-none">{label}</p>
                <p className="mt-1.5 text-[11px] text-white/35">Playback will pause</p>
                <button
                  onClick={() => {
                    setDeadline(null);
                    showToast('Sleep timer cancelled');
                    setOpen(false);
                  }}
                  className="press mt-4 w-full rounded-xl bg-white/[0.08] py-2.5 text-[12px] font-semibold text-white/70 hover:bg-white/[0.12]"
                >
                  Cancel timer
                </button>
              </div>
            ) : (
              <div className="p-2">
                {OPTIONS.map((mins) => (
                  <button
                    key={mins}
                    onClick={() => {
                      setDeadline(Date.now() + mins * 60_000);
                      showToast(`Stopping in ${mins} minutes`);
                      setOpen(false);
                    }}
                    className="press flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/[0.06]"
                  >
                    <span className="text-[12.5px] font-medium text-white/80">
                      {mins < 60 ? `${mins} minutes` : mins === 60 ? '1 hour' : `${mins / 60} hours`}
                    </span>
                    <span className="text-[10.5px] text-white/25">{mins < 60 ? `${mins}m` : `${mins / 60}h`}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
