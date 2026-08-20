import { useState } from 'react';
import { Timer, Trash2, Info, Wifi, Volume2, Shield, Headphones, Zap, Download, Smartphone } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { clearCache, getCacheSize } from '../data/api';

const EQ_PRESETS = [
  { name: 'Flat', gains: [0,0,0,0,0,0,0,0,0,0] },
  { name: 'Bass Boost', gains: [6,5,4,3,1,0,0,0,0,0] },
  { name: 'Treble Boost', gains: [0,0,0,0,0,1,2,4,5,6] },
  { name: 'Vocal', gains: [-2,-1,0,2,4,4,3,2,0,-1] },
  { name: 'Rock', gains: [5,4,2,0,-1,-1,1,3,4,5] },
  { name: 'Pop', gains: [-1,1,3,4,3,1,0,-1,-2,-2] },
  { name: 'Hip-Hop', gains: [5,4,1,3,-1,-1,2,0,1,3] },
  { name: 'EDM', gains: [4,3,1,0,-2,0,1,3,4,5] },
  { name: 'Jazz', gains: [3,2,1,2,-1,-1,0,1,2,3] },
  { name: 'Classical', gains: [4,3,2,1,0,0,0,2,3,4] },
  { name: 'Acoustic', gains: [3,2,0,1,2,2,1,2,3,2] },
  { name: 'R&B', gains: [3,5,4,1,-1,0,2,3,2,1] },
];

const EQ_BANDS = ['31', '63', '125', '250', '500', '1K', '2K', '4K', '8K', '16K'];

export default function Settings() {
  const { volume, setVolume, boostLevel, setVolumeBoost, bassBoostOn, setBassBoost, vocalMode, setVocalMode, resetAudio, applyEqPreset, setEqBand, showToast } = usePlayer();
  const [crossfade, setCrossfade] = useState(() => parseInt(localStorage.getItem('crossfade_dur') || '5'));
  const [activePreset, setActivePreset] = useState(() => { try { return localStorage.getItem('ma_eq_preset') || 'Flat'; } catch { return 'Flat'; } });
  const [eqValues, setEqValues] = useState(() => { try { return JSON.parse(localStorage.getItem('ma_eq_values')) || [0,0,0,0,0,0,0,0,0,0]; } catch { return [0,0,0,0,0,0,0,0,0,0]; } });

  const handleCrossfade = (val) => {
    setCrossfade(val);
    localStorage.setItem('crossfade_dur', val.toString());
  };

  const handlePreset = (preset) => {
    setActivePreset(preset.name);
    setEqValues(preset.gains);
    applyEqPreset(preset.gains);
    try { localStorage.setItem('ma_eq_preset', preset.name); localStorage.setItem('ma_eq_values', JSON.stringify(preset.gains)); } catch {}
  };

  const handleBand = (i, val) => {
    const newVals = [...eqValues];
    newVals[i] = val;
    setEqValues(newVals);
    setEqBand(i, val);
    setActivePreset('Custom');
    try { localStorage.setItem('ma_eq_preset', 'Custom'); localStorage.setItem('ma_eq_values', JSON.stringify(newVals)); } catch {}
  };

  const handleBoost = (val) => {
    setVolumeBoost(val);
  };

  const clearHistory = () => {
    localStorage.removeItem('ma_history');
    showToast('History cleared');
  };

  const clearAllData = () => {
    localStorage.clear();
    showToast('Resetting...');
    setTimeout(() => window.location.reload(), 800);
  };

  return (
    <div className="pb-6 pt-2 max-w-xl">
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-[24px] font-bold text-white tracking-tight">Settings</h1>
        <p className="text-[12px] text-white/40 mt-0.5">Customize your experience</p>
      </div>

      {/* Volume */}
      <Section title="Volume Amplifier" icon={Volume2}>
        <div className="px-5 py-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[13px] text-white/70 font-medium">Output Level</span>
            <span className={`text-[15px] font-bold tabular-nums ${boostLevel > 100 ? 'text-orange-400' : 'text-white'}`}>{Math.round(boostLevel)}%</span>
          </div>
          <input type="range" min="0" max="200" step="5" value={boostLevel}
            onChange={e => handleBoost(parseInt(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none bg-white/[0.08] cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:shadow-black/30" />
          <div className="flex justify-between text-[10px] text-white/25 mt-2">
            <span>0%</span><span>100%</span><span>200%</span>
          </div>
          {boostLevel > 100 && (
            <p className="text-[11px] text-orange-400/70 mt-3 flex items-center gap-1.5">
              <Zap size={11} /> Volume above 100% may cause distortion
            </p>
          )}
          <button onClick={() => { resetAudio(); showToast('Audio reset'); }}
            className="mt-4 w-full py-2.5 bg-white/[0.04] hover:bg-white/[0.08] rounded-xl text-[12px] text-white/50 font-medium transition-colors active:scale-[0.98]">
            Reset to Default
          </button>
        </div>
      </Section>

      {/* Sound Effects */}
      <Section title="Sound Effects" icon={Headphones}>
        <div className="divide-y divide-white/[0.04]">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${bassBoostOn ? 'bg-rose-500/15' : 'bg-white/[0.04]'}`}>
                <span className="text-[16px]">🔊</span>
              </div>
              <div>
                <p className="text-[13px] text-white font-medium">Bass Boost</p>
                <p className="text-[11px] text-white/30">Enhanced low frequencies</p>
              </div>
            </div>
            <Toggle on={bassBoostOn} onChange={(v) => { setBassBoost(v); if (v) setVocalMode(false); }} />
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${vocalMode ? 'bg-violet-500/15' : 'bg-white/[0.04]'}`}>
                <span className="text-[16px]">🎤</span>
              </div>
              <div>
                <p className="text-[13px] text-white font-medium">Vocal Mode</p>
                <p className="text-[11px] text-white/30">Clearer vocals, reduced instruments</p>
              </div>
            </div>
            <Toggle on={vocalMode} onChange={(v) => { setVocalMode(v); if (v) setBassBoost(false); }} />
          </div>
        </div>
      </Section>

      {/* Equalizer */}
      <Section title="Equalizer" icon={Zap}>
        <div className="px-5 py-5">
          <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scroll-x">
            {EQ_PRESETS.map(p => (
              <button key={p.name} onClick={() => handlePreset(p)}
                className={`px-3.5 py-2 rounded-xl text-[11px] font-semibold whitespace-nowrap shrink-0 transition-all active:scale-95 ${
                  activePreset === p.name ? 'bg-white text-black' : 'bg-white/[0.05] text-white/50 hover:bg-white/[0.08]'
                }`}>
                {p.name}
              </button>
            ))}
          </div>
          <div className="flex justify-between gap-1.5">
            {EQ_BANDS.map((band, i) => (
              <div key={band} className="flex flex-col items-center gap-1.5 flex-1">
                <span className={`text-[9px] font-bold tabular-nums ${eqValues[i] > 0 ? 'text-rose-400' : eqValues[i] < 0 ? 'text-blue-400' : 'text-white/25'}`}>
                  {eqValues[i] > 0 ? '+' : ''}{eqValues[i]}
                </span>
                <div className="relative h-20 w-full flex justify-center">
                  <input type="range" min="-8" max="8" step="1" value={eqValues[i]}
                    onChange={e => handleBand(i, parseInt(e.target.value))}
                    className="absolute h-20 w-7 appearance-none bg-transparent cursor-pointer [writing-mode:vertical-lr] [direction:rtl] [&::-webkit-slider-track]:w-[3px] [&::-webkit-slider-track]:rounded-full [&::-webkit-slider-track]:bg-white/[0.08] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-sm" />
                </div>
                <span className="text-[8px] text-white/25 font-medium">{band}</span>
              </div>
            ))}
          </div>
          <button onClick={() => { handlePreset(EQ_PRESETS[0]); showToast('EQ reset'); }}
            className="mt-4 w-full py-2.5 bg-white/[0.04] hover:bg-white/[0.08] rounded-xl text-[12px] text-white/50 font-medium transition-colors active:scale-[0.98]">
            Reset Equalizer
          </button>
        </div>
      </Section>

      {/* Audio Quality */}
      <Section title="Audio Quality" icon={Wifi}>
        <div className="divide-y divide-white/[0.04]">
          <SettingRow label="Streaming Quality" desc="Maximum quality streaming">
            <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-lg">320kbps</span>
          </SettingRow>
          <SettingRow label="Audio Format" desc="AAC High Definition">
            <span className="text-[11px] text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-lg">HD</span>
          </SettingRow>
        </div>
      </Section>

      {/* Playback */}
      <Section title="Playback" icon={Timer}>
        <div className="px-5 py-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[13px] text-white font-medium">Crossfade</span>
              <p className="text-[11px] text-white/30 mt-0.5">Smooth transitions between songs</p>
            </div>
            <span className="text-[13px] text-white font-bold tabular-nums">{crossfade === 0 ? 'Off' : `${crossfade}s`}</span>
          </div>
          <input type="range" min="0" max="12" step="1" value={crossfade}
            onChange={e => handleCrossfade(parseInt(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none bg-white/[0.08] cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:shadow-black/30" />
        </div>
      </Section>

      {/* Data & Privacy */}
      <Section title="Data & Privacy" icon={Shield}>
        <div className="divide-y divide-white/[0.04]">
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-[13px] text-white font-medium">Listening History</p>
              <p className="text-[11px] text-white/30">Remove all play history</p>
            </div>
            <button onClick={clearHistory} className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] rounded-xl text-[11px] text-white/70 font-medium transition-colors active:scale-95">
              Clear
            </button>
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-[13px] text-white font-medium">API Cache</p>
              <p className="text-[11px] text-white/30">{getCacheSize()} cached items</p>
            </div>
            <button onClick={() => { clearCache(); showToast('Cache cleared'); }} className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] rounded-xl text-[11px] text-white/70 font-medium transition-colors active:scale-95">
              Clear
            </button>
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-[13px] text-white font-medium">Reset Everything</p>
              <p className="text-[11px] text-white/30">Clear all data and start fresh</p>
            </div>
            <button onClick={clearAllData} className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-[11px] text-red-400 font-medium transition-colors active:scale-95">
              Reset
            </button>
          </div>
        </div>
      </Section>

      {/* Get the App */}
      <Section title="Install App" icon={Smartphone}>
        <div className="px-5 py-5 space-y-3">
          <button onClick={() => {
            if (window.deferredPrompt) {
              window.deferredPrompt.prompt();
              window.deferredPrompt.userChoice.then(() => { window.deferredPrompt = null; });
            } else {
              alert('Tap browser menu > "Add to Home Screen" or "Install App"');
            }
          }}
            className="flex items-center justify-center gap-2 w-full py-3 bg-white rounded-xl text-[13px] text-black font-bold active:scale-[0.98] shadow-md hover:shadow-lg transition-all">
            <Download size={15} />
            Install as App
          </button>

          <a href="https://github.com/wintontomlinson/musicarea/raw/main/Music%20Area.apk"
            download
            className="flex items-center justify-center gap-2 w-full py-3 bg-white/[0.05] hover:bg-white/[0.08] rounded-xl text-[13px] text-white/70 font-semibold active:scale-[0.98] transition-all border border-white/[0.06]">
            <Download size={15} />
            Download APK
          </a>
          <p className="text-[10px] text-white/20 text-center">Install adds to home screen, no download needed</p>
        </div>
      </Section>

      {/* About */}
      <Section title="About" icon={Info}>
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-[13px] text-white font-medium">Music Area</p>
            <p className="text-[11px] text-white/30">Free, ad-free music streaming</p>
          </div>
          <span className="text-[11px] text-white/25 bg-white/[0.04] px-2.5 py-1 rounded-lg font-medium">v2.0</span>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2.5 px-1">
        {Icon && <Icon size={13} className="text-white/30" />}
        <p className="text-[12px] text-white/40 font-semibold uppercase tracking-wider">{title}</p>
      </div>
      <div className="bg-white/[0.03] rounded-2xl border border-white/[0.05] overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function SettingRow({ label, desc, children }) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <div>
        <p className="text-[13px] text-white font-medium">{label}</p>
        {desc && <p className="text-[11px] text-white/30 mt-0.5">{desc}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ on, onChange, disabled }) {
  return (
    <button onClick={() => !disabled && onChange?.(!on)} disabled={disabled}
      className={`w-[44px] h-[24px] rounded-full relative transition-all duration-200 ${on ? 'bg-white' : 'bg-white/[0.12]'} ${disabled ? 'opacity-50' : ''}`}>
      <div className={`absolute top-[3px] w-[18px] h-[18px] rounded-full shadow-sm transition-all duration-200 ${on ? 'translate-x-[23px] bg-black' : 'translate-x-[3px] bg-white/60'}`} />
    </button>
  );
}
