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
      <div className="fixed inset-0 flex bg-[#0A0A0B]">
        {/* Desktop Sidebar */}
        <Sidebar />
        
        {/* Main Area */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0 md:ml-[220px]">
          <Header />
          <main className="flex-1 min-h-0 scroll-y pt-16 pb-[140px] md:pb-[88px]">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/library" element={<Library />} />
                <Route path="/search" element={<SearchResults />} />
              </Routes>
            </div>
          </main>
        </div>

        {/* Player */}
        <MiniPlayer />
        <ExpandedPlayer />
        
        {/* Mobile Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30">
          <MobileNav />
        </div>
        
        <Toast />
      </div>
    </BrowserRouter></PlayerProvider></AuthProvider>
  );
}
