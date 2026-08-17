import { NavLink } from 'react-router-dom';
import { Home, Search, Library } from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/library', icon: Library, label: 'Library' },
];

export default function MobileNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0F0F0F] border-t border-white/5">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-4 py-1 transition-all duration-200 btn-press ${
                isActive ? 'text-white' : 'text-[#AAAAAA]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} />
                <span className="text-[10px] font-medium">{item.label}</span>
                {isActive && <div className="w-1 h-1 bg-[#FF0000] rounded-full mt-0.5"></div>}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
