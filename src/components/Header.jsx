import SearchBar from './SearchBar';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 h-16 flex items-center px-4 sm:px-6 lg:px-8 xl:px-10 bg-[#080808]/90 backdrop-blur-xl border-b border-white/[0.04]">
      <div className="max-w-[1400px] mx-auto w-full">
        <SearchBar />
      </div>
    </header>
  );
}
