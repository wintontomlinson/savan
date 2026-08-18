import { NavLink } from 'react-router-dom';
import { Home, Compass, Library, Music } from 'lucide-react';

const nav = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/explore', icon: Compass, label: 'Explore' },
  { to: '/library', icon: Library, label: 'Library' },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-[72px] lg:w-[240px] h-full bg-[#060606] border-r border-white/[0.04] fixed left-0 top-0 z-20 pt-14">
      {/* Brand */}
      <div className="px-4 lg:px-5 py-5 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
          <Music size={15} className="text-white" />
        </div>
        <span className="hidden lg:block text-[15px] font-bold text-white tracking-tight">Music Area</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 lg:px-3 mt-3 space-y-1">
        {nav.map(item => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 ${
              isActive
                ? 'bg-white/[0.06] text-white shadow-sm'
                : 'text-[#888] hover:text-white hover:bg-white/[0.03]'
            }`
          }>
            <item.icon size={19} strokeWidth={1.7} />
            <span className="hidden lg:block">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
