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
      <div className="fixed inset-0 flex bg-[#080808]">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-0 min-w-0 md:ml-[72px] lg:ml-[240px]">
          <Header />
          <main className="flex-1 min-h-0 scroll-y pt-16 pb-32 md:pb-24 px-4 sm:px-6 lg:px-8 xl:px-10">
            <div className="max-w-[1400px] mx-auto">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/library" element={<Library />} />
                <Route path="/search" element={<SearchResults />} />
              </Routes>
            </div>
          </main>
        </div>
        <MiniPlayer />
        <ExpandedPlayer />
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30">
          <MobileNav />
        </div>
        <Toast />
      </div>
    </BrowserRouter></PlayerProvider></AuthProvider>
  );
}
