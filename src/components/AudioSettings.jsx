import { useState, useEffect } from 'react';
import { SlidersHorizontal, X, Timer, Waves, Radio } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { getQuality, setQuality as setApiQuality } from '../data/api';

export default function AudioSettings() {
  const { showToast } = usePlayer();
  const [open, setOpen] = useState(false);
  const [crossfade, setCrossfade] = useState(() => parseInt(localStorage.getItem('crossfade_dur') || '5'));
  const [streamQuality, setStreamQuality] = useState(() => getQuality());

  useEffect(() => { localStorage.setItem('crossfade_dur', crossfade.toString()); }, [crossfade]);

  if (!open) return (
    <button onClick={() => setOpen(true)} className="p-2 text-[#888] hover:text-white btn-press" aria-label="Audio Settings">
      <SlidersHorizontal size={20} />
    </button>
  );

  return (
    <>
      <div className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="fixed bottom-0 left-0 right-0 z-[81] bg-[#0c0c0c] border-t border-white/[0.06] rounded-t-[28px] max-h-[85vh] scroll-y animate-up">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>

        <div className="px-5 pb-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pt-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-500/15 flex items-center justify-center">
                <Waves size={16} className="text-rose-400" />
              </div>
              <h2 className="text-[16px] font-bold text-white">Audio</h2>
            </div>
            <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center btn-press">
              <X size={16} className="text-white" />
            </button>
          </div>

          {/* Streaming Quality */}
          <div className="p-4 bg-[#111] rounded-2xl mb-3 border border-white/[0.04]">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${streamQuality === '320kbps' ? 'bg-emerald-500/15' : 'bg-white/[0.04]'}`}>
                <Radio size={18} className={streamQuality === '320kbps' ? 'text-emerald-400' : 'text-[#666]'} />
              </div>
              <div>
                <p className="text-[14px] text-white font-semibold">Streaming Quality</p>
                <p className="text-[11px] text-[#666]">Current: {streamQuality}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { q: '320kbps', label: '320 kbps', badge: 'HD', desc: 'Best quality' },
                { q: '160kbps', label: '160 kbps', badge: 'HQ', desc: 'High quality' },
                { q: '96kbps', label: '96 kbps', badge: '', desc: 'Normal' },
                { q: '48kbps', label: '48 kbps', badge: 'SAVE', desc: 'Data saver' },
              ].map(item => (
                <button key={item.q} onClick={() => { setApiQuality(item.q); setStreamQuality(item.q); showToast(`Quality: ${item.label}`); }}
                  className={`flex flex-col items-start p-3 rounded-xl transition-all btn-press border ${
                    streamQuality === item.q ? 'bg-rose-500/10 border-rose-500/30' : 'bg-[#1a1a1a] border-transparent hover:bg-[#222]'
                  }`}>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[13px] font-bold ${streamQuality === item.q ? 'text-rose-300' : 'text-white'}`}>{item.label}</span>
                    {item.badge && <span className="text-[8px] font-bold px-1 py-0.5 rounded bg-white/10 text-[#aaa]">{item.badge}</span>}
                  </div>
                  <span className="text-[10px] text-[#555] mt-0.5">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Crossfade */}
          <div className="p-4 bg-[#111] rounded-2xl mb-3 border border-white/[0.04]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center">
                  <Timer size={18} className="text-rose-400" />
                </div>
                <div>
                  <p className="text-[14px] text-white font-semibold">Crossfade</p>
                  <p className="text-[11px] text-[#666]">Smooth transition between songs</p>
                </div>
              </div>
              <span className="text-[15px] text-rose-400 font-bold tabular-nums">{crossfade}s</span>
            </div>
            <input type="range" min="0" max="12" step="1" value={crossfade}
              onChange={e => setCrossfade(parseInt(e.target.value))}
              className="w-full h-2.5 rounded-full appearance-none bg-[#1a1a1a] cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-rose-500 [&::-webkit-slider-thumb]:shadow-xl [&::-webkit-slider-thumb]:shadow-rose-500/30 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-rose-300" />
            <div className="flex justify-between text-[10px] text-[#555] mt-2 px-1"><span>Off</span><span>6s</span><span>12s</span></div>
          </div>
        </div>
      </div>
    </>
  );
}

export function getCrossfadeDuration() {
  try { return parseInt(localStorage.getItem('crossfade_dur')) || 5; } catch { return 5; }
}

export function resumeAudioContext() {}
export function initAudioProcessing() {}
