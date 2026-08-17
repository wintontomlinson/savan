import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PlayerProvider } from './context/PlayerContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MiniPlayer from './components/MiniPlayer';
import ExpandedPlayer from './components/ExpandedPlayer';
import MobileNav from './components/MobileNav';
import Toast from './components/Toast';
import Home from './pages/Home';
import Library from './pages/Library';
import Search from './pages/Search';

export default function App() {
  return (
    <PlayerProvider>
      <Router>
        <div className="flex h-screen bg-[#0F0F0F] overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col lg:ml-[240px] h-full">
            <Header />
            <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 pb-[140px] lg:pb-[100px]">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/library" element={<Library />} />
                <Route path="/search" element={<Search />} />
              </Routes>
            </main>
          </div>
          <MiniPlayer />
          <ExpandedPlayer />
          <MobileNav />
          <Toast />
        </div>
      </Router>
    </PlayerProvider>
  );
}
