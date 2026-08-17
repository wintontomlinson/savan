import { NavLink } from 'react-router-dom';
import { Home, Library, Search, Settings, User } from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/library', icon: Library, label: 'Library' },
];

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-[240px] h-full bg-[#0F0F0F] border-r border-white/5 fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 group cursor-pointer">
        <div className="w-8 h-8 bg-[#FF0000] rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(255,0,0,0.4)]">
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
            <path d="M10 8.64L15.27 12 10 15.36V8.64M8 5v14l11-7L8 5z" />
          </svg>
        </div>
        <span className="text-lg font-bold text-white transition-colors duration-200 group-hover:text-[#FF0000]">Music</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-lg mb-1 transition-all duration-200 group relative overflow-hidden ${
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-[#AAAAAA] hover:bg-[#282828] hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-0 bg-[#FF0000] rounded-r-full transition-all duration-300 ${isActive ? 'h-6' : ''}`}></div>
                <item.icon size={22} className="transition-all duration-200 group-hover:scale-110" />
                <span className="text-sm font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-white/5">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#282828] transition-all duration-200">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <User size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">User</p>
          </div>
          <button className="p-1.5 rounded-full hover:bg-[#383838] transition-all duration-200 hover:rotate-90">
            <Settings size={16} className="text-[#AAAAAA]" />
          </button>
        </div>
      </div>
    </aside>
  );
}
