import { useState } from 'react';
import { AudioWaveform, Gauge, Trash2, RefreshCw, ShieldAlert, Info, SlidersHorizontal } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { clearCache, getCacheSize } from '../data/api';

const EQ_BANDS = ['31', '63', '125', '250', '500', '1K', '2K', '4K', '8K', '16K'];
const FLAT = Array(10).fill(0);

const EQ_PRESETS = [
  { name: 'Flat', gains: FLAT },
  { name: 'Bass Boost', gains: [6, 5, 4, 2, 0, 0, 0, 0, 0, 0] },
  { name: 'Treble', gains: [0, 0, 0, 0, 0, 1, 2, 4, 5, 6] },
  { name: 'Vocal', gains: [-3, -2, 0, 2, 4, 5, 4, 2, 0, -1] },
  { name: 'Rock', gains: [5, 4, 2, 0, -1, -1, 1, 3, 4, 5] },
  { name: 'Pop', gains: [-1, 1, 3, 4, 3, 1, 0, -1, -2, -2] },
  { name: 'Hip-Hop', gains: [5, 4, 2, 3, -1, -1, 2, 0, 1, 3] },
  { name: 'EDM', gains: [4, 3, 1, 0, -2, 0, 1, 3, 4, 5] },
  { name: 'Acoustic', gains: [3, 2, 0, 1, 2, 2, 1, 2, 3, 2] },
  { name: 'Classical', gains: [4, 3, 2, 1, 0, 0, 0, 2, 3, 4] },
];

function readNumber(key, fallback) {
  const value = parseInt(localStorage.getItem(key), 10);
  return Number.isFinite(value) ? value : fallback;
}

export default function Settings() {
  const { boostLevel, setVolumeBoost, applyEqPreset, setEqBand, resetAudio, showToast } = usePlayer();

  const [crossfade, setCrossfade] = useState(() => readNumber('crossfade_dur', 0));
  const [preset, setPreset] = useState(() => localStorage.getItem('ma_eq_preset') || 'Flat');
  const [gains, setGains] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('ma_eq_values'));
      return Array.isArray(saved) && saved.length === 10 ? saved : FLAT;
    } catch {
      return FLAT;
    }
  });
  const [cacheSize, setCacheSize] = useState(getCacheSize);

  const persist = (nextPreset, nextGains) => {
    try {
      localStorage.setItem('ma_eq_preset', nextPreset);
      localStorage.setItem('ma_eq_values', JSON.stringify(nextGains));
    } catch {}
  };

  const choosePreset = (item) => {
    setPreset(item.name);
    setGains(item.gains);
    applyEqPreset(item.gains);
    persist(item.name, item.gains);
  };

  const changeBand = (index, value) => {
    const next = [...gains];
    next[index] = value;
    setGains(next);
    setEqBand(index, value);
    setPreset('Custom');
    persist('Custom', next);
  };

  const changeCrossfade = (value) => {
    setCrossfade(value);
    try {
      localStorage.setItem('crossfade_dur', String(value));
    } catch {}
  };

  const resetSound = () => {
    resetAudio();
    choosePreset(EQ_PRESETS[0]);
    changeCrossfade(0);
    showToast('Sound settings reset');
  };

  return (
    <div className="mx-auto max-w-3xl pt-6">
      <header className="mb-8">
        <h1 className="text-[26px] font-bold tracking-tight sm:text-[32px]">Settings</h1>
        <p className="mt-1 text-[13px] text-white/40">Tune playback and manage what is stored on this device.</p>
      </header>

      {/* ---------- Sound ---------- */}
      <Group icon={AudioWaveform} title="Sound" hint="Output level and equaliser, applied live via the Web Audio API.">
        <Row label="Output level" value={`${boostLevel}%`} accent={boostLevel > 100}>
          <input
            type="range"
            min="0"
            max="200"
            step="5"
            value={boostLevel}
            onChange={(e) => setVolumeBoost(parseInt(e.target.value, 10))}
            aria-label="Output level"
            className="slider mt-1"
            style={{
              background: `linear-gradient(to right, ${boostLevel > 100 ? '#fb923c' : '#fff'} ${(boostLevel / 200) * 100}%, rgba(255,255,255,0.14) ${(boostLevel / 200) * 100}%)`,
            }}
          />
          <Ticks labels={['0%', '100%', '200%']} />
          {boostLevel > 100 && (
            <p className="mt-2 text-[11px] text-orange-300/80">
              Above 100% the signal is amplified in software — compression keeps it from clipping, but keep an eye on
              your ears.
            </p>
          )}
        </Row>

        <Row label="Equaliser preset" value={preset}>
          <div className="scroll-x -mx-1 mt-1 flex gap-2 px-1 pb-1">
            {EQ_PRESETS.map((item) => (
              <button
                key={item.name}
                onClick={() => choosePreset(item)}
                data-active={preset === item.name}
                className="chip shrink-0"
              >
                {item.name}
              </button>
            ))}
          </div>
        </Row>

        <Row label="10-band equaliser" value={`${gains.filter((g) => g !== 0).length} bands adjusted`}>
          <div className="scroll-x -mx-1 flex gap-1 px-1 pt-2">
            {EQ_BANDS.map((band, i) => (
              <div key={band} className="flex w-[42px] shrink-0 flex-col items-center gap-1.5">
                <span
                  className={`text-[10px] font-bold tabular-nums ${
                    gains[i] > 0 ? 'text-accent' : gains[i] < 0 ? 'text-sky-400' : 'text-white/25'
                  }`}
                >
                  {gains[i] > 0 ? '+' : ''}
                  {gains[i]}
                </span>
                <input
                  type="range"
                  min="-8"
                  max="8"
                  step="1"
                  value={gains[i]}
                  onChange={(e) => changeBand(i, parseInt(e.target.value, 10))}
                  aria-label={`${band} hertz`}
                  className="slider-v"
                />
                <span className={`text-[9px] ${gains[i] !== 0 ? 'text-white/55' : 'text-white/20'}`}>{band}</span>
              </div>
            ))}
          </div>
        </Row>
      </Group>

      {/* ---------- Playback ---------- */}
      <Group icon={Gauge} title="Playback" hint="How one track hands over to the next.">
        <Row label="Crossfade" value={crossfade === 0 ? 'Off' : `${crossfade}s`}>
          <input
            type="range"
            min="0"
            max="12"
            step="1"
            value={crossfade}
            onChange={(e) => changeCrossfade(parseInt(e.target.value, 10))}
            aria-label="Crossfade duration"
            className="slider mt-1"
            style={{
              background: `linear-gradient(to right, #fff ${(crossfade / 12) * 100}%, rgba(255,255,255,0.14) ${(crossfade / 12) * 100}%)`,
            }}
          />
          <Ticks labels={['Off', '6s', '12s']} />
        </Row>

        <Row label="Streaming quality" value="320 kbps">
          <p className="text-[11.5px] text-white/35">
            The highest bitrate the source offers is always selected — there is nothing to downgrade here.
          </p>
        </Row>
      </Group>

      {/* ---------- Data ---------- */}
      <Group icon={Info} title="Data" hint="Everything is stored locally in this browser. No account, no sync.">
        <Action
          icon={RefreshCw}
          label="Clear API cache"
          desc={`${cacheSize} cached responses in memory`}
          cta="Clear"
          onClick={() => {
            clearCache();
            setCacheSize(0);
            showToast('Cache cleared');
          }}
        />
        <Action
          icon={SlidersHorizontal}
          label="Reset sound settings"
          desc="Equaliser, output level and crossfade"
          cta="Reset"
          tone="warning"
          onClick={resetSound}
        />
        <Action
          icon={Trash2}
          label="Clear listening history"
          desc="Recently played and the recommendations built from it"
          cta="Clear"
          tone="warning"
          onClick={() => {
            localStorage.removeItem('ma_history');
            localStorage.removeItem('ma_total_plays');
            showToast('Listening history cleared');
          }}
        />
        <Action
          icon={ShieldAlert}
          label="Erase all local data"
          desc="Playlists, likes, downloads, history and settings"
          cta="Erase"
          tone="danger"
          onClick={() => {
            if (!window.confirm('Erase every playlist, like, download and setting stored in this browser?')) return;
            localStorage.clear();
            showToast('Everything erased — reloading');
            setTimeout(() => window.location.reload(), 700);
          }}
        />
      </Group>

      <p className="pb-4 text-center text-[11px] text-white/20">Music Area · free, ad-free streaming</p>
    </div>
  );
}

/* ---------------- Pieces ---------------- */

function Group({ icon: Icon, title, hint, children }) {
  return (
    <section className="mb-7">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15">
          <Icon size={16} className="text-accent" />
        </span>
        <div>
          <h2 className="text-[15px] font-bold tracking-tight">{title}</h2>
          <p className="text-[11.5px] text-white/35">{hint}</p>
        </div>
      </div>
      <div className="divide-y divide-[rgba(255,255,255,0.06)] overflow-hidden rounded-2xl border border-hair bg-surface-2/50">
        {children}
      </div>
    </section>
  );
}

function Row({ label, value, accent, children }) {
  return (
    <div className="p-4">
      <div className="mb-2.5 flex items-baseline justify-between gap-3">
        <span className="text-[13px] font-semibold text-white/80">{label}</span>
        <span className={`text-[12.5px] font-bold tabular-nums ${accent ? 'text-orange-400' : 'text-white/50'}`}>
          {value}
        </span>
      </div>
      {children}
    </div>
  );
}

function Ticks({ labels }) {
  return (
    <div className="mt-2 flex justify-between text-[10px] text-white/20">
      {labels.map((l) => (
        <span key={l}>{l}</span>
      ))}
    </div>
  );
}

function Action({ icon: Icon, label, desc, cta, onClick, tone = 'default' }) {
  const tones = {
    default: 'bg-white/[0.07] text-white/70 hover:bg-white/[0.12]',
    warning: 'bg-amber-500/12 text-amber-300 hover:bg-amber-500/20',
    danger: 'bg-red-500/12 text-red-300 hover:bg-red-500/20',
  };
  return (
    <div className="flex items-center gap-3 p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.06]">
        <Icon size={16} className="text-white/60" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-white/85">{label}</p>
        <p className="mt-0.5 text-[11.5px] text-white/35">{desc}</p>
      </div>
      <button onClick={onClick} className={`press shrink-0 rounded-lg px-3.5 py-2 text-[12px] font-semibold ${tones[tone]}`}>
        {cta}
      </button>
    </div>
  );
}
