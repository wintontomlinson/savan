import { Link, useLocation } from 'react-router-dom';
import { Compass, House, Library, Search } from 'lucide-react';

const PRIMARY = [
  { to: '/', icon: House, label: 'Home' },
  { to: '/explore', icon: Compass, label: 'Discover' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/library', icon: Library, label: 'Library' },
];

function Row({ to, icon: Icon, label, active }) {
  return (
    <Link
      to={to}
      className={`group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[13px] font-semibold transition-all duration-200 ${
        active ? 'bg-white/[0.11] text-white shadow-[0_8px_24px_-18px_rgba(255,255,255,0.55)]' : 'text-white/50 hover:bg-white/[0.055] hover:text-white'
      }`}
      title={label}
    >
      {active && <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-accent" />}
      <Icon size={19} strokeWidth={active ? 2.3 : 1.8} className={`shrink-0 ${active ? 'text-accent' : 'text-white/45 group-hover:text-white/85'}`} />
      <span className="hidden truncate lg:block">{label}</span>
    </Link>
  );
}

export default function Sidebar() {
  const { pathname, search } = useLocation();
  const tab = new URLSearchParams(search).get('tab');
  const isPrimary = (to) => (to === '/library' ? pathname === '/library' && !tab : to === '/' ? pathname === '/' : pathname.startsWith(to));

  return (
    <aside className="hidden w-[76px] shrink-0 flex-col overflow-hidden rounded-3xl border border-hair bg-surface/95 p-2 md:flex lg:w-[244px]">
      <Link to="/" className="mb-5 flex items-center gap-3 px-2 pt-3 lg:px-3">
        <div className="brand-mark flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-lg shadow-accent/20">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 18V5l12-2v13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="6" cy="18" r="3" fill="white" />
            <circle cx="18" cy="16" r="3" fill="white" />
          </svg>
        </div>
        <span className="hidden text-[18px] font-extrabold tracking-[-0.05em] lg:block">savan</span>
      </Link>
      <nav className="space-y-1">{PRIMARY.map((item) => <Row key={item.to} {...item} active={isPrimary(item.to)} />)}</nav>
    </aside>
  );
}
