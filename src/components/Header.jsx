import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, Search } from 'lucide-react';

const TITLES = { '/': 'Home', '/explore': 'Discover', '/search': 'Search', '/library': 'Library' };

export default function Header() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [q, setQ] = useState('');
  const submit = (e) => {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    navigate(`/search?q=${encodeURIComponent(term)}`);
    setQ('');
  };
  return (
    <header className="chrome sticky top-0 z-30 flex h-[68px] shrink-0 items-center gap-3 border-b border-hair px-4 sm:px-6 lg:px-9">
      <div className="hidden items-center gap-1 md:flex">
        <button onClick={() => navigate(-1)} aria-label="Go back" className="press nav-circle"><ChevronLeft size={18} /></button>
      </div>
      <Link to="/" className="flex items-center gap-2.5 md:hidden">
        <div className="brand-mark flex h-9 w-9 items-center justify-center rounded-xl"><span className="text-[19px] font-black">s</span></div>
        <span className="text-[17px] font-extrabold tracking-[-0.05em]">savan</span>
      </Link>
      <h1 className="hidden text-[15px] font-bold tracking-tight text-white/90 md:block">{TITLES[pathname] || 'Savan'}</h1>
      <div className="flex-1" />
      {pathname !== '/search' && <form onSubmit={submit} className="hidden md:block">
        <div className="flex h-10 w-[250px] items-center gap-2 rounded-2xl border border-hair bg-white/[0.045] px-3.5 transition-colors focus-within:border-white/20 focus-within:bg-white/[0.075] lg:w-[320px]">
          <Search size={15} className="shrink-0 text-white/38" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search songs, artists, albums" className="w-full bg-transparent text-[13px] font-medium placeholder:text-white/28 focus:outline-none" autoComplete="off" spellCheck="false" />
        </div>
      </form>}
      <Link to="/search" aria-label="Search" className="press flex h-10 w-10 items-center justify-center rounded-2xl border border-hair bg-white/[0.05] text-white/75 md:hidden"><Search size={18} /></Link>
    </header>
  );
}
