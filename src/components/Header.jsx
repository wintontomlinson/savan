import { useLocation } from 'react-router-dom';

export default function Header() {
  const { pathname } = useLocation();
  
  const getTitle = () => {
    if (pathname === '/') return 'Home';
    if (pathname === '/explore') return 'Explore';
    if (pathname === '/library') return 'Library';
    if (pathname === '/search') return 'Search';
    return '';
  };

  // Hide header on search page (has its own search bar)
  if (pathname === '/search') return null;

  return (
    <header className="fixed top-0 left-0 right-0 h-14 z-40 flex items-center px-4 sm:px-5 md:pl-[88px] lg:pl-[256px] glass border-b border-white/5">
      <h1 className="text-[15px] font-semibold text-white">{getTitle()}</h1>
    </header>
  );
}
