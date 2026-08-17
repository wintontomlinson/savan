import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PlayerProvider } from './context/PlayerContext';
import { AuthProvider } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MiniPlayer from './components/MiniPlayer';
import ExpandedPlayer from './components/ExpandedPlayer';
import Toast from './components/Toast';
import MobileNav from './components/MobileNav';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Library from './pages/Library';
import SearchResults from './pages/SearchResults';

export default function App() {
  return (
    <AuthProvider><PlayerProvider><BrowserRouter>
      <div className="h-[100dvh] bg-[#0F0F0F] flex flex-col md:flex-row overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 min-h-0 md:ml-[72px] lg:ml-[240px]">
          <Header />
          <main className="flex-1 overflow-y-auto overflow-x-hidden pt-14 pb-36 md:pb-24 px-3 sm:px-5 lg:px-6 -webkit-overflow-scrolling-touch">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/library" element={<Library />} />
              <Route path="/search" element={<SearchResults />} />
            </Routes>
          </main>
        </div>
        <MiniPlayer />
        <ExpandedPlayer />
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0F0F0F] border-t border-[#1A1A1A]">
          <MobileNav />
        </nav>
        <Toast />
      </div>
    </BrowserRouter></PlayerProvider></AuthProvider>
  );
}
