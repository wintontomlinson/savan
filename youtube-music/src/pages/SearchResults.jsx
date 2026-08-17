import{useState,useEffect}from'react';
import{useSearchParams}from'react-router-dom';
import{Play,Loader2,Frown}from'lucide-react';
import{searchSongs}from'../data/api';
import{usePlayer}from'../context/PlayerContext';
import SongRow from'../components/SongRow';

export default function SearchResults(){
  const[params]=useSearchParams();
  const q=params.get('q')||'';
  const{playSong}=usePlayer();
  const[songs,setSongs]=useState([]);
  const[loading,setLoading]=useState(false);

  useEffect(()=>{
    if(!q)return;setLoading(true);
    searchSongs(q,30).then(s=>{setSongs(s);setLoading(false);});
  },[q]);

  if(!q)return<div className="text-center py-20"><p className="text-lg text-white">Search for music</p></div>;

  return(
    <div className="pb-6">
      <h1 className="text-xl font-bold text-white mb-1">Results for "{q}"</h1>
      <p className="text-xs text-[#717171] mb-5">{songs.length} results</p>

      {loading&&<div className="flex justify-center py-16"><Loader2 size={22} className="text-[#FF0000] animate-spin"/></div>}

      {!loading&&!songs.length&&<div className="text-center py-16"><Frown size={36} className="text-[#717171] mx-auto mb-3"/><p className="text-white">No results for "{q}"</p></div>}

      {!loading&&songs.length>0&&(
        <>
          <button onClick={()=>playSong(songs[0],songs)} className="group flex items-center gap-4 p-4 bg-[#1A1A1A] rounded-xl hover:bg-[#272727] transition-colors w-full sm:w-[360px] text-left mb-5">
            <img src={songs[0].thumbnail} alt="" className="w-14 h-14 rounded-lg object-cover"/>
            <div className="flex-1 min-w-0"><p className="text-base font-bold text-white truncate">{songs[0].title}</p><p className="text-sm text-[#AAAAAA]">{songs[0].artist}</p></div>
            <div className="w-9 h-9 bg-[#FF0000] rounded-full items-center justify-center hidden group-hover:flex"><Play size={14} className="text-white ml-0.5" fill="white"/></div>
          </button>
          <div className="bg-[#1A1A1A] rounded-xl overflow-hidden">{songs.map((s,i)=><SongRow key={s.id} song={s} index={i} songList={songs}/>)}</div>
        </>
      )}
    </div>
  );
}
