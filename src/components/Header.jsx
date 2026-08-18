import SearchBar from './SearchBar';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-30 md:pl-[220px] flex items-center px-4 sm:px-6 glass border-b border-white/[0.04]">
      {/* Mobile Brand */}
      <div className="md:hidden flex items-center gap-2 mr-3">
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
        </div>
      </div>
      
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <SearchBar />
      </div>
    </header>
  );
}
