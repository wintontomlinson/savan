import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import { searchSongs } from '../data/api';

export default function Header() {
  const [query, setQuery] = useState('');
  const [show, setShow] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  const timer = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); return; }
    setLoading(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const r = await searchSongs(query, 5);
      setSuggestions(r);
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer.current);
  }, [query]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setShow(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const submit = (e) => {
    e.preventDefault();
    if (query.trim()) { navigate(`/search?q=${encodeURIComponent(query.trim())}`); setShow(false); }
  };

  return (
    <header className="sticky top-0 z-30 glass px-4 sm:px-6 py-3">
      <div ref={ref} className="w-full max-w-lg mx-auto relative">
        <form onSubmit={submit}>
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98989F]" />
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShow(true); }}
            onFocus={() => setShow(true)}
            placeholder="Artists, Songs, Albums"
            className="w-full bg-[#2C2C2E] text-white text-[14px] pl-10 pr-4 py-2.5 rounded-xl placeholder:text-[#636366] focus:outline-none focus:ring-2 focus:ring-[#FC3C44]/40 transition-all"
          />
        </form>

        {show && suggestions.length > 0 && (
          <div className="absolute top-full mt-2 w-full bg-[#2C2C2E] rounded-2xl shadow-2xl border border-white/5 overflow-hidden max-h-[55vh] overflow-y-auto animate-scale-in">
            {suggestions.map((song) => (
              <button
                key={song.id}
                onClick={() => { navigate(`/search?q=${encodeURIComponent(song.title)}`); setShow(false); setQuery(song.title); }}
                className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
              >
                <img src={song.image} alt="" className="w-11 h-11 rounded-lg object-cover" />
                <div className="text-left min-w-0 flex-1">
                  <p className="text-[14px] text-white truncate">{song.title}</p>
                  <p className="text-[12px] text-[#98989F] truncate">{song.artist}</p>
                </div>
              </button>
            ))}
            {loading && <div className="flex justify-center py-3"><Loader2 size={16} className="text-[#98989F] animate-spin" /></div>}
          </div>
        )}
      </div>
    </header>
  );
}
