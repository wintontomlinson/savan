import { Link, useLocation } from 'react-router-dom';
import { Compass, House, Library, Search, Sparkles } from 'lucide-react';

const PRIMARY = [
  { to: '/', icon: House, label: 'Home', hint: 'Made for you' },
  { to: '/explore', icon: Compass, label: 'Discover', hint: 'Find a new sound' },
  { to: '/search', icon: Search, label: 'Search', hint: 'Everything in music' },
  { to: '/library', icon: Library, label: 'Library', hint: 'Your saved music' },
];

function Row({ to, icon: Icon, label, hint, active }) {
  return (
    <Link to={to} className={`sidebar-link group ${active ? 'sidebar-link-active' : ''}`} title={label}>
      <span className="sidebar-link-icon"><Icon size={18} strokeWidth={active ? 2.4 : 1.8} /></span>
      <span className="hidden min-w-0 lg:block">
        <span className="block truncate text-[13px] font-bold">{label}</span>
        <span className="mt-0.5 block truncate text-[10px] font-medium text-white/35 group-hover:text-white/55">{hint}</span>
      </span>
    </Link>
  );
}

export default function Sidebar() {
  const { pathname, search } = useLocation();
  const tab = new URLSearchParams(search).get('tab');
  const isPrimary = (to) => (to === '/library' ? pathname === '/library' && !tab : to === '/' ? pathname === '/' : pathname.startsWith(to));

  return (
    <aside className="studio-sidebar hidden w-[78px] shrink-0 flex-col overflow-hidden p-2.5 md:flex lg:w-[264px]">
      <Link to="/" className="sidebar-brand mb-8 flex items-center gap-3 px-2.5 pt-2 lg:px-3">
        <div className="brand-mark flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px]">
          <Sparkles size={19} fill="currentColor" />
        </div>
        <span className="hidden text-[20px] font-extrabold tracking-[-0.065em] lg:block">savan</span>
      </Link>
      <p className="sidebar-caption hidden lg:block">Your space</p>
      <nav className="space-y-1.5">{PRIMARY.map((item) => <Row key={item.to} {...item} active={isPrimary(item.to)} />)}</nav>
      <div className="sidebar-pro hidden mt-auto lg:block">
        <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-[#e9d7ff]"><Sparkles size={15} /></div>
        <p className="text-[12px] font-bold text-white">Listening is personal.</p>
        <p className="mt-1 text-[10.5px] leading-relaxed text-white/45">The more you play, the sharper your mixes become.</p>
      </div>
    </aside>
  );
}
