import { useState, useEffect } from 'react';
import { SlidersHorizontal, X, Zap } from 'lucide-react';

// Web Audio API EQ + Bass Boost
let audioContext = null;
let sourceNode = null;
let bands = [];
let bassBoostFilter = null;
let connected = false;

const BANDS = [
  { freq: 60, label: 'Bass' },
  { freq: 250, label: 'Low' },
  { freq: 1000, label: 'Mid' },
  { freq: 4000, label: 'High' },
  { freq: 12000, label: 'Air' },
];

function initAudioContext(audioElement) {
  if (connected || !audioElement) return;
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    sourceNode = audioContext.createMediaElementSource(audioElement);

    // Create EQ bands
    bands = BANDS.map(b => {
      const filter = audioContext.createBiquadFilter();
      filter.type = 'peaking';
      filter.frequency.value = b.freq;
      filter.Q.value = 1.4;
      filter.gain.value = 0;
      return filter;
    });

    // Bass boost filter
    bassBoostFilter = audioContext.createBiquadFilter();
    bassBoostFilter.type = 'lowshelf';
    bassBoostFilter.frequency.value = 150;
    bassBoostFilter.gain.value = 0;

    // Chain: source → bands → bassBoost → destination
    let prev = sourceNode;
    bands.forEach(b => { prev.connect(b); prev = b; });
    prev.connect(bassBoostFilter);
    bassBoostFilter.connect(audioContext.destination);

    connected = true;
  } catch (e) {
    // Fallback: direct connect
    if (sourceNode && audioContext) sourceNode.connect(audioContext.destination);
  }
}

export function connectAudio(audioElement) {
  if (!connected) initAudioContext(audioElement);
  if (audioContext?.state === 'suspended') audioContext.resume();
}

export default function AudioSettings({ audioA, audioB }) {
  const [open, setOpen] = useState(false);
  const [eqValues, setEqValues] = useState(() => {
    try { return JSON.parse(localStorage.getItem('eq_values')) || [0, 0, 0, 0, 0]; }
    catch { return [0, 0, 0, 0, 0]; }
  });
  const [bassBoost, setBassBoost] = useState(() => {
    try { return localStorage.getItem('bass_boost') === 'true'; }
    catch { return false; }
  });
  const [crossfade, setCrossfade] = useState(() => {
    try { return parseInt(localStorage.getItem('crossfade_dur')) || 5; }
    catch { return 5; }
  });

  // Apply EQ values
  useEffect(() => {
    if (!connected) return;
    bands.forEach((b, i) => { b.gain.value = eqValues[i]; });
    try { localStorage.setItem('eq_values', JSON.stringify(eqValues)); } catch {}
  }, [eqValues]);

  // Apply bass boost
  useEffect(() => {
    if (bassBoostFilter) bassBoostFilter.gain.value = bassBoost ? 10 : 0;
    try { localStorage.setItem('bass_boost', bassBoost.toString()); } catch {}
  }, [bassBoost]);

  // Save crossfade
  useEffect(() => {
    try { localStorage.setItem('crossfade_dur', crossfade.toString()); } catch {}
  }, [crossfade]);

  const setEqBand = (index, value) => {
    setEqValues(prev => { const n = [...prev]; n[index] = value; return n; });
  };

  const resetEq = () => setEqValues([0, 0, 0, 0, 0]);

  // Presets
  const presets = {
    Flat: [0, 0, 0, 0, 0],
    'Bass Heavy': [8, 5, 0, -2, -1],
    Vocal: [-2, 0, 4, 3, 0],
    Electronic: [4, 2, 0, 3, 5],
    Rock: [5, 3, -1, 2, 4],
  };

  if (!open) {
    return (
      <button onClick={() => { setOpen(true); connectAudio(audioA); }} className="p-2 text-[#888] hover:text-white active:scale-90 transition-transform">
        <SlidersHorizontal size={20} />
      </button>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="fixed bottom-0 left-0 right-0 z-[81] bg-[#111] border-t border-[#222] rounded-t-3xl p-5 pb-8 max-h-[80vh] scroll-area" style={{ animation: 'slideUp 0.3s ease-out' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-white">Audio Settings</h2>
          <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-[#222] rounded-full"><X size={20} className="text-white" /></button>
        </div>

        {/* Bass Boost */}
        <div className="flex items-center justify-between mb-5 p-3 bg-[#1a1a1a] rounded-xl">
          <div className="flex items-center gap-2">
            <Zap size={18} className={bassBoost ? 'text-[#FF0000]' : 'text-[#666]'} />
            <span className="text-[13px] text-white font-medium">Bass Boost</span>
          </div>
          <button onClick={() => setBassBoost(!bassBoost)}
            className={`w-11 h-6 rounded-full transition-colors relative ${bassBoost ? 'bg-[#FF0000]' : 'bg-[#333]'}`}>
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${bassBoost ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
          </button>
        </div>

        {/* Crossfade */}
        <div className="mb-5 p-3 bg-[#1a1a1a] rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] text-white font-medium">Crossfade</span>
            <span className="text-[12px] text-[#FF0000] font-medium">{crossfade}s</span>
          </div>
          <input type="range" min="0" max="12" step="1" value={crossfade}
            onChange={e => setCrossfade(parseInt(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none bg-[#333] cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FF0000]" />
          <div className="flex justify-between text-[10px] text-[#555] mt-1"><span>Off</span><span>12s</span></div>
        </div>

        {/* EQ Presets */}
        <div className="mb-4">
          <p className="text-[12px] text-[#666] mb-2">Presets</p>
          <div className="flex gap-2 scroll-x pb-1">
            {Object.entries(presets).map(([name, vals]) => (
              <button key={name} onClick={() => setEqValues(vals)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-medium shrink-0 ${JSON.stringify(eqValues) === JSON.stringify(vals) ? 'bg-[#FF0000] text-white' : 'bg-[#222] text-[#999]'}`}
              >{name}</button>
            ))}
          </div>
        </div>

        {/* EQ Sliders */}
        <div className="flex justify-between items-end gap-2 px-2">
          {BANDS.map((b, i) => (
            <div key={b.freq} className="flex flex-col items-center gap-2 flex-1">
              <span className="text-[10px] text-[#FF0000] font-medium">{eqValues[i] > 0 ? '+' : ''}{eqValues[i]}</span>
              <div className="relative h-28 w-full flex justify-center">
                <input type="range" min="-10" max="10" step="1" value={eqValues[i]}
                  onChange={e => setEqBand(i, parseInt(e.target.value))}
                  className="absolute h-28 w-6 appearance-none bg-transparent cursor-pointer [writing-mode:vertical-lr] [direction:rtl] [&::-webkit-slider-track]:w-1.5 [&::-webkit-slider-track]:rounded-full [&::-webkit-slider-track]:bg-[#333] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md" />
              </div>
              <span className="text-[9px] text-[#666]">{b.label}</span>
            </div>
          ))}
        </div>

        {/* Reset */}
        <button onClick={resetEq} className="mt-4 w-full py-2.5 text-[12px] text-[#999] bg-[#1a1a1a] rounded-xl active:bg-[#222]">Reset EQ</button>
      </div>
    </>
  );
}

export function getCrossfadeDuration() {
  try { return parseInt(localStorage.getItem('crossfade_dur')) || 5; }
  catch { return 5; }
}
