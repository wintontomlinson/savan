import { NavLink } from 'react-router-dom';
import { Home, Search, Library, Compass } from 'lucide-react';

const items = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/explore', icon: Compass, label: 'Discover' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/library', icon: Library, label: 'Library' },
];

export default function MobileNav() {
  return (
    <div className="glass border-t border-white/[0.04] safe-area-pb">
      <div className="flex items-center justify-around h-[52px]">
        {items.map(i => (
          <NavLink key={i.to} to={i.to} className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 py-1.5 px-4 rounded-lg transition-fast ${
              isActive ? 'text-violet-400' : 'text-[#71717A]'
            }`
          }>
            <i.icon size={20} strokeWidth={1.8} />
            <span className="text-[9px] font-medium">{i.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
