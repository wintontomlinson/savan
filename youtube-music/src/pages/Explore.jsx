import{useState,useEffect}from'react';
import{Loader2}from'lucide-react';
import{searchSongs}from'../data/api';
import SongRow from'../components/SongRow';
import SongCard from'../components/SongCard';
import HorizontalScroll from'../components/HorizontalScroll';

const GENRE_CARDS=[
  {name:'Bollywood',q:'bollywood hits 2024',color:'from-orange-500 to-red-600'},
  {name:'Punjabi',q:'punjabi latest 2024',color:'from-green-500 to-emerald-700'},
  {name:'Pop',q:'english pop 2024',color:'from-pink-500 to-rose-600'},
  {name:'Hip-Hop',q:'indian hip hop rap',color:'from-yellow-600 to-amber-800'},
  {name:'K-Pop',q:'kpop trending 2024',color:'from-fuchsia-500 to-pink-400'},
  {name:'Lo-Fi',q:'lofi chill study',color:'from-indigo-500 to-purple-700'},
  {name:'Romantic',q:'romantic love songs hindi',color:'from-rose-500 to-red-600'},
  {name:'Electronic',q:'edm electronic dance',color:'from-blue-500 to-cyan-400'},
  {name:'Classical',q:'indian classical raag',color:'from-amber-600 to-yellow-500'},
  {name:'Devotional',q:'bhajan aarti devotional',color:'from-amber-400 to-orange-500'},
];

export default function Explore(){
  const[topSongs,setTopSongs]=useState([]);
  const[genreSongs,setGenreSongs]=useState({});
  const[loading,setLoading]=useState(true);
  const[activeGenre,setActiveGenre]=useState(null);

  useEffect(()=>{searchSongs('top trending india 2024',20).then(s=>{setTopSongs(s);setLoading(false);});},[]);

  const loadGenre=async(g)=>{
    setActiveGenre(g.name);
    if(!genreSongs[g.name]){const s=await searchSongs(g.q,12);setGenreSongs(p=>({...p,[g.name]:s}));}
  };

  return(
    <div className="pb-8 animate-[fadeIn_0.3s_ease-out]">
      <h1 className="text-2xl font-bold text-white mb-6">Explore</h1>

      {/* Genre Grid */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">Browse Genres</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {GENRE_CARDS.map(g=><button key={g.name} onClick={()=>loadGenre(g)} className={`p-5 rounded-xl bg-gradient-to-br ${g.color} text-left hover:opacity-80 transition-opacity ${activeGenre===g.name?'ring-2 ring-white':''}`}><span className="text-sm font-bold text-white">{g.name}</span></button>)}
        </div>
      </section>

      {/* Genre Songs */}
      {activeGenre&&genreSongs[activeGenre]&&(
        <HorizontalScroll title={activeGenre}>{genreSongs[activeGenre].map(s=><SongCard key={s.id} song={s}/>)}</HorizontalScroll>
      )}

      {/* Top Chart */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">Top Songs</h2>
        {loading?<div className="flex justify-center py-8"><Loader2 size={24} className="text-[#FF0000] animate-spin"/></div>:
        <div className="bg-[#1A1A1A] rounded-xl overflow-hidden">{topSongs.map((s,i)=><SongRow key={s.id} song={s} index={i} songList={topSongs}/>)}</div>}
      </section>
    </div>
  );
}
