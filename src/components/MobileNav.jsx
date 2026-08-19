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
    <div className="bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/[0.05]">
      <div className="flex items-center justify-around h-[56px] px-2">
        {items.map(i => (
          <NavLink key={i.to} to={i.to} className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-2xl transition-all duration-200 ${
              isActive ? 'text-white' : 'text-[#555]'
            }`
          }>
            {({ isActive }) => (
              <>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  isActive ? 'bg-rose-500/10' : ''
                }`}>
                  <i.icon size={20} strokeWidth={isActive ? 2.2 : 1.5} className={isActive ? 'text-rose-400' : ''} />
                </div>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
