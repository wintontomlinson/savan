import { NavLink } from 'react-router-dom';
import { Home, Compass, Library, Music } from 'lucide-react';

const links = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/explore', icon: Compass, label: 'Explore' },
  { to: '/library', icon: Library, label: 'Library' },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-[72px] lg:w-[240px] h-full bg-[#080808] border-r border-white/5 fixed left-0 top-0 z-30 pt-14">
      <div className="px-4 lg:px-5 py-5 flex items-center gap-2.5">
        <div className="w-8 h-8 bg-gradient-to-br from-[#FF0000] to-[#CC0000] rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
          <Music size={16} className="text-white" />
        </div>
        <span className="hidden lg:block text-white font-bold text-[15px]"></span>
      </div>
      <nav className="flex-1 px-2 lg:px-3 space-y-1 mt-2">
        {links.map(l => (
          <NavLink key={l.to} to={l.to} className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 ${isActive ? 'bg-white/[0.08] text-white shadow-sm' : 'text-[#777] hover:text-white hover:bg-white/[0.03]'}`
          }>
            <l.icon size={20} className="shrink-0" />
            <span className="hidden lg:block">{l.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
