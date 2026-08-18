import { useState, useEffect } from 'react';
import { SlidersHorizontal, X, Zap, Volume2, Timer, Music2, Waves } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

const EQ_PRESETS = [
  { name: 'Normal', icon: '🎵', values: [0, 0, 0, 0, 0] },
  { name: 'Bass', icon: '🔊', values: [6, 4, 0, -1, -2] },
  { name: 'Vocal', icon: '🎤', values: [-1, 0, 4, 3, 1] },
  { name: 'EDM', icon: '🎧', values: [4, 2, 0, 3, 5] },
  { name: 'Rock', icon: '🎸', values: [5, 3, -1, 2, 4] },
  { name: 'Treble', icon: '✨', values: [-2, -1, 0, 3, 5] },
  { name: 'Deep', icon: '🌊', values: [8, 5, 1, -1, -3] },
  { name: 'Flat', icon: '➖', values: [0, 0, 0, 0, 0] },
];

const BANDS = ['60Hz', '250Hz', '1kHz', '4kHz', '12kHz'];

export default function AudioSettings() {
  const { volume, setVolume, showToast } = usePlayer();
  const [open, setOpen] = useState(false);
  const [bassBoost, setBassBoost] = useState(() => localStorage.getItem('bass_on') === 'true');
  const [boostLevel, setBoostLevel] = useState(() => parseFloat(localStorage.getItem('boost_level') || '100'));
  const [crossfade, setCrossfade] = useState(() => parseInt(localStorage.getItem('crossfade_dur') || '5'));
  const [activePreset, setActivePreset] = useState(() => localStorage.getItem('eq_preset') || 'Normal');
  const [eqValues, setEqValues] = useState(() => {
    try { const s = JSON.parse(localStorage.getItem('eq_vals')); return s?.length === 5 ? s : [0,0,0,0,0]; }
    catch { return [0,0,0,0,0]; }
  });

  useEffect(() => { localStorage.setItem('bass_on', bassBoost.toString()); }, [bassBoost]);
  useEffect(() => { localStorage.setItem('boost_level', boostLevel.toString()); }, [boostLevel]);
  useEffect(() => { localStorage.setItem('crossfade_dur', crossfade.toString()); }, [crossfade]);
  useEffect(() => { localStorage.setItem('eq_preset', activePreset); }, [activePreset]);
  useEffect(() => { localStorage.setItem('eq_vals', JSON.stringify(eqValues)); }, [eqValues]);

  const applyPreset = (preset) => {
    setActivePreset(preset.name);
    setEqValues(preset.values);
    showToast(`${preset.icon} ${preset.name}`);
  };

  const setEqBand = (i, val) => {
    const v = [...eqValues]; v[i] = val; setEqValues(v);
    setActivePreset('Custom');
  };

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

          {/* Bass Boost */}
          <div className="p-4 bg-[#111] rounded-2xl mb-3 border border-white/[0.04] transition-all duration-200 hover:border-white/[0.08]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-200 ${bassBoost ? 'bg-rose-500/20' : 'bg-white/[0.04]'}`}>
                  <Zap size={18} className={`transition-colors duration-200 ${bassBoost ? 'text-rose-400' : 'text-[#666]'}`} />
                </div>
                <div>
                  <p className="text-[14px] text-white font-semibold">Bass Boost</p>
                  <p className="text-[11px] text-[#666]">Low frequency enhancement</p>
                </div>
              </div>
              <button onClick={() => { setBassBoost(!bassBoost); showToast(bassBoost ? 'Bass Boost OFF' : 'Bass Boost ON 🔊'); }}
                className={`w-[52px] h-[30px] rounded-full relative transition-all duration-300 ${bassBoost ? 'bg-rose-500 shadow-lg shadow-rose-500/30' : 'bg-[#2a2a2a]'}`}>
                <div className={`absolute top-[3px] w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${bassBoost ? 'translate-x-[24px]' : 'translate-x-[3px]'}`} />
              </button>
            </div>
          </div>

          {/* Volume Boost */}
          <div className="p-4 bg-[#111] rounded-2xl mb-3 border border-white/[0.04]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center">
                  <Volume2 size={18} className="text-rose-400" />
                </div>
                <div>
                  <p className="text-[14px] text-white font-semibold">Volume Boost</p>
                  <p className="text-[11px] text-[#666]">Amplify output</p>
                </div>
              </div>
              <span className="text-[15px] text-rose-400 font-bold tabular-nums">{Math.round(boostLevel)}%</span>
            </div>
            <div className="relative">
              <input type="range" min="50" max="150" step="5" value={boostLevel}
                onChange={e => { setBoostLevel(parseInt(e.target.value)); setVolume(Math.min(1, parseInt(e.target.value) / 100 * 0.7)); }}
                className="w-full h-2.5 rounded-full appearance-none bg-[#1a1a1a] cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-rose-500 [&::-webkit-slider-thumb]:shadow-xl [&::-webkit-slider-thumb]:shadow-rose-500/30 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-rose-300" />
            </div>
            <div className="flex justify-between text-[10px] text-[#555] mt-2 px-1"><span>50%</span><span>100%</span><span>150%</span></div>
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

          {/* EQ Presets */}
          <div className="p-4 bg-[#111] rounded-2xl mb-3 border border-white/[0.04]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center">
                <Music2 size={18} className="text-rose-400" />
              </div>
              <div>
                <p className="text-[14px] text-white font-semibold">EQ Preset</p>
                <p className="text-[11px] text-[#666]">Sound profile: {activePreset}</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {EQ_PRESETS.map(p => (
                <button key={p.name} onClick={() => applyPreset(p)}
                  className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-all duration-200 btn-press ${
                    activePreset === p.name ? 'bg-rose-500/20 ring-1 ring-rose-500/40 shadow-sm' : 'bg-[#1a1a1a] hover:bg-[#222]'
                  }`}>
                  <span className="text-[16px]">{p.icon}</span>
                  <span className={`text-[10px] font-medium ${activePreset === p.name ? 'text-rose-300' : 'text-[#888]'}`}>{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* EQ Bands */}
          <div className="p-4 bg-[#111] rounded-2xl border border-white/[0.04]">
            <p className="text-[13px] text-white font-semibold mb-4">Manual EQ</p>
            <div className="flex justify-between gap-2">
              {BANDS.map((band, i) => (
                <div key={band} className="flex flex-col items-center gap-2 flex-1">
                  <span className="text-[10px] text-rose-400 font-bold tabular-nums">{eqValues[i] > 0 ? '+' : ''}{eqValues[i]}</span>
                  <div className="relative h-28 flex justify-center">
                    <input type="range" min="-8" max="8" step="1" value={eqValues[i]}
                      onChange={e => setEqBand(i, parseInt(e.target.value))}
                      className="absolute h-28 w-8 appearance-none bg-transparent cursor-pointer [writing-mode:vertical-lr] [direction:rtl] [&::-webkit-slider-track]:w-2 [&::-webkit-slider-track]:rounded-full [&::-webkit-slider-track]:bg-[#222] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg" />
                  </div>
                  <span className="text-[9px] text-[#666] font-medium">{band}</span>
                </div>
              ))}
            </div>
            <button onClick={() => { setEqValues([0,0,0,0,0]); setActivePreset('Flat'); }}
              className="mt-4 w-full py-2.5 text-[12px] text-[#888] bg-[#1a1a1a] rounded-xl btn-press hover:text-white font-medium">
              Reset EQ
            </button>
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
