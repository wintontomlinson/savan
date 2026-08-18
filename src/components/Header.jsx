import { Bell, Settings, Music } from 'lucide-react';
import SearchBar from './SearchBar';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 h-16 flex items-center px-4 sm:px-6 lg:px-8 xl:px-10 bg-[#080808]/90 backdrop-blur-xl border-b border-white/[0.04]">
      <div className="max-w-[1400px] mx-auto w-full flex items-center gap-4">
        {/* Logo + Name */}
        <div className="flex items-center gap-2.5 shrink-0 md:hidden">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-md shadow-rose-500/20">
            <Music size={14} className="text-white" />
          </div>
          <span className="text-[15px] font-bold text-white tracking-tight">Music Area</span>
        </div>

        {/* Search */}
        <div className="flex-1 min-w-0">
          <SearchBar />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button className="w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center transition-colors btn-press relative">
            <Bell size={17} className="text-[#aaa]" />
            <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
          </button>
          <button className="w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center transition-colors btn-press">
            <Settings size={17} className="text-[#aaa]" />
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center ml-1 cursor-pointer btn-press ring-2 ring-white/[0.08]">
            <span className="text-[11px] font-bold text-white">U</span>
          </div>
        </div>
      </div>
    </header>
  );
}
