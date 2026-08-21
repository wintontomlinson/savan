import { Link, useLocation } from 'react-router-dom';
import { House, Compass, Search, Library, Settings, Heart, ArrowDownToLine, History } from 'lucide-react';

const PRIMARY = [
  { to: '/', icon: House, label: 'Home' },
  { to: '/explore', icon: Compass, label: 'Explore' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/library', icon: Library, label: 'Library' },
];

const SHORTCUTS = [
  { to: '/library?tab=liked', icon: Heart, label: 'Liked Songs', tint: 'text-accent' },
  { to: '/library?tab=downloads', icon: ArrowDownToLine, label: 'Downloads', tint: 'text-sky-400' },
  { to: '/library?tab=history', icon: History, label: 'Recently Played', tint: 'text-amber-400' },
];

function Row({ to, icon: Icon, label, tint, active }) {
  return (
    <Link
      to={to}
      className={`group relative flex items-center gap-3.5 rounded-xl px-3 py-2.5 text-[13.5px] font-semibold transition-colors duration-200 ${
        active ? 'bg-white/[0.08] text-white' : 'text-white/55 hover:bg-white/[0.04] hover:text-white'
      }`}
      title={label}
    >
      {active && <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-accent" />}
      <Icon
        size={20}
        strokeWidth={active ? 2.3 : 1.8}
        className={`shrink-0 transition-colors ${
          active ? 'text-accent' : `${tint || 'text-white/45'} group-hover:text-white/80`
        }`}
      />
      <span className="hidden truncate lg:block">{label}</span>
    </Link>
  );
}

export default function Sidebar() {
  const { pathname, search } = useLocation();
  const tab = new URLSearchParams(search).get('tab');

  const isPrimary = (to) => {
    if (to === '/library') return pathname === '/library' && !tab;
    return to === '/' ? pathname === '/' : pathname.startsWith(to);
  };

  return (
    <aside className="hidden w-[76px] shrink-0 flex-col overflow-hidden rounded-2xl border border-hair bg-surface md:flex lg:w-[248px]">
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4 lg:px-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent-hi to-accent-lo shadow-lg shadow-accent/25">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 18V5l12-2v13" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="6" cy="18" r="3" fill="white" />
            <circle cx="18" cy="16" r="3" fill="white" />
          </svg>
        </div>
        <span className="hidden text-[15px] font-bold tracking-tight lg:block">Music Area</span>
      </div>

      <nav className="space-y-1 px-2 lg:px-3">
        {PRIMARY.map((item) => (
          <Row key={item.to} {...item} active={isPrimary(item.to)} />
        ))}
      </nav>

      <div className="mx-4 my-4 border-t border-hair lg:mx-5" />

      <p className="hidden px-5 pb-2 text-[10.5px] font-bold uppercase tracking-[0.14em] text-white/30 lg:block">
        Your Library
      </p>
      <nav className="space-y-1 px-2 lg:px-3">
        {SHORTCUTS.map((item) => (
          <Row key={item.to} {...item} active={pathname === '/library' && `?tab=${tab}` === item.to.split('/library')[1]} />
        ))}
      </nav>

      <div className="mt-auto px-2 pb-3 lg:px-3">
        <Row to="/settings" icon={Settings} label="Settings" active={pathname === '/settings'} />
      </div>
    </aside>
  );
}
