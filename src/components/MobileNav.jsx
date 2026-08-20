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
    <div className="bg-[#060606]/95 backdrop-blur-2xl border-t border-white/[0.05]">
      <div className="flex items-center justify-around h-[56px] px-2">
        {items.map(i => (
          <NavLink key={i.to} to={i.to} className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-3 transition-all duration-300 ${
              isActive ? 'text-white' : 'text-[#444]'
            }`
          }>
            {({ isActive }) => (
              <div className="relative">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  isActive ? 'bg-gradient-to-b from-rose-500/15 to-transparent scale-110' : 'hover:bg-white/[0.04]'
                }`}>
                  <i.icon size={20} strokeWidth={isActive ? 2.2 : 1.5} className={`transition-all duration-300 ${isActive ? 'text-fuchsia-400' : ''}`} />
                </div>
                {isActive && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-rose-400 rounded-full" />}
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
