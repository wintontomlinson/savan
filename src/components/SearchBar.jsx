import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { searchSongs } from '../data/api';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState([]);
  const ref = useRef(null);
  const timer = useRef(null);
  const nav = useNavigate();

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => { setResults(await searchSongs(query, 5)); }, 400);
  }, [query]);

  const submit = e => { e.preventDefault(); if (query.trim()) { nav(`/search?q=${encodeURIComponent(query.trim())}`); setOpen(false); } };

  return (
    <div ref={ref} className="relative w-full max-w-lg">
      <form onSubmit={submit} className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
        <input value={query} onChange={e => { setQuery(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)}
          placeholder="Search..." className="w-full bg-[#1A1A1A] text-white text-[14px] pl-9 pr-8 py-2.5 rounded-full placeholder:text-[#555] focus:outline-none focus:ring-1 focus:ring-[#FF0000]/40" />
        {query && <button type="button" onClick={() => { setQuery(''); setResults([]); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666]"><X size={14} /></button>}
      </form>
      {open && results.length > 0 && (
        <div className="absolute top-full mt-1.5 w-full bg-[#1A1A1A] rounded-2xl border border-[#272727] shadow-2xl overflow-hidden max-h-[60vh] overflow-y-auto z-50">
          {results.map(s => (
            <button key={s.id} onClick={() => { nav(`/search?q=${encodeURIComponent(s.title)}`); setOpen(false); setQuery(s.title); }}
              className="flex items-center gap-3 w-full px-4 py-3 hover:bg-[#272727] transition-colors border-b border-[#272727] last:border-0">
              <img src={s.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
              <div className="min-w-0 text-left flex-1">
                <p className="text-[13px] text-white truncate">{s.title}</p>
                <p className="text-[11px] text-[#888] truncate">{s.artist}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
