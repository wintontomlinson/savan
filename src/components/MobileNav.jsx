import { NavLink } from 'react-router-dom';
import { Home, Compass, Search, Library, Settings } from 'lucide-react';

const items = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/explore', icon: Compass, label: 'Explore' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/library', icon: Library, label: 'Library' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function MobileNav() {
  return (
    <div className="bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/[0.04]">
      <div className="flex items-center justify-around h-[52px]">
        {items.map(i => (
          <NavLink key={i.to} to={i.to} className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 py-1.5 px-3 rounded-xl transition-all duration-200 ${
              isActive ? 'text-white' : 'text-[#555]'
            }`
          }>
            {({ isActive }) => (
              <>
                <i.icon size={19} strokeWidth={isActive ? 2 : 1.5} className={isActive ? 'text-rose-400' : ''} />
                <span className={`text-[9px] font-medium ${isActive ? 'text-rose-400' : ''}`}>{i.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
