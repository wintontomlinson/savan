import{useState,useEffect,useMemo}from'react';
import{Play,Loader2,Clock,TrendingUp}from'lucide-react';
import{getGreeting}from'../data/mockData';
import{searchSongs}from'../data/api';
import{getSmartQueries,analyzePreferences,getHistory}from'../data/algorithm';
import{usePlayer}from'../context/PlayerContext';
import{useAuth}from'../context/AuthContext';
import SongCard from'../components/SongCard';
import HorizontalScroll from'../components/HorizontalScroll';
import SongRow from'../components/SongRow';

export default function Home(){
  const{playSong}=usePlayer();
  const{user}=useAuth();
  const[sections,setSections]=useState({});
  const[loading,setLoading]=useState(true);

  const queries=useMemo(()=>getSmartQueries(),[]);
  const prefs=useMemo(()=>analyzePreferences(),[]);
  const history=useMemo(()=>getHistory(),[]);

  useEffect(()=>{
    async function load(){
      setLoading(true);
      const res={};
      await Promise.all(queries.map(async s=>{res[s.key]=await searchSongs(s.query,12);}));
      setSections(res);setLoading(false);
    }
    load();
  },[queries]);

  const trending=sections.trending||[];
  const recentSongs=history.slice(0,6);

  return(
    <div className="pb-6">
      {/* Greeting + Stats */}
      <section className="mb-6 rounded-2xl bg-gradient-to-r from-[#FF0000]/15 via-[#1A1A1A] to-[#1A1A1A] p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">{getGreeting()}, {user.name}</h1>
        <p className="text-sm text-[#AAAAAA]">
          {prefs?`You've played ${prefs.totalPlays} songs • Top: ${prefs.topArtists[0]?.name||''}${prefs.topArtists[1]?', '+prefs.topArtists[1].name:''}`:'Start listening to get personalized recommendations'}
        </p>
      </section>

      {loading&&<div className="flex items-center justify-center py-16"><Loader2 size={24} className="text-[#FF0000] animate-spin"/><span className="ml-3 text-sm text-[#AAAAAA]">Building your feed...</span></div>}

      {/* Recently Played */}
      {recentSongs.length>0&&(
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3"><Clock size={16} className="text-[#AAAAAA]"/><h2 className="text-base font-semibold text-white">Jump Back In</h2></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {recentSongs.map(s=>(
              <button key={s.id} onClick={()=>playSong(s)} className="group flex items-center gap-2.5 bg-[#1A1A1A] hover:bg-[#272727] rounded-lg overflow-hidden transition-colors">
                <img src={s.thumbnail} alt="" className="w-12 h-12 object-cover"/>
                <p className="text-xs sm:text-sm font-medium text-white truncate pr-2 flex-1">{s.title}</p>
                <div className="w-7 h-7 bg-[#FF0000] rounded-full items-center justify-center mr-2 hidden group-hover:flex shrink-0"><Play size={12} className="text-white ml-0.5" fill="white"/></div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Top Chart */}
      {trending.length>0&&(
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3"><TrendingUp size={16} className="text-[#FF0000]"/><h2 className="text-base font-semibold text-white">Top Trending</h2></div>
          <div className="bg-[#1A1A1A] rounded-xl overflow-hidden">{trending.slice(0,8).map((s,i)=><SongRow key={s.id} song={s} index={i} songList={trending}/>)}</div>
        </section>
      )}

      {/* Algorithm-driven sections */}
      {queries.filter(q=>q.key!=='trending').map(sec=>{
        const songs=sections[sec.key]||[];
        if(!songs.length)return null;
        return<HorizontalScroll key={sec.key} title={sec.title}>{songs.map(s=><SongCard key={s.id} song={s}/>)}</HorizontalScroll>;
      })}
    </div>
  );
}
