import{useState,useEffect}from'react';
import{useSearchParams}from'react-router-dom';
import{Play,Loader2,Frown}from'lucide-react';
import{searchSongs,searchAlbums}from'../data/api';
import{usePlayer}from'../context/PlayerContext';
import SongRow from'../components/SongRow';
import AlbumCard from'../components/AlbumCard';

export default function SearchResults(){
  const[params]=useSearchParams();
  const q=params.get('q')||'';
  const{playSong}=usePlayer();
  const[songs,setSongs]=useState([]);
  const[albums,setAlbums]=useState([]);
  const[loading,setLoading]=useState(false);

  useEffect(()=>{
    if(!q)return;setLoading(true);
    Promise.all([searchSongs(q,25),searchAlbums(q,8)]).then(([s,a])=>{setSongs(s);setAlbums(a);setLoading(false);});
  },[q]);

  if(!q)return<div className="text-center py-20"><p className="text-lg text-white">Search for music</p></div>;

  return(
    <div className="pb-8 animate-[fadeIn_0.3s_ease-out]">
      <h1 className="text-xl font-bold text-white mb-4">Results for "{q}"</h1>

      {loading&&<div className="flex justify-center py-16"><Loader2 size={24} className="text-[#FF0000] animate-spin"/></div>}

      {!loading&&!songs.length&&!albums.length&&<div className="text-center py-16"><Frown size={40} className="text-[#717171] mx-auto mb-3"/><p className="text-white">No results for "{q}"</p><p className="text-sm text-[#AAAAAA] mt-1">Try different keywords</p></div>}

      {!loading&&songs.length>0&&(
        <>
          {/* Top Result */}
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-[#AAAAAA] uppercase mb-3">Top Result</h2>
            <button onClick={()=>playSong(songs[0],songs)} className="group flex items-center gap-4 p-4 bg-[#1A1A1A] rounded-xl hover:bg-[#272727] transition-colors w-full sm:w-[380px] text-left">
              <img src={songs[0].thumbnail} alt="" className="w-16 h-16 rounded-lg object-cover"/>
              <div className="flex-1 min-w-0"><p className="text-lg font-bold text-white truncate">{songs[0].title}</p><p className="text-sm text-[#AAAAAA]">{songs[0].artist}</p></div>
              <div className="w-10 h-10 bg-[#FF0000] rounded-full items-center justify-center hidden group-hover:flex"><Play size={16} className="text-white ml-0.5" fill="white"/></div>
            </button>
          </section>

          <section className="mb-6">
            <h2 className="text-base font-semibold text-white mb-3">Songs</h2>
            <div className="bg-[#1A1A1A] rounded-xl overflow-hidden">{songs.map((s,i)=><SongRow key={s.id} song={s} index={i} songList={songs}/>)}</div>
          </section>
        </>
      )}

      {!loading&&albums.length>0&&(
        <section className="mb-6">
          <h2 className="text-base font-semibold text-white mb-3">Albums</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">{albums.map(a=><AlbumCard key={a.id} album={a}/>)}</div>
        </section>
      )}
    </div>
  );
}
