import { useState } from 'react';
import { Timer, Trash2, Info, Wifi, Volume2, Shield, Headphones, Zap, Bell } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { clearCache, getCacheSize, getQuality, setQuality } from '../data/api';

export default function Settings() {
  const { volume, setVolume, showToast } = usePlayer();
  const [crossfade, setCrossfade] = useState(() => parseInt(localStorage.getItem('crossfade_dur') || '5'));
  const [streamQuality, setStreamQuality] = useState(() => getQuality());
  const [notifications, setNotifications] = useState(true);

  const handleCrossfade = (val) => {
    setCrossfade(val);
    localStorage.setItem('crossfade_dur', val.toString());
  };

  const handleQuality = (q) => {
    setQuality(q);
    setStreamQuality(q);
    showToast(`Quality: ${q === 'auto' ? 'Auto (recommended)' : q}`);
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

      {/* Audio Quality */}
      <Section title="Audio Quality">
        <SettingRow icon={Wifi} label="Streaming" desc="Quality adjusts to your connection">
          <select value={streamQuality} onChange={e => handleQuality(e.target.value)}
            className="bg-white/[0.06] text-white text-[12px] font-medium px-3 py-2 rounded-xl border border-white/[0.06] outline-none cursor-pointer appearance-none">
            <option value="auto" className="bg-[#1a1a1a]">Auto</option>
            <option value="320kbps" className="bg-[#1a1a1a]">320kbps HD</option>
            <option value="160kbps" className="bg-[#1a1a1a]">160kbps</option>
            <option value="96kbps" className="bg-[#1a1a1a]">96kbps</option>
            <option value="48kbps" className="bg-[#1a1a1a]">48kbps</option>
          </select>
        </SettingRow>
        <SettingRow icon={Headphones} label="Download Quality" desc="For offline songs">
          <span className="text-[12px] text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-lg">320kbps</span>
        </SettingRow>
      </Section>

      {/* Playback */}
      <Section title="Playback">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <Volume2 size={16} className="text-[#aaa]" />
              <span className="text-[13px] text-white font-medium">Volume</span>
            </div>
            <span className="text-[12px] text-rose-400 font-bold tabular-nums w-10 text-right">{Math.round(volume * 100)}%</span>
          </div>
          <input type="range" min="0" max="1" step="0.01" value={volume}
            onChange={e => setVolume(parseFloat(e.target.value))}
            className="w-full h-[6px] rounded-full appearance-none bg-white/[0.08] cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:shadow-white/20" />
        </div>
        <div className="px-4 py-4 border-t border-white/[0.04]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <Timer size={16} className="text-[#aaa]" />
              <div>
                <span className="text-[13px] text-white font-medium">Crossfade</span>
                <p className="text-[10px] text-[#666]">Smooth transition between songs</p>
              </div>
            </div>
            <span className="text-[12px] text-rose-400 font-bold tabular-nums w-10 text-right">{crossfade === 0 ? 'Off' : `${crossfade}s`}</span>
          </div>
          <input type="range" min="0" max="12" step="1" value={crossfade}
            onChange={e => handleCrossfade(parseInt(e.target.value))}
            className="w-full h-[6px] rounded-full appearance-none bg-white/[0.08] cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:shadow-white/20" />
        </div>
        <SettingRow icon={Zap} label="Gapless Playback" desc="No silence between tracks">
          <Toggle on={true} disabled />
        </SettingRow>
      </Section>

      {/* Notifications */}
      <Section title="Notifications">
        <SettingRow icon={Bell} label="Push Notifications" desc="New releases & recommendations">
          <Toggle on={notifications} onChange={v => setNotifications(v)} />
        </SettingRow>
      </Section>

      {/* Data & Privacy */}
      <Section title="Data & Privacy">
        <SettingRow icon={Trash2} label="Clear History" desc="Remove all listening history">
          <button onClick={clearHistory} className="px-3.5 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] rounded-xl text-[11px] text-white font-medium transition-colors btn-press">
            Clear
          </button>
        </SettingRow>
        <SettingRow icon={Trash2} label="Clear Cache" desc={`${getCacheSize()} cached items`}>
          <button onClick={() => { clearCache(); showToast('Cache cleared'); }} className="px-3.5 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] rounded-xl text-[11px] text-white font-medium transition-colors btn-press">
            Clear
          </button>
        </SettingRow>
        <SettingRow icon={Shield} label="Reset Everything" desc="Clear all data and start fresh">
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
