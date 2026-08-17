import { NavLink } from 'react-router-dom';
import { Home, Search, Library } from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/library', icon: Library, label: 'Your Library' },
];

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-[240px] h-full bg-black fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#1DB954] rounded-full flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-black">
              <path d="M10 8.64L15.27 12 10 15.36V8.64M8 5v14l11-7L8 5z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-white">Savan</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-lg mb-0.5 transition-all ${
                isActive ? 'text-white bg-[#1A1A1A]' : 'text-[#A0A0A0] hover:text-white'
              }`
            }
          >
            <item.icon size={22} />
            <span className="text-sm font-semibold">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-6 my-3 border-t border-white/10"></div>

      {/* Bottom info */}
      <div className="mt-auto px-6 py-4">
        <p className="text-[10px] text-[#666] leading-relaxed">Powered by JioSaavn API</p>
      </div>
    </aside>
  );
}
