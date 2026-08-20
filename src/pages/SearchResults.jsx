import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, Play, Loader2, SearchX, TrendingUp, Clock, RefreshCw, Sparkles } from 'lucide-react';
import { searchSongs } from '../data/api';
import { usePlayer } from '../context/PlayerContext';
import { getHistory } from '../data/algorithm';
import SongRow from '../components/SongRow';

const TRENDING = ['Arijit Singh', 'Diljit Dosanjh', 'AP Dhillon', 'Shreya Ghoshal', 'Sidhu Moosewala', 'Atif Aslam', 'Jubin Nautiyal', 'The Weeknd', 'Karan Aujla', 'Pritam'];

const MOODS = [
  { label: 'Chill Vibes', query: 'lofi chill hindi', gradient: 'from-sky-500/30 to-blue-600/10', emoji: '🌊' },
  { label: 'Party Mode', query: 'party dance bollywood', gradient: 'from-rose-500/30 to-pink-600/10', emoji: '🎉' },
  { label: 'Sad Songs', query: 'sad hindi songs', gradient: 'from-indigo-500/30 to-purple-600/10', emoji: '💔' },
  { label: 'Workout', query: 'workout gym motivation', gradient: 'from-orange-500/30 to-red-600/10', emoji: '💪' },
  { label: 'Romance', query: 'romantic hindi songs', gradient: 'from-pink-500/30 to-rose-600/10', emoji: '❤️' },
  { label: 'Old School', query: '90s bollywood classic', gradient: 'from-amber-500/30 to-yellow-600/10', emoji: '🎵' },
];

export default function SearchResults() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const { playSong } = usePlayer();
  const [query, setQuery] = useState(q);
  const [songs, setSongs] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sugLoading, setSugLoading] = useState(false);
  const [error, setError] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focused, setFocused] = useState(false);
  const requestId = useRef(0);
  const sugTimer = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { setQuery(q); }, [q]);
  useEffect(() => { if (!q) inputRef.current?.focus(); }, []);

  const doSearch = async () => {
    if (!q?.trim()) return;
    setLoading(true); setError(false); setShowSuggestions(false);
    const id = ++requestId.current;
    const s = await searchSongs(q, 30) || [];
    if (id !== requestId.current) return;
    if (s.length === 0) { setError(true); setLoading(false); return; }
    setSongs(s); setLoading(false);
  };

  useEffect(() => { if (q) doSearch(); }, [q]);

  useEffect(() => {
    if (query.length < 2 || query === q) { setSuggestions([]); setShowSuggestions(false); return; }
    setSugLoading(true); setShowSuggestions(true);
    if (sugTimer.current) clearTimeout(sugTimer.current);
    sugTimer.current = setTimeout(async () => {
      const results = await searchSongs(query, 5) || [];
      setSuggestions(results); setSugLoading(false);
    }, 300);
    return () => { if (sugTimer.current) clearTimeout(sugTimer.current); };
  }, [query]);

  const handleSubmit = (e) => { e.preventDefault(); if (query.trim()) { setParams({ q: query.trim() }); setShowSuggestions(false); } };
  const quickSearch = (term) => { setQuery(term); setParams({ q: term }); setShowSuggestions(false); };
  const recentArtists = [...new Set(getHistory().slice(0, 20).map(s => s.artist?.split(',')[0]?.trim()).filter(Boolean))].slice(0, 8);

  const clearSearch = () => {
    setQuery('');
    setSongs([]);
    setSuggestions([]);
    setError(false);
    setShowSuggestions(false);
    setParams({});
    inputRef.current?.focus();
  };

  return (
    <div className="pb-6 pt-2">
      {/* Search Bar */}
      <div className="sticky top-0 z-20 pb-4 pt-1">
        <form onSubmit={handleSubmit} className="relative">
          <div className={`relative flex items-center transition-all duration-300 rounded-2xl ${
            focused
              ? 'bg-[#1f1f23] shadow-xl shadow-black/40 ring-1 ring-white/[0.1]'
              : 'bg-[#151517] ring-1 ring-white/[0.05]'
          }`}>
            <Search size={18} className={`absolute left-4 transition-colors duration-200 ${focused ? 'text-rose-400' : 'text-white/30'}`} />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => { setFocused(true); if (query.length >= 2 && suggestions.length > 0) setShowSuggestions(true); }}
              onBlur={() => setFocused(false)}
              placeholder="What do you want to listen to?"
              className="w-full bg-transparent text-white text-[15px] font-medium pl-12 pr-12 py-4 rounded-2xl placeholder:text-white/25 placeholder:font-normal focus:outline-none"
              autoComplete="off"
              spellCheck="false"
            />
            {query && (
              <button type="button" onClick={clearSearch}
                className="absolute right-3 w-8 h-8 rounded-full bg-white/[0.1] flex items-center justify-center hover:bg-white/[0.18] transition-all duration-200 active:scale-90">
                <X size={14} className="text-white/70" />
              </button>
            )}
          </div>

          {/* Live Suggestions Dropdown */}
          {showSuggestions && (
            <div className="absolute left-0 right-0 top-[calc(100%+6px)] bg-[#1a1a1d] rounded-2xl border border-white/[0.06] shadow-2xl shadow-black/80 overflow-hidden z-50 animate-scale">
              {sugLoading && (
                <div className="flex items-center gap-3 px-5 py-4">
                  <Loader2 size={14} className="text-rose-400 animate-spin" />
                  <span className="text-[12px] text-white/40">Searching...</span>
                </div>
              )}
              {!sugLoading && suggestions.length > 0 && suggestions.map((s, i) => (
                <button key={s.id || i} onClick={() => { playSong(s, suggestions); setShowSuggestions(false); }}
                  className="flex items-center gap-3 w-full px-5 py-3.5 hover:bg-white/[0.05] active:bg-white/[0.08] transition-all duration-150 text-left border-b border-white/[0.04] last:border-0">
                  <img src={s.thumbnail} alt="" className="w-11 h-11 rounded-xl object-cover shrink-0 shadow-md" loading="lazy" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] text-white truncate font-medium">{s.title}</p>
                    <p className="text-[11px] text-white/30 truncate">{s.artist}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center shrink-0">
                    <Play size={11} className="text-white/50 ml-0.5" fill="currentColor" />
                  </div>
                </button>
              ))}
              {!sugLoading && suggestions.length > 0 && (
                <button onClick={handleSubmit} className="w-full px-5 py-3.5 text-[12px] text-rose-400 font-semibold hover:bg-white/[0.03] transition-colors text-center">
                  View all results
                </button>
              )}
            </div>
          )}
        </form>
      </div>

      {/* Empty State - Discovery */}
      {!q && (
        <div className="animate-in space-y-8">
          {/* Mood Cards */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={15} className="text-rose-400" />
              <p className="text-[14px] text-white font-bold">Browse by Mood</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {MOODS.map(mood => (
                <button key={mood.label} onClick={() => quickSearch(mood.query)}
                  className={`relative overflow-hidden rounded-2xl p-4 text-left transition-all duration-200 active:scale-[0.97] bg-gradient-to-br ${mood.gradient} border border-white/[0.04] hover:border-white/[0.08] group`}>
                  <span className="text-[20px] mb-1.5 block">{mood.emoji}</span>
                  <p className="text-[13px] font-semibold text-white">{mood.label}</p>
                  <div className="absolute right-3 bottom-3 w-7 h-7 rounded-full bg-white/[0.08] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play size={10} className="text-white ml-0.5" fill="white" />
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Recent Searches */}
          {recentArtists.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Clock size={13} className="text-white/30" />
                <p className="text-[13px] text-white font-semibold">Recent</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentArtists.map(a => (
                  <button key={a} onClick={() => quickSearch(a)}
                    className="px-4 py-2.5 bg-white/[0.05] hover:bg-white/[0.09] rounded-full text-[12px] text-white/70 font-medium border border-white/[0.05] hover:border-white/[0.1] transition-all duration-200 active:scale-95">
                    {a}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Trending */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={15} className="text-emerald-400" />
              <p className="text-[14px] text-white font-bold">Trending Now</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TRENDING.map((t, i) => (
                <button key={t} onClick={() => quickSearch(t)}
                  className="flex items-center gap-3.5 px-4 py-3.5 bg-white/[0.03] hover:bg-white/[0.06] rounded-2xl border border-white/[0.04] hover:border-white/[0.07] transition-all duration-200 active:scale-[0.98] text-left group">
                  <span className={`text-[14px] font-bold w-7 h-7 rounded-lg flex items-center justify-center shrink-0 tabular-nums ${
                    i < 3 ? 'bg-rose-500/15 text-rose-400' : 'bg-white/[0.04] text-white/25'
                  }`}>{i + 1}</span>
                  <span className="text-[13px] text-white/80 font-medium group-hover:text-white transition-colors flex-1">{t}</span>
                  <Play size={12} className="text-white/0 group-hover:text-white/30 transition-all shrink-0" />
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Results */}
      {q && (
        <>
          <div className="flex items-center justify-between mb-5 animate-in">
            <div>
              <h2 className="text-[20px] font-bold text-white">{q}</h2>
              <p className="text-[11px] text-white/30 mt-0.5">{loading ? 'Searching...' : songs.length > 0 ? `${songs.length} results` : ''}</p>
            </div>
            {songs.length > 0 && (
              <button onClick={() => playSong(songs[0], songs)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-[12px] font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 active:scale-95">
                <Play size={13} fill="black" /> Play All
              </button>
            )}
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-24 animate-in">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500/15 to-purple-500/10 flex items-center justify-center mb-4 border border-rose-500/10">
                <Loader2 size={22} className="text-rose-400 animate-spin" />
              </div>
              <p className="text-[13px] text-white/30 font-medium">Finding music...</p>
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-24 animate-in">
              <div className="w-16 h-16 mx-auto mb-4 bg-white/[0.03] rounded-2xl flex items-center justify-center border border-white/[0.05]">
                <SearchX size={26} className="text-white/15" />
              </div>
              <p className="text-[16px] text-white font-semibold">No results found</p>
              <p className="text-[12px] text-white/30 mt-1 mb-6">Try searching with different keywords</p>
              <button onClick={doSearch} className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-white text-[12px] rounded-full font-medium transition-all duration-300 active:scale-95 border border-white/[0.06]">
                <RefreshCw size={13} /> Try Again
              </button>
            </div>
          )}

          {!loading && !error && songs.length > 0 && (
            <div className="animate-in">
              {/* Top Result Card */}
              <div className="mb-5">
                <p className="text-[11px] text-white/30 font-semibold uppercase tracking-wider mb-2.5 px-1">Best Match</p>
                <button onClick={() => playSong(songs[0], songs)}
                  className="group flex items-center gap-4 p-4 bg-gradient-to-r from-white/[0.04] to-white/[0.02] rounded-2xl border border-white/[0.05] hover:border-white/[0.1] w-full text-left transition-all duration-300 hover:shadow-xl hover:shadow-black/20">
                  <img src={songs[0].thumbnail} alt="" className="w-[72px] h-[72px] rounded-xl object-cover shadow-xl ring-1 ring-white/[0.06] transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[17px] font-bold text-white truncate">{songs[0].title}</p>
                    <p className="text-[12px] text-white/40 truncate mt-1">{songs[0].artist}</p>
                  </div>
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl shrink-0 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300">
                    <Play size={18} className="text-black ml-0.5" fill="black" />
                  </div>
                </button>
              </div>

              {/* Songs List */}
              <div>
                <p className="text-[11px] text-white/30 font-semibold uppercase tracking-wider mb-2.5 px-1">Songs</p>
                <div className="rounded-2xl overflow-hidden border border-white/[0.04]">
                  {songs.slice(1).map((s, i) => <SongRow key={`${s.id}-${i}`} song={s} index={i + 1} songList={songs} />)}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
