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
          `flex flex-col items-center justify-center gap-0.5 min-w-[60px] py-1.5 ${isActive ? 'text-[#FF0000]' : 'text-[#555]'}`
        }>
          <i.icon size={22} />
          <span className="text-[10px] font-medium">{i.label}</span>
        </NavLink>
      ))}
    </div>
  );
}
