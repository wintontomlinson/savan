import { NavLink } from 'react-router-dom';
import { Home, Compass, Library, Music } from 'lucide-react';

const items = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/explore', icon: Compass, label: 'Explore' },
  { to: '/library', icon: Library, label: 'Library' },
];

export default function MobileNav() {
  return (
    <div className="flex items-center h-[52px]">
      {/* Logo */}
      <div className="flex items-center gap-1.5 pl-4 pr-2 shrink-0">
        <div className="w-6 h-6 bg-gradient-to-br from-[#FF0000] to-[#CC0000] rounded-lg flex items-center justify-center">
          <Music size={12} className="text-white" />
        </div>
        <span className="text-[11px] font-bold text-white tracking-tight"></span>
      </div>

      {/* Nav Items */}
      <div className="flex-1 flex items-center justify-around">
        {items.map(i => (
          <NavLink key={i.to} to={i.to} className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 py-2 px-3 rounded-xl transition-all ${isActive ? 'text-[#FF0000]' : 'text-[#555]'}`
          }>
            <i.icon size={20} />
            <span className="text-[9px] font-medium">{i.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
