import{useState,useEffect}from'react';
import{songs,artists,albums,playlists,moods,moodColors,getGreeting}from'../data/mockData';
import{usePlayer}from'../context/PlayerContext';
import{useAuth}from'../context/AuthContext';
import{Play}from'lucide-react';
import SongCard from'../components/SongCard';
import ArtistCard from'../components/ArtistCard';
import AlbumCard from'../components/AlbumCard';
import PlaylistCard from'../components/PlaylistCard';
import HorizontalScroll from'../components/HorizontalScroll';
import SkeletonLoader from'../components/SkeletonLoader';

export default function Home(){
  const{playSong}=usePlayer();
  const{user}=useAuth();
  const[loading,setLoading]=useState(true);
  useEffect(()=>{const t=setTimeout(()=>setLoading(false),1200);return()=>clearTimeout(t);},[]);

  const quickPicks=songs.slice(0,8);
  const hotNow=[...songs].sort((a,b)=>b.plays-a.plays).slice(0,12);
  const recommended=songs.filter(s=>['Pop','Bollywood','Indie'].includes(s.genre)).slice(0,12);
  const newAlbums=albums.filter(a=>a.year>=2022);
  const mixedForYou=songs.filter(s=>['Electronic','R&B','K-Pop'].includes(s.genre)).slice(0,12);

  if(loading)return<div className="space-y-8 animate-pulse p-2"><div className="h-40 rounded-2xl bg-[#272727]"/><SkeletonLoader type="card"/><SkeletonLoader type="card"/></div>;

  return(
    <div className="pb-8 animate-[fadeIn_0.3s_ease-out]">
      {/* Greeting */}
      <section className="mb-8 rounded-2xl overflow-hidden bg-gradient-to-r from-[#FF0000]/20 via-[#1A1A1A] to-[#1A1A1A] p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">{getGreeting()}, {user.name}</h1>
        <p className="text-sm text-[#AAAAAA]">Here's what's good for you today</p>
      </section>

      {/* Quick Picks */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">Quick Picks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {quickPicks.map(s=>(
            <button key={s.id} onClick={()=>playSong(s,quickPicks)} className="group flex items-center gap-3 p-2 rounded-lg bg-[#1A1A1A] hover:bg-[#272727] transition-colors">
              <img src={s.thumbnail} alt="" className="w-12 h-12 rounded object-cover"/>
              <div className="flex-1 min-w-0 text-left"><p className="text-sm text-white truncate">{s.title}</p><p className="text-xs text-[#AAAAAA] truncate">{s.artist}</p></div>
              <div className="w-8 h-8 bg-[#FF0000] rounded-full items-center justify-center hidden group-hover:flex"><Play size={14} className="text-white ml-0.5" fill="white"/></div>
            </button>
          ))}
        </div>
      </section>

      <HorizontalScroll title="Hot Right Now" seeAll>{hotNow.map(s=><SongCard key={s.id} song={s}/>)}</HorizontalScroll>
      <HorizontalScroll title="Recommended For You" seeAll>{recommended.map(s=><SongCard key={s.id} song={s}/>)}</HorizontalScroll>
      <HorizontalScroll title="New Releases" seeAll>{newAlbums.map(a=><AlbumCard key={a.id} album={a}/>)}</HorizontalScroll>

      {/* Moods & Genres */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">Moods & Genres</h2>
        <div className="flex gap-3 overflow-x-auto pb-2" style={{scrollbarWidth:'none'}}>
          {moods.map(m=><button key={m} className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-medium text-white bg-gradient-to-r ${moodColors[m]||'from-gray-600 to-gray-800'} hover:opacity-80 transition-opacity`}>{m}</button>)}
        </div>
      </section>

      <HorizontalScroll title="Top Artists" seeAll>{artists.map(a=><ArtistCard key={a.id} artist={a}/>)}</HorizontalScroll>
      <HorizontalScroll title="Recommended Playlists" seeAll>{playlists.map(p=><PlaylistCard key={p.id} playlist={p}/>)}</HorizontalScroll>
      <HorizontalScroll title="Mixed For You" seeAll>{mixedForYou.map(s=><SongCard key={s.id} song={s}/>)}</HorizontalScroll>
    </div>
  );
}
