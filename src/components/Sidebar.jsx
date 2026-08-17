import { NavLink } from 'react-router-dom';
import { Home, Compass, Library, Music } from 'lucide-react';

const links = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/explore', icon: Compass, label: 'Explore' },
  { to: '/library', icon: Library, label: 'Library' },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-[72px] lg:w-[240px] h-full bg-[#0F0F0F] border-r border-[#1A1A1A] fixed left-0 top-0 z-30 pt-14">
      <div className="px-4 lg:px-5 py-4 flex items-center gap-2.5">
        <Music className="text-[#FF0000] shrink-0" size={22} />
        <span className="hidden lg:block text-white font-bold text-base">Music Area</span>
      </div>
      <nav className="flex-1 px-2 lg:px-3 space-y-0.5">
        {links.map(l => (
          <NavLink key={l.to} to={l.to} className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${isActive ? 'bg-[#1A1A1A] text-white' : 'text-[#888] hover:text-white hover:bg-[#1A1A1A]/50'}`
          }>
            <l.icon size={20} className="shrink-0" />
            <span className="hidden lg:block">{l.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
