import{useState,useMemo}from'react';
import{useSearchParams,useNavigate}from'react-router-dom';
import{Play,Frown}from'lucide-react';
import{songs,artists,albums,playlists}from'../data/mockData';
import{usePlayer}from'../context/PlayerContext';
import SongRow from'../components/SongRow';
import AlbumCard from'../components/AlbumCard';
import ArtistCard from'../components/ArtistCard';
import PlaylistCard from'../components/PlaylistCard';

const tabs=['All','Songs','Albums','Artists','Playlists'];

export default function SearchResults(){
  const[params]=useSearchParams();
  const q=(params.get('q')||'').toLowerCase();
  const[tab,setTab]=useState('All');
  const{playSong}=usePlayer();
  const nav=useNavigate();

  const results=useMemo(()=>({
    songs:songs.filter(s=>s.title.toLowerCase().includes(q)||s.artist.toLowerCase().includes(q)),
    artists:artists.filter(a=>a.name.toLowerCase().includes(q)),
    albums:albums.filter(a=>a.title.toLowerCase().includes(q)||a.artist.toLowerCase().includes(q)),
    playlists:playlists.filter(p=>p.title.toLowerCase().includes(q)),
  }),[q]);

  const hasResults=results.songs.length||results.artists.length||results.albums.length||results.playlists.length;

  if(!q)return<div className="text-center py-20"><p className="text-lg text-white">Search for music</p><p className="text-sm text-[#AAAAAA] mt-1">Find songs, artists, albums</p></div>;

  return(
    <div className="pb-8 animate-[fadeIn_0.3s_ease-out]">
      <h1 className="text-xl font-bold text-white mb-1">Results for "{params.get('q')}"</h1>
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 mt-3" style={{scrollbarWidth:'none'}}>
        {tabs.map(t=><button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${tab===t?'bg-white text-black':'bg-[#272727] text-[#AAAAAA] hover:text-white'}`}>{t}</button>)}
      </div>

      {!hasResults&&<div className="text-center py-20"><Frown size={48} className="text-[#717171] mx-auto mb-4"/><p className="text-white text-lg">No results for "{params.get('q')}"</p><p className="text-sm text-[#AAAAAA] mt-1">Try different keywords</p></div>}

      {/* Top Result */}
      {(tab==='All')&&results.songs.length>0&&(
        <section className="mb-6"><h2 className="text-base font-semibold text-[#AAAAAA] uppercase text-xs tracking-wide mb-3">Top Result</h2>
          <button onClick={()=>playSong(results.songs[0],results.songs)} className="group flex items-center gap-4 p-4 bg-[#1A1A1A] rounded-xl hover:bg-[#272727] transition-colors w-full sm:w-[380px] text-left">
            <img src={results.songs[0].thumbnail} alt="" className="w-16 h-16 rounded-lg object-cover"/>
            <div className="flex-1 min-w-0"><p className="text-lg font-bold text-white truncate">{results.songs[0].title}</p><p className="text-sm text-[#AAAAAA]">{results.songs[0].artist}</p><span className="text-xs bg-[#272727] px-2 py-0.5 rounded text-[#AAAAAA] mt-1 inline-block">Song</span></div>
            <div className="w-10 h-10 bg-[#FF0000] rounded-full items-center justify-center hidden group-hover:flex"><Play size={16} className="text-white ml-0.5" fill="white"/></div>
          </button>
        </section>
      )}

      {(tab==='All'||tab==='Songs')&&results.songs.length>0&&<section className="mb-6"><h2 className="text-base font-semibold text-white mb-3">Songs</h2><div className="bg-[#1A1A1A] rounded-xl overflow-hidden">{results.songs.slice(0,tab==='Songs'?50:6).map((s,i)=><SongRow key={s.id} song={s} index={i} songList={results.songs}/>)}</div></section>}
      {(tab==='All'||tab==='Albums')&&results.albums.length>0&&<section className="mb-6"><h2 className="text-base font-semibold text-white mb-3">Albums</h2><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">{results.albums.map(a=><AlbumCard key={a.id} album={a}/>)}</div></section>}
      {(tab==='All'||tab==='Artists')&&results.artists.length>0&&<section className="mb-6"><h2 className="text-base font-semibold text-white mb-3">Artists</h2><div className="flex gap-4 flex-wrap">{results.artists.map(a=><ArtistCard key={a.id} artist={a}/>)}</div></section>}
      {(tab==='All'||tab==='Playlists')&&results.playlists.length>0&&<section className="mb-6"><h2 className="text-base font-semibold text-white mb-3">Playlists</h2><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">{results.playlists.map(p=><PlaylistCard key={p.id} playlist={p}/>)}</div></section>}
    </div>
  );
}
