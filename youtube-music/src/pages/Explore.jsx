import{useState}from'react';
import{Loader2}from'lucide-react';
import{searchSongs}from'../data/api';
import SongCard from'../components/SongCard';
import SongRow from'../components/SongRow';
import HorizontalScroll from'../components/HorizontalScroll';

const GENRES=[
  {name:'Bollywood',q:'bollywood trending 2024',color:'from-orange-500 to-red-600'},
  {name:'Punjabi',q:'punjabi latest hits',color:'from-green-500 to-emerald-700'},
  {name:'Pop',q:'english pop hits 2024',color:'from-pink-500 to-rose-600'},
  {name:'Hip-Hop',q:'indian hip hop rap',color:'from-yellow-600 to-amber-800'},
  {name:'Lo-Fi',q:'lofi chill hindi',color:'from-indigo-500 to-purple-700'},
  {name:'Romantic',q:'romantic love songs',color:'from-rose-500 to-red-600'},
  {name:'Party',q:'party dance songs',color:'from-cyan-500 to-blue-600'},
  {name:'Devotional',q:'bhajan devotional',color:'from-amber-400 to-orange-500'},
  {name:'Retro',q:'old hindi 90s classic',color:'from-teal-500 to-emerald-700'},
  {name:'K-Pop',q:'kpop trending',color:'from-fuchsia-500 to-pink-400'},
];

export default function Explore(){
  const[active,setActive]=useState(null);
  const[songs,setSongs]=useState([]);
  const[loading,setLoading]=useState(false);

  const loadGenre=async(g)=>{
    setActive(g.name);setLoading(true);
    const s=await searchSongs(g.q,15);
    setSongs(s);setLoading(false);
  };

  return(
    <div className="pb-6">
      <h1 className="text-2xl font-bold text-white mb-5">Explore</h1>

      {/* Genre Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 mb-6">
        {GENRES.map(g=>(
          <button key={g.name} onClick={()=>loadGenre(g)} className={`p-4 sm:p-5 rounded-xl bg-gradient-to-br ${g.color} text-left transition-all active:scale-95 ${active===g.name?'ring-2 ring-white shadow-lg':''}`}>
            <span className="text-sm font-bold text-white">{g.name}</span>
          </button>
        ))}
      </div>

      {/* Results */}
      {loading&&<div className="flex justify-center py-10"><Loader2 size={22} className="text-[#FF0000] animate-spin"/></div>}

      {!loading&&active&&songs.length>0&&(
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">{active}</h2>
          <div className="bg-[#1A1A1A] rounded-xl overflow-hidden">{songs.map((s,i)=><SongRow key={s.id} song={s} index={i} songList={songs}/>)}</div>
        </section>
      )}
    </div>
  );
}
