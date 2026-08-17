import SearchBar from './SearchBar';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 z-40 flex items-center px-3 sm:px-4 md:pl-[88px] lg:pl-[256px] bg-[#0a0a0a]/90 backdrop-blur-lg border-b border-white/5">
      <SearchBar />
    </header>
  );
}
