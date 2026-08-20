import { useState } from 'react';
import { Volume2, Trash2, Shield, Music, Waves, Settings as SettingsIcon, Info, RefreshCw, SlidersHorizontal, Headphones, Zap, ExternalLink } from 'lucide-react';
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
  { name: 'Jazz', gains: [3,2,1,2,-1,-1,0,1,2,3] },
  { name: 'Classical', gains: [4,3,2,1,0,0,0,2,3,4] },
  { name: 'R&B', gains: [3,5,4,1,-1,0,2,3,2,1] },
  { name: 'Acoustic', gains: [3,2,0,1,2,2,1,2,3,2] },
];

const EQ_BANDS = ['31', '63', '125', '250', '500', '1K', '2K', '4K', '8K', '16K'];

export default function Settings() {
  const { 
    boostLevel, 
    setVolumeBoost, 
    bassBoostOn, 
    setBassBoost, 
    vocalMode, 
    setVocalMode, 
    resetAudio, 
    applyEqPreset, 
    setEqBand, 
    showToast 
  } = usePlayer();
  
  const [crossfade, setCrossfade] = useState(() => parseInt(localStorage.getItem('crossfade_dur') || '5'));
  const [activePreset, setActivePreset] = useState(() => { try { return localStorage.getItem('ma_eq_preset') || 'Flat'; } catch { return 'Flat'; } });
  const [eqValues, setEqValues] = useState(() => { try { return JSON.parse(localStorage.getItem('ma_eq_values')) || [0,0,0,0,0,0,0,0,0,0]; } catch { return [0,0,0,0,0,0,0,0,0,0]; } });
  const [activeSection, setActiveSection] = useState('audio');
  const [cacheSize, setCacheSize] = useState(getCacheSize());

  const handleCrossfade = (val) => { 
    setCrossfade(val); 
    localStorage.setItem('crossfade_dur', val.toString()); 
  };
  
  const handlePreset = (preset) => { 
    setActivePreset(preset.name); 
    setEqValues(preset.gains); 
    applyEqPreset(preset.gains); 
    try { 
      localStorage.setItem('ma_eq_preset', preset.name); 
      localStorage.setItem('ma_eq_values', JSON.stringify(preset.gains)); 
    } catch {} 
  };
  
  const handleBand = (i, val) => { 
    const v = [...eqValues]; 
    v[i] = val; 
    setEqValues(v); 
    setEqBand(i, val); 
    setActivePreset('Custom'); 
    try { 
      localStorage.setItem('ma_eq_preset', 'Custom'); 
      localStorage.setItem('ma_eq_values', JSON.stringify(v)); 
    } catch {} 
  };

  const handleClearHistory = () => {
    localStorage.removeItem('ma_history');
    localStorage.removeItem('ma_liked_songs');
    showToast('Play history cleared');
  };

  const handleClearCache = () => {
    clearCache();
    setCacheSize(0);
    showToast('Cache cleared');
  };

  const handleResetAll = () => {
    localStorage.clear();
    showToast('Resetting...');
    setTimeout(() => window.location.reload(), 800);
  };

  const handleResetAudio = () => {
    resetAudio();
    handlePreset(EQ_PRESETS[0]);
    setCrossfade(5);
    localStorage.setItem('crossfade_dur', '5');
    setVolumeBoost(100);
    setBassBoost(false);
    setVocalMode(false);
    showToast('Audio settings reset');
  };

  const sections = [
    { id: 'audio', label: 'Audio', icon: SlidersHorizontal, desc: 'Volume, output, quality' },
    { id: 'effects', label: 'Effects', icon: Waves, desc: 'Bass boost, vocal mode' },
    { id: 'equalizer', label: 'Equalizer', icon: Music, desc: '10-band EQ, presets' },
    { id: 'playback', label: 'Playback', icon: Zap, desc: 'Crossfade, gapless' },
    { id: 'data', label: 'Data', icon: Info, desc: 'Cache, history, reset' },
  ];

  return (
    <div className="min-h-screen bg-[#060606]">
      <div className="max-w-3xl mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white via-rose-300 to-fuchsia-300 bg-clip-text text-transparent">Settings</h1>
            <p className="text-white/40 mt-1">Fine-tune your listening experience</p>
          </div>
          <div className="flex items-center gap-2">
            <ExternalLink className="text-white/30" size={20} />
          </div>
        </div>

        <div className="flex gap-4 mb-6 overflow-x-auto scroll-x pb-2">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex shrink-0 items-center gap-2.5 px-4 py-3 rounded-xl border transition-all duration-300 ${
                activeSection === section.id
                  ? 'bg-white/10 border-white/20 text-white shadow-lg shadow-rose-500/10'
                  : 'bg-white/[0.03] border-white/[0.05] text-white/60 hover:bg-white/[0.06] hover:border-white/[0.1]'
              }`}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-rose-500/20 to-fuchsia-500/20">
                <section.icon size={16} className={activeSection === section.id ? 'text-rose-300' : 'text-white/60'} />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold">{section.label}</p>
                <p className="text-[10px] text-white/35">{section.desc}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="bg-[#0a0a0a]/80 backdrop-blur-2xl rounded-2xl border border-white/[0.08] overflow-hidden">
          {activeSection === 'audio' && (
            <AudioSection 
              boostLevel={boostLevel} 
              setVolumeBoost={setVolumeBoost} 
              showToast={showToast}
            />
          )}
          {activeSection === 'effects' && (
            <EffectsSection 
              bassBoostOn={bassBoostOn} 
              setBassBoost={setBassBoost} 
              vocalMode={vocalMode} 
              setVocalMode={setVocalMode}
            />
          )}
          {activeSection === 'equalizer' && (
            <EqualizerSection 
              activePreset={activePreset}
              setActivePreset={setActivePreset}
              eqValues={eqValues}
              setEqValues={setEqValues}
              handlePreset={handlePreset}
              handleBand={handleBand}
              showToast={showToast}
            />
          )}
          {activeSection === 'playback' && (
            <PlaybackSection 
              crossfade={crossfade}
              handleCrossfade={handleCrossfade}
            />
          )}
          {activeSection === 'data' && (
            <DataSection 
              cacheSize={cacheSize}
              handleClearHistory={handleClearHistory}
              handleClearCache={handleClearCache}
              handleResetAll={handleResetAll}
              handleResetAudio={handleResetAudio}
              showToast={showToast}
            />
          )}
        </div>

        <p className="text-center text-[11px] text-white/20 mt-6">Music Area v2.0 — Free, ad-free streaming</p>
      </div>
    </div>
  );
}

function AudioSection({ boostLevel, setVolumeBoost }) {
  return (
    <div className="p-6 space-y-6">
      <div className="border-b border-white/[0.06] pb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Volume2 size={20} className="text-rose-400" />
          Volume & Output
        </h2>
        <p className="text-white/40 text-sm mt-1">Control playback volume and output level</p>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-white/60">Output Level</span>
            <span className={`text-lg font-bold tabular-nums ${boostLevel > 100 ? 'text-orange-400' : 'text-white'}`}>{boostLevel}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="200"
            step="5"
            value={boostLevel}
            onChange={e => setVolumeBoost(parseInt(e.target.value))}
            className="w-full h-2 rounded-full appearance-none bg-white/[0.08] cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r_[&::-webkit-slider-thumb]:from-rose-400_[&::-webkit-slider-thumb]:to-fuchsia-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-rose-500/30"
          />
          <div className="flex justify-between text-[10px] text-white/20 mt-2"><span>0%</span><span>100%</span><span>200%</span></div>
        </div>

        <div className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.05]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Shield size={18} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-white font-medium">Maximum Quality Locked</p>
                <p className="text-white/40 text-sm">320kbps AAC streaming enforced</p>
              </div>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded-full">HD</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function EffectsSection({ bassBoostOn, setBassBoost, vocalMode, setVocalMode }) {
  return (
    <div className="p-6 space-y-4">
      <div className="border-b border-white/[0.06] pb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Waves size={20} className="text-rose-400" />
          Sound Effects
        </h2>
        <p className="text-white/40 text-sm mt-1">Enhance your audio with real-time processing</p>
      </div>

      <div className="space-y-3">
        <EffectRow
          label="Bass Boost"
          desc="Enhances low frequencies for deeper, punchier bass"
          icon={<Headphones size={18} className="text-amber-400" />}
          on={bassBoostOn}
          onChange={setBassBoost}
          accent="amber"
        />
        <EffectRow
          label="Vocal Mode"
          desc="Boosts mid-range for clearer vocals and dialogue"
          icon={<Music size={18} className="text-blue-400" />}
          on={vocalMode}
          onChange={setVocalMode}
          accent="blue"
        />
      </div>

      <div className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.05]">
        <p className="text-white/50 text-sm">Uses Web Audio API with 10-band EQ and dynamic compression for transparent processing.</p>
      </div>
    </div>
  );
}

function EffectRow({ label, desc, icon, on, onChange, accent }) {
  const accentColors = {
    amber: 'from-amber-500 to-orange-500',
    blue: 'from-blue-500 to-cyan-500',
  };
  
  return (
    <div className="p-4 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${accentColors[accent]}/20`}>
            {icon}
          </div>
          <div>
            <p className="text-white font-medium">{label}</p>
            <p className="text-white/40 text-sm">{desc}</p>
          </div>
        </div>
        <button
          onClick={() => onChange(!on)}
          className={`w-12 h-7 rounded-full relative transition-all duration-300 ${
            on ? `bg-gradient-to-r ${accentColors[accent]} shadow-md shadow-${accent}-500/30` : 'bg-white/[0.1]'
          }`}
        >
          <div className={`absolute top-0.5 w-6 h-6 rounded-full shadow-sm transition-all duration-300 ${
            on ? 'translate-x-5 bg-white' : 'translate-x-0.5 bg-white/50'
          }`} />
        </button>
      </div>
    </div>
  );
}

function EqualizerSection({ activePreset, eqValues, handlePreset, handleBand }) {
  return (
    <div className="p-6 space-y-6">
      <div className="border-b border-white/[0.06] pb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Music size={20} className="text-rose-400" />
          10-Band Equalizer
        </h2>
        <p className="text-white/40 text-sm mt-1">Shape your sound with precision</p>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-white/50 text-sm mb-3">Presets</p>
          <div className="flex gap-2 overflow-x-auto scroll-x pb-2">
            {EQ_PRESETS.map(p => (
              <button
                key={p.name}
                onClick={() => handlePreset(p)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap shrink-0 transition-all ${
                  activePreset === p.name
                    ? 'bg-gradient-to-r from-rose-500 to-fuchsia-500 text-white shadow-lg shadow-rose-500/30'
                    : 'bg-white/[0.05] text-white/60 hover:bg-white/[0.08] hover:text-white'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-white/50 text-sm mb-2">Custom EQ</p>
          <div className="flex gap-1 overflow-x-auto scroll-x pb-4">
            {EQ_BANDS.map((band, i) => (
              <EQBand
                key={band}
                band={band}
                value={eqValues[i]}
                onChange={val => handleBand(i, val)}
                isActive={eqValues[i] !== 0}
              />
            ))}
          </div>
        </div>

        <button
          onClick={() => { handlePreset(EQ_PRESETS[0]); showToast('EQ reset to flat'); }}
          className="w-full py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-white/60 font-medium transition-colors border border-white/[0.05]"
        >
          Reset to Flat
        </button>
      </div>
    </div>
  );
}

function EQBand({ band, value, onChange, isActive }) {
  return (
    <div className="flex flex-col items-center gap-2 shrink-0 w-14">
      <span className={`text-[10px] font-bold tabular-nums ${value > 0 ? 'text-rose-400' : value < 0 ? 'text-blue-400' : 'text-white/30'}`}>
        {value > 0 ? '+' : ''}{value}
      </span>
      <div className="relative h-28 w-full flex justify-center">
        <input
          type="range"
          min="-8"
          max="8"
          step="1"
          value={value}
          onChange={e => onChange(parseInt(e.target.value))}
          className="absolute h-28 w-8 appearance-none bg-transparent cursor-pointer [writing-mode:vertical-lr] [direction:rtl] [&::-webkit-slider-track]:w-[4px] [&::-webkit-slider-track]:rounded-full [&::-webkit-slider-track]:bg-white/[0.08] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r_[&::-webkit-slider-thumb]:from-rose-400_[&::-webkit-slider-thumb]:to-fuchsia-500 [&::-webkit-slider-thumb]:shadow-lg"
        />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[4px] h-1/2 bg-gradient-to-t from-transparent via-white/10 to-white/5 rounded-full pointer-events-none" />
      </div>
      <span className={`text-[7px] font-medium ${isActive ? 'text-white/60' : 'text-white/20'}`}>{band}Hz</span>
    </div>
  );
}

function PlaybackSection({ crossfade, handleCrossfade }) {
  return (
    <div className="p-6 space-y-6">
      <div className="border-b border-white/[0.06] pb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Zap size={20} className="text-rose-400" />
          Playback
        </h2>
        <p className="text-white/40 text-sm mt-1">Control how tracks transition</p>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-white/60">Crossfade Duration</span>
            <span className="text-lg font-bold tabular-nums text-white">{crossfade === 0 ? 'Off' : `${crossfade}s`}</span>
          </div>
          <input
            type="range"
            min="0"
            max="12"
            step="1"
            value={crossfade}
            onChange={e => handleCrossfade(parseInt(e.target.value))}
            className="w-full h-2 rounded-full appearance-none bg-white/[0.08] cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r_[&::-webkit-slider-thumb]:from-rose-400_[&::-webkit-slider-thumb]:to-fuchsia-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-rose-500/30"
          />
          <div className="flex justify-between text-[10px] text-white/20 mt-2"><span>Off</span><span>6s</span><span>12s</span></div>
        </div>

        <div className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.05]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
              <Info size={18} className="text-rose-400" />
            </div>
            <div>
              <p className="text-white font-medium">Gapless Playback</p>
              <p className="text-white/40 text-sm">Enabled automatically for seamless album listening</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DataSection({ cacheSize, handleClearHistory, handleClearCache, handleResetAll, handleResetAudio }) {
  return (
    <div className="p-6 space-y-6">
      <div className="border-b border-white/[0.06] pb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Info size={20} className="text-rose-400" />
          Data & Privacy
        </h2>
        <p className="text-white/40 text-sm mt-1">Manage stored data and reset options</p>
      </div>

      <div className="space-y-3">
        <DataRow
          label="Clear Play History"
          desc="Removes recently played tracks and liked songs"
          icon={<Trash2 size={18} className="text-amber-400" />}
          onClick={handleClearHistory}
          actionLabel="Clear"
          variant="default"
        />
        <DataRow
          label="Clear Cache"
          desc={`${cacheSize} cached API responses`}
          icon={<RefreshCw size={18} className="text-blue-400" />}
          onClick={handleClearCache}
          actionLabel="Clear"
          variant="default"
        />
        <DataRow
          label="Reset Audio Settings"
          desc="EQ, volume boost, effects, crossfade"
          icon={<SettingsIcon size={18} className="text-rose-400" />}
          onClick={handleResetAudio}
          actionLabel="Reset"
          variant="warning"
        />
        <DataRow
          label="Reset Everything"
          desc="All data, settings, and preferences"
          icon={<Shield size={18} className="text-red-400" />}
          onClick={handleResetAll}
          actionLabel="Reset All"
          variant="danger"
        />
      </div>
    </div>
  );
}

function DataRow({ label, desc, icon, onClick, actionLabel, variant }) {
  const variantStyles = {
    default: 'bg-white/[0.05] hover:bg-white/[0.08] text-white/70 border-white/[0.05]',
    warning: 'bg-amber-500/10 hover:bg-amber-500/15 text-amber-300 border-amber-500/20',
    danger: 'bg-red-500/10 hover:bg-red-500/15 text-red-300 border-red-500/20',
  };

  return (
    <div className="p-4 rounded-xl border bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-white/[0.05]">
            {icon}
          </div>
          <div>
            <p className="text-white font-medium">{label}</p>
            <p className="text-white/40 text-sm">{desc}</p>
          </div>
        </div>
        <button
          onClick={onClick}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${variantStyles[variant]} active:scale-95`}
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}