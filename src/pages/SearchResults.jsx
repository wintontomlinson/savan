import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, Play, Loader2, SearchX, TrendingUp, RefreshCw, Clock, Trash2, Shuffle } from 'lucide-react';
import { searchSongs } from '../data/api';
import { usePlayer } from '../context/PlayerContext';
import { getHistory } from '../data/algorithm';
import SongRow from '../components/SongRow';
import SongCard from '../components/SongCard';
import HorizontalScroll from '../components/HorizontalScroll';

const TRENDING = ['Arijit Singh', 'Diljit Dosanjh', 'AP Dhillon', 'Shreya Ghoshal', 'Sidhu Moosewala', 'Atif Aslam', 'Jubin Nautiyal', 'The Weeknd', 'Karan Aujla', 'Pritam'];

export default function SearchResults() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const { playSong, showToast } = usePlayer();
  const [query, setQuery] = useState(q);
  const [songs, setSongs] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sugLoading, setSugLoading] = useState(false);
  const [error, setError] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focused, setFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ma_recent_searches')) || []; } catch { return []; }
  });
  const requestId = useRef(0);
  const sugTimer = useRef(null);
  const inputRef = useRef(null);

  const recentArtists = (() => {
    const hist = getHistory().slice(0, 50);
    const seen = new Set();
    const artists = [];
    for (const s of hist) {
      const name = s.artist?.split(',')[0]?.trim();
      if (name && !seen.has(name)) {
        seen.add(name);
        artists.push({ name, img: s.thumbnail });
      }
      if (artists.length >= 8) break;
    }
    return artists;
  })();
  const recentSongsFromHistory = getHistory().slice(0, 6);

  useEffect(() => { setQuery(q); }, [q]);
  useEffect(() => { if (!q) inputRef.current?.focus(); }, []);

  const doSearch = async () => {
    if (!q?.trim()) return;
    setLoading(true); setError(false); setShowSuggestions(false);
    // Save to recent searches
    const updated = [q, ...recentSearches.filter(s => s !== q)].slice(0, 10);
    setRecentSearches(updated);
    try { localStorage.setItem('ma_recent_searches', JSON.stringify(updated)); } catch {}
    
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
  
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('ma_recent_searches');
    showToast('Recent searches cleared');
  };

  const removeRecentSearch = (term) => {
    const updated = recentSearches.filter(s => s !== term);
    setRecentSearches(updated);
    try { localStorage.setItem('ma_recent_searches', JSON.stringify(updated)); } catch {}
  };

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
    <div className="pb-6 pt-3">
      {/* Search Bar */}
      <div className="sticky top-0 z-20 pb-4">
        <form onSubmit={handleSubmit} className="relative">
          <div className={`relative flex items-center rounded-2xl transition-all duration-300 ${
            focused
              ? 'bg-[#1c1c20] ring-1 ring-white/[0.12] shadow-2xl shadow-black/40'
              : 'bg-[#131315] ring-1 ring-white/[0.05] hover:ring-white/[0.08]'
          }`}>
            <Search size={17} className={`absolute left-4 transition-all duration-300 ${focused ? 'text-white/70' : 'text-white/25'}`} />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => { setFocused(true); if (query.length >= 2 && suggestions.length > 0) setShowSuggestions(true); }}
              onBlur={() => setFocused(false)}
              placeholder="What do you want to hear?"
              className="w-full bg-transparent text-white text-[15px] font-medium pl-12 pr-12 py-4 rounded-2xl placeholder:text-white/20 focus:outline-none"
              autoComplete="off"
              spellCheck="false"
            />
            {query && (
              <button type="button" onClick={clearSearch}
                className="absolute right-3 w-8 h-8 rounded-full bg-white/[0.12] flex items-center justify-center hover:bg-white/[0.2] active:scale-85 transition-all duration-200">
                <X size={14} className="text-white/80" />
              </button>
            )}
          </div>

          {/* Live Suggestions */}
          {showSuggestions && (
            <div className="absolute left-0 right-0 top-[calc(100%+6px)] bg-[#18181b] rounded-2xl border border-white/[0.06] shadow-2xl shadow-black/60 overflow-hidden z-50 animate-scale">
              {sugLoading && (
                <div className="flex items-center gap-3 px-5 py-4">
                  <Loader2 size={14} className="text-white/25 animate-spin" />
                  <span className="text-[12px] text-white/30">Searching...</span>
                </div>
              )}
              {!sugLoading && suggestions.map((s, i) => (
                <button key={s.id || i} onClick={() => { playSong(s, suggestions); setShowSuggestions(false); }}
                  className="flex items-center gap-3 w-full px-5 py-3.5 hover:bg-white/[0.04] active:bg-white/[0.07] transition-all duration-150 text-left border-b border-white/[0.03] last:border-0">
                  <img src={s.thumbnail} alt="" className="w-11 h-11 rounded-xl object-cover shrink-0 shadow-md" loading="lazy" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] text-white truncate font-medium">{s.title}</p>
                    <p className="text-[10px] text-white/25 truncate">{s.artist}</p>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center shrink-0">
                    <Play size={10} className="text-white/40 ml-0.5" fill="currentColor" />
                  </div>
                </button>
              ))}
              {!sugLoading && suggestions.length > 0 && (
                <button onClick={handleSubmit} className="w-full px-5 py-3.5 text-[12px] text-white/40 font-medium hover:bg-white/[0.03] hover:text-white/60 transition-all text-center">
                  View all results &rarr;
                </button>
              )}
            </div>
          )}
        </form>
      </div>

      {/* Empty State - Discovery */}
      {!q && (
        <div className="space-y-8 animate-in">
          {/* Recent Searches with clear */}
          {recentSearches.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock size={13} className="text-white/25" />
                  <p className="text-[12px] text-white/50 font-semibold">Recent Searches</p>
                </div>
                <button onClick={clearRecentSearches} className="flex items-center gap-1 text-[11px] text-white/25 hover:text-white/50 transition-colors active:scale-95">
                  <Trash2 size={11} /> Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map(term => (
                  <div key={term} className="flex items-center gap-1 bg-white/[0.04] rounded-full border border-white/[0.04] hover:border-white/[0.08] transition-all group">
                    <button onClick={() => quickSearch(term)} className="pl-3.5 pr-1 py-2 text-[12px] text-white/60 font-medium hover:text-white/80 transition-colors">
                      {term}
                    </button>
                    <button onClick={() => removeRecentSearch(term)} className="pr-2.5 py-2 text-white/20 hover:text-white/50 transition-colors">
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Recently Played Artists */}
          {recentArtists.length > 0 && (
            <section>
              <p className="text-[12px] text-white/50 font-semibold mb-3">Your Artists</p>
              <div className="flex gap-4 scroll-x pb-1">
                {recentArtists.map(a => (
                  <button key={a.name} onClick={() => quickSearch(a.name)}
                    className="flex flex-col items-center gap-2 shrink-0 group active:scale-95 transition-all">
                    <div className="w-16 h-16 rounded-full overflow-hidden ring-1 ring-white/[0.06] group-hover:ring-white/[0.15] shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                      <img src={a.img} alt={a.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" loading="lazy" />
                    </div>
                    <span className="text-[10px] text-white/40 font-medium text-center w-16 truncate group-hover:text-white/70 transition-colors">{a.name}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Recently Played Songs */}
          {recentSongsFromHistory.length > 0 && (
            <section>
              <HorizontalScroll title="Recently Played">
                {recentSongsFromHistory.map(s => <SongCard key={s.id} song={s} />)}
              </HorizontalScroll>
            </section>
          )}

          {/* Trending */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={15} className="text-rose-400" />
              <p className="text-[14px] text-white font-bold">Trending</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {TRENDING.map((t, i) => (
                <button key={t} onClick={() => quickSearch(t)}
                  className="flex items-center gap-3 px-4 py-3.5 bg-white/[0.02] hover:bg-white/[0.05] rounded-xl border border-white/[0.03] hover:border-white/[0.07] transition-all duration-200 active:scale-[0.98] text-left group hover:-translate-y-0.5">
                  <span className={`text-[13px] font-bold w-5 tabular-nums ${i < 3 ? 'text-rose-400' : 'text-white/15'}`}>{i + 1}</span>
                  <span className="text-[13px] text-white/70 font-medium group-hover:text-white transition-colors flex-1">{t}</span>
                  <Play size={11} className="text-white/0 group-hover:text-white/30 transition-all shrink-0" />
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Results */}
      {q && (
        <div className="animate-in">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[20px] font-black text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #fff 0%, #e879f9 60%, #a78bfa 100%)' }}>{q}</h2>
              <p className="text-[11px] text-white/25 mt-0.5">{loading ? 'Searching...' : songs.length > 0 ? `${songs.length} results` : ''}</p>
            </div>
            {songs.length > 0 && (
              <div className="flex items-center gap-2">
                <button onClick={() => { const s = [...songs].sort(() => Math.random() - 0.5); playSong(s[0], s); }}
                  className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.1] active:scale-90 transition-all">
                  <Shuffle size={14} className="text-white/60" />
                </button>
                <button onClick={() => playSong(songs[0], songs)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white text-[12px] font-bold rounded-full shadow-lg shadow-fuchsia-500/20 hover:shadow-fuchsia-500/30 hover:scale-[1.03] active:scale-95 transition-all duration-300">
                  <Play size={13} fill="white" /> Play All
                </button>
              </div>
            )}
          </div>

          {loading && (
            <div className="flex flex-col items-center py-20">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-3 animate-pulse">
                <Search size={18} className="text-white/15" />
              </div>
              <p className="text-[12px] text-white/20">Finding music...</p>
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-20">
              <SearchX size={28} className="text-white/10 mx-auto mb-3" />
              <p className="text-[14px] text-white/50 font-medium">No results found</p>
              <p className="text-[12px] text-white/20 mt-1 mb-5">Try different keywords</p>
              <button onClick={doSearch} className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.06] text-white/60 text-[12px] rounded-full font-medium active:scale-95 transition-all hover:bg-white/[0.1]">
                <RefreshCw size={12} /> Retry
              </button>
            </div>
          )}

          {!loading && !error && songs.length > 0 && (
            <>
              {/* Top Result */}
              <div className="mb-5">
                <p className="text-[10px] text-white/25 font-semibold uppercase tracking-wider mb-2 px-1">Best Match</p>
                <button onClick={() => playSong(songs[0], songs)}
                  className="group flex items-center gap-4 p-4 bg-white/[0.03] hover:bg-white/[0.05] rounded-2xl border border-white/[0.04] hover:border-white/[0.08] w-full text-left transition-all duration-300 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5">
                  <img src={songs[0].thumbnail} alt="" className="w-16 h-16 rounded-xl object-cover shadow-xl ring-1 ring-white/[0.06] group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[17px] font-bold text-white truncate">{songs[0].title}</p>
                    <p className="text-[12px] text-white/35 truncate mt-0.5">{songs[0].artist}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-fuchsia-500 to-violet-500 rounded-full flex items-center justify-center shadow-xl shadow-fuchsia-500/20 shrink-0 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300">
                    <Play size={18} className="text-white ml-0.5" fill="white" />
                  </div>
                </button>
              </div>

              {/* All Songs */}
              <div>
                <p className="text-[10px] text-white/25 font-semibold uppercase tracking-wider mb-2 px-1">All Results ({songs.length - 1})</p>
                <div className="rounded-2xl border border-white/[0.04] overflow-hidden">
                  {songs.slice(1).map((s, i) => <SongRow key={`${s.id}-${i}`} song={s} index={i + 1} songList={songs} />)}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
