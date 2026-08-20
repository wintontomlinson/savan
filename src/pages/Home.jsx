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
        <div className="relative overflow-hidden rounded-2xl p-5 sm:p-6 border border-white/[0.08]" style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 30%, #1a1145 60%, #0d0620 100%)' }}>
          {/* Disco ambient glows */}
          <div className="absolute top-[-30%] right-[10%] w-32 h-32 bg-fuchsia-500/[0.15] rounded-full blur-[60px] animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-[-20%] left-[5%] w-28 h-28 bg-violet-400/[0.12] rounded-full blur-[50px] animate-pulse" style={{ animationDuration: '3s', animationDelay: '1s' }} />
          <div className="absolute top-[30%] right-[-5%] w-20 h-20 bg-rose-500/[0.1] rounded-full blur-[40px] animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }} />
          
          <div className="relative flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-[24px] sm:text-[28px] font-black text-transparent bg-clip-text tracking-tight" style={{ backgroundImage: 'linear-gradient(90deg, #fff 0%, #f0abfc 50%, #c084fc 100%)' }}>{getGreeting()}</h1>
              {prefs ? (
                <p className="text-[11px] text-white/35 mt-1.5 font-medium">{prefs.totalPlays} plays{prefs.topArtists?.[0] && <> &middot; {typeof prefs.topArtists[0] === 'string' ? prefs.topArtists[0] : prefs.topArtists[0].name}</>}</p>
              ) : (
                <p className="text-[11px] text-white/25 mt-1.5">Drop the beat</p>
              )}
            </div>
            {history.length > 0 && (
              <button onClick={() => { const s = [...history.slice(0, 20)].sort(() => Math.random() - 0.5); playSong(s[0], s); }}
                className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white text-[12px] font-bold rounded-full shadow-lg shadow-fuchsia-500/20 hover:shadow-fuchsia-500/30 hover:scale-[1.04] active:scale-[0.96] transition-all duration-300">
                <Shuffle size={13} /> Mix
              </button>
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
