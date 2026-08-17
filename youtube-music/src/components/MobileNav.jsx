import { NavLink } from 'react-router-dom';
import { Home, Search, Library } from 'lucide-react';

const items = [
  { to: '/', icon: Home, label: 'Listen' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/library', icon: Library, label: 'Library' },
];

export default function MobileNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/10">
      <div className="flex items-center justify-around h-[50px]">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 w-full h-full ${isActive ? 'text-[#FC3C44]' : 'text-[#636366]'}`
            }
          >
            <item.icon size={20} />
            <span className="text-[9px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
