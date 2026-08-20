import { useState, useEffect, useMemo } from 'react';
import { Play, Loader2, RefreshCw, Shuffle, Zap } from 'lucide-react';
import { getGreeting } from '../data/mockData';
import { searchSongs } from '../data/api';
import { getHomeQueries, getHistory, analyzePreferences } from '../data/algorithm';
import { usePlayer } from '../context/PlayerContext';
import SongCard from '../components/SongCard';
import HorizontalScroll from '../components/HorizontalScroll';
import SongRow from '../components/SongRow';

const QUICK_MOODS = [
  { label: 'Chill', query: 'lofi chill hindi', emoji: '🎧' },
  { label: 'Energy', query: 'workout motivation songs', emoji: '⚡' },
  { label: 'Sad', query: 'sad hindi heartbreak', emoji: '🌧️' },
  { label: 'Party', query: 'dance party bollywood', emoji: '🎉' },
  { label: 'Romance', query: 'romantic hindi songs', emoji: '💕' },
  { label: 'Focus', query: 'study instrumental focus', emoji: '🎯' },
];

export default function Home() {
  const { playSong, currentSong, upNext } = usePlayer();
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [moodSongs, setMoodSongs] = useState(null);
  const [activeMood, setActiveMood] = useState(null);
  const [moodLoading, setMoodLoading] = useState(false);

  const queries = useMemo(() => getHomeQueries(currentSong), [currentSong]);
  const history = useMemo(() => getHistory(), []);
  const prefs = useMemo(() => analyzePreferences(), []);
  const quickPicks = history.slice(0, 6);

  const loadData = async () => {
    setLoading(true); setError(false);
    try {
      const res = {};
      await Promise.all(queries.map(async s => { res[s.key] = await searchSongs(s.query, 12); }));
      setSections(res); setLoading(false);
    } catch { setError(true); setLoading(false); }
  };

  useEffect(() => { loadData(); }, [queries]);

  const playMood = async (mood) => {
    if (activeMood === mood.label) { setActiveMood(null); setMoodSongs(null); return; }
    setActiveMood(mood.label);
    setMoodLoading(true);
    const songs = await searchSongs(mood.query, 20) || [];
    setMoodSongs(songs);
    setMoodLoading(false);
    if (songs.length > 0) {
      const shuffled = [...songs].sort(() => Math.random() - 0.5);
      playSong(shuffled[0], shuffled);
    }
  };

  return (
    <div className="pb-6 pt-3">
      {/* Hero Greeting */}
      <section className="mb-7 animate-in">
        <div className="relative overflow-hidden rounded-[28px] p-8 sm:p-10 border border-white/[0.06]" style={{ background: 'linear-gradient(160deg, #18122B 0%, #1D1340 30%, #0F172A 60%, #0C0C14 100%)' }}>
          {/* Ambient glow */}
          <div className="absolute top-[-40%] right-[-20%] w-[70%] h-[70%] rounded-full blur-[120px] animate-float" style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)' }} />
          <div className="absolute bottom-[-30%] left-[-15%] w-[55%] h-[55%] rounded-full blur-[100px] animate-float" style={{ animationDelay: '3s', background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)' }} />
          <div className="absolute top-[20%] right-[20%] w-[25%] h-[25%] rounded-full blur-[60px]" style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.04) 0%, transparent 70%)' }} />
          
          {/* Decorative line */}
          <div className="absolute top-0 left-8 sm:left-10 w-[1px] h-16 bg-gradient-to-b from-rose-400/30 to-transparent" />
          
          <div className="relative">
            {/* Greeting text */}
            <p className="text-[11px] text-white/30 font-medium uppercase tracking-[0.2em] mb-3">Welcome Back</p>
            <h1 className="text-[32px] sm:text-[42px] font-bold tracking-tight leading-[1.05]">
              <span className="text-white">{getGreeting()}</span>
            </h1>
            
            {/* Stats line */}
            {prefs ? (
              <div className="flex items-center gap-3 mt-5">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.06]">
                  <div className="w-2 h-2 rounded-full bg-rose-400/80" />
                  <span className="text-[11px] text-white/45 font-medium">{prefs.totalPlays} plays</span>
                </div>
                {prefs.topArtists?.[0] && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.06]">
                    <div className="w-2 h-2 rounded-full bg-violet-400/80" />
                    <span className="text-[11px] text-white/45 font-medium">{typeof prefs.topArtists[0] === 'string' ? prefs.topArtists[0] : prefs.topArtists[0].name}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[13px] text-white/25 mt-4">Discover music made for you</p>
            )}

            {/* Actions */}
            {history.length > 0 && (
              <div className="flex items-center gap-3 mt-7">
                <button onClick={() => { const s = [...history.slice(0, 20)].sort(() => Math.random() - 0.5); playSong(s[0], s); }}
                  className="group inline-flex items-center gap-2.5 px-6 py-3 bg-white text-black text-[13px] font-bold rounded-full shadow-lg shadow-white/[0.08] hover:shadow-white/[0.15] hover:scale-[1.04] active:scale-[0.97] transition-all duration-300">
                  <Shuffle size={14} className="group-hover:rotate-180 transition-transform duration-500" /> Shuffle
                </button>
                <button onClick={() => playSong(history[0], history.slice(0, 20))}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/[0.07] text-white/80 text-[13px] font-medium rounded-full border border-white/[0.08] hover:bg-white/[0.12] hover:text-white hover:border-white/[0.15] active:scale-[0.97] transition-all duration-300 backdrop-blur-sm">
                  <Play size={13} fill="currentColor" /> Continue
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Quick Mood Play */}
      <section className="mb-7 animate-in" style={{ animationDelay: '0.05s' }}>
        <div className="flex gap-2 scroll-x pb-1">
          {QUICK_MOODS.map(m => (
            <button key={m.label} onClick={() => playMood(m)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full shrink-0 transition-all duration-300 active:scale-95 ${
                activeMood === m.label
                  ? 'bg-white text-black font-bold shadow-lg shadow-white/10 scale-105'
                  : 'bg-white/[0.04] text-white/60 border border-white/[0.05] hover:bg-white/[0.07] hover:border-white/[0.1] hover:scale-[1.02]'
              }`}>
              <span className="text-[14px]">{m.emoji}</span>
              <span className="text-[12px] font-medium">{m.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Jump Back In */}
      {quickPicks.length > 0 && !currentSong && (
        <section className="mb-8 animate-in" style={{ animationDelay: '0.08s' }}>
          <h2 className="text-[15px] font-bold text-white mb-3">Jump Back In</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {quickPicks.map((s, i) => (
              <button key={s.id} onClick={() => playSong(s, quickPicks)}
                style={{ animationDelay: `${i * 50}ms` }}
                className="group flex items-center gap-3 bg-white/[0.03] hover:bg-white/[0.06] rounded-xl p-2.5 transition-all duration-300 border border-white/[0.04] hover:border-white/[0.08] text-left hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5 animate-in">
                <img src={s.thumbnail} alt="" className="w-11 h-11 rounded-lg object-cover shrink-0 shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:scale-105" loading="lazy" />
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-medium text-white truncate">{s.title}</p>
                  <p className="text-[10px] text-white/25 truncate">{s.artist}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Up Next Queue */}
      {currentSong && upNext.length > 0 && (
        <section className="mb-8 animate-in">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-bold text-white flex items-center gap-2">
              <Zap size={13} className="text-rose-400" /> Up Next
            </h2>
            <span className="text-[10px] text-white/20">{upNext.length} songs</span>
          </div>
          <div className="rounded-2xl border border-white/[0.04] overflow-hidden">
            {upNext.slice(0, 5).map((s, i) => <SongRow key={`${s.id}-${i}`} song={s} index={i} songList={upNext} />)}
          </div>
        </section>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-8">
          {[1, 2, 3].map(i => (
            <div key={i}>
              <div className="skeleton h-4 w-32 mb-3 rounded-lg" />
              <div className="flex gap-4 overflow-hidden">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="shrink-0 w-[150px]">
                    <div className="aspect-square skeleton rounded-2xl mb-2" />
                    <div className="skeleton h-3 w-3/4 mb-1 rounded" />
                    <div className="skeleton h-2.5 w-1/2 rounded" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="text-center py-20 animate-in">
          <p className="text-[14px] text-white/60 font-medium mb-2">Couldn't load music</p>
          <p className="text-[12px] text-white/25 mb-5">Check your connection</p>
          <button onClick={loadData} className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black text-[12px] font-bold rounded-full shadow-lg active:scale-95 transition-all hover:scale-[1.02]">
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      )}

      {/* Personalized Sections */}
      {!loading && !error && (
        <>
          {!currentSong && history.length > 0 && (
            <section className="animate-in" style={{ animationDelay: '0.1s' }}>
              <HorizontalScroll title="Recently Played">
                {history.slice(0, 10).map(s => <SongCard key={s.id} song={s} />)}
              </HorizontalScroll>
            </section>
          )}
          {queries.map((sec, idx) => {
            const songs = sections[sec.key] || [];
            if (!songs.length) return null;
            return (
              <section key={sec.key} className="animate-in" style={{ animationDelay: `${(idx + 2) * 0.06}s` }}>
                <HorizontalScroll title={sec.title}>{songs.map(s => <SongCard key={s.id} song={s} />)}</HorizontalScroll>
              </section>
            );
          })}
        </>
      )}
    </div>
  );
}
