import { useState } from 'react';
import { Volume2, Zap, Timer, Trash2, Info, Shield, Download, Smartphone } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { clearCache, getCacheSize } from '../data/api';

const EQ_PRESETS = [
  { name: 'Flat', gains: [0,0,0,0,0,0,0,0,0,0] },
  { name: 'Bass Boost', gains: [6,5,4,3,1,0,0,0,0,0] },
  { name: 'Treble', gains: [0,0,0,0,0,1,2,4,5,6] },
  { name: 'Vocal', gains: [-2,-1,0,2,4,4,3,2,0,-1] },
  { name: 'Rock', gains: [5,4,2,0,-1,-1,1,3,4,5] },
  { name: 'Pop', gains: [-1,1,3,4,3,1,0,-1,-2,-2] },
  { name: 'Hip-Hop', gains: [5,4,1,3,-1,-1,2,0,1,3] },
  { name: 'EDM', gains: [4,3,1,0,-2,0,1,3,4,5] },
];

const EQ_BANDS = ['31', '63', '125', '250', '500', '1K', '2K', '4K', '8K', '16K'];

export default function Settings() {
  const { boostLevel, setVolumeBoost, bassBoostOn, setBassBoost, vocalMode, setVocalMode, resetAudio, applyEqPreset, setEqBand, showToast } = usePlayer();
  const [crossfade, setCrossfade] = useState(() => parseInt(localStorage.getItem('crossfade_dur') || '5'));
  const [activePreset, setActivePreset] = useState(() => { try { return localStorage.getItem('ma_eq_preset') || 'Flat'; } catch { return 'Flat'; } });
  const [eqValues, setEqValues] = useState(() => { try { return JSON.parse(localStorage.getItem('ma_eq_values')) || [0,0,0,0,0,0,0,0,0,0]; } catch { return [0,0,0,0,0,0,0,0,0,0]; } });

  const handleCrossfade = (val) => { setCrossfade(val); localStorage.setItem('crossfade_dur', val.toString()); };
  const handlePreset = (preset) => { setActivePreset(preset.name); setEqValues(preset.gains); applyEqPreset(preset.gains); try { localStorage.setItem('ma_eq_preset', preset.name); localStorage.setItem('ma_eq_values', JSON.stringify(preset.gains)); } catch {} };
  const handleBand = (i, val) => { const v = [...eqValues]; v[i] = val; setEqValues(v); setEqBand(i, val); setActivePreset('Custom'); try { localStorage.setItem('ma_eq_preset', 'Custom'); localStorage.setItem('ma_eq_values', JSON.stringify(v)); } catch {} };

  return (
    <div className="pb-6 pt-3 max-w-lg">
      <h1 className="text-[26px] font-bold text-white tracking-tight mb-1">Settings</h1>
      <p className="text-[12px] text-white/35 mb-7">Audio & app preferences</p>

      {/* Volume */}
      <Section title="Volume">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] text-white/60">Output Level</span>
            <span className={`text-[13px] font-bold tabular-nums ${boostLevel > 100 ? 'text-orange-400' : 'text-white'}`}>{boostLevel}%</span>
          </div>
          <input type="range" min="0" max="200" step="5" value={boostLevel} onChange={e => setVolumeBoost(parseInt(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none bg-white/[0.08] cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md" />
          <div className="flex justify-between text-[9px] text-white/20 mt-1.5"><span>0%</span><span>100%</span><span>200%</span></div>
        </div>
      </Section>

      {/* Effects */}
      <Section title="Effects">
        <div className="divide-y divide-white/[0.04]">
          <Row label="Bass Boost" desc="Enhanced low frequencies">
            <Toggle on={bassBoostOn} onChange={v => { setBassBoost(v); if (v) setVocalMode(false); }} />
          </Row>
          <Row label="Vocal Mode" desc="Clearer vocals">
            <Toggle on={vocalMode} onChange={v => { setVocalMode(v); if (v) setBassBoost(false); }} />
          </Row>
        </div>
      </Section>

      {/* EQ */}
      <Section title="Equalizer">
        <div className="p-4">
          <div className="flex gap-1.5 mb-4 overflow-x-auto scroll-x pb-1">
            {EQ_PRESETS.map(p => (
              <button key={p.name} onClick={() => handlePreset(p)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap shrink-0 transition-all ${
                  activePreset === p.name ? 'bg-white text-black' : 'bg-white/[0.05] text-white/40 hover:bg-white/[0.08]'
                }`}>{p.name}</button>
            ))}
          </div>
          <div className="flex justify-between gap-1">
            {EQ_BANDS.map((band, i) => (
              <div key={band} className="flex flex-col items-center gap-1 flex-1">
                <span className={`text-[8px] font-bold tabular-nums ${eqValues[i] > 0 ? 'text-rose-400' : eqValues[i] < 0 ? 'text-blue-400' : 'text-white/20'}`}>
                  {eqValues[i] > 0 ? '+' : ''}{eqValues[i]}
                </span>
                <div className="relative h-16 w-full flex justify-center">
                  <input type="range" min="-8" max="8" step="1" value={eqValues[i]} onChange={e => handleBand(i, parseInt(e.target.value))}
                    className="absolute h-16 w-6 appearance-none bg-transparent cursor-pointer [writing-mode:vertical-lr] [direction:rtl] [&::-webkit-slider-track]:w-[3px] [&::-webkit-slider-track]:rounded-full [&::-webkit-slider-track]:bg-white/[0.06] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white" />
                </div>
                <span className="text-[7px] text-white/20">{band}</span>
              </div>
            ))}
          </div>
          <button onClick={() => { handlePreset(EQ_PRESETS[0]); showToast('EQ reset'); }}
            className="mt-3 w-full py-2 bg-white/[0.04] hover:bg-white/[0.07] rounded-lg text-[11px] text-white/40 font-medium transition-colors active:scale-[0.98]">Reset EQ</button>
        </div>
      </Section>

      {/* Playback */}
      <Section title="Playback">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] text-white/60">Crossfade</span>
            <span className="text-[12px] text-white/80 font-medium tabular-nums">{crossfade === 0 ? 'Off' : `${crossfade}s`}</span>
          </div>
          <input type="range" min="0" max="12" step="1" value={crossfade} onChange={e => handleCrossfade(parseInt(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none bg-white/[0.08] cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md" />
        </div>
      </Section>

      {/* Data */}
      <Section title="Data">
        <div className="divide-y divide-white/[0.04]">
          <Row label="Clear History" desc="Remove play history">
            <button onClick={() => { localStorage.removeItem('ma_history'); showToast('History cleared'); }} className="px-3 py-1.5 bg-white/[0.05] hover:bg-white/[0.09] rounded-lg text-[11px] text-white/60 font-medium transition-colors active:scale-95">Clear</button>
          </Row>
          <Row label="Clear Cache" desc={`${getCacheSize()} items`}>
            <button onClick={() => { clearCache(); showToast('Cache cleared'); }} className="px-3 py-1.5 bg-white/[0.05] hover:bg-white/[0.09] rounded-lg text-[11px] text-white/60 font-medium transition-colors active:scale-95">Clear</button>
          </Row>
          <Row label="Reset All" desc="Start fresh">
            <button onClick={() => { localStorage.clear(); showToast('Resetting...'); setTimeout(() => window.location.reload(), 800); }} className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/15 rounded-lg text-[11px] text-red-400 font-medium transition-colors active:scale-95">Reset</button>
          </Row>
        </div>
      </Section>

      {/* Install */}
      <Section title="App">
        <div className="p-4 space-y-2.5">
          <button onClick={() => { if (window.deferredPrompt) { window.deferredPrompt.prompt(); } else { alert('Use browser menu > Install App'); } }}
            className="w-full py-2.5 bg-white rounded-xl text-[12px] text-black font-bold active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md">
            <Download size={14} /> Install App
          </button>
          <a href="https://github.com/wintontomlinson/musicarea/raw/main/Music%20Area.apk" download
            className="w-full py-2.5 bg-white/[0.05] hover:bg-white/[0.08] rounded-xl text-[12px] text-white/60 font-medium transition-all flex items-center justify-center gap-2 border border-white/[0.05]">
            <Download size={14} /> Download APK
          </a>
        </div>
      </Section>

      {/* About */}
      <Section title="About">
        <Row label="Music Area" desc="Free, ad-free streaming">
          <span className="text-[10px] text-white/20 bg-white/[0.04] px-2 py-0.5 rounded">v2.0</span>
        </Row>
      </Section>

      {/* Reset Audio Button */}
      <button onClick={() => { resetAudio(); showToast('Audio reset'); }}
        className="w-full mt-4 py-3 bg-white/[0.03] hover:bg-white/[0.06] rounded-xl text-[12px] text-white/35 font-medium transition-colors active:scale-[0.98] border border-white/[0.04]">
        Reset All Audio Settings
      </button>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-4">
      <p className="text-[11px] text-white/25 font-semibold uppercase tracking-wider mb-2 px-0.5">{title}</p>
      <div className="bg-white/[0.02] rounded-xl border border-white/[0.04] overflow-hidden">{children}</div>
    </div>
  );
}

function Row({ label, desc, children }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <div><p className="text-[13px] text-white/70 font-medium">{label}</p>{desc && <p className="text-[10px] text-white/25 mt-0.5">{desc}</p>}</div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ on, onChange }) {
  return (
    <button onClick={() => onChange(!on)} className={`w-10 h-[22px] rounded-full relative transition-all duration-200 ${on ? 'bg-white' : 'bg-white/[0.1]'}`}>
      <div className={`absolute top-[3px] w-4 h-4 rounded-full shadow-sm transition-all duration-200 ${on ? 'translate-x-[21px] bg-black' : 'translate-x-[3px] bg-white/50'}`} />
    </button>
  );
}
