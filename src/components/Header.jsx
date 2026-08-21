import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search, Settings } from 'lucide-react';

const TITLES = {
  '/': 'Listen Now',
  '/explore': 'Explore',
  '/search': 'Search',
  '/library': 'Library',
  '/settings': 'Settings',
};

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
    <header className="chrome sticky top-0 z-30 flex h-[60px] shrink-0 items-center gap-3 border-b border-hair px-4 sm:px-6 lg:px-8">
      {/* History nav — desktop */}
      <div className="hidden items-center gap-1.5 md:flex">
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="press flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white/70 transition-colors hover:bg-black/60 hover:text-white"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => navigate(1)}
          aria-label="Go forward"
          className="press flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white/70 transition-colors hover:bg-black/60 hover:text-white"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Brand — mobile */}
      <Link to="/" className="flex items-center gap-2.5 md:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-hi to-accent-lo shadow-md shadow-accent/20">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 18V5l12-2v13" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="6" cy="18" r="3" fill="white" />
            <circle cx="18" cy="16" r="3" fill="white" />
          </svg>
        </div>
        <span className="text-[15px] font-bold tracking-tight">Music Area</span>
      </Link>

      <h1 className="hidden text-[15px] font-bold tracking-tight text-white/80 md:block lg:text-[16px]">
        {TITLES[pathname] || 'Music Area'}
      </h1>

      <div className="flex-1" />

      {/* Search — desktop, hidden on the search page itself */}
      {pathname !== '/search' && (
        <form onSubmit={submit} className="hidden md:block">
          <div className="flex h-9 w-[230px] items-center gap-2 rounded-full border border-hair bg-white/[0.05] px-3.5 transition-colors focus-within:border-hair-strong focus-within:bg-white/[0.08] lg:w-[300px]">
            <Search size={15} className="shrink-0 text-white/40" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Songs, artists, albums"
              className="w-full bg-transparent text-[13px] font-medium placeholder:text-white/30 focus:outline-none"
              autoComplete="off"
              spellCheck="false"
            />
          </div>
        </form>
      )}

      <Link
        to="/search"
        aria-label="Search"
        className="press flex h-9 w-9 items-center justify-center rounded-full border border-hair bg-white/[0.05] text-white/70 md:hidden"
      >
        <Search size={17} />
      </Link>

      <Link
        to="/settings"
        aria-label="Settings"
        className={`press flex h-9 w-9 items-center justify-center rounded-full border border-hair transition-colors md:hidden ${
          pathname === '/settings' ? 'bg-white/[0.12] text-white' : 'bg-white/[0.05] text-white/70'
        }`}
      >
        <Settings size={17} />
      </Link>
    </header>
  );
}
