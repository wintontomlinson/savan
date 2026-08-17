import { NavLink } from 'react-router-dom';
import { Home, Search, Library, Music2 } from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'Listen Now' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/library', icon: Library, label: 'Library' },
];

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-[260px] h-full bg-[#1C1C1E] fixed left-0 top-0 z-40 border-r border-white/5">
      {/* Logo */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-[#FC3C44] to-[#FF2D55] rounded-xl flex items-center justify-center">
            <Music2 size={18} className="text-white" />
          </div>
          <span className="text-[17px] font-semibold text-white tracking-tight">Music</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="px-3 mt-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl mb-0.5 transition-all ${
                isActive ? 'bg-white/10 text-white' : 'text-[#98989F] hover:text-white hover:bg-white/5'
              }`
            }
          >
            <item.icon size={20} />
            <span className="text-[14px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-6 py-5">
        <p className="text-[10px] text-[#48484A]">Powered by JioSaavn</p>
      </div>
    </aside>
  );
}
