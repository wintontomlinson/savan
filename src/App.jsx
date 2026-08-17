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
      <div className="fixed inset-0 flex flex-col md:flex-row bg-[#080808]">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-0 md:ml-[72px] lg:ml-[240px]">
          <Header />
          <div className="flex-1 min-h-0 scroll-y pt-14 pb-32 md:pb-20 px-3 sm:px-5 lg:px-6">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/library" element={<Library />} />
              <Route path="/search" element={<SearchResults />} />
            </Routes>
          </div>
        </div>
        <MiniPlayer />
        <ExpandedPlayer />
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 glass border-t border-white/5">
          <MobileNav />
        </div>
        <Toast />
      </div>
    </BrowserRouter></PlayerProvider></AuthProvider>
  );
}
