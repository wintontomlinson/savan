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
    const res = {};
    try {
      await Promise.all(queries.map(async s => { res[s.key] = await searchSongs(s.query, 12); }));
      setSections(res); setLoading(false);
    } catch { setError(true); setLoading(false); }
  };

  useEffect(() => { loadData(); }, [queries]);
  const recentSongs = history.slice(0, 6);

  return (
    <div className="pb-6">
      {/* Hero / Greeting */}
      <section className="mb-8 animate-in">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-violet-600/20 via-[#121214] to-[#121214] p-6 sm:p-8 border border-white/[0.04]">
          <h1 className="text-[22px] sm:text-[28px] font-bold text-white mb-1 tracking-tight">{getGreeting()}</h1>
          <p className="text-[13px] sm:text-[14px] text-[#A1A1AA]">
            {prefs ? `Curated for you • ${prefs.topArtists.slice(0, 2).join(', ')}` : 'Discover new music'}
          </p>
          <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>
      </section>

      {/* Loading */}
      {loading && (
        <div className="space-y-6">
          <div className="flex gap-4">{[...Array(5)].map((_, i) => <div key={i} className="shrink-0 w-[160px]"><div className="aspect-square skeleton mb-2" /><div className="skeleton h-3 w-3/4 mb-1" /><div className="skeleton h-2.5 w-1/2" /></div>)}</div>
          <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="flex gap-3 items-center"><div className="skeleton w-10 h-10 rounded-md" /><div className="flex-1"><div className="skeleton h-3 w-1/3 mb-1" /><div className="skeleton h-2.5 w-1/4" /></div></div>)}</div>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="text-center py-16">
          <p className="text-[14px] text-white mb-1">Something went wrong</p>
          <p className="text-[12px] text-[#71717A] mb-4">Unable to load music right now</p>
          <button onClick={loadData} className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500 text-white text-[13px] rounded-full active:scale-95 transition-fast">
            <RefreshCw size={14} /> Try Again
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Up Next */}
          {currentSong && upNext.length > 0 && (
            <section className="mb-8 animate-in">
              <div className="flex items-center gap-2 mb-3 px-1">
                <Radio size={14} className="text-violet-400" />
                <h2 className="text-[15px] font-semibold text-white">Playing Next</h2>
              </div>
              <div className="bg-[#121214] rounded-xl border border-white/[0.04] overflow-hidden">
                {upNext.slice(0, 4).map((s, i) => <SongRow key={`${s.id}-${i}`} song={s} index={i} songList={upNext} />)}
              </div>
            </section>
          )}

          {/* Recently Played */}
          {!currentSong && recentSongs.length > 0 && (
            <section className="mb-8 animate-in">
              <h2 className="text-[15px] font-semibold text-white mb-3 px-1">Jump Back In</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {recentSongs.map(s => (
                  <button key={s.id} onClick={() => playSong(s)}
                    className="flex items-center gap-2.5 bg-[#121214] hover:bg-[#18181B] rounded-lg overflow-hidden transition-fast border border-white/[0.03] group">
                    <img src={s.thumbnail} alt="" className="w-12 h-12 object-cover" loading="lazy" />
                    <p className="text-[11px] sm:text-[12px] font-medium text-white truncate pr-3 flex-1">{s.title}</p>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Dynamic Sections */}
          {queries.map(sec => {
            const songs = sections[sec.key] || [];
            if (!songs.length) return null;
            return <HorizontalScroll key={sec.key} title={sec.title}>{songs.map(s => <SongCard key={s.id} song={s} />)}</HorizontalScroll>;
          })}
        </>
      )}
    </div>
  );
}
