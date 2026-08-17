import { NavLink } from 'react-router-dom';
import { Home, Compass, Library } from 'lucide-react';

const items = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/explore', icon: Compass, label: 'Explore' },
  { to: '/library', icon: Library, label: 'Library' },
];

export default function MobileNav() {
  return (
    <div className="flex items-center justify-around h-[52px]">
      {items.map(i => (
        <NavLink key={i.to} to={i.to} className={({ isActive }) =>
          `flex flex-col items-center justify-center gap-0.5 py-2 px-5 rounded-xl transition-all ${isActive ? 'text-[#FF0000]' : 'text-[#555]'}`
        }>
          <i.icon size={20} />
          <span className="text-[9px] font-medium">{i.label}</span>
        </NavLink>
      ))}
    </div>
  );
}
