import { useState, useEffect, useCallback } from 'react';
import { SlidersHorizontal, X, Zap, Volume2, Timer, Music2, Waves, RotateCcw, ChevronDown, Sparkles, Radio } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { getQuality, setQuality as setApiQuality } from '../data/api';

const EQ_PRESETS = [
  { name: 'Flat', icon: '➖', values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], desc: 'No change' },
  { name: 'Bass Boost', icon: '🔊', values: [7, 6, 5, 3, 1, 0, 0, 0, 0, 0], desc: 'Heavy low-end' },
  { name: 'Vocal', icon: '🎤', values: [-2, -1, 0, 2, 4, 5, 4, 2, 0, -1], desc: 'Clear vocals' },
  { name: 'EDM', icon: '🎧', values: [5, 4, 2, 0, -1, 0, 2, 4, 5, 4], desc: 'Electronic' },
  { name: 'Rock', icon: '🎸', values: [5, 4, 2, 1, -1, -1, 1, 3, 4, 5], desc: 'Guitars & drums' },
  { name: 'Pop', icon: '🎵', values: [-1, 1, 3, 4, 3, 2, 1, 0, -1, -1], desc: 'Radio sound' },
  { name: 'Jazz', icon: '🎷', values: [3, 2, 1, 2, -1, -1, 0, 2, 3, 4], desc: 'Warm & smooth' },
  { name: 'Classical', icon: '🎻', values: [4, 3, 2, 1, 0, 0, 1, 2, 3, 5], desc: 'Orchestra' },
  { name: 'Hip Hop', icon: '🎶', values: [6, 5, 3, 1, 0, -1, 1, 0, 2, 3], desc: '808s & bass' },
  { name: 'Acoustic', icon: '🪕', values: [3, 2, 1, 0, 1, 2, 3, 3, 2, 1], desc: 'Natural tone' },
  { name: 'R&B', icon: '💜', values: [4, 5, 3, 1, -1, 0, 2, 3, 2, 1], desc: 'Soul & groove' },
  { name: 'Treble', icon: '✨', values: [-3, -2, -1, 0, 1, 2, 3, 5, 6, 7], desc: 'Bright highs' },
];

const BANDS_10 = ['32', '64', '125', '250', '500', '1K', '2K', '4K', '8K', '16K'];
const BAND_UNITS = ['Hz', 'Hz', 'Hz', 'Hz', 'Hz', '', '', '', '', ''];

export default function AudioSettings() {
  const { volume, setVolume, showToast } = usePlayer();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('eq'); // 'eq' | 'mixer'
  const [bassBoost, setBassBoost] = useState(() => localStorage.getItem('bass_on') === 'true');
  const [boostLevel, setBoostLevel] = useState(() => parseFloat(localStorage.getItem('boost_level') || '100'));
  const [crossfade, setCrossfade] = useState(() => parseInt(localStorage.getItem('crossfade_dur') || '5'));
  const [streamQuality, setStreamQuality] = useState(() => getQuality());
  const [activePreset, setActivePreset] = useState(() => localStorage.getItem('eq_preset') || 'Flat');
  const [eqValues, setEqValues] = useState(() => {
    try { const s = JSON.parse(localStorage.getItem('eq_vals_10')); return s?.length === 10 ? s : [0,0,0,0,0,0,0,0,0,0]; }
    catch { return [0,0,0,0,0,0,0,0,0,0]; }
  });
  const [showPresets, setShowPresets] = useState(false);

  useEffect(() => { localStorage.setItem('bass_on', bassBoost.toString()); }, [bassBoost]);
  useEffect(() => { localStorage.setItem('boost_level', boostLevel.toString()); }, [boostLevel]);
  useEffect(() => { localStorage.setItem('crossfade_dur', crossfade.toString()); }, [crossfade]);
  useEffect(() => { localStorage.setItem('eq_preset', activePreset); }, [activePreset]);
  useEffect(() => { localStorage.setItem('eq_vals_10', JSON.stringify(eqValues)); }, [eqValues]);

  const applyPreset = (preset) => {
    setActivePreset(preset.name);
    setEqValues(preset.values);
    showToast(`${preset.icon} ${preset.name}`);
    setShowPresets(false);
  };

  const setEqBand = (i, val) => {
    const v = [...eqValues]; v[i] = val; setEqValues(v);
    setActivePreset('Custom');
  };

  const resetEq = () => {
    setEqValues([0,0,0,0,0,0,0,0,0,0]);
    setActivePreset('Flat');
    showToast('EQ Reset');
  };

  const handleVolumeBoost = (val) => {
    setBoostLevel(val);
    // Map 0-200 to actual volume (0-1 range used internally, but we allow boost via gain)
    setVolume(Math.min(1, val / 100));
    localStorage.setItem('boost_level', val.toString());
  };

  if (!open) return (
    <button onClick={() => setOpen(true)} className="p-2 text-[#888] hover:text-white btn-press transition-colors" aria-label="Audio Settings">
      <SlidersHorizontal size={20} />
    </button>
  );

  return (
    <>
      <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-md" onClick={() => setOpen(false)} />
      <div className="fixed bottom-0 left-0 right-0 z-[81] bg-[#0a0a0c] border-t border-white/[0.06] rounded-t-[32px] max-h-[90vh] overflow-y-auto overscroll-contain animate-up">
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
                <h2 className="text-[17px] font-bold text-white">Audio Engine</h2>
                <p className="text-[11px] text-[#555]">Professional sound control</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center btn-press hover:bg-white/[0.1] transition-colors">
              <X size={16} className="text-white" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex bg-[#111] rounded-2xl p-1 mb-5 border border-white/[0.04]">
            <button onClick={() => setTab('eq')}
              className={`flex-1 py-2.5 rounded-xl text-[12px] font-semibold transition-all duration-200 ${
                tab === 'eq' ? 'bg-gradient-to-r from-rose-500/20 to-orange-500/10 text-white shadow-sm border border-rose-500/20' : 'text-[#666] hover:text-[#999]'
              }`}>
              <span className="flex items-center justify-center gap-1.5"><Music2 size={14} /> Equalizer</span>
            </button>
            <button onClick={() => setTab('mixer')}
              className={`flex-1 py-2.5 rounded-xl text-[12px] font-semibold transition-all duration-200 ${
                tab === 'mixer' ? 'bg-gradient-to-r from-rose-500/20 to-orange-500/10 text-white shadow-sm border border-rose-500/20' : 'text-[#666] hover:text-[#999]'
              }`}>
              <span className="flex items-center justify-center gap-1.5"><SlidersHorizontal size={14} /> Mixer</span>
            </button>
          </div>

          {tab === 'eq' && (
            <>
              {/* Preset Selector */}
              <div className="p-4 bg-[#0f0f11] rounded-2xl mb-4 border border-white/[0.04]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <Sparkles size={14} className="text-rose-400" />
                    <p className="text-[13px] text-white font-semibold">Preset</p>
                  </div>
                  <button onClick={() => setShowPresets(!showPresets)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] rounded-lg transition-colors border border-white/[0.06]">
                    <span className="text-[12px] text-rose-300 font-medium">{activePreset}</span>
                    <ChevronDown size={12} className={`text-[#666] transition-transform duration-200 ${showPresets ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {showPresets && (
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/[0.04]">
                    {EQ_PRESETS.map(p => (
                      <button key={p.name} onClick={() => applyPreset(p)}
                        className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-all duration-200 btn-press ${
                          activePreset === p.name
                            ? 'bg-gradient-to-b from-rose-500/20 to-rose-500/5 ring-1 ring-rose-500/40 shadow-lg shadow-rose-500/10'
                            : 'bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04]'
                        }`}>
                        <span className="text-[18px]">{p.icon}</span>
                        <span className={`text-[10px] font-semibold ${activePreset === p.name ? 'text-rose-300' : 'text-[#999]'}`}>{p.name}</span>
                        <span className="text-[8px] text-[#555]">{p.desc}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 10-Band EQ */}
              <div className="p-5 bg-[#0f0f11] rounded-2xl mb-4 border border-white/[0.04]">
                <div className="flex items-center justify-between mb-5">
                  <p className="text-[13px] text-white font-semibold">10-Band Equalizer</p>
                  <button onClick={resetEq}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] rounded-lg transition-colors">
                    <RotateCcw size={11} className="text-[#888]" />
                    <span className="text-[10px] text-[#888] font-medium">Reset</span>
                  </button>
                </div>

                {/* EQ Visualization */}
                <div className="relative mb-3">
                  {/* Grid lines */}
                  <div className="absolute inset-x-0 top-0 h-full flex flex-col justify-between pointer-events-none px-4">
                    {[8, 4, 0, -4, -8].map(v => (
                      <div key={v} className="flex items-center gap-2">
                        <span className="text-[8px] text-[#333] w-4 text-right tabular-nums">{v > 0 ? '+' : ''}{v}</span>
                        <div className="flex-1 h-px bg-white/[0.03]" />
                      </div>
                    ))}
                  </div>

                  {/* Sliders */}
                  <div className="flex justify-between gap-1 relative z-10 pt-2">
                    {BANDS_10.map((band, i) => (
                      <div key={band} className="flex flex-col items-center gap-1.5 flex-1">
                        <span className={`text-[9px] font-bold tabular-nums transition-colors ${
                          eqValues[i] > 0 ? 'text-rose-400' : eqValues[i] < 0 ? 'text-blue-400' : 'text-[#555]'
                        }`}>
                          {eqValues[i] > 0 ? '+' : ''}{eqValues[i]}
                        </span>
                        <div className="relative h-32 flex justify-center">
                          <div className="absolute inset-0 w-1.5 mx-auto rounded-full bg-[#1a1a1e]" />
                          {/* Fill indicator */}
                          <div className={`absolute w-1.5 mx-auto rounded-full left-1/2 -translate-x-1/2 transition-all duration-150 ${
                            eqValues[i] >= 0 ? 'bg-gradient-to-t from-rose-500/30 to-rose-400/60' : 'bg-gradient-to-b from-blue-500/30 to-blue-400/60'
                          }`} style={{
                            top: eqValues[i] >= 0 ? `${50 - (eqValues[i] / 8) * 50}%` : '50%',
                            bottom: eqValues[i] >= 0 ? '50%' : `${50 - (Math.abs(eqValues[i]) / 8) * 50}%`,
                          }} />
                          <input type="range" min="-8" max="8" step="1" value={eqValues[i]}
                            onChange={e => setEqBand(i, parseInt(e.target.value))}
                            className="eq-slider-vertical" />
                        </div>
                        <div className="text-center">
                          <span className="text-[8px] text-[#555] font-medium block leading-tight">{band}</span>
                          <span className="text-[7px] text-[#333]">{BAND_UNITS[i]}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {tab === 'mixer' && (
            <>
              {/* Volume Boost - now up to 200% */}
              <div className="p-5 bg-[#0f0f11] rounded-2xl mb-4 border border-white/[0.04]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      boostLevel > 100 ? 'bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/20' : 'bg-white/[0.04] border border-white/[0.04]'
                    }`}>
                      <Volume2 size={20} className={`transition-colors ${boostLevel > 100 ? 'text-orange-400' : 'text-rose-400'}`} />
                    </div>
                    <div>
                      <p className="text-[14px] text-white font-semibold">Volume Amplifier</p>
                      <p className="text-[11px] text-[#555]">Boost output up to 200%</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[20px] font-bold tabular-nums ${
                      boostLevel > 150 ? 'text-red-400' : boostLevel > 100 ? 'text-orange-400' : 'text-rose-400'
                    }`}>{Math.round(boostLevel)}%</span>
                  </div>
                </div>

                {/* Volume slider */}
                <div className="relative mt-2">
                  <div className="relative h-3 rounded-full bg-[#1a1a1e] overflow-hidden">
                    <div className={`absolute left-0 top-0 h-full rounded-full transition-all duration-150 ${
                      boostLevel > 150 ? 'bg-gradient-to-r from-rose-500 via-orange-500 to-red-500' :
                      boostLevel > 100 ? 'bg-gradient-to-r from-rose-500 to-orange-500' :
                      'bg-gradient-to-r from-rose-600 to-rose-400'
                    }`} style={{ width: `${(boostLevel / 200) * 100}%` }} />
                    {/* 100% marker */}
                    <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/20" />
                  </div>
                  <input type="range" min="0" max="200" step="1" value={boostLevel}
                    onChange={e => handleVolumeBoost(parseInt(e.target.value))}
                    className="absolute inset-0 w-full h-3 opacity-0 cursor-pointer" />
                </div>

                <div className="flex justify-between text-[9px] mt-2 px-0.5">
                  <span className="text-[#444]">0%</span>
                  <span className="text-[#444]">50%</span>
                  <span className="text-[#555] font-medium">100%</span>
                  <span className="text-orange-400/60">150%</span>
                  <span className="text-red-400/60">200%</span>
                </div>

                {boostLevel > 150 && (
                  <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <span className="text-[10px]">⚠️</span>
                    <span className="text-[10px] text-red-300">High volume may cause distortion</span>
                  </div>
                )}
              </div>

              {/* Bass Boost */}
              <div className="p-5 bg-[#0f0f11] rounded-2xl mb-4 border border-white/[0.04] transition-all duration-200 hover:border-white/[0.08]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 border ${
                      bassBoost ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/10 border-amber-500/20 shadow-lg shadow-amber-500/10' : 'bg-white/[0.04] border-white/[0.04]'
                    }`}>
                      <Zap size={20} className={`transition-colors duration-300 ${bassBoost ? 'text-amber-400' : 'text-[#555]'}`} />
                    </div>
                    <div>
                      <p className="text-[14px] text-white font-semibold">Bass Boost</p>
                      <p className="text-[11px] text-[#555]">Low frequency enhancement</p>
                    </div>
                  </div>
                  <button onClick={() => { setBassBoost(!bassBoost); showToast(bassBoost ? 'Bass Boost OFF' : 'Bass Boost ON 🔊'); }}
                    className={`w-[54px] h-[30px] rounded-full relative transition-all duration-300 ${
                      bassBoost ? 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg shadow-amber-500/30' : 'bg-[#222]'
                    }`}>
                    <div className={`absolute top-[3px] w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${
                      bassBoost ? 'translate-x-[26px]' : 'translate-x-[3px]'
                    }`} />
                  </button>
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
                  <span>Off</span>
                  <span>3s</span>
                  <span>6s</span>
                  <span>9s</span>
                  <span>12s</span>
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
                    { q: '320kbps', label: '320 kbps', badge: 'HD', desc: 'Maximum quality', color: 'emerald' },
                    { q: '160kbps', label: '160 kbps', badge: 'HQ', desc: 'High quality', color: 'blue' },
                    { q: '96kbps', label: '96 kbps', badge: '', desc: 'Normal', color: 'gray' },
                    { q: '48kbps', label: '48 kbps', badge: 'SAVE', desc: 'Data saver', color: 'yellow' },
                  ].map(item => (
                    <button key={item.q} onClick={() => { setApiQuality(item.q); setStreamQuality(item.q); showToast(`Quality: ${item.label} ${item.badge}`); }}
                      className={`flex flex-col items-start p-3 rounded-xl transition-all duration-200 btn-press border ${
                        streamQuality === item.q
                          ? item.color === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/30 shadow-sm' : item.color === 'blue' ? 'bg-blue-500/10 border-blue-500/30' : 'bg-white/[0.06] border-white/[0.08]'
                          : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04]'
                      }`}>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[13px] font-bold ${
                          streamQuality === item.q
                            ? item.color === 'emerald' ? 'text-emerald-300' : item.color === 'blue' ? 'text-blue-300' : 'text-white'
                            : 'text-white'
                        }`}>{item.label}</span>
                        {item.badge && <span className={`text-[8px] font-bold px-1 py-0.5 rounded ${
                          item.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' :
                          item.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                          item.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' : ''
                        }`}>{item.badge}</span>}
                      </div>
                      <span className="text-[10px] text-[#555] mt-0.5">{item.desc}</span>
                      {streamQuality === item.q && <div className="w-1.5 h-1.5 rounded-full bg-current mt-1.5 opacity-60" />}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
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
