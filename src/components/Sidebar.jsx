import { NavLink } from 'react-router-dom';
import { Home, Compass, Search, Library } from 'lucide-react';

const nav = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/explore', icon: Compass, label: 'Discover' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/library', icon: Library, label: 'Library' },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-[220px] h-full fixed left-0 top-0 z-20 bg-[#0A0A0B] border-r border-white/[0.04]">
      {/* Brand */}
      <div className="px-6 py-5 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
        </div>
        <span className="text-[15px] font-semibold text-white tracking-tight">MusicArea</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-4 space-y-0.5">
        {nav.map(item => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-fast ${
              isActive 
                ? 'bg-white/[0.06] text-white' 
                : 'text-[#A1A1AA] hover:text-white hover:bg-white/[0.03]'
            }`
          }>
            <item.icon size={18} strokeWidth={1.8} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/[0.04]">
        <p className="text-[10px] text-[#52525B]">MusicArea v2.0</p>
      </div>
    </aside>
  );
}
