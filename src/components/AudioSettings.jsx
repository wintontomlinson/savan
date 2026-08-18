import { useState, useEffect } from 'react';
import { SlidersHorizontal, X, Volume2, Timer, Waves, Radio } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { getQuality, setQuality as setApiQuality } from '../data/api';

export default function AudioSettings() {
  const { volume, setVolume, showToast } = usePlayer();
  const [open, setOpen] = useState(false);
  const [crossfade, setCrossfade] = useState(() => parseInt(localStorage.getItem('crossfade_dur') || '5'));
  const [streamQuality, setStreamQuality] = useState(() => getQuality());

  useEffect(() => { localStorage.setItem('crossfade_dur', crossfade.toString()); }, [crossfade]);

  if (!open) return (
    <button onClick={() => setOpen(true)} className="p-2 text-[#888] hover:text-white btn-press transition-colors" aria-label="Audio Settings">
      <SlidersHorizontal size={20} />
    </button>
  );

  return (
    <>
      <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-md" onClick={() => setOpen(false)} />
      <div className="fixed bottom-0 left-0 right-0 z-[81] bg-[#0a0a0c] border-t border-white/[0.06] rounded-t-[32px] max-h-[85vh] overflow-y-auto overscroll-contain animate-up">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-[#0a0a0c] z-10">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>

        <div className="px-5 pb-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-5 pt-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500/20 to-orange-500/10 flex items-center justify-center border border-rose-500/20">
                <Waves size={18} className="text-rose-400" />
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-white">Audio Settings</h2>
                <p className="text-[11px] text-[#555]">Sound control</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center btn-press hover:bg-white/[0.1] transition-colors">
              <X size={16} className="text-white" />
            </button>
          </div>

          {/* Volume */}
          <div className="p-5 bg-[#0f0f11] rounded-2xl mb-4 border border-white/[0.04]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white/[0.04] flex items-center justify-center border border-white/[0.04]">
                  <Volume2 size={20} className="text-rose-400" />
                </div>
                <div>
                  <p className="text-[14px] text-white font-semibold">Volume</p>
                  <p className="text-[11px] text-[#555]">Playback volume</p>
                </div>
              </div>
              <span className="text-[18px] text-rose-400 font-bold tabular-nums">{Math.round(volume * 100)}%</span>
            </div>

            <div className="relative">
              <div className="relative h-3 rounded-full bg-[#1a1a1e] overflow-hidden">
                <div className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-150"
                  style={{ width: `${volume * 100}%` }} />
              </div>
              <input type="range" min="0" max="1" step="0.01" value={volume}
                onChange={e => setVolume(parseFloat(e.target.value))}
                className="absolute inset-0 w-full h-3 opacity-0 cursor-pointer" />
            </div>
          </div>

          {/* Crossfade */}
          <div className="p-5 bg-[#0f0f11] rounded-2xl mb-4 border border-white/[0.04]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white/[0.04] flex items-center justify-center border border-white/[0.04]">
                  <Timer size={20} className="text-rose-400" />
                </div>
                <div>
                  <p className="text-[14px] text-white font-semibold">Crossfade</p>
                  <p className="text-[11px] text-[#555]">Smooth song transitions</p>
                </div>
              </div>
              <span className="text-[18px] text-rose-400 font-bold tabular-nums">{crossfade}s</span>
            </div>

            <div className="relative">
              <div className="relative h-2.5 rounded-full bg-[#1a1a1e] overflow-hidden">
                <div className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-150"
                  style={{ width: `${(crossfade / 12) * 100}%` }} />
              </div>
              <input type="range" min="0" max="12" step="1" value={crossfade}
                onChange={e => setCrossfade(parseInt(e.target.value))}
                className="absolute inset-0 w-full h-2.5 opacity-0 cursor-pointer" />
            </div>
            <div className="flex justify-between text-[9px] text-[#444] mt-2 px-0.5">
              <span>Off</span><span>3s</span><span>6s</span><span>9s</span><span>12s</span>
            </div>
          </div>

          {/* Streaming Quality */}
          <div className="p-5 bg-[#0f0f11] rounded-2xl mb-4 border border-white/[0.04]">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-all ${
                streamQuality === '320kbps' ? 'bg-gradient-to-br from-emerald-500/20 to-green-500/10 border-emerald-500/20' : 'bg-white/[0.04] border-white/[0.04]'
              }`}>
                <Radio size={20} className={streamQuality === '320kbps' ? 'text-emerald-400' : 'text-rose-400'} />
              </div>
              <div>
                <p className="text-[14px] text-white font-semibold">Streaming Quality</p>
                <p className="text-[11px] text-[#555]">Higher = better sound, more data</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { q: '320kbps', label: '320 kbps', badge: 'HD', desc: 'Best quality', color: 'emerald' },
                { q: '160kbps', label: '160 kbps', badge: 'HQ', desc: 'High quality', color: 'blue' },
                { q: '96kbps', label: '96 kbps', badge: '', desc: 'Normal', color: 'gray' },
                { q: '48kbps', label: '48 kbps', badge: 'SAVE', desc: 'Data saver', color: 'yellow' },
              ].map(item => (
                <button key={item.q} onClick={() => { setApiQuality(item.q); setStreamQuality(item.q); showToast(`Quality: ${item.label}`); }}
                  className={`flex flex-col items-start p-3 rounded-xl transition-all duration-200 btn-press border ${
                    streamQuality === item.q
                      ? item.color === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/30' : item.color === 'blue' ? 'bg-blue-500/10 border-blue-500/30' : 'bg-white/[0.06] border-white/[0.08]'
                      : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04]'
                  }`}>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[13px] font-bold ${
                      streamQuality === item.q ? (item.color === 'emerald' ? 'text-emerald-300' : item.color === 'blue' ? 'text-blue-300' : 'text-white') : 'text-white'
                    }`}>{item.label}</span>
                    {item.badge && <span className={`text-[8px] font-bold px-1 py-0.5 rounded ${
                      item.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' :
                      item.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                      item.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' : ''
                    }`}>{item.badge}</span>}
                  </div>
                  <span className="text-[10px] text-[#555] mt-0.5">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
