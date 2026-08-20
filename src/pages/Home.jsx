import { useState, useEffect, useMemo } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { getHistory, analyzePreferences } from '../data/algorithm';
import { searchSongs, searchArtists } from '../data/api';
import { getHomeQueries } from '../data/algorithm';
import { getGreeting } from '../data/mockData';
import SongRow from '../components/SongRow';
import SongCard from '../components/SongCard';
import HorizontalScroll from '../components/HorizontalScroll';
import { Shuffle, Zap, Heart, Music2, Sparkles, BarChart3, Loader2, RefreshCw } from 'lucide-react';

const MOOD_SECTIONS = [
  { key: 'chill', label: 'Chill', query: 'lofi chill hindi', icon: Music2 },
  { key: 'energy', label: 'Energy', query: 'workout motivation songs', icon: Zap },
  { key: 'sad', label: 'Sad', query: 'sad hindi heartbreak', icon: Heart },
  { key: 'party', label: 'Party', query: 'dance party bollywood', icon: Sparkles },
  { key: 'romance', label: 'Romance', query: 'romantic hindi songs', icon: Heart },
  { key: 'focus', label: 'Focus', query: 'study instrumental focus', icon: BarChart3 },
];

const TRENDING_QUERIES = [
  { key: 'trending', query: 'trending hindi songs 2024', title: 'Trending Now' },
  { key: 'new', query: 'new releases hindi 2024', title: 'New Releases' },
  { key: 'viral', query: 'viral songs 2024', title: 'Going Viral' },
];

export default function Home() {
  const { playSong, currentSong, upNext } = usePlayer();
  const [sections, setSections] = useState({});
  const [trendingData, setTrendingData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeMood, setActiveMood] = useState(null);
  const [moodSongs, setMoodSongs] = useState([]);
  const [topArtists, setTopArtists] = useState([]);

  const queries = useMemo(() => getHomeQueries(currentSong), [currentSong]);
  const history = useMemo(() => getHistory(), []);
  const prefs = useMemo(() => analyzePreferences(), []);
  const quickPicks = history.slice(0, 6);

  const loadHomeData = async () => {
    setLoading(true);
    setError(false);
    try {
      const [homeRes, trendingRes] = await Promise.all([
        Promise.all(queries.map(async s => [s.key, await searchSongs(s.query, 12)])),
        Promise.all(TRENDING_QUERIES.map(async s => [s.key, await searchSongs(s.query, 15)])),
      ]);
      setSections(Object.fromEntries(homeRes));
      setTrendingData(Object.fromEntries(trendingRes));

      // Extract top artists from trending
      const artistCounts = {};
      Object.values(trendingData).flat().forEach(song => {
        const artist = song.artist?.split(',')[0]?.trim();
        if (artist) artistCounts[artist] = (artistCounts[artist] || 0) + 1;
      });
      const sortedArtists = Object.entries(artistCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name]) => name);
      
      // Fetch artist images
      const { searchArtists } = await import('../data/api');
      const artistProfiles = await Promise.all(
        sortedArtists.map(name => searchArtists(name, 1).then(r => r[0]).catch(() => null))
      );
      setTopArtists(artistProfiles.filter(Boolean));

      setLoading(false);
    } catch {
      setError(true);
      setLoading(false);
    }
  };

  useEffect(() => { loadHomeData(); }, [queries]);

  const playMood = async (mood) => {
    if (activeMood === mood.key) { setActiveMood(null); setMoodSongs([]); return; }
    setActiveMood(mood.key);
    setMoodLoading(true);
    const songs = await searchSongs(mood.query, 20) || [];
    setMoodSongs(songs);
    setMoodLoading(false);
    if (songs.length > 0) {
      const shuffled = [...songs].sort(() => Math.random() - 0.5);
      playSong(shuffled[0], shuffled);
    }
  };

  const playShuffled = (songs) => {
    const shuffled = [...songs].sort(() => Math.random() - 0.5);
    playSong(shuffled[0], shuffled);
  };

  const shuffleHistory = () => {
    const s = history.slice(0, 30).sort(() => Math.random() - 0.5);
    playSong(s[0], s);
  };

  return (
    <div className="pb-6 pt-3">
      {/* Hero Section - Clean & Dynamic */}
      <section className="mb-8 animate-in">
        <div className="relative overflow-hidden rounded-2xl p-5 sm:p-6 border border-white/[0.06]" style={{ background: 'linear-gradient(135deg, #0f0818 0%, #1a0a2e 50%, #0f0818 100%)' }}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(225,29,72,0.08)_0%,_transparent_70%)]" />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-[24px] sm:text-[28px] font-black text-transparent bg-clip-text tracking-tight" style={{ backgroundImage: 'linear-gradient(90deg, #fff 0%, #f0abfc 50%, #c084fc 100%)' }}>
                {getGreeting()}
              </h1>
              <p className="mt-1.5 text-[11px] text-white/35 font-medium">
                {prefs ? (
                  <>
                    {prefs.totalPlays} plays
                    {prefs.topArtists?.[0] && (
                      <>
                        {' · '}
                        {typeof prefs.topArtists[0] === 'string' ? prefs.topArtists[0] : prefs.topArtists[0].name}
                      </>
                    )}
                  </>
                ) : (
                  'Discover something new today'
                )}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {history.length > 0 && (
                <button onClick={shuffleHistory}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white text-[11px] font-bold rounded-full shadow-lg shadow-fuchsia-500/20 hover:shadow-fuchsia-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
                  <Shuffle size={12} /> Shuffle History
                </button>
              )}
              <button onClick={loadHomeData}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-white/70 text-[11px] font-medium rounded-full active:scale-[0.98] transition-all">
                <Loader2 size={12} className={loading ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Mood Quick Actions - Clean Pills */}
      <section className="mb-8 animate-in" style={{ animationDelay: '0.05s' }}>
        <div className="flex gap-2 overflow-x-auto scroll-x pb-2">
          {MOOD_SECTIONS.map((m, i) => (
            <button key={m.key} onClick={() => playMood(m)}
              style={{ animationDelay: `${i * 30}ms` }}
              className={`flex shrink-0 items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-300 active:scale-95 ${
                activeMood === m.key
                  ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/30'
                  : 'bg-white/[0.04] text-white/60 border border-white/[0.05] hover:bg-white/[0.07] hover:border-white/[0.1] hover:text-white'
              }`}>
              <m.icon size={14} className={activeMood === m.key ? 'text-white' : 'text-white/50'} />
              <span className="text-[12px] font-medium">{m.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Top Artists Carousel - Live from trending */}
      {topArtists.length > 0 && (
        <section className="mb-8 animate-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-bold text-white">Top Artists Right Now</h2>
            <span className="text-[10px] text-white/30">Updated from trending</span>
          </div>
          <div className="flex gap-3 overflow-x-auto scroll-x pb-2">
            {topArtists.map((artist, i) => (
              <button key={artist.name} onClick={() => playMood({ key: `artist_${artist.id}`, query: artist.name, label: artist.name })}
                style={{ animationDelay: `${i * 40}ms` }}
                className="flex shrink-0 flex-col items-center gap-2 group active:scale-95 transition-all">
                <div className="relative w-18 h-18 sm:w-20 sm:h-20">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-rose-500/20 to-fuchsia-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <img src={artist.img} alt={artist.name}
                    className="w-full h-full rounded-full object-cover ring-1 ring-white/[0.06] group-hover:ring-rose-400/40 group-hover:scale-105 transition-all duration-300 shadow-lg" loading="lazy" />
                </div>
                <span className="text-[10px] font-semibold text-center leading-tight truncate w-18 sm:w-20 text-white/70 group-hover:text-white transition-colors">{artist.name}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Jump Back In - Smart History */}
      {(quickPicks.length > 0 || (currentSong && upNext.length > 0)) && (
        <section className="mb-8 animate-in" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-bold text-white">{currentSong ? 'Up Next' : 'Jump Back In'}</h2>
            <span className="text-[10px] text-white/30">
              {currentSong ? `${upNext.length} songs` : `${quickPicks.length} recent`}
            </span>
          </div>
          <div className="rounded-2xl border border-white/[0.04] overflow-hidden bg-[#0c0c0c]">
            {(currentSong ? upNext.slice(0, 8) : quickPicks.slice(0, 8)).map((s, i) => (
              <SongRow key={`${s.id}-${i}`} song={s} index={i} songList={currentSong ? upNext : quickPicks} />
            ))}
          </div>
        </section>
      )}

      {/* Mood Results - When mood is active */}
      {activeMood && moodSongs.length > 0 && (
        <section className="mb-8 animate-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[16px] font-bold text-white">{MOOD_SECTIONS.find(m => m.key === activeMood)?.label} Mix</h2>
              <p className="text-[10px] text-white/30 mt-0.5">{moodSongs.length} songs • Tap to play</p>
            </div>
            <button onClick={() => playShuffled(moodSongs)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] rounded-full text-[10px] font-medium text-white/60 active:scale-95">
              <Shuffle size={11} /> Shuffle
            </button>
          </div>
          <div className="rounded-2xl border border-white/[0.04] overflow-hidden bg-[#0c0c0c]">
            {moodSongs.slice(0, 15).map((s, i) => <SongRow key={s.id} song={s} index={i} songList={moodSongs} />)}
          </div>
        </section>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-8 animate-in">
          {[1, 2, 3].map(i => (
            <div key={i}>
              <div className="flex items-center justify-between mb-3">
                <div className="skeleton h-4 w-24 rounded-lg" />
              </div>
              <div className="flex gap-3 overflow-x-auto scroll-x pb-2">
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

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-16 animate-in">
          <Music2 size={28} className="text-white/10 mx-auto mb-3" />
          <p className="text-[14px] text-white/50 font-medium mb-2">Couldn't load music</p>
          <p className="text-[12px] text-white/20 mb-5">Check your connection</p>
          <button onClick={loadHomeData} className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black text-[12px] font-bold rounded-full shadow-lg active:scale-95 transition-all hover:scale-[1.02]">
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      )}

      {/* Trending Sections - Live Data */}
      {!loading && !error && (
        <>
          {/* Featured Trending - Large Card */}
          {trendingData.trending?.length > 0 && (
            <section className="mb-8 animate-in" style={{ animationDelay: '0.2s' }}>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-[16px] font-bold text-white">Trending Now</h2>
                  <p className="text-[10px] text-white/30 mt-0.5">Updated live from charts</p>
                </div>
              </div>
              <HorizontalScroll title="Trending Now">
                {trendingData.trending.slice(0, 12).map(s => <SongCard key={s.id} song={s} />)}
              </HorizontalScroll>
            </section>
          )}

          {/* Other Trending Sections */}
          {TRENDING_QUERIES.filter(t => t.key !== 'trending').map((sec, idx) => {
            const songs = trendingData[sec.key] || [];
            if (!songs.length) return null;
            return (
              <section key={sec.key} className="mb-8 animate-in" style={{ animationDelay: `${(idx + 2) * 0.06}s` }}>
                <HorizontalScroll title={sec.title}>
                  {songs.map(s => <SongCard key={s.id} song={s} />)}
                </HorizontalScroll>
              </section>
            );
          })}

          {/* Personalized Sections from Algorithm */}
          {queries.map((sec, idx) => {
            const songs = sections[sec.key] || [];
            if (!songs.length) return null;
            return (
              <section key={sec.key} className="mb-8 animate-in" style={{ animationDelay: `${(idx + 4) * 0.06}s` }}>
                <HorizontalScroll title={sec.title}>
                  {songs.map(s => <SongCard key={s.id} song={s} />)}
                </HorizontalScroll>
              </section>
            );
          })}
        </>
      )}
    </div>
  );
}