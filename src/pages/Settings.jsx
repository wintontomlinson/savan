import { useState } from 'react';
import { Timer, Trash2, Info, Wifi, Moon, Volume2, Download, Shield } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { clearCache, getCacheSize } from '../data/api';

export default function Settings() {
  const { showToast } = usePlayer();
  const [crossfade, setCrossfade] = useState(() => parseInt(localStorage.getItem('crossfade_dur') || '5'));

  const handleCrossfade = (val) => {
    setCrossfade(val);
    localStorage.setItem('crossfade_dur', val.toString());
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

  const cacheSize = getCacheSize();

  return (
    <div className="pb-6 pt-2 max-w-lg">
      <h1 className="text-xl font-bold text-white mb-6">Settings</h1>

      {/* Audio */}
      <Section title="Audio">
        <Item icon={Timer} label="Crossfade" desc={`${crossfade}s transition between songs`}>
          <input type="range" min="0" max="12" step="1" value={crossfade}
            onChange={e => handleCrossfade(parseInt(e.target.value))}
            className="w-24 h-1.5 rounded-full appearance-none bg-white/10 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white" />
        </Item>
        <Item icon={Wifi} label="Stream Quality" desc="Auto — adjusts to your network speed">
          <span className="text-[12px] text-rose-400 font-medium">Auto</span>
        </Item>
        <Item icon={Volume2} label="Normalize Volume" desc="Same loudness across songs">
          <Toggle defaultOn={false} onToggle={(v) => showToast(v ? 'Coming soon' : '')} />
        </Item>
      </Section>

      {/* Playback */}
      <Section title="Playback">
        <Item icon={Download} label="Download Quality" desc="320kbps HD for downloads">
          <span className="text-[12px] text-emerald-400 font-medium">HD</span>
        </Item>
        <Item icon={Moon} label="Sleep Timer" desc="Available in Now Playing screen">
          <span className="text-[11px] text-[#666]">In Player →</span>
        </Item>
      </Section>

      {/* Data */}
      <Section title="Data & Storage">
        <Item icon={Trash2} label="Clear Listening History" desc="Remove all played songs history">
          <button onClick={clearHistory} className="px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] rounded-lg text-[11px] text-white font-medium transition-colors btn-press">
            Clear
          </button>
        </Item>
        <Item icon={Trash2} label="Clear Cache" desc={`${cacheSize} items cached`}>
          <button onClick={() => { clearCache(); showToast('Cache cleared'); }} className="px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] rounded-lg text-[11px] text-white font-medium transition-colors btn-press">
            Clear
          </button>
        </Item>
        <Item icon={Shield} label="Reset Everything" desc="Clear all data and start fresh">
          <button onClick={clearAllData} className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg text-[11px] text-rose-400 font-medium transition-colors btn-press">
            Reset
          </button>
        </Item>
      </Section>

      {/* About */}
      <Section title="About">
        <Item icon={Info} label="Music Area" desc="Version 2.0 — Built with ❤️">
          <span className="text-[11px] text-[#666]">v2.0</span>
        </Item>
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <p className="text-[11px] text-[#888] uppercase tracking-wider font-medium mb-2 px-1">{title}</p>
      <div className="bg-[#0e0e0e] rounded-2xl border border-white/[0.04] divide-y divide-white/[0.04] overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function Item({ icon: Icon, label, desc, children }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className="w-9 h-9 rounded-xl bg-white/[0.04] flex items-center justify-center shrink-0">
        <Icon size={17} className="text-[#aaa]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-white font-medium">{label}</p>
        <p className="text-[11px] text-[#666] truncate">{desc}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ defaultOn = false, onToggle }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button onClick={() => { const v = !on; setOn(v); onToggle?.(v); }}
      className={`w-[44px] h-[26px] rounded-full relative transition-all duration-200 ${on ? 'bg-rose-500' : 'bg-[#333]'}`}>
      <div className={`absolute top-[3px] w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${on ? 'translate-x-[21px]' : 'translate-x-[3px]'}`} />
    </button>
  );
}
