import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PlayerProvider } from './context/PlayerContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MiniPlayer from './components/MiniPlayer';
import ExpandedPlayer from './components/ExpandedPlayer';
import QueueSidebar from './components/QueueSidebar';
import MobileNav from './components/MobileNav';
import Toast from './components/Toast';
import Home from './pages/Home';
import Library from './pages/Library';
import Artist from './pages/Artist';
import Album from './pages/Album';
import Playlist from './pages/Playlist';
import Search from './pages/Search';

export default function App() {
  return (
    <PlayerProvider>
      <Router>
        <div className="flex h-screen bg-[#0F0F0F] overflow-hidden">
          <Sidebar />

          <div className="flex-1 flex flex-col lg:ml-[240px] h-full">
            <Header />

            <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 pb-[180px] lg:pb-[120px]">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/library" element={<Library />} />
                <Route path="/artist/:id" element={<Artist />} />
                <Route path="/album/:id" element={<Album />} />
                <Route path="/playlist/:id" element={<Playlist />} />
                <Route path="/search" element={<Search />} />
              </Routes>
            </main>
          </div>

          <MiniPlayer />
          <ExpandedPlayer />
          <QueueSidebar />
          <MobileNav />
          <Toast />
        </div>
      </Router>
    </PlayerProvider>
  );
}
