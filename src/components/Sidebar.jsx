import { NavLink } from 'react-router-dom';
import { Home, Compass, Search, Library, Settings, Disc3 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

const nav = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/explore', icon: Compass, label: 'Explore' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/library', icon: Library, label: 'Library' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { currentSong, isPlaying } = usePlayer();

  return (
    <aside className="hidden md:flex flex-col w-[72px] lg:w-[240px] h-full bg-[#040404] border-r border-white/[0.04] fixed left-0 top-0 z-20">
      {/* Brand */}
      <div className="px-4 lg:px-5 py-5 flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#ff2d55] to-[#af52de] flex items-center justify-center shadow-lg shadow-[#ff2d55]/25 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="relative">
            <path d="M9 18V5l12-2v13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="6" cy="18" r="3" fill="white"/>
            <circle cx="18" cy="16" r="3" fill="white"/>
          </svg>
        </div>
        <span className="hidden lg:block text-[16px] font-bold text-white tracking-tight">Music Area</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 lg:px-3 mt-2 space-y-0.5">
        {nav.map(item => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-3 rounded-xl text-[13px] font-medium transition-all duration-200 group ${
              isActive
                ? 'bg-white/[0.08] text-white'
                : 'text-[#666] hover:text-white hover:bg-white/[0.04]'
            }`
          }>
            {({ isActive }) => (
              <>
                <item.icon size={20} strokeWidth={isActive ? 2.2 : 1.5} className={isActive ? 'text-rose-400' : 'group-hover:text-white/80'} />
                <span className="hidden lg:block">{item.label}</span>
                {isActive && <div className="hidden lg:block ml-auto w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Now Playing */}
      {currentSong && (
        <div className="px-2 lg:px-3 pb-4 mt-auto">
          <div className="p-2.5 lg:p-3 bg-gradient-to-br from-white/[0.04] to-white/[0.02] rounded-2xl border border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className={`w-10 h-10 rounded-xl overflow-hidden shrink-0 ring-1 ring-white/[0.08] transition-shadow ${isPlaying ? 'shadow-lg shadow-rose-500/20' : ''}`}>
                <img src={currentSong.thumbnail} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="hidden lg:block min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-white truncate">{currentSong.title}</p>
                <p className="text-[10px] text-white/30 truncate">{currentSong.artist}</p>
              </div>
            </div>
            {isPlaying && (
              <div className="hidden lg:flex items-center gap-1.5 mt-2.5 px-0.5">
                <Disc3 size={11} className="text-rose-400 animate-[spin_3s_linear_infinite]" />
                <span className="text-[9px] text-rose-400/80 font-medium">Playing</span>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
