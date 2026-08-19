import { Search, Bell } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 h-14 flex items-center px-4 sm:px-6 lg:px-8 xl:px-10 bg-[#080808]/95 backdrop-blur-xl border-b border-white/[0.04]">
      <div className="max-w-[1400px] mx-auto w-full flex items-center justify-between">
        {/* Logo — mobile only */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
            <span className="text-[11px] font-black text-white tracking-tighter">MA</span>
          </div>
          <span className="text-[15px] font-bold text-white tracking-tight">Music Area</span>
        </div>

        {/* Desktop — greeting + search shortcut */}
        <div className="hidden md:flex items-center gap-4">
          <span className="text-[14px] font-semibold text-white/70">Music Area</span>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <NavLink to="/search" className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.1] transition-colors active:scale-90 md:hidden">
            <Search size={15} className="text-white/60" />
          </NavLink>
        </div>
      </div>
    </header>
  );
}
