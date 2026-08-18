import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, Play, Loader2, SearchX, TrendingUp, Clock, RefreshCw, Music } from 'lucide-react';
import { searchSongs } from '../data/api';
import { usePlayer } from '../context/PlayerContext';
import { getHistory } from '../data/algorithm';
import SongRow from '../components/SongRow';

const TRENDING = ['Arijit Singh', 'Diljit Dosanjh', 'AP Dhillon', 'Shreya Ghoshal', 'Sidhu Moose Wala', 'Atif Aslam', 'Jubin Nautiyal', 'The Weeknd'];

export default function SearchResults() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const { playSong } = usePlayer();
  const [query, setQuery] = useState(q);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const requestId = useRef(0);
  const inputRef = useRef(null);

  useEffect(() => { setQuery(q); }, [q]);
  useEffect(() => { if (!q) inputRef.current?.focus(); }, []);

  const doSearch = async () => {
    if (!q?.trim()) return;
    setLoading(true);
    setError(false);
    const id = ++requestId.current;
    const s = await searchSongs(q, 30) || [];
    if (id !== requestId.current) return;
    if (s.length === 0) { setError(true); setLoading(false); return; }
    setSongs(s);
    setLoading(false);
  };

  useEffect(() => { if (q) doSearch(); }, [q]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) setParams({ q: query.trim() });
  };

  const quickSearch = (term) => { setQuery(term); setParams({ q: term }); };

  const recentArtists = [...new Set(getHistory().slice(0, 20).map(s => s.artist?.split(',')[0]?.trim()).filter(Boolean))].slice(0, 6);

  // No query — show discover page
  if (!q) return (
    <div className="pb-6 pt-2 animate-in">
      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555]" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="What do you want to listen to?"
          className="w-full bg-[#161616] text-white text-[15px] pl-12 pr-12 py-3.5 rounded-2xl placeholder:text-[#555] focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:bg-[#1a1a1a] transition-all border border-white/[0.04]"
          autoComplete="off"
          spellCheck="false"
        />
        {query && (
          <button type="button" onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
            <X size={12} className="text-[#999]" />
          </button>
        )}
      </form>
      {/* Recent */}
      {recentArtists.length > 0 && (
        <div className="mb-7">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={14} className="text-[#666]" />
            <p className="text-[13px] text-white font-semibold">Recent Searches</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentArtists.map(a => (
              <button key={a} onClick={() => quickSearch(a)}
                className="px-4 py-2.5 bg-[#111] hover:bg-[#181818] rounded-full text-[13px] text-white border border-white/[0.04] hover:border-white/[0.08] transition-all btn-press">
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
          <p className="text-[13px] text-white font-semibold">Trending Now</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {TRENDING.map((t, i) => (
            <button key={t} onClick={() => quickSearch(t)}
              className="flex items-center gap-3 p-3 bg-[#111] hover:bg-[#161616] rounded-xl border border-white/[0.04] hover:border-white/[0.08] transition-all btn-press text-left">
              <span className="text-[12px] text-rose-400 font-bold w-5">{i + 1}</span>
              <span className="text-[13px] text-white font-medium truncate">{t}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="pb-6 pt-2">
      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative mb-5">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555]" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="What do you want to listen to?"
          className="w-full bg-[#161616] text-white text-[15px] pl-12 pr-12 py-3.5 rounded-2xl placeholder:text-[#555] focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:bg-[#1a1a1a] transition-all border border-white/[0.04]"
          autoComplete="off"
          spellCheck="false"
        />
        {query && (
          <button type="button" onClick={() => { setQuery(''); setParams({}); setSongs([]); setError(false); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
            <X size={12} className="text-[#999]" />
          </button>
        )}
      </form>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-5 animate-in">
        <div>
          <h2 className="text-[18px] font-bold text-white">"{q}"</h2>
          <p className="text-[11px] text-[#666] mt-0.5">{loading ? 'Searching...' : songs.length > 0 ? `${songs.length} songs found` : ''}</p>
        </div>
        {songs.length > 0 && (
          <button onClick={() => playSong(songs[0], songs)}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-[12px] font-semibold rounded-full transition-colors btn-press shadow-lg shadow-rose-500/20">
            <Play size={13} fill="white" /> Play All
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={24} className="text-rose-500 animate-spin mb-3" />
          <p className="text-[12px] text-[#666]">Searching...</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="text-center py-20 animate-in">
          <div className="w-16 h-16 mx-auto mb-4 bg-white/[0.04] rounded-2xl flex items-center justify-center">
            <SearchX size={28} className="text-[#333]" />
          </div>
          <p className="text-[14px] text-white font-medium">No results found</p>
          <p className="text-[12px] text-[#666] mt-1 mb-5">Try different keywords or check spelling</p>
          <button onClick={doSearch} className="flex items-center gap-2 mx-auto px-4 py-2.5 bg-rose-500 text-white text-[13px] rounded-full btn-press font-medium">
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {/* Results */}
      {!loading && !error && songs.length > 0 && (
        <div className="animate-in">
          {/* Top Result - Featured Card */}
          <div className="mb-5">
            <p className="text-[12px] text-[#666] uppercase tracking-wider font-medium mb-3">Top Result</p>
            <button onClick={() => playSong(songs[0], songs)}
              className="group flex items-center gap-4 p-4 bg-gradient-to-r from-[#111] to-[#0e0e0e] rounded-2xl border border-white/[0.04] hover:border-white/[0.08] w-full sm:w-auto sm:max-w-md text-left transition-all btn-press">
              <img src={songs[0].thumbnail} alt="" className="w-20 h-20 rounded-xl object-cover shadow-lg ring-1 ring-white/[0.06]" loading="lazy" />
              <div className="flex-1 min-w-0">
                <p className="text-[16px] font-bold text-white truncate">{songs[0].title}</p>
                <p className="text-[13px] text-[#888] truncate mt-0.5">{songs[0].artist}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Music size={10} className="text-[#555]" />
                  <span className="text-[10px] text-[#555] capitalize">{songs[0].language || 'Song'}</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center shadow-xl shadow-rose-500/30 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 shrink-0">
                <Play size={18} className="text-white ml-0.5" fill="white" />
              </div>
            </button>
          </div>

          {/* All Songs */}
          <p className="text-[12px] text-[#666] uppercase tracking-wider font-medium mb-3">Songs</p>
          <div className="bg-[#0e0e0e] rounded-2xl overflow-hidden border border-white/[0.04]">
            {songs.map((s, i) => <SongRow key={`${s.id}-${i}`} song={s} index={i} songList={songs} />)}
          </div>
        </div>
      )}
    </div>
  );
}
