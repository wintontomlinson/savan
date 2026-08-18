import { Music } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 h-14 flex items-center px-4 sm:px-6 lg:px-8 xl:px-10 bg-[#080808]/90 backdrop-blur-xl border-b border-white/[0.04]">
      <div className="max-w-[1400px] mx-auto w-full flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5 md:hidden">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-md shadow-rose-500/20">
            <Music size={14} className="text-white" />
          </div>
          <span className="text-[15px] font-bold text-white tracking-tight">Music Area</span>
        </div>
        {/* Desktop — just brand text */}
        <div className="hidden md:block">
          <span className="text-[14px] font-medium text-white/60">Music Area</span>
        </div>
      </div>
    </header>
  );
}
