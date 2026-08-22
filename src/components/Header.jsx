import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, Sparkles } from 'lucide-react';

const TITLES = { '/': 'For you', '/explore': 'Browse', '/search': 'Search', '/library': 'Your collection' };

export default function Header() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [q, setQ] = useState('');
  const submit = (event) => {
    event.preventDefault();
    const term = q.trim();
    if (!term) return;
    navigate(`/search?q=${encodeURIComponent(term)}`);
    setQ('');
  };

  return (
    <header className="app-header sticky top-0 z-30 flex h-[76px] shrink-0 items-center gap-3 px-4 sm:px-7 lg:px-10">
      <div className="hidden items-center gap-3 md:flex">
        <button onClick={() => navigate(-1)} aria-label="Go back" className="press nav-circle"><ChevronLeft size={18} /></button>
        <div>
          <p className="header-overline">Savan radio</p>
          <h1 className="text-[15px] font-bold tracking-tight text-white">{TITLES[pathname] || 'Savan'}</h1>
        </div>
      </div>
      <Link to="/" className="flex items-center gap-2.5 md:hidden">
        <div className="brand-mark flex h-10 w-10 items-center justify-center rounded-[14px]">
          <Sparkles size={18} fill="currentColor" />
        </div>
        <span className="text-[18px] font-extrabold tracking-[-0.06em]">savan</span>
      </Link>
      <div className="flex-1" />
      {pathname !== '/search' && (
        <form onSubmit={submit} className="hidden md:block">
          <div className="header-search flex h-11 w-[270px] items-center gap-2.5 px-4 lg:w-[350px]">
            <Search size={16} className="shrink-0 text-white/45" />
            <input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search your next favorite" className="w-full bg-transparent text-[13px] font-medium placeholder:text-white/35 focus:outline-none" autoComplete="off" spellCheck="false" />
          </div>
        </form>
      )}
      <Link to="/search" aria-label="Search" className="header-mobile-search press flex h-10 w-10 items-center justify-center md:hidden"><Search size={18} /></Link>
    </header>
  );
}
