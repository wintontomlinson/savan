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
import Explore from './pages/Explore';
import Library from './pages/Library';
import Premium from './pages/Premium';
import Artist from './pages/Artist';
import Album from './pages/Album';
import Playlist from './pages/Playlist';
import Search from './pages/Search';

export default function App() {
  return (
    <PlayerProvider>
      <Router>
        <div className="flex h-screen bg-[#0F0F0F] overflow-hidden">
          {/* Sidebar - Desktop */}
          <Sidebar />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col lg:ml-[240px] h-full">
            {/* Header */}
            <Header />

            {/* Scrollable Content */}
            <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 pb-[180px] lg:pb-[120px]">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/library" element={<Library />} />
                <Route path="/premium" element={<Premium />} />
                <Route path="/artist/:id" element={<Artist />} />
                <Route path="/album/:id" element={<Album />} />
                <Route path="/playlist/:id" element={<Playlist />} />
                <Route path="/search" element={<Search />} />
              </Routes>
            </main>
          </div>

          {/* Mini Player */}
          <div className="lg:ml-0">
            <MiniPlayer />
          </div>

          {/* Expanded Player (overlay) */}
          <ExpandedPlayer />

          {/* Queue Sidebar */}
          <QueueSidebar />

          {/* Mobile Bottom Navigation */}
          <MobileNav />

          {/* Toast Notifications */}
          <Toast />
        </div>
      </Router>
    </PlayerProvider>
  );
}
