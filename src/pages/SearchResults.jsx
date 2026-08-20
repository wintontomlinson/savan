import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, Play, Loader2, SearchX, TrendingUp, RefreshCw, Mic } from 'lucide-react';
import { searchSongs } from '../data/api';
import { usePlayer } from '../context/PlayerContext';
import { getHistory } from '../data/algorithm';
import SongRow from '../components/SongRow';

const TRENDING = ['Arijit Singh', 'Diljit Dosanjh', 'AP Dhillon', 'Shreya Ghoshal', 'Sidhu Moosewala', 'Atif Aslam', 'Jubin Nautiyal', 'The Weeknd', 'Karan Aujla', 'Pritam'];

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

  const recentArtists = [...new Set(getHistory().slice(0, 20).map(s => s.artist?.split(',')[0]?.trim()).filter(Boolean))].slice(0, 6);

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
            <Search size={17} className={`absolute left-4 transition-all duration-300 ${focused ? 'text-white/70 scale-110' : 'text-white/25'}`} />
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
              <button type="button" onClick={() => { setQuery(''); setSongs([]); setSuggestions([]); setError(false); setShowSuggestions(false); setParams({}); inputRef.current?.focus(); }}
                className="absolute right-3 w-8 h-8 rounded-full bg-white/[0.1] flex items-center justify-center hover:bg-white/[0.18] active:scale-85 transition-all duration-200">
                <X size={14} className="text-white/70" />
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
                  style={{ animationDelay: `${i * 30}ms` }}
                  className="flex items-center gap-3 w-full px-5 py-3.5 hover:bg-white/[0.04] active:bg-white/[0.07] transition-all duration-150 text-left border-b border-white/[0.03] last:border-0 animate-in">
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

      {/* Empty State */}
      {!q && (
        <div className="space-y-7 animate-in">
          {/* Recent */}
          {recentArtists.length > 0 && (
            <section>
              <p className="text-[12px] text-white/25 font-semibold uppercase tracking-wider mb-3">Recent</p>
              <div className="flex flex-wrap gap-2">
                {recentArtists.map(a => (
                  <button key={a} onClick={() => quickSearch(a)}
                    className="px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] rounded-full text-[12px] text-white/60 font-medium border border-white/[0.04] hover:border-white/[0.08] transition-all duration-200 active:scale-95 hover:scale-[1.02]">
                    {a}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Trending */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={15} className="text-rose-400" />
              <p className="text-[14px] text-white font-bold">Trending Searches</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {TRENDING.map((t, i) => (
                <button key={t} onClick={() => quickSearch(t)}
                  style={{ animationDelay: `${i * 30}ms` }}
                  className="flex items-center gap-3 px-4 py-3.5 bg-white/[0.02] hover:bg-white/[0.05] rounded-xl border border-white/[0.03] hover:border-white/[0.07] transition-all duration-200 active:scale-[0.98] text-left group animate-in hover:-translate-y-0.5">
                  <span className={`text-[13px] font-bold w-6 tabular-nums ${i < 3 ? 'text-rose-400' : 'text-white/15'}`}>{i + 1}</span>
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
              <h2 className="text-[20px] font-bold text-white">{q}</h2>
              <p className="text-[11px] text-white/25 mt-0.5">{loading ? 'Searching...' : songs.length > 0 ? `${songs.length} results` : ''}</p>
            </div>
            {songs.length > 0 && (
              <button onClick={() => playSong(songs[0], songs)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-[12px] font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-[1.03] active:scale-95 transition-all duration-300">
                <Play size={13} fill="black" /> Play All
              </button>
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
                <button onClick={() => playSong(songs[0], songs)}
                  className="group flex items-center gap-4 p-4 bg-white/[0.03] hover:bg-white/[0.05] rounded-2xl border border-white/[0.04] hover:border-white/[0.08] w-full text-left transition-all duration-300 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5">
                  <img src={songs[0].thumbnail} alt="" className="w-16 h-16 rounded-xl object-cover shadow-xl ring-1 ring-white/[0.06] group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-rose-400/70 font-semibold uppercase tracking-wider mb-1">Best Match</p>
                    <p className="text-[17px] font-bold text-white truncate">{songs[0].title}</p>
                    <p className="text-[12px] text-white/35 truncate mt-0.5">{songs[0].artist}</p>
                  </div>
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl shrink-0 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300">
                    <Play size={18} className="text-black ml-0.5" fill="black" />
                  </div>
                </button>
              </div>

              {/* Songs */}
              <div className="rounded-2xl border border-white/[0.04] overflow-hidden">
                {songs.slice(1).map((s, i) => <SongRow key={`${s.id}-${i}`} song={s} index={i + 1} songList={songs} />)}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
