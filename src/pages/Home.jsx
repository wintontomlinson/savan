import { useState, useEffect, useMemo } from 'react';
import { Play, Loader2, RefreshCw, Headphones, Sparkles, Music, TrendingUp } from 'lucide-react';
import { getGreeting } from '../data/mockData';
import { searchSongs } from '../data/api';
import { getHomeQueries, getHistory, analyzePreferences } from '../data/algorithm';
import { usePlayer } from '../context/PlayerContext';
import SongCard from '../components/SongCard';
import HorizontalScroll from '../components/HorizontalScroll';
import SongRow from '../components/SongRow';

const MOODS = [
  { label: 'Chill', query: 'lofi chill hindi relax', emoji: '🎧', gradient: 'from-sky-500/20 to-blue-600/10' },
  { label: 'Party', query: 'party bollywood dance hits', emoji: '🪩', gradient: 'from-rose-500/20 to-pink-600/10' },
  { label: 'Sad', query: 'sad hindi heartbreak songs', emoji: '🌧️', gradient: 'from-indigo-500/20 to-purple-600/10' },
  { label: 'Workout', query: 'workout gym motivation hindi', emoji: '🔥', gradient: 'from-orange-500/20 to-red-600/10' },
  { label: 'Romance', query: 'romantic hindi love songs', emoji: '💕', gradient: 'from-pink-500/20 to-rose-600/10' },
  { label: 'Drive', query: 'road trip hindi songs', emoji: '🛣️', gradient: 'from-emerald-500/20 to-green-600/10' },
  { label: 'Sleep', query: 'lori neend raat hindi songs', emoji: '🌙', gradient: 'from-violet-500/20 to-purple-600/10' },
  { label: 'Focus', query: 'study focus instrumental', emoji: '🎯', gradient: 'from-cyan-500/20 to-blue-600/10' },
  { label: 'Devotional', query: 'bhajan aarti devotional hindi', emoji: '🙏', gradient: 'from-amber-500/20 to-yellow-600/10' },
  { label: 'Retro', query: '90s bollywood old songs classic', emoji: '📻', gradient: 'from-teal-500/20 to-emerald-600/10' },
  { label: 'Punjabi', query: 'punjabi hits latest 2024', emoji: '🎵', gradient: 'from-pink-500/20 to-fuchsia-600/10' },
  { label: 'English', query: 'english pop hits trending', emoji: '🌍', gradient: 'from-blue-500/20 to-indigo-600/10' },
  { label: 'Hip-Hop', query: 'indian hip hop rap 2024', emoji: '🎤', gradient: 'from-purple-500/20 to-violet-600/10' },
  { label: 'Sufi', query: 'sufi songs qawwali hindi', emoji: '🌀', gradient: 'from-teal-500/20 to-cyan-600/10' },
  { label: 'Rain', query: 'barish rain hindi romantic', emoji: '☔', gradient: 'from-slate-500/20 to-gray-600/10' },
  { label: 'Night', query: 'late night hindi songs', emoji: '🌃', gradient: 'from-indigo-500/20 to-slate-600/10' },
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
    if (activeMood === mood.label) { setActiveMood(null); setMoodSongs(null); return; }
    setActiveMood(mood.label);
    setMoodLoading(true);
    const songs = await searchSongs(mood.query, 15) || [];
    setMoodSongs(songs);
    setMoodLoading(false);
  };

  const recentSongs = history.slice(0, 8);
  const quickPicks = history.slice(0, 4);

  return (
    <div className="pb-6 pt-2">
      {/* Hero */}
      <section className="mb-7 animate-in">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a1a2e] via-[#12121f] to-[#0f0f1a] p-6 sm:p-8 border border-white/[0.05]">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-rose-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-violet-500/8 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-rose-400" />
              <span className="text-[11px] text-rose-400/80 font-semibold uppercase tracking-wider">For You</span>
            </div>
            <h1 className="text-[26px] sm:text-[32px] font-bold text-white tracking-tight leading-tight">{getGreeting()}</h1>
            <p className="text-[13px] text-white/35 mt-2">
              {prefs ? `${prefs.totalPlays} songs played` : 'Start listening to get personalized picks'}
            </p>
          </div>
        </div>
      </section>

      {/* Quick Picks */}
      {quickPicks.length > 0 && !currentSong && (
        <section className="mb-7 animate-in" style={{ animationDelay: '0.05s' }}>
          <div className="flex items-center gap-2 mb-3">
            <Headphones size={14} className="text-white/30" />
            <p className="text-[13px] text-white font-semibold">Jump Back In</p>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {quickPicks.map(s => (
              <button key={s.id} onClick={() => playSong(s)}
                className="group flex items-center gap-3 bg-white/[0.03] hover:bg-white/[0.06] rounded-2xl p-3 transition-all duration-200 border border-white/[0.04] hover:border-white/[0.07] text-left">
                <img src={s.thumbnail} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0 shadow-md ring-1 ring-white/[0.05] transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold text-white leading-tight line-clamp-2">{s.title}</p>
                  <p className="text-[10px] text-white/30 truncate mt-0.5">{s.artist}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md shrink-0 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all">
                  <Play size={11} className="text-black ml-0.5" fill="black" />
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Moods */}
      <section className="mb-7 animate-in" style={{ animationDelay: '0.08s' }}>
        <div className="flex items-center gap-2 mb-3">
          <Music size={14} className="text-white/30" />
          <p className="text-[13px] text-white font-semibold">Moods & Genres</p>
        </div>
        <div className="flex gap-2 scroll-x pb-2">
          {MOODS.map(m => (
            <button key={m.label} onClick={() => loadMood(m)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full shrink-0 transition-all duration-200 active:scale-95 ${
                activeMood === m.label 
                  ? 'bg-white text-black font-bold shadow-lg' 
                  : 'bg-white/[0.04] text-white/60 border border-white/[0.05] hover:bg-white/[0.07]'
              }`}>
              <span className="text-[13px]">{m.emoji}</span>
              <span className="text-[12px] font-medium">{m.label}</span>
            </button>
          ))}
        </div>

        {/* Mood Results */}
        {moodLoading && <div className="flex justify-center py-8"><Loader2 size={18} className="text-white/30 animate-spin" /></div>}
        {!moodLoading && moodSongs && moodSongs.length > 0 && (
          <div className="mt-4 animate-in">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[14px] text-white font-semibold">{activeMood}</p>
              <button onClick={() => playSong(moodSongs[0], moodSongs)} className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full text-[11px] font-bold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all active:scale-95">
                <Play size={11} fill="black" /> Play All
              </button>
            </div>
            <div className="flex gap-3 scroll-x pb-1">
              {moodSongs.slice(0, 10).map(s => <SongCard key={s.id} song={s} />)}
            </div>
          </div>
        )}
      </section>

      {/* Loading */}
      {loading && (
        <div className="space-y-8 animate-fade">
          <div className="flex gap-4">{[...Array(5)].map((_, i) => <div key={i} className="shrink-0 w-[150px]"><div className="aspect-square skeleton rounded-2xl mb-2.5" /><div className="skeleton h-3 w-3/4 mb-1.5" /><div className="skeleton h-2.5 w-1/2" /></div>)}</div>
          <div className="flex gap-4">{[...Array(5)].map((_, i) => <div key={i} className="shrink-0 w-[150px]"><div className="aspect-square skeleton rounded-2xl mb-2.5" /><div className="skeleton h-3 w-3/4 mb-1.5" /><div className="skeleton h-2.5 w-1/2" /></div>)}</div>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="text-center py-24 animate-in">
          <div className="w-16 h-16 mx-auto mb-4 bg-white/[0.04] rounded-2xl flex items-center justify-center border border-white/[0.05]">
            <Music size={24} className="text-white/15" />
          </div>
          <p className="text-[15px] text-white font-semibold">Something went wrong</p>
          <p className="text-[12px] text-white/30 mt-1 mb-6">Unable to load music right now</p>
          <button onClick={loadData} className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black text-[12px] rounded-full font-bold shadow-lg hover:shadow-xl transition-all active:scale-95">
            <RefreshCw size={13} /> Try Again
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Up Next */}
          {currentSong && upNext.length > 0 && (
            <section className="mb-7 animate-in">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={14} className="text-white/30" />
                <p className="text-[13px] text-white font-semibold">Playing Next</p>
              </div>
              <div className="rounded-2xl border border-white/[0.04] overflow-hidden">
                {upNext.slice(0, 5).map((s, i) => <SongRow key={`${s.id}-${i}`} song={s} index={i} songList={upNext} />)}
              </div>
            </section>
          )}

          {/* Recently Played */}
          {!currentSong && recentSongs.length > 0 && (
            <section className="mb-7 animate-in" style={{ animationDelay: '0.12s' }}>
              <HorizontalScroll title="Recently Played">
                {recentSongs.map(s => <SongCard key={s.id} song={s} />)}
              </HorizontalScroll>
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
