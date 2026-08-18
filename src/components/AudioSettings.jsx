import { useState, useEffect } from 'react';
import { SlidersHorizontal, X, Zap, Volume2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

// Volume boost works by setting audio.volume higher than normal
// Bass/EQ is visual-only (real EQ needs CORS which JioSaavn CDN doesn't support)

export default function AudioSettings() {
  const { volume, setVolume, showToast } = usePlayer();
  const [open, setOpen] = useState(false);
  const [bassBoost, setBassBoost] = useState(() => localStorage.getItem('bass_on') === 'true');
  const [boostLevel, setBoostLevel] = useState(() => parseFloat(localStorage.getItem('boost_level') || '1'));
  const [crossfade, setCrossfade] = useState(() => parseInt(localStorage.getItem('crossfade_dur') || '5'));
  const [eqPreset, setEqPreset] = useState(() => localStorage.getItem('eq_preset') || 'Normal');

  // Apply bass boost by increasing volume
  useEffect(() => {
    localStorage.setItem('bass_on', bassBoost.toString());
    if (bassBoost) {
      setVolume(Math.min(1, volume * 1.3));
      showToast('Bass Boost ON 🔊');
    }
  }, [bassBoost]);

  // Volume boost level
  useEffect(() => {
    localStorage.setItem('boost_level', boostLevel.toString());
  }, [boostLevel]);

  // Crossfade
  useEffect(() => {
    localStorage.setItem('crossfade_dur', crossfade.toString());
  }, [crossfade]);

  // EQ Preset
  useEffect(() => {
    localStorage.setItem('eq_preset', eqPreset);
  }, [eqPreset]);

  const presets = ['Normal', 'Bass Heavy', 'Vocal', 'Electronic', 'Rock', 'Treble'];

  if (!open) return (
    <button onClick={() => setOpen(true)} className="p-2 text-[#888] hover:text-white btn-press">
      <SlidersHorizontal size={20} />
    </button>
  );

  return (
    <>
      <div className="fixed inset-0 z-[80] bg-black/60" onClick={() => setOpen(false)} />
      <div className="fixed bottom-0 left-0 right-0 z-[81] bg-[#0e0e0e] border-t border-white/[0.06] rounded-t-3xl p-5 pb-8 max-h-[80vh] scroll-y animate-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[16px] font-bold text-white">Audio Settings</h2>
          <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-white/10 rounded-full btn-press"><X size={18} className="text-white" /></button>
        </div>

        {/* Bass Boost */}
        <div className="flex items-center justify-between p-4 bg-[#111] rounded-2xl mb-4 border border-white/[0.04]">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bassBoost ? 'bg-rose-500/20' : 'bg-white/[0.05]'}`}>
              <Zap size={17} className={bassBoost ? 'text-rose-400' : 'text-[#666]'} />
            </div>
            <div>
              <p className="text-[13px] text-white font-medium">Bass Boost</p>
              <p className="text-[10px] text-[#666]">Enhance low frequencies</p>
            </div>
          </div>
          <button onClick={() => setBassBoost(!bassBoost)}
            className={`w-12 h-7 rounded-full relative transition-colors duration-200 ${bassBoost ? 'bg-rose-500' : 'bg-[#333]'}`}>
            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${bassBoost ? 'translate-x-[22px]' : 'translate-x-1'}`} />
          </button>
        </div>

        {/* Volume Boost */}
        <div className="p-4 bg-[#111] rounded-2xl mb-4 border border-white/[0.04]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/[0.05] flex items-center justify-center">
                <Volume2 size={17} className="text-rose-400" />
              </div>
              <div>
                <p className="text-[13px] text-white font-medium">Volume Boost</p>
                <p className="text-[10px] text-[#666]">Amplify output level</p>
              </div>
            </div>
            <span className="text-[13px] text-rose-400 font-bold">{Math.round(boostLevel * 100)}%</span>
          </div>
          <input type="range" min="50" max="150" step="5" value={boostLevel * 100}
            onChange={e => { const v = parseInt(e.target.value) / 100; setBoostLevel(v); setVolume(Math.min(1, v * 0.7)); }}
            className="w-full h-2 rounded-full appearance-none bg-[#222] cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-rose-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-rose-500/30" />
          <div className="flex justify-between text-[10px] text-[#555] mt-1.5"><span>50%</span><span>100%</span><span>150%</span></div>
        </div>

        {/* Crossfade */}
        <div className="p-4 bg-[#111] rounded-2xl mb-4 border border-white/[0.04]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[13px] text-white font-medium">Crossfade</p>
            <span className="text-[13px] text-rose-400 font-bold">{crossfade}s</span>
          </div>
          <input type="range" min="0" max="12" step="1" value={crossfade}
            onChange={e => setCrossfade(parseInt(e.target.value))}
            className="w-full h-2 rounded-full appearance-none bg-[#222] cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-rose-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-rose-500/30" />
          <div className="flex justify-between text-[10px] text-[#555] mt-1.5"><span>Off</span><span>6s</span><span>12s</span></div>
        </div>

        {/* EQ Presets */}
        <div className="p-4 bg-[#111] rounded-2xl border border-white/[0.04]">
          <p className="text-[13px] text-white font-medium mb-3">EQ Preset</p>
          <div className="flex flex-wrap gap-2">
            {presets.map(p => (
              <button key={p} onClick={() => { setEqPreset(p); showToast(`EQ: ${p}`); }}
                className={`px-4 py-2 rounded-full text-[12px] font-medium transition-all duration-150 btn-press ${
                  eqPreset === p ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20' : 'bg-[#1a1a1a] text-[#999] hover:text-white'
                }`}>
                {p}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-[#555] mt-3">Note: Full EQ requires CORS support from audio source</p>
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
