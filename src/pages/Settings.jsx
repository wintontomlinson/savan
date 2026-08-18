import { useState } from 'react';
import { Timer, Trash2, Info, Wifi, Volume2, Shield, Music2, SlidersHorizontal } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { clearCache, getCacheSize, getQuality, setQuality } from '../data/api';

const EQ_PRESETS = [
  { name: 'Normal', desc: 'No change' },
  { name: 'Bass', desc: 'Heavy low-end' },
  { name: 'Vocal', desc: 'Clear vocals' },
  { name: 'Rock', desc: 'Guitars & drums' },
  { name: 'EDM', desc: 'Electronic' },
  { name: 'Treble', desc: 'Bright highs' },
];

export default function Settings() {
  const { volume, setVolume, showToast } = usePlayer();
  const [crossfade, setCrossfade] = useState(() => parseInt(localStorage.getItem('crossfade_dur') || '5'));
  const [streamQuality, setStreamQuality] = useState(() => getQuality());
  const [eqPreset, setEqPreset] = useState(() => localStorage.getItem('eq_preset') || 'Normal');

  const handleCrossfade = (val) => {
    setCrossfade(val);
    localStorage.setItem('crossfade_dur', val.toString());
  };

  const handleQuality = (q) => {
    setQuality(q);
    setStreamQuality(q);
    showToast(`Quality: ${q === 'auto' ? 'Auto' : q}`);
  };

  const handleEq = (name) => {
    setEqPreset(name);
    localStorage.setItem('eq_preset', name);
    showToast(`EQ: ${name}`);
  };

  const clearHistory = () => {
    localStorage.removeItem('ma_history');
    showToast('History cleared');
  };

  const clearAllData = () => {
    localStorage.clear();
    showToast('All data cleared — refreshing...');
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <div className="pb-6 pt-2 max-w-lg">
      <h1 className="text-xl font-bold text-white mb-6">Settings</h1>

      {/* Audio Quality */}
      <Section title="Stream Quality">
        <div className="px-4 py-3">
          <p className="text-[12px] text-[#888] mb-3">Higher quality uses more data</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { q: 'auto', label: 'Auto' },
              { q: '320kbps', label: '320kbps' },
              { q: '160kbps', label: '160kbps' },
              { q: '96kbps', label: '96kbps' },
              { q: '48kbps', label: '48kbps' },
            ].map(item => (
              <button key={item.q} onClick={() => handleQuality(item.q)}
                className={`py-2.5 rounded-xl text-[12px] font-medium transition-all btn-press ${
                  streamQuality === item.q ? 'bg-rose-500 text-white' : 'bg-white/[0.06] text-[#aaa] hover:bg-white/[0.1]'
                }`}>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Volume */}
      <Section title="Volume">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Volume2 size={16} className="text-[#aaa]" />
              <span className="text-[13px] text-white font-medium">Playback Volume</span>
            </div>
            <span className="text-[13px] text-rose-400 font-bold tabular-nums">{Math.round(volume * 100)}%</span>
          </div>
          <input type="range" min="0" max="1" step="0.01" value={volume}
            onChange={e => setVolume(parseFloat(e.target.value))}
            className="w-full h-2 rounded-full appearance-none bg-white/10 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md" />
        </div>
      </Section>

      {/* EQ */}
      <Section title="Equalizer">
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 mb-3">
            <SlidersHorizontal size={14} className="text-[#888]" />
            <span className="text-[12px] text-[#888]">Sound profile</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {EQ_PRESETS.map(p => (
              <button key={p.name} onClick={() => handleEq(p.name)}
                className={`flex flex-col items-center gap-0.5 py-3 rounded-xl transition-all btn-press ${
                  eqPreset === p.name ? 'bg-rose-500/15 ring-1 ring-rose-500/40' : 'bg-white/[0.04] hover:bg-white/[0.08]'
                }`}>
                <span className={`text-[12px] font-semibold ${eqPreset === p.name ? 'text-rose-300' : 'text-white'}`}>{p.name}</span>
                <span className="text-[9px] text-[#666]">{p.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Crossfade */}
      <Section title="Crossfade">
        <Item icon={Timer} label="Song Transition" desc={crossfade === 0 ? 'Off' : `${crossfade}s smooth fade`}>
          <input type="range" min="0" max="30" step="1" value={crossfade}
            onChange={e => handleCrossfade(parseInt(e.target.value))}
            className="w-20 h-1.5 rounded-full appearance-none bg-white/10 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white" />
        </Item>
      </Section>

      {/* Data */}
      <Section title="Data & Storage">
        <Item icon={Trash2} label="Clear History" desc="Remove listening history">
          <button onClick={clearHistory} className="px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] rounded-lg text-[11px] text-white font-medium transition-colors btn-press">
            Clear
          </button>
        </Item>
        <Item icon={Trash2} label="Clear Cache" desc={`${getCacheSize()} items`}>
          <button onClick={() => { clearCache(); showToast('Cache cleared'); }} className="px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] rounded-lg text-[11px] text-white font-medium transition-colors btn-press">
            Clear
          </button>
        </Item>
        <Item icon={Shield} label="Reset App" desc="Clear everything, start fresh">
          <button onClick={clearAllData} className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg text-[11px] text-rose-400 font-medium transition-colors btn-press">
            Reset
          </button>
        </Item>
      </Section>

      {/* About */}
      <Section title="About">
        <Item icon={Info} label="Music Area" desc="v2.0 — Ad-free music streaming">
          <span className="text-[11px] text-[#555]">v2.0</span>
        </Item>
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-5">
      <p className="text-[11px] text-[#888] uppercase tracking-wider font-medium mb-2 px-1">{title}</p>
      <div className="bg-[#0e0e0e] rounded-2xl border border-white/[0.04] overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function Item({ icon: Icon, label, desc, children }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.03] last:border-0">
      <div className="w-9 h-9 rounded-xl bg-white/[0.04] flex items-center justify-center shrink-0">
        <Icon size={16} className="text-[#aaa]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-white font-medium">{label}</p>
        <p className="text-[11px] text-[#666]">{desc}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
