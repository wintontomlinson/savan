import { useState, useEffect, useMemo } from 'react';
import { Play, Loader2, RefreshCw, Shuffle } from 'lucide-react';
import { getGreeting } from '../data/mockData';
import { searchSongs } from '../data/api';
import { getHomeQueries, getHistory, analyzePreferences } from '../data/algorithm';
import { usePlayer } from '../context/PlayerContext';
import SongCard from '../components/SongCard';
import HorizontalScroll from '../components/HorizontalScroll';
import SongRow from '../components/SongRow';

export default function Home() {
  const { playSong, currentSong, upNext } = usePlayer();
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const queries = useMemo(() => getHomeQueries(currentSong), [currentSong]);
  const history = useMemo(() => getHistory(), []);
  const prefs = useMemo(() => analyzePreferences(), []);
  const recentSongs = history.slice(0, 8);
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

  return (
    <div className="pb-6 pt-3">
      {/* Greeting */}
      <section className="mb-7">
        <h1 className="text-[26px] sm:text-[30px] font-bold text-white tracking-tight">{getGreeting()}</h1>
        {prefs && <p className="text-[13px] text-white/35 mt-1">{prefs.totalPlays} songs played so far</p>}
      </section>

      {/* Quick Picks - Resume listening */}
      {quickPicks.length > 0 && !currentSong && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-bold text-white">Jump Back In</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {quickPicks.map(s => (
              <button key={s.id} onClick={() => playSong(s, quickPicks)}
                className="group flex items-center gap-3 bg-white/[0.03] hover:bg-white/[0.06] rounded-xl p-2.5 transition-all duration-200 border border-white/[0.04] hover:border-white/[0.07] text-left">
                <img src={s.thumbnail} alt="" className="w-11 h-11 rounded-lg object-cover shrink-0 shadow-md" loading="lazy" />
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-medium text-white truncate">{s.title}</p>
                  <p className="text-[10px] text-white/30 truncate">{s.artist}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Now Playing Queue */}
      {currentSong && upNext.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-bold text-white">Up Next</h2>
            <span className="text-[11px] text-white/25">{upNext.length} songs</span>
          </div>
          <div className="rounded-2xl border border-white/[0.04] overflow-hidden">
            {upNext.slice(0, 5).map((s, i) => <SongRow key={`${s.id}-${i}`} song={s} index={i} songList={upNext} />)}
          </div>
        </section>
      )}

      {/* Recently Played */}
      {!currentSong && recentSongs.length > 0 && (
        <section className="mb-2">
          <HorizontalScroll title="Recently Played">
            {recentSongs.map(s => <SongCard key={s.id} song={s} />)}
          </HorizontalScroll>
        </section>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-8">
          {[1, 2].map(i => (
            <div key={i} className="flex gap-4 overflow-hidden">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="shrink-0 w-[150px]">
                  <div className="aspect-square skeleton rounded-2xl mb-2" />
                  <div className="skeleton h-3 w-3/4 mb-1" />
                  <div className="skeleton h-2.5 w-1/2" />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="text-center py-20">
          <p className="text-[15px] text-white font-medium mb-2">Couldn't load recommendations</p>
          <p className="text-[12px] text-white/30 mb-5">Check your connection and try again</p>
          <button onClick={loadData} className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black text-[12px] font-bold rounded-full shadow-lg active:scale-95 transition-all">
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      )}

      {/* Personalized Sections */}
      {!loading && !error && queries.map((sec, idx) => {
        const songs = sections[sec.key] || [];
        if (!songs.length) return null;
        return (
          <section key={sec.key} className="animate-in" style={{ animationDelay: `${idx * 0.05}s` }}>
            <HorizontalScroll title={sec.title}>
              {songs.map(s => <SongCard key={s.id} song={s} />)}
            </HorizontalScroll>
          </section>
        );
      })}
    </div>
  );
}
