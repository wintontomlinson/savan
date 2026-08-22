import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { PlayerProvider } from './context/PlayerContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import PlayerBar from './components/PlayerBar';
import NowPlaying from './components/NowPlaying';
import QueuePanel from './components/QueuePanel';
import MobileNav from './components/MobileNav';
import Toast from './components/Toast';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Library from './pages/Library';
import SearchResults from './pages/SearchResults';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.getElementById('main-scroll')?.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

function Pages() {
  const location = useLocation();
  return (
    <div key={location.pathname} className="a-fade-up">
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/library" element={<Library />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <PlayerProvider>
      <BrowserRouter>
        <div className="fixed inset-0 flex flex-col bg-ink">
          <div className="flex min-h-0 flex-1 gap-2 p-0 md:p-2 md:pb-0">
            <Sidebar />
            <div className="app-main flex min-w-0 flex-1 flex-col overflow-hidden border-hair bg-surface md:rounded-3xl md:border">
              <Header />
              <main id="main-scroll" className="scroll-y flex-1">
                <div className="mx-auto w-full max-w-[1480px] px-4 pb-14 sm:px-6 lg:px-9">
                  <ScrollToTop />
                  <Pages />
                </div>
              </main>
            </div>
            <QueuePanel />
          </div>
          <div className="shrink-0">
            <PlayerBar />
            <MobileNav />
          </div>
          <NowPlaying />
          <Toast />
        </div>
      </BrowserRouter>
    </PlayerProvider>
  );
}
