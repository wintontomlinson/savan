import{BrowserRouter,Routes,Route}from'react-router-dom';
import{PlayerProvider}from'./context/PlayerContext';
import{AuthProvider}from'./context/AuthContext';
import Sidebar from'./components/Sidebar';
import Header from'./components/Header';
import MiniPlayer from'./components/MiniPlayer';
import ExpandedPlayer from'./components/ExpandedPlayer';
import Toast from'./components/Toast';
import MobileNav from'./components/MobileNav';
import Home from'./pages/Home';
import Explore from'./pages/Explore';
import Library from'./pages/Library';
import SearchResults from'./pages/SearchResults';

function BottomNav(){return<nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#1A1A1A] border-t border-[#383838] h-[52px]"><MobileNav/></nav>;}

export default function App(){
  return(
    <AuthProvider><PlayerProvider><BrowserRouter>
      <div className="h-[100dvh] bg-[#0F0F0F] overflow-hidden flex">
        <Sidebar/>
        <div className="flex-1 flex flex-col md:ml-[72px] lg:ml-[240px] min-w-0">
          <Header/>
          <main className="flex-1 overflow-y-auto pt-16 pb-[136px] md:pb-[96px] px-4 sm:px-6">
            <Routes>
              <Route path="/" element={<Home/>}/>
              <Route path="/explore" element={<Explore/>}/>
              <Route path="/library" element={<Library/>}/>
              <Route path="/search" element={<SearchResults/>}/>
            </Routes>
          </main>
        </div>
        <MiniPlayer/>
        <ExpandedPlayer/>
        <BottomNav/>
        <Toast/>
      </div>
    </BrowserRouter></PlayerProvider></AuthProvider>
  );
}
