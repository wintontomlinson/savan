import { Search } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 h-14 flex items-center px-4 sm:px-6 lg:px-8 xl:px-10 bg-[#060606]/90 backdrop-blur-2xl border-b border-white/[0.03] transition-all duration-300">
      <div className="max-w-[1400px] mx-auto w-full flex items-center justify-between">
        {/* Logo — mobile only */}
        <div className="flex items-center gap-2.5 md:hidden">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#ff2d55] to-[#af52de] flex items-center justify-center shadow-md shadow-[#ff2d55]/15 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="relative">
              <path d="M9 18V5l12-2v13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="6" cy="18" r="3" fill="white"/>
              <circle cx="18" cy="16" r="3" fill="white"/>
            </svg>
          </div>
          <span className="text-[15px] font-bold text-white tracking-tight">Music Area</span>
        </div>

        {/* Desktop */}
        <div className="hidden md:block">
          <span className="text-[14px] font-semibold text-white/50">Music Area</span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <NavLink to="/search" className="w-9 h-9 rounded-full bg-white/[0.04] flex items-center justify-center hover:bg-white/[0.08] transition-all duration-300 active:scale-90 md:hidden border border-white/[0.04]">
            <Search size={16} className="text-white/60" />
          </NavLink>
        </div>
      </div>
    </header>
  );
}
