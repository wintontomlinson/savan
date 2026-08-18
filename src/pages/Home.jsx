import { useState, useEffect, useMemo } from 'react';
import { Play, Loader2, Radio, RefreshCw } from 'lucide-react';
import { getGreeting } from '../data/mockData';
import { searchSongs } from '../data/api';
import { getHomeQueries, getHistory, analyzePreferences } from '../data/algorithm';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import SongCard from '../components/SongCard';
import HorizontalScroll from '../components/HorizontalScroll';
import SongRow from '../components/SongRow';

export default function Home() {
  const { playSong, currentSong, upNext } = usePlayer();
  const { user } = useAuth();
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const queries = useMemo(() => getHomeQueries(currentSong), [currentSong]);
  const history = useMemo(() => getHistory(), []);
  const prefs = useMemo(() => analyzePreferences(), []);

  const loadData = async () => {
    setLoading(true); setError(false);
    try {
      const res = {};
      await Promise.all(queries.map(async s => { res[s.key] = await searchSongs(s.query, 12); }));
      setSections(res); setLoading(false);
    } catch { setError(true); setLoading(false); }
  };

  useEffect(() => { loadData(); }, [queries]);
  const recentSongs = history.slice(0, 6);

  return (
    <div className="pb-6">
      {/* Hero */}
      <section className="mb-8 animate-in">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-rose-600/15 via-[#0e0e0e] to-[#0e0e0e] p-7 sm:p-9 border border-white/[0.04]">
          <h1 className="text-[24px] sm:text-[30px] font-bold text-white mb-1.5 tracking-tight">{getGreeting()}</h1>
          <p className="text-[13px] sm:text-[14px] text-[#999]">
            {prefs ? `Based on ${prefs.topArtists.slice(0,2).join(', ')}` : 'Discover new music'}
          </p>
          {/* Decorative elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-rose-500/[0.07] rounded-full blur-3xl pointer-events-none animate-float" />
          <div className="absolute -bottom-20 -left-10 w-60 h-60 bg-purple-500/[0.04] rounded-full blur-3xl pointer-events-none" />
        </div>
      </section>

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-8 animate-fade">
          <div className="flex gap-4">{[...Array(5)].map((_, i) => <div key={i} className="shrink-0 w-[150px]"><div className="aspect-square skeleton rounded-2xl mb-2.5" /><div className="skeleton h-3 w-3/4 mb-1.5" /><div className="skeleton h-2.5 w-1/2" /></div>)}</div>
          <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="flex gap-3 items-center"><div className="skeleton w-11 h-11 rounded-lg" /><div className="flex-1"><div className="skeleton h-3 w-2/5 mb-1.5" /><div className="skeleton h-2.5 w-1/4" /></div></div>)}</div>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="text-center py-20 animate-in">
          <p className="text-[15px] text-white mb-1">Something went wrong</p>
          <p className="text-[12px] text-[#666] mb-5">Unable to load music right now</p>
          <button onClick={loadData} className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-[13px] rounded-full btn-press font-medium">
            <RefreshCw size={14} /> Try Again
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Up Next */}
          {currentSong && upNext.length > 0 && (
            <section className="mb-8 animate-in">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 bg-rose-500/20 rounded-full flex items-center justify-center">
                  <Radio size={11} className="text-rose-400" />
                </div>
                <h2 className="text-[15px] font-bold text-white">Playing Next</h2>
              </div>
              <div className="bg-[#0e0e0e] rounded-2xl border border-white/[0.04] overflow-hidden">
                {upNext.slice(0, 5).map((s, i) => <SongRow key={`${s.id}-${i}`} song={s} index={i} songList={upNext} />)}
              </div>
            </section>
          )}

          {/* Recently Played */}
          {!currentSong && recentSongs.length > 0 && (
            <section className="mb-8 animate-in" style={{ animationDelay: '0.1s' }}>
              <h2 className="text-[15px] font-bold text-white mb-3">Jump Back In</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 stagger">
                {recentSongs.map(s => (
                  <button key={s.id} onClick={() => playSong(s)}
                    className="group flex items-center gap-2.5 bg-[#0e0e0e] hover:bg-[#151515] rounded-xl overflow-hidden transition-all duration-200 border border-white/[0.03] hover:border-white/[0.06] btn-press">
                    <img src={s.thumbnail} alt="" className="w-12 h-12 object-cover transition-transform duration-200 group-hover:scale-105" loading="lazy" />
                    <p className="text-[11px] sm:text-[12px] font-medium text-white truncate pr-3 flex-1">{s.title}</p>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Dynamic Sections */}
          {queries.map((sec, idx) => {
            const songs = sections[sec.key] || [];
            if (!songs.length) return null;
            return (
              <div key={sec.key} style={{ animationDelay: `${(idx + 1) * 0.08}s` }} className="animate-in">
                <HorizontalScroll title={sec.title}>{songs.map(s => <SongCard key={s.id} song={s} />)}</HorizontalScroll>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
