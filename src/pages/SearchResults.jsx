import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, Play, Loader2, SearchX, TrendingUp, Clock, RefreshCw } from 'lucide-react';
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

  return (
    <div className="pb-6 pt-2">
      {/* Search Input — pill shape */}
      <div className="sticky top-0 z-20 pb-2 pt-1">
        <form onSubmit={handleSubmit} className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => { if (query.length >= 2 && suggestions.length > 0) setShowSuggestions(true); }}
            placeholder="Search songs, artists, albums..."
            className="w-full bg-[#1c1c1e] text-white text-[14px] font-medium pl-11 pr-11 py-3 rounded-full placeholder:text-white/30 placeholder:font-normal focus:outline-none transition-all duration-300 border border-white/[0.06] focus:border-white/[0.1] focus:bg-[#222225]"
            autoComplete="off"
            spellCheck="false"
          />
          {query && (
            <button type="button" onClick={() => { setQuery(''); setSongs([]); setSuggestions([]); setError(false); setShowSuggestions(false); setParams({}); inputRef.current?.focus(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/[0.1] flex items-center justify-center hover:bg-white/[0.15] transition-all duration-200 active:scale-90">
              <X size={12} className="text-white/60" />
            </button>
          )}

          {/* Live Suggestions — inside form so it's positioned relative to input */}
          {showSuggestions && (
            <div className="absolute left-0 right-0 top-[calc(100%+10px)] bg-[#1c1c1e] rounded-2xl border border-[#2a2a2d] shadow-2xl shadow-black/80 overflow-hidden z-50 animate-scale">
              {sugLoading && (
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <Loader2 size={14} className="text-rose-400 animate-spin" />
                  <span className="text-[12px] text-white/40">Searching...</span>
                </div>
              )}
              {!sugLoading && suggestions.length > 0 && suggestions.map((s, i) => (
                <button key={s.id || i} onClick={() => { playSong(s, suggestions); setShowSuggestions(false); }}
                  className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/[0.04] active:bg-white/[0.07] transition-all duration-200 text-left border-b border-white/[0.03] last:border-0">
                  <img src={s.thumbnail} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0 ring-1 ring-white/[0.05]" loading="lazy" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] text-white truncate font-medium">{s.title}</p>
                    <p className="text-[10px] text-white/30 truncate">{s.artist}</p>
                  </div>
                  <Play size={12} className="text-white/20 shrink-0" />
                </button>
              ))}
              {!sugLoading && suggestions.length > 0 && (
                <button onClick={handleSubmit} className="w-full px-4 py-3 text-[11px] text-rose-400 font-semibold hover:bg-white/[0.03] transition-colors text-center">
                  See all results for "{query}"
                </button>
              )}
            </div>
          )}
        </form>
      </div>

      {/* Empty State — Recent + Trending */}
      {!q && (
        <div className="animate-in">
          {/* Recent */}
          {recentArtists.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Clock size={14} className="text-white/30" />
                <p className="text-[13px] text-white font-semibold">Recent Searches</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentArtists.map(a => (
                  <button key={a} onClick={() => quickSearch(a)}
                    className="px-4 py-2.5 bg-white/[0.04] hover:bg-white/[0.07] rounded-full text-[12px] text-white/70 font-medium border border-white/[0.04] hover:border-white/[0.08] transition-all duration-300 active:scale-95">
                    {a}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Trending */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={14} className="text-rose-400" />
              <p className="text-[14px] text-white font-bold">Trending</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TRENDING.map((t, i) => (
                <button key={t} onClick={() => quickSearch(t)}
                  className="flex items-center gap-3 px-4 py-3.5 bg-white/[0.02] hover:bg-white/[0.05] rounded-2xl border border-white/[0.03] hover:border-white/[0.06] transition-all duration-300 active:scale-[0.98] text-left group">
                  <span className={`text-[14px] font-bold w-6 shrink-0 tabular-nums ${i < 3 ? 'text-rose-400' : 'text-white/20'}`}>{i + 1}</span>
                  <span className="text-[13px] text-white/80 font-medium group-hover:text-white transition-colors">{t}</span>
                  <Play size={11} className="ml-auto text-white/0 group-hover:text-white/30 transition-all shrink-0" />
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Results */}
      {q && (
        <>
          <div className="flex items-center justify-between mb-4 animate-in">
            <div>
              <h2 className="text-[18px] font-bold text-white">"{q}"</h2>
              <p className="text-[11px] text-white/30 mt-0.5">{loading ? 'Searching...' : songs.length > 0 ? `${songs.length} songs found` : ''}</p>
            </div>
            {songs.length > 0 && (
              <button onClick={() => playSong(songs[0], songs)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white text-[12px] font-bold rounded-full shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 hover:scale-[1.02] transition-all duration-300 active:scale-95">
                <Play size={13} fill="white" /> Play All
              </button>
            )}
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-20 animate-in">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-3">
                <Loader2 size={20} className="text-rose-400 animate-spin" />
              </div>
              <p className="text-[12px] text-white/30">Finding music...</p>
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-20 animate-in">
              <div className="w-14 h-14 mx-auto mb-4 bg-white/[0.03] rounded-2xl flex items-center justify-center border border-white/[0.04]">
                <SearchX size={24} className="text-white/20" />
              </div>
              <p className="text-[15px] text-white font-semibold">No results</p>
              <p className="text-[12px] text-white/30 mt-1 mb-5">Try different keywords</p>
              <button onClick={doSearch} className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-white text-[12px] rounded-full font-medium transition-all duration-300 active:scale-95">
                <RefreshCw size={13} /> Retry
              </button>
            </div>
          )}

          {!loading && !error && songs.length > 0 && (
            <div className="animate-in">
              {/* Top Result — premium card */}
              <div className="mb-5">
                <button onClick={() => playSong(songs[0], songs)}
                  className="group flex items-center gap-4 p-4 bg-gradient-to-r from-white/[0.03] to-white/[0.01] rounded-2xl border border-white/[0.04] hover:border-white/[0.08] w-full text-left transition-all duration-300 hover:shadow-lg hover:shadow-black/20">
                  <img src={songs[0].thumbnail} alt="" className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-xl object-cover shadow-lg ring-1 ring-white/[0.05] transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] text-rose-400 font-semibold uppercase tracking-wider mb-1">Top Result</p>
                    <p className="text-[16px] sm:text-[18px] font-bold text-white truncate">{songs[0].title}</p>
                    <p className="text-[12px] text-white/40 truncate mt-0.5">{songs[0].artist}</p>
                  </div>
                  <div className="w-11 h-11 bg-gradient-to-r from-rose-500 to-rose-600 rounded-full flex items-center justify-center shadow-lg shadow-rose-500/20 shrink-0 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300">
                    <Play size={16} className="text-white ml-0.5" fill="white" />
                  </div>
                </button>
              </div>

              {/* Song List */}
              <div className="bg-[#0a0a0a] rounded-2xl overflow-hidden border border-white/[0.04]">
                {songs.slice(1).map((s, i) => <SongRow key={`${s.id}-${i}`} song={s} index={i + 1} songList={songs} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
