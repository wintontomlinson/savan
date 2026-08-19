import { Search, Bell } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 h-14 flex items-center px-4 sm:px-6 lg:px-8 xl:px-10 bg-[#080808]/95 backdrop-blur-xl border-b border-white/[0.04]">
      <div className="max-w-[1400px] mx-auto w-full flex items-center justify-between">
        {/* Logo — mobile only */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#ff2d55] to-[#af52de] flex items-center justify-center shadow-lg shadow-[#ff2d55]/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="relative">
              <path d="M9 18V5l12-2v13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="6" cy="18" r="3" fill="white"/>
              <circle cx="18" cy="16" r="3" fill="white"/>
            </svg>
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
