import { useState, useEffect, useMemo } from 'react';
import { Play, Loader2, RefreshCw, Headphones, Sparkles } from 'lucide-react';
import { getGreeting } from '../data/mockData';
import { searchSongs } from '../data/api';
import { getHomeQueries, getHistory, analyzePreferences } from '../data/algorithm';
import { usePlayer } from '../context/PlayerContext';
import SongCard from '../components/SongCard';
import HorizontalScroll from '../components/HorizontalScroll';
import SongRow from '../components/SongRow';

const MOODS = [
  { label: 'Chill', query: 'lofi chill hindi relax', icon: '🎧' },
  { label: 'Party', query: 'party bollywood dance hits', icon: '🪩' },
  { label: 'Sad', query: 'sad hindi heartbreak songs', icon: '🌧️' },
  { label: 'Workout', query: 'workout gym motivation hindi', icon: '🔥' },
  { label: 'Romance', query: 'romantic hindi love songs', icon: '💕' },
  { label: 'Drive', query: 'road trip hindi songs', icon: '🛣️' },
  { label: 'Sleep', query: 'lori neend raat hindi songs', icon: '🌙' },
  { label: 'Focus', query: 'study focus instrumental', icon: '🎯' },
  { label: 'Devotional', query: 'bhajan aarti devotional hindi', icon: '🙏' },
  { label: 'Retro', query: '90s bollywood old songs classic', icon: '📻' },
  { label: 'Punjabi', query: 'punjabi hits latest 2024', icon: '🎵' },
  { label: 'English', query: 'english pop hits trending', icon: '🌍' },
  { label: 'Hip-Hop', query: 'indian hip hop rap 2024', icon: '🎤' },
  { label: 'Sufi', query: 'sufi songs qawwali hindi', icon: '🌀' },
  { label: 'Rain', query: 'barish rain hindi romantic', icon: '🌧️' },
  { label: 'Night', query: 'late night hindi songs', icon: '🌃' },
];

export default function Home() {
  const { playSong, currentSong, upNext } = usePlayer();
  const [sections, setSections] = useState({});
  const [moodSongs, setMoodSongs] = useState(null);
  const [moodLoading, setMoodLoading] = useState(false);
  const [activeMood, setActiveMood] = useState(null);
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

  const loadMood = async (mood) => {
    setActiveMood(mood.label);
    setMoodLoading(true);
    const songs = await searchSongs(mood.query, 15) || [];
    setMoodSongs(songs);
    setMoodLoading(false);
  };

  const recentSongs = history.slice(0, 8);
  const quickPicks = history.slice(0, 4);

  return (
    <div className="pb-6">
      {/* Moods — Top suggestion chips */}
      <section className="mb-5 animate-in">
        <div className="flex gap-2 scroll-x pb-2">
          {MOODS.map(m => (
            <button key={m.label} onClick={() => loadMood(m)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full shrink-0 transition-all btn-press ${
                activeMood === m.label ? 'bg-white text-black font-semibold' : 'bg-[#1a1a1a] text-white'
              }`}>
              <span className="text-[14px]">{m.icon}</span>
              <span className="text-[13px] font-medium">{m.label}</span>
            </button>
          ))}
        </div>

        {/* Mood Results */}
        {moodLoading && <div className="flex justify-center py-6"><Loader2 size={18} className="text-white animate-spin" /></div>}
        {!moodLoading && moodSongs && moodSongs.length > 0 && (
          <div className="mt-3 animate-in">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[13px] text-white font-medium">{activeMood} vibes</p>
              <button onClick={() => playSong(moodSongs[0], moodSongs)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full text-[11px] text-black font-semibold btn-press">
                <Play size={10} fill="black" /> Play All
              </button>
            </div>
            <div className="flex gap-3 scroll-x pb-1 stagger">
              {moodSongs.slice(0, 10).map(s => <SongCard key={s.id} song={s} />)}
            </div>
          </div>
        )}
      </section>

      {/* Hero */}
      <section className="mb-7 animate-in" style={{ animationDelay: '0.03s' }}>
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-rose-600/15 via-[#0e0e0e] to-purple-900/10 p-6 sm:p-8 border border-white/[0.04]">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-rose-400" />
              <span className="text-[11px] text-rose-400 font-medium uppercase tracking-wider">For You</span>
            </div>
            <h1 className="text-[22px] sm:text-[28px] font-bold text-white mb-1 tracking-tight">{getGreeting()}</h1>
            <p className="text-[13px] text-[#999]">
              {prefs ? `${prefs.totalPlays} songs played • Top: ${prefs.topArtists.slice(0,2).join(', ')}` : 'Start listening to get personalized recommendations'}
            </p>
          </div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-rose-500/[0.08] rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-10 w-48 h-48 bg-purple-500/[0.06] rounded-full blur-3xl pointer-events-none" />
        </div>
      </section>

      {/* Quick Picks — mini resume cards */}
      {quickPicks.length > 0 && !currentSong && (
        <section className="mb-7 animate-in" style={{ animationDelay: '0.05s' }}>
          <h2 className="text-[15px] font-bold text-white mb-3 flex items-center gap-2">
            <Headphones size={15} className="text-[#888]" /> Quick Picks
          </h2>
          <div className="grid grid-cols-2 gap-2.5">
            {quickPicks.map(s => (
              <button key={s.id} onClick={() => playSong(s)}
                className="group flex items-center gap-3 bg-[#111] hover:bg-[#161616] rounded-2xl p-3 transition-all duration-300 border border-white/[0.03] hover:border-white/[0.06] hover:shadow-lg hover:shadow-black/20 btn-press text-left">
                <img src={s.thumbnail} alt="" className="w-11 h-11 rounded-xl object-cover shrink-0 ring-1 ring-white/[0.05] transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold text-white leading-tight line-clamp-2">{s.title}</p>
                  <p className="text-[10px] text-white/35 truncate mt-0.5">{s.artist}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-8 animate-fade">
          <div className="flex gap-4">{[...Array(5)].map((_, i) => <div key={i} className="shrink-0 w-[150px]"><div className="aspect-square skeleton rounded-2xl mb-2.5" /><div className="skeleton h-3 w-3/4 mb-1.5" /><div className="skeleton h-2.5 w-1/2" /></div>)}</div>
          <div className="flex gap-4">{[...Array(5)].map((_, i) => <div key={i} className="shrink-0 w-[150px]"><div className="aspect-square skeleton rounded-2xl mb-2.5" /><div className="skeleton h-3 w-3/4 mb-1.5" /><div className="skeleton h-2.5 w-1/2" /></div>)}</div>
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
            <section className="mb-7 animate-in">
              <h2 className="text-[15px] font-bold text-white mb-3">Playing Next</h2>
              <div className="bg-[#0e0e0e] rounded-2xl border border-white/[0.04] overflow-hidden">
                {upNext.slice(0, 5).map((s, i) => <SongRow key={`${s.id}-${i}`} song={s} index={i} songList={upNext} />)}
              </div>
            </section>
          )}

          {/* Recently Played */}
          {!currentSong && recentSongs.length > 0 && (
            <section className="mb-7 animate-in" style={{ animationDelay: '0.15s' }}>
              <h2 className="text-[15px] font-bold text-white mb-3">Recently Played</h2>
              <div className="flex gap-3 scroll-x pb-1">
                {recentSongs.map(s => <SongCard key={s.id} song={s} />)}
              </div>
            </section>
          )}

          {/* Dynamic Sections */}
          {queries.map((sec, idx) => {
            const songs = sections[sec.key] || [];
            if (!songs.length) return null;
            return (
              <div key={sec.key} style={{ animationDelay: `${(idx + 2) * 0.06}s` }} className="animate-in">
                <HorizontalScroll title={sec.title}>{songs.map(s => <SongCard key={s.id} song={s} />)}</HorizontalScroll>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
