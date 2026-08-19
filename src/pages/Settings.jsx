import { useState } from 'react';
import { Timer, Trash2, Info, Wifi, Volume2, Shield, Headphones, Zap, Bell, SlidersHorizontal, Download, Smartphone } from 'lucide-react';
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
  const { volume, setVolume, boostLevel, setVolumeBoost, bassBoostOn, setBassBoost, resetAudio, applyEqPreset, setEqBand, showToast } = usePlayer();
  const [crossfade, setCrossfade] = useState(() => parseInt(localStorage.getItem('crossfade_dur') || '5'));
  const [notifications, setNotifications] = useState(true);
  const [activePreset, setActivePreset] = useState('Flat');
  const [eqValues, setEqValues] = useState([0,0,0,0,0,0,0,0,0,0]);

  const handleCrossfade = (val) => {
    setCrossfade(val);
    localStorage.setItem('crossfade_dur', val.toString());
  };

  const handlePreset = (preset) => {
    setActivePreset(preset.name);
    setEqValues(preset.gains);
    applyEqPreset(preset.gains);
    showToast(`EQ: ${preset.name}`);
  };

  const handleBand = (i, val) => {
    const newVals = [...eqValues];
    newVals[i] = val;
    setEqValues(newVals);
    setEqBand(i, val);
    setActivePreset('Custom');
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
      <h1 className="text-[22px] font-bold text-white mb-1">Settings</h1>
      <p className="text-[13px] text-[#666] mb-7">Customize your listening experience</p>

      {/* Volume Boost */}
      <Section title="Volume Amplifier">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <Volume2 size={16} className="text-[#aaa]" />
              <span className="text-[13px] text-white font-medium">Output Volume</span>
            </div>
            <span className={`text-[13px] font-bold tabular-nums ${boostLevel > 100 ? 'text-orange-400' : 'text-rose-400'}`}>{Math.round(boostLevel)}%</span>
          </div>
          <input type="range" min="0" max="200" step="5" value={boostLevel}
            onChange={e => handleBoost(parseInt(e.target.value))}
            className="w-full h-[6px] rounded-full appearance-none bg-white/[0.08] cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md" />
          <div className="flex justify-between text-[9px] text-[#555] mt-1.5 px-0.5">
            <span>0%</span><span>100%</span><span>200%</span>
          </div>
          {boostLevel > 100 && (
            <p className="text-[10px] text-orange-400/80 mt-2">Volume above 100% may distort audio</p>
          )}
          <button onClick={() => { resetAudio(); showToast('Audio reset'); }}
            className="mt-3 w-full py-2.5 bg-white/[0.04] hover:bg-white/[0.08] rounded-xl text-[12px] text-[#aaa] font-medium transition-colors btn-press">
            Reset Audio
          </button>
        </div>
      </Section>

      {/* Bass Boost */}
      <Section title="Bass Boost">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${bassBoostOn ? 'bg-rose-500/20' : 'bg-white/[0.05]'}`}>
              <span className="text-[18px]">🔊</span>
            </div>
            <div>
              <p className="text-[13px] text-white font-medium">Bass Boost</p>
              <p className="text-[11px] text-[#555]">Extra low-end punch</p>
            </div>
          </div>
          <Toggle on={bassBoostOn} onChange={(v) => { setBassBoost(v); showToast(v ? 'Bass Boost ON' : 'Bass Boost OFF'); }} />
        </div>
      </Section>

      {/* Equalizer */}
      <Section title="Equalizer">
        <div className="px-4 py-4">
          {/* Presets */}
          <div className="flex gap-2 mb-5 scroll-x pb-1">
            {EQ_PRESETS.map(p => (
              <button key={p.name} onClick={() => handlePreset(p)}
                className={`px-3.5 py-2 rounded-xl text-[12px] font-medium whitespace-nowrap shrink-0 transition-all btn-press ${
                  activePreset === p.name ? 'bg-rose-500 text-white' : 'bg-white/[0.06] text-[#aaa] hover:bg-white/[0.1]'
                }`}>
                {p.name}
              </button>
            ))}
          </div>
          {/* Bands */}
          <div className="flex justify-between gap-2">
            {EQ_BANDS.map((band, i) => (
              <div key={band} className="flex flex-col items-center gap-1.5 flex-1">
                <span className={`text-[10px] font-bold tabular-nums ${eqValues[i] > 0 ? 'text-rose-400' : eqValues[i] < 0 ? 'text-blue-400' : 'text-[#666]'}`}>
                  {eqValues[i] > 0 ? '+' : ''}{eqValues[i]}
                </span>
                <div className="relative h-24 w-full flex justify-center">
                  <input type="range" min="-8" max="8" step="1" value={eqValues[i]}
                    onChange={e => handleBand(i, parseInt(e.target.value))}
                    className="absolute h-24 w-8 appearance-none bg-transparent cursor-pointer [writing-mode:vertical-lr] [direction:rtl] [&::-webkit-slider-track]:w-[4px] [&::-webkit-slider-track]:rounded-full [&::-webkit-slider-track]:bg-white/[0.08] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md" />
                </div>
                <span className="text-[9px] text-[#666]">{band}</span>
              </div>
            ))}
          </div>
          {/* Reset */}
          <button onClick={() => { handlePreset(EQ_PRESETS[0]); showToast('EQ Reset'); }}
            className="mt-4 w-full py-2.5 bg-white/[0.04] hover:bg-white/[0.08] rounded-xl text-[12px] text-[#aaa] font-medium transition-colors btn-press">
            Reset EQ
          </button>
        </div>
      </Section>

      {/* Audio Quality */}
      <Section title="Audio Quality">
        <SettingRow icon={Wifi} label="Streaming" desc="Always maximum quality">
          <span className="text-[12px] text-emerald-400 font-semibold">320kbps HD</span>
        </SettingRow>
        <SettingRow icon={Headphones} label="Format" desc="AAC High Definition">
          <span className="text-[11px] text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-lg">Active</span>
        </SettingRow>
      </Section>

      {/* Playback */}
      <Section title="Playback">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <Timer size={16} className="text-[#aaa]" />
              <div>
                <span className="text-[13px] text-white font-medium">Crossfade</span>
                <p className="text-[10px] text-[#666]">Smooth transition</p>
              </div>
            </div>
            <span className="text-[12px] text-rose-400 font-bold tabular-nums">{crossfade === 0 ? 'Off' : `${crossfade}s`}</span>
          </div>
          <input type="range" min="0" max="12" step="1" value={crossfade}
            onChange={e => handleCrossfade(parseInt(e.target.value))}
            className="w-full h-[6px] rounded-full appearance-none bg-white/[0.08] cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md" />
        </div>
      </Section>

      {/* Data */}
      <Section title="Data & Privacy">
        <SettingRow icon={Trash2} label="Clear History" desc="Remove listening history">
          <button onClick={clearHistory} className="px-3.5 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] rounded-xl text-[11px] text-white font-medium transition-colors btn-press">
            Clear
          </button>
        </SettingRow>
        <SettingRow icon={Trash2} label="Clear Cache" desc={`${getCacheSize()} cached items`}>
          <button onClick={() => { clearCache(); showToast('Cache cleared'); }} className="px-3.5 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] rounded-xl text-[11px] text-white font-medium transition-colors btn-press">
            Clear
          </button>
        </SettingRow>
        <SettingRow icon={Shield} label="Reset Everything" desc="Clear all data, start fresh">
          <button onClick={clearAllData} className="px-3.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl text-[11px] text-rose-400 font-medium transition-colors btn-press">
            Reset
          </button>
        </SettingRow>
      </Section>

      {/* About */}
      <Section title="About">
        <SettingRow icon={Info} label="Music Area" desc="Free, ad-free music streaming">
          <span className="text-[11px] text-[#555] bg-white/[0.04] px-2 py-1 rounded-lg">v2.0.0</span>
        </SettingRow>
      </Section>

      {/* Download App */}
      <Section title="Get the App">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Smartphone size={18} className="text-white" />
            </div>
            <div>
              <p className="text-[13px] text-white font-semibold">Music Area for Android</p>
              <p className="text-[11px] text-white/40">Install the app on your phone</p>
            </div>
          </div>
          <a href="https://musicarea.vercel.app" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 bg-white rounded-xl text-[13px] text-black font-bold btn-press shadow-md hover:shadow-lg transition-all active:scale-95">
            <Download size={15} />
            Download APK
          </a>
          <p className="text-[10px] text-white/25 mt-2 text-center">Or add to Home Screen from browser menu</p>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-5">
      <p className="text-[12px] text-[#777] font-semibold mb-2.5 px-1">{title}</p>
      <div className="bg-[#111] rounded-2xl border border-white/[0.05] overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function SettingRow({ icon: Icon, label, desc, children }) {
  return (
    <div className="flex items-center gap-3.5 px-4 py-3.5 border-b border-white/[0.04] last:border-0">
      <div className="w-9 h-9 rounded-xl bg-white/[0.05] flex items-center justify-center shrink-0">
        <Icon size={16} className="text-[#999]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-white font-medium leading-tight">{label}</p>
        {desc && <p className="text-[11px] text-[#555] mt-0.5">{desc}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ on, onChange, disabled }) {
  return (
    <button onClick={() => !disabled && onChange?.(!on)} disabled={disabled}
      className={`w-[46px] h-[26px] rounded-full relative transition-all duration-200 ${on ? 'bg-rose-500' : 'bg-[#333]'} ${disabled ? 'opacity-60' : ''}`}>
      <div className={`absolute top-[3px] w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${on ? 'translate-x-[23px]' : 'translate-x-[3px]'}`} />
    </button>
  );
}
