import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2 } from 'lucide-react';
import { searchSongs } from '../data/api';
import { ytmSearchSongs } from '../data/ytmusic';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const ref = useRef(null);
  const timer = useRef(null);
  const requestId = useRef(0);
  const nav = useNavigate();

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('touchstart', h);
    document.addEventListener('mousedown', h);
    return () => { document.removeEventListener('touchstart', h); document.removeEventListener('mousedown', h); };
  }, []);

  useEffect(() => {
    if (query.length < 2) { setResults([]); setLoading(false); setError(false); return; }
    setLoading(true);
    setError(false);
    if (timer.current) clearTimeout(timer.current);

    timer.current = setTimeout(async () => {
      const id = ++requestId.current;
      // Try JioSaavn first (always works), YT is optional bonus
      let saavnResults = [];
      let ytResults = [];
      try {
        saavnResults = await searchSongs(query, 6) || [];
      } catch { saavnResults = []; }
      try {
        ytResults = await ytmSearchSongs(query, 3) || [];
      } catch { ytResults = []; }
      if (id !== requestId.current) return;
      // Combine: JioSaavn first (playable), then YT Music (if any)
      const combined = [...saavnResults, ...ytResults.map(r => ({ ...r, ytOnly: true }))];
      if (combined.length === 0 && query.length >= 2) setError(true);
      setResults(combined);
      setLoading(false);
    }, 400);

    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [query]);

  const submit = e => {
    e.preventDefault();
    if (query.trim()) { nav(`/search?q=${encodeURIComponent(query.trim())}`); setOpen(false); }
  };

  return (
    <div ref={ref} className="relative w-full max-w-lg">
      <form onSubmit={submit} className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555]" />
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search songs, artists..."
          className="w-full bg-[#1a1a1a] text-white text-[14px] pl-10 pr-10 py-2.5 rounded-full placeholder:text-[#555] focus:outline-none focus:bg-[#222] transition-colors"
        />
        {query && <button type="button" onClick={() => { setQuery(''); setResults([]); setError(false); }} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#555]"><X size={16} /></button>}
      </form>

      {open && (results.length > 0 || loading || error) && (
        <div className="absolute top-full mt-2 w-full bg-[#141414] rounded-2xl border border-[#222] shadow-2xl overflow-hidden z-50 max-h-[70vh] scroll-y">
          {loading && <div className="flex justify-center py-4"><Loader2 size={18} className="text-[#FF0000] animate-spin" /></div>}
          {error && !loading && <p className="text-[13px] text-[#666] text-center py-4">No results found</p>}
          {results.map((s, i) => (
            <button key={s.id || i} onClick={async () => {
              if (s.ytOnly) {
                // YT result — just search on JioSaavn for guaranteed playback
                setOpen(false); setQuery(s.title);
                nav(`/search?q=${encodeURIComponent(s.title + ' ' + s.artist)}`);
              } else {
                nav(`/search?q=${encodeURIComponent(s.title)}`);
                setOpen(false); setQuery(s.title);
              }
            }}
              className="flex items-center gap-3 w-full px-4 py-3 active:bg-[#222] hover:bg-[#1a1a1a] transition-colors text-left">
              <img src={s.thumbnail} alt="" className="w-11 h-11 rounded-lg object-cover shrink-0" loading="lazy" />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] text-white truncate font-medium">{s.title}</p>
                <p className="text-[11px] text-[#777] truncate">{s.artist}</p>
              </div>
              {s.ytOnly && <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full shrink-0">YT</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
