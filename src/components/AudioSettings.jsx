import { useState, useEffect, useRef } from 'react';
import { SlidersHorizontal, X, Zap, Volume2 } from 'lucide-react';

// Audio processing state (module-level, persists across renders)
let ctx = null;
let gainNode = null;
let bassFilter = null;
let eqFilters = [];
let sourceA = null;
let sourceB = null;
let initialized = false;

const BANDS = [
  { freq: 60, label: 'Bass' },
  { freq: 250, label: 'Low' },
  { freq: 1000, label: 'Mid' },
  { freq: 4000, label: 'High' },
  { freq: 12000, label: 'Air' },
];

// Call this ONCE after first user interaction with both audio elements
export function initAudioProcessing(audioA, audioB) {
  if (initialized || !audioA || !audioB) return;
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();

    // Create processing chain
    gainNode = ctx.createGain();
    gainNode.gain.value = parseFloat(localStorage.getItem('extra_vol') || '1');

    bassFilter = ctx.createBiquadFilter();
    bassFilter.type = 'lowshelf';
    bassFilter.frequency.value = 120;
    bassFilter.gain.value = localStorage.getItem('bass_on') === 'true' ? 12 : 0;

    eqFilters = BANDS.map(b => {
      const f = ctx.createBiquadFilter();
      f.type = 'peaking';
      f.frequency.value = b.freq;
      f.Q.value = 1.2;
      f.gain.value = 0;
      return f;
    });

    // Load saved EQ
    try {
      const saved = JSON.parse(localStorage.getItem('eq_vals') || '[]');
      if (saved.length === 5) eqFilters.forEach((f, i) => f.gain.value = saved[i]);
    } catch {}

    // Connect both audio sources through same chain
    sourceA = ctx.createMediaElementSource(audioA);
    sourceB = ctx.createMediaElementSource(audioB);

    // Both sources → gain → EQ → bass → destination
    const merger = ctx.createChannelMerger(2);
    sourceA.connect(merger, 0, 0);
    sourceB.connect(merger, 0, 0);

    let prev = merger;
    prev.connect(gainNode);
    prev = gainNode;
    eqFilters.forEach(f => { prev.connect(f); prev = f; });
    prev.connect(bassFilter);
    bassFilter.connect(ctx.destination);

    initialized = true;
  } catch (e) {
    console.warn('Audio processing init failed:', e);
    // Fallback direct
    try {
      if (sourceA) sourceA.connect(ctx.destination);
      if (sourceB) sourceB.connect(ctx.destination);
    } catch {}
  }
}

export function resumeAudioContext() {
  if (ctx?.state === 'suspended') ctx.resume();
}

export default function AudioSettings() {
  const [open, setOpen] = useState(false);
  const [bassOn, setBassOn] = useState(() => localStorage.getItem('bass_on') === 'true');
  const [extraVol, setExtraVol] = useState(() => parseFloat(localStorage.getItem('extra_vol') || '1'));
  const [eqVals, setEqVals] = useState(() => {
    try { const s = JSON.parse(localStorage.getItem('eq_vals')); return s?.length === 5 ? s : [0,0,0,0,0]; }
    catch { return [0,0,0,0,0]; }
  });
  const [crossfade, setCrossfade] = useState(() => parseInt(localStorage.getItem('crossfade_dur') || '5'));

  // Apply bass boost
  useEffect(() => {
    if (bassFilter) bassFilter.gain.value = bassOn ? 12 : 0;
    localStorage.setItem('bass_on', bassOn.toString());
  }, [bassOn]);

  // Apply extra volume (1.0 = normal, up to 3.0 = 300%)
  useEffect(() => {
    if (gainNode) gainNode.gain.value = extraVol;
    localStorage.setItem('extra_vol', extraVol.toString());
  }, [extraVol]);

  // Apply EQ
  useEffect(() => {
    eqFilters.forEach((f, i) => { if (f) f.gain.value = eqVals[i]; });
    localStorage.setItem('eq_vals', JSON.stringify(eqVals));
  }, [eqVals]);

  // Crossfade duration
  useEffect(() => { localStorage.setItem('crossfade_dur', crossfade.toString()); }, [crossfade]);

  const presets = {
    Flat: [0,0,0,0,0],
    'Bass Heavy': [8,5,0,-2,-1],
    Vocal: [-2,0,5,3,1],
    Electronic: [4,2,0,3,5],
    Rock: [5,3,-1,3,4],
  };

  if (!open) return (
    <button onClick={() => setOpen(true)} className="p-2 text-[#888] hover:text-white active:scale-90 transition-transform">
      <SlidersHorizontal size={20} />
    </button>
  );

  return (
    <>
      <div className="fixed inset-0 z-[80] bg-black/60" onClick={() => setOpen(false)} />
      <div className="fixed bottom-0 left-0 right-0 z-[81] bg-[#111] border-t border-[#222] rounded-t-3xl p-5 pb-8 max-h-[85vh] scroll-y animate-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[15px] font-bold text-white">Audio Settings</h2>
          <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-[#222] rounded-full"><X size={18} className="text-white" /></button>
        </div>

        {/* Bass Boost */}
        <div className="flex items-center justify-between p-3.5 bg-[#1a1a1a] rounded-2xl mb-4">
          <div className="flex items-center gap-2.5">
            <Zap size={18} className={bassOn ? 'text-[#FF0000]' : 'text-[#555]'} />
            <span className="text-[13px] text-white font-medium">Bass Boost</span>
          </div>
          <button onClick={() => setBassOn(!bassOn)}
            className={`w-12 h-7 rounded-full relative transition-colors ${bassOn ? 'bg-[#FF0000]' : 'bg-[#333]'}`}>
            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow ${bassOn ? 'translate-x-[22px]' : 'translate-x-1'}`} />
          </button>
        </div>

        {/* Extra Volume */}
        <div className="p-3.5 bg-[#1a1a1a] rounded-2xl mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Volume2 size={16} className="text-[#FF0000]" />
              <span className="text-[13px] text-white font-medium">Volume Boost</span>
            </div>
            <span className="text-[12px] text-[#FF0000] font-bold">{Math.round(extraVol * 100)}%</span>
          </div>
          <input type="range" min="0.5" max="3" step="0.1" value={extraVol}
            onChange={e => setExtraVol(parseFloat(e.target.value))}
            className="w-full h-2 rounded-full appearance-none bg-[#333] cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FF0000] [&::-webkit-slider-thumb]:shadow-lg" />
          <div className="flex justify-between text-[10px] text-[#555] mt-1"><span>50%</span><span>100%</span><span>200%</span><span>300%</span></div>
        </div>

        {/* Crossfade */}
        <div className="p-3.5 bg-[#1a1a1a] rounded-2xl mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] text-white font-medium">Crossfade</span>
            <span className="text-[12px] text-[#FF0000] font-bold">{crossfade}s</span>
          </div>
          <input type="range" min="0" max="12" step="1" value={crossfade}
            onChange={e => setCrossfade(parseInt(e.target.value))}
            className="w-full h-2 rounded-full appearance-none bg-[#333] cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FF0000] [&::-webkit-slider-thumb]:shadow-lg" />
          <div className="flex justify-between text-[10px] text-[#555] mt-1"><span>Off</span><span>6s</span><span>12s</span></div>
        </div>

        {/* EQ Presets */}
        <div className="mb-4">
          <p className="text-[11px] text-[#555] uppercase font-medium mb-2">EQ Presets</p>
          <div className="flex gap-2 scroll-x pb-1">
            {Object.entries(presets).map(([name, vals]) => (
              <button key={name} onClick={() => setEqVals(vals)}
                className={`px-3.5 py-2 rounded-full text-[11px] font-medium shrink-0 transition-all active:scale-95 ${JSON.stringify(eqVals) === JSON.stringify(vals) ? 'bg-[#FF0000] text-white' : 'bg-[#222] text-[#999]'}`}
              >{name}</button>
            ))}
          </div>
        </div>

        {/* EQ Sliders */}
        <div className="flex justify-between items-end gap-3 px-1">
          {BANDS.map((b, i) => (
            <div key={b.freq} className="flex flex-col items-center gap-2 flex-1">
              <span className="text-[10px] text-[#FF0000] font-bold tabular-nums">{eqVals[i] > 0 ? '+' : ''}{eqVals[i]}</span>
              <div className="relative h-24 flex justify-center">
                <input type="range" min="-10" max="10" step="1" value={eqVals[i]}
                  onChange={e => { const v = [...eqVals]; v[i] = parseInt(e.target.value); setEqVals(v); }}
                  className="absolute h-24 w-7 appearance-none bg-transparent cursor-pointer [writing-mode:vertical-lr] [direction:rtl] [&::-webkit-slider-track]:w-2 [&::-webkit-slider-track]:rounded-full [&::-webkit-slider-track]:bg-[#333] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg" />
              </div>
              <span className="text-[9px] text-[#555] font-medium">{b.label}</span>
            </div>
          ))}
        </div>

        <button onClick={() => setEqVals([0,0,0,0,0])} className="mt-5 w-full py-3 text-[12px] text-[#999] bg-[#1a1a1a] rounded-xl active:bg-[#222] font-medium">Reset EQ</button>
      </div>
    </>
  );
}

export function getCrossfadeDuration() {
  try { return parseInt(localStorage.getItem('crossfade_dur')) || 5; } catch { return 5; }
}
