import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, Play, Loader2, SearchX, TrendingUp, Clock, RefreshCw, Music } from 'lucide-react';
import { searchSongs } from '../data/api';
import { usePlayer } from '../context/PlayerContext';
import { getHistory } from '../data/algorithm';
import SongRow from '../components/SongRow';

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
  const requestId = useRef(0);
  const sugTimer = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { setQuery(q); }, [q]);
  useEffect(() => { if (!q) inputRef.current?.focus(); }, []);

  // Full search when q changes (from URL)
  const doSearch = async () => {
    if (!q?.trim()) return;
    setLoading(true);
    setError(false);
    setShowSuggestions(false);
    const id = ++requestId.current;
    const s = await searchSongs(q, 30) || [];
    if (id !== requestId.current) return;
    if (s.length === 0) { setError(true); setLoading(false); return; }
    setSongs(s);
    setLoading(false);
  };

  useEffect(() => { if (q) doSearch(); }, [q]);

  // Live suggestions while typing
  useEffect(() => {
    if (query.length < 2 || query === q) { setSuggestions([]); setShowSuggestions(false); return; }
    setSugLoading(true);
    setShowSuggestions(true);
    if (sugTimer.current) clearTimeout(sugTimer.current);

    sugTimer.current = setTimeout(async () => {
      const results = await searchSongs(query, 5) || [];
      setSuggestions(results);
      setSugLoading(false);
    }, 300);

    return () => { if (sugTimer.current) clearTimeout(sugTimer.current); };
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) { setParams({ q: query.trim() }); setShowSuggestions(false); }
  };

  const quickSearch = (term) => { setQuery(term); setParams({ q: term }); setShowSuggestions(false); };

  const playSuggestion = (song) => {
    playSong(song, suggestions);
    setShowSuggestions(false);
  };

  const recentArtists = [...new Set(getHistory().slice(0, 20).map(s => s.artist?.split(',')[0]?.trim()).filter(Boolean))].slice(0, 6);

  return (
    <div className="pb-6 pt-2">
      {/* Search Input */}
      <div className="relative mb-5 sticky top-0 z-20 bg-[#080808] pb-2 -mx-1 px-1">
        <form onSubmit={handleSubmit} className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555]" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => { if (query.length >= 2 && suggestions.length > 0) setShowSuggestions(true); }}
            placeholder="What do you want to listen to?"
            className="w-full bg-[#141414] text-white text-[15px] pl-12 pr-12 py-3.5 rounded-2xl placeholder:text-[#555] focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:bg-[#1a1a1a] transition-all border border-white/[0.06]"
            autoComplete="off"
            spellCheck="false"
          />
          {query && (
            <button type="button" onClick={() => { setQuery(''); setSongs([]); setSuggestions([]); setError(false); setShowSuggestions(false); setParams({}); inputRef.current?.focus(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/15 transition-colors">
              <X size={13} className="text-[#999]" />
            </button>
          )}
        </form>

        {/* Live Suggestions Dropdown */}
        {showSuggestions && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#141414] rounded-2xl border border-white/[0.06] shadow-2xl shadow-black/60 overflow-hidden z-50 animate-scale">
            {sugLoading && (
              <div className="flex items-center gap-3 px-4 py-3">
                <Loader2 size={16} className="text-rose-500 animate-spin" />
                <span className="text-[12px] text-[#888]">Finding songs...</span>
              </div>
            )}
            {!sugLoading && suggestions.length > 0 && suggestions.map((s, i) => (
              <button key={s.id || i} onClick={() => playSuggestion(s)}
                className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/[0.04] active:bg-white/[0.06] transition-colors text-left border-b border-white/[0.03] last:border-0">
                <img src={s.thumbnail} alt="" className="w-11 h-11 rounded-xl object-cover shrink-0 ring-1 ring-white/[0.06]" loading="lazy" />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-white truncate font-medium">{s.title}</p>
                  <p className="text-[11px] text-[#666] truncate">{s.artist}</p>
                </div>
                <Play size={14} className="text-[#555] shrink-0" />
              </button>
            ))}
            {!sugLoading && suggestions.length > 0 && (
              <button onClick={handleSubmit} className="w-full px-4 py-3 text-[12px] text-rose-400 font-medium hover:bg-white/[0.03] transition-colors text-center">
                See all results for "{query}"
              </button>
            )}
          </div>
        )}
      </div>

      {/* No query state */}
      {!q && (
        <div className="animate-in">
          {/* Recent */}
          {recentArtists.length > 0 && (
            <div className="mb-7">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-[#666]" />
                  <p className="text-[13px] text-white font-semibold">Recent</p>
                </div>
                <button onClick={() => { localStorage.removeItem('ma_history'); showToast('History cleared'); window.location.reload(); }}
                  className="text-[11px] text-[#666] hover:text-white transition-colors btn-press">
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentArtists.map(a => (
                  <button key={a} onClick={() => quickSearch(a)}
                    className="px-4 py-2.5 bg-[#141414] hover:bg-[#1a1a1a] rounded-full text-[13px] text-white border border-white/[0.04] hover:border-white/[0.08] transition-all btn-press">
                    {a}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trending */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} className="text-rose-400" />
              <p className="text-[13px] text-white font-semibold">Trending</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {TRENDING.map((t, i) => (
                <button key={t} onClick={() => quickSearch(t)}
                  className="flex items-center gap-3 px-4 py-3 bg-[#111] hover:bg-[#161616] rounded-xl border border-white/[0.03] hover:border-white/[0.06] transition-all btn-press text-left">
                  <span className="text-[13px] text-rose-400/80 font-bold w-5 shrink-0">{i + 1}</span>
                  <span className="text-[13px] text-white font-medium">{t}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {q && (
        <>
          {/* Results Header */}
          <div className="flex items-center justify-between mb-4 animate-in">
            <div>
              <h2 className="text-[17px] font-bold text-white">Results for "{q}"</h2>
              <p className="text-[11px] text-[#666] mt-0.5">{loading ? 'Searching...' : songs.length > 0 ? `${songs.length} songs` : ''}</p>
            </div>
            {songs.length > 0 && (
              <div className="flex items-center gap-2">
                <button onClick={() => { setQuery(''); setParams({}); setSongs([]); setError(false); }}
                  className="px-3 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-[11px] text-[#aaa] font-medium rounded-full btn-press transition-colors">
                  Clear
                </button>
                <button onClick={() => playSong(songs[0], songs)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white text-black text-[12px] font-semibold rounded-full btn-press shadow-lg shadow-white/10 hover:shadow-white/20 transition-shadow">
                  <Play size={12} fill="black" /> Play All
                </button>
              </div>
            )}
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 size={22} className="text-rose-500 animate-spin mb-3" />
              <p className="text-[12px] text-[#666]">Searching...</p>
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-20 animate-in">
              <div className="w-14 h-14 mx-auto mb-4 bg-white/[0.04] rounded-2xl flex items-center justify-center">
                <SearchX size={24} className="text-[#444]" />
              </div>
              <p className="text-[14px] text-white font-medium">No results found</p>
              <p className="text-[12px] text-[#666] mt-1 mb-5">Try a different search</p>
              <button onClick={doSearch} className="flex items-center gap-2 mx-auto px-4 py-2.5 bg-white/[0.08] text-white text-[12px] rounded-full btn-press font-medium hover:bg-white/[0.12] transition-colors">
                <RefreshCw size={13} /> Retry
              </button>
            </div>
          )}

          {!loading && !error && songs.length > 0 && (
            <div className="animate-in">
              {/* Top Result */}
              <div className="mb-5">
                <button onClick={() => playSong(songs[0], songs)}
                  className="group flex items-center gap-4 p-4 bg-[#111] rounded-2xl border border-white/[0.04] hover:border-white/[0.08] w-full text-left transition-all btn-press">
                  <img src={songs[0].thumbnail} alt="" className="w-[72px] h-[72px] rounded-xl object-cover shadow-lg ring-1 ring-white/[0.06]" loading="lazy" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-rose-400 font-medium uppercase tracking-wider mb-1">Top Result</p>
                    <p className="text-[16px] font-bold text-white truncate">{songs[0].title}</p>
                    <p className="text-[12px] text-[#888] truncate mt-0.5">{songs[0].artist}</p>
                  </div>
                  <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-lg shrink-0 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                    <Play size={16} className="text-black ml-0.5" fill="black" />
                  </div>
                </button>
              </div>

              {/* Song List */}
              <div className="bg-[#0e0e0e] rounded-2xl overflow-hidden border border-white/[0.04]">
                {songs.slice(1).map((s, i) => <SongRow key={`${s.id}-${i}`} song={s} index={i + 1} songList={songs} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
