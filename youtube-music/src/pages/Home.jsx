import{useState,useEffect}from'react';
import{Play,Loader2}from'lucide-react';
import{getGreeting,HOME_SECTIONS}from'../data/mockData';
import{searchSongs}from'../data/api';
import{usePlayer}from'../context/PlayerContext';
import{useAuth}from'../context/AuthContext';
import SongCard from'../components/SongCard';
import HorizontalScroll from'../components/HorizontalScroll';
import SongRow from'../components/SongRow';
import SkeletonLoader from'../components/SkeletonLoader';

export default function Home(){
  const{playSong}=usePlayer();
  const{user}=useAuth();
  const[sections,setSections]=useState({});
  const[loading,setLoading]=useState(true);

  useEffect(()=>{
    async function load(){
      setLoading(true);
      const res={};
      await Promise.all(HOME_SECTIONS.map(async s=>{res[s.key]=await searchSongs(s.query,12);}));
      setSections(res);setLoading(false);
    }
    load();
  },[]);

  const trending=sections.trending||[];

  return(
    <div className="pb-8 animate-[fadeIn_0.3s_ease-out]">
      {/* Greeting */}
      <section className="mb-8 rounded-2xl overflow-hidden bg-gradient-to-r from-[#FF0000]/20 via-[#1A1A1A] to-[#1A1A1A] p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">{getGreeting()}, {user.name}</h1>
        <p className="text-sm text-[#AAAAAA]">Listen to real music from JioSaavn</p>
      </section>

      {loading&&<div className="space-y-8"><SkeletonLoader type="card"/><SkeletonLoader type="card"/><SkeletonLoader type="row" count={8}/></div>}

      {/* Quick Picks */}
      {trending.length>0&&(
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">Quick Picks</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {trending.slice(0,6).map(s=>(
              <button key={s.id} onClick={()=>playSong(s,trending)} className="group flex items-center gap-3 p-2 rounded-lg bg-[#1A1A1A] hover:bg-[#272727] transition-colors">
                <img src={s.thumbnail} alt="" className="w-12 h-12 rounded object-cover"/>
                <div className="flex-1 min-w-0 text-left"><p className="text-sm text-white truncate">{s.title}</p><p className="text-xs text-[#AAAAAA] truncate">{s.artist}</p></div>
                <div className="w-8 h-8 bg-[#FF0000] rounded-full items-center justify-center hidden group-hover:flex shrink-0"><Play size={14} className="text-white ml-0.5" fill="white"/></div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Top Chart */}
      {trending.length>0&&(
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">🔥 Top Trending</h2>
          <div className="bg-[#1A1A1A] rounded-xl overflow-hidden">{trending.map((s,i)=><SongRow key={s.id} song={s} index={i} songList={trending}/>)}</div>
        </section>
      )}

      {/* Category Sections */}
      {HOME_SECTIONS.filter(s=>s.key!=='trending').map(sec=>{
        const songs=sections[sec.key]||[];
        if(!songs.length)return null;
        return<HorizontalScroll key={sec.key} title={sec.title}>{songs.map(s=><SongCard key={s.id} song={s}/>)}</HorizontalScroll>;
      })}
    </div>
  );
}
