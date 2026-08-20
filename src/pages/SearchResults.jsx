import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, Play, Loader2, SearchX, TrendingUp, RefreshCw } from 'lucide-react';
import { searchSongs } from '../data/api';
import { usePlayer } from '../context/PlayerContext';
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
          <div className={`flex items-center rounded-2xl transition-all duration-200 ${
            focused ? 'bg-[#1f1f22] ring-1 ring-white/[0.1] shadow-lg shadow-black/30' : 'bg-[#141416] ring-1 ring-white/[0.05]'
          }`}>
            <Search size={17} className={`absolute left-4 transition-colors ${focused ? 'text-white/60' : 'text-white/25'}`} />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => { setFocused(true); if (query.length >= 2 && suggestions.length > 0) setShowSuggestions(true); }}
              onBlur={() => setFocused(false)}
              placeholder="Search songs, artists..."
              className="w-full bg-transparent text-white text-[14px] font-medium pl-12 pr-12 py-3.5 rounded-2xl placeholder:text-white/25 focus:outline-none"
              autoComplete="off"
              spellCheck="false"
            />
            {query && (
              <button type="button" onClick={() => { setQuery(''); setSongs([]); setSuggestions([]); setError(false); setShowSuggestions(false); setParams({}); inputRef.current?.focus(); }}
                className="absolute right-3 w-7 h-7 rounded-full bg-white/[0.1] flex items-center justify-center hover:bg-white/[0.18] active:scale-90 transition-all">
                <X size={13} className="text-white/60" />
              </button>
            )}
          </div>

          {/* Suggestions */}
          {showSuggestions && (
            <div className="absolute left-0 right-0 top-[calc(100%+6px)] bg-[#1a1a1d] rounded-2xl border border-white/[0.06] shadow-2xl overflow-hidden z-50 animate-scale">
              {sugLoading && (
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <Loader2 size={14} className="text-white/30 animate-spin" />
                  <span className="text-[12px] text-white/30">Searching...</span>
                </div>
              )}
              {!sugLoading && suggestions.map((s, i) => (
                <button key={s.id || i} onClick={() => { playSong(s, suggestions); setShowSuggestions(false); }}
                  className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/[0.04] transition-colors text-left border-b border-white/[0.03] last:border-0">
                  <img src={s.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0 shadow-sm" loading="lazy" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] text-white truncate font-medium">{s.title}</p>
                    <p className="text-[10px] text-white/25 truncate">{s.artist}</p>
                  </div>
                  <Play size={11} className="text-white/15 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </form>
      </div>

      {/* Trending (when no search) */}
      {!q && (
        <section className="animate-in">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={14} className="text-white/30" />
            <p className="text-[14px] text-white font-bold">Trending</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {TRENDING.map((t, i) => (
              <button key={t} onClick={() => quickSearch(t)}
                className="flex items-center gap-3 px-4 py-3.5 bg-white/[0.02] hover:bg-white/[0.05] rounded-xl border border-white/[0.03] hover:border-white/[0.06] transition-all active:scale-[0.98] text-left group">
                <span className={`text-[13px] font-bold w-5 tabular-nums ${i < 3 ? 'text-rose-400' : 'text-white/20'}`}>{i + 1}</span>
                <span className="text-[13px] text-white/70 font-medium group-hover:text-white transition-colors">{t}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Results */}
      {q && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[18px] font-bold text-white">{q}</h2>
              <p className="text-[11px] text-white/25 mt-0.5">{loading ? 'Searching...' : songs.length > 0 ? `${songs.length} results` : ''}</p>
            </div>
            {songs.length > 0 && (
              <button onClick={() => playSong(songs[0], songs)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-black text-[12px] font-bold rounded-full shadow-md active:scale-95 transition-all">
                <Play size={12} fill="black" /> Play All
              </button>
            )}
          </div>

          {loading && (
            <div className="flex justify-center py-20">
              <Loader2 size={20} className="text-white/20 animate-spin" />
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-20">
              <SearchX size={28} className="text-white/10 mx-auto mb-3" />
              <p className="text-[14px] text-white/60 font-medium">No results</p>
              <p className="text-[12px] text-white/25 mt-1 mb-5">Try different keywords</p>
              <button onClick={doSearch} className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.06] text-white text-[12px] rounded-full font-medium active:scale-95 transition-all">
                <RefreshCw size={12} /> Retry
              </button>
            </div>
          )}

          {!loading && !error && songs.length > 0 && (
            <div className="rounded-2xl border border-white/[0.04] overflow-hidden">
              {songs.map((s, i) => <SongRow key={`${s.id}-${i}`} song={s} index={i} songList={songs} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
