import { NavLink } from 'react-router-dom';
import { House, Compass, Search, Library } from 'lucide-react';

const ITEMS = [
  { to: '/', icon: House, label: 'Home' },
  { to: '/explore', icon: Compass, label: 'Explore' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/library', icon: Library, label: 'Library' },
];

export default function MobileNav() {
  return (
    <nav className="chrome border-t border-hair pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="flex h-[58px] items-stretch justify-around">
        {ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className="press flex flex-1 flex-col items-center justify-center gap-1"
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={21}
                  strokeWidth={isActive ? 2.4 : 1.8}
                  className={isActive ? 'text-accent' : 'text-white/45'}
                />
                <span
                  className={`text-[10px] font-semibold tracking-tight ${isActive ? 'text-white' : 'text-white/45'}`}
                >
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
