import { NavLink } from 'react-router-dom';
import { Home, Compass, Library } from 'lucide-react';

const items = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/explore', icon: Compass, label: 'Explore' },
  { to: '/library', icon: Library, label: 'Library' },
];

export default function MobileNav() {
  return (
    <div className="glass border-t border-white/[0.04]">
      <div className="flex items-center justify-around h-[52px]">
        {items.map(i => (
          <NavLink key={i.to} to={i.to} className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 py-1.5 px-4 rounded-xl transition-all duration-150 ${
              isActive ? 'text-rose-400' : 'text-[#555]'
            }`
          }>
            <i.icon size={20} strokeWidth={1.7} />
            <span className="text-[9px] font-medium">{i.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
