import{useState,useRef,useEffect}from'react';
import{useNavigate}from'react-router-dom';
import{Search,Mic,X,Clock,TrendingUp}from'lucide-react';
import{songs,artists,albums}from'../data/mockData';

export default function SearchBar(){
  const[query,setQuery]=useState('');
  const[open,setOpen]=useState(false);
  const[recent,setRecent]=useState(()=>{try{return JSON.parse(localStorage.getItem('recentSearches'))||[]}catch{return[]}});
  const ref=useRef(null);
  const nav=useNavigate();
  const timer=useRef(null);
  const[results,setResults]=useState({songs:[],artists:[],albums:[]});

  useEffect(()=>{const h=(e)=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};document.addEventListener('mousedown',h);return()=>document.removeEventListener('mousedown',h);},[]);

  useEffect(()=>{
    if(query.length<2){setResults({songs:[],artists:[],albums:[]});return;}
    if(timer.current)clearTimeout(timer.current);
    timer.current=setTimeout(()=>{
      const q=query.toLowerCase();
      setResults({songs:songs.filter(s=>s.title.toLowerCase().includes(q)||s.artist.toLowerCase().includes(q)).slice(0,4),artists:artists.filter(a=>a.name.toLowerCase().includes(q)).slice(0,3),albums:albums.filter(a=>a.title.toLowerCase().includes(q)).slice(0,3)});
    },300);
  },[query]);

  const submit=(e)=>{e.preventDefault();if(!query.trim())return;const q=query.trim();setRecent(p=>{const n=[q,...p.filter(x=>x!==q)].slice(0,10);localStorage.setItem('recentSearches',JSON.stringify(n));return n;});nav(`/search?q=${encodeURIComponent(q)}`);setOpen(false);};
  const removeRecent=(s)=>setRecent(p=>{const n=p.filter(x=>x!==s);localStorage.setItem('recentSearches',JSON.stringify(n));return n;});
  const hasResults=results.songs.length||results.artists.length||results.albums.length;

  return(
    <div ref={ref} className="relative w-full max-w-[500px]">
      <form onSubmit={submit} className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#717171]"/>
        <input value={query} onChange={e=>{setQuery(e.target.value);setOpen(true);}} onFocus={()=>setOpen(true)} placeholder="Search songs, artists, albums..." className="w-full bg-[#272727] text-white text-sm pl-9 pr-9 py-2.5 rounded-full placeholder:text-[#717171] focus:outline-none focus:ring-1 focus:ring-[#FF0000]/50"/>
        {query&&<button type="button" onClick={()=>{setQuery('');setResults({songs:[],artists:[],albums:[]});}} className="absolute right-9 top-1/2 -translate-y-1/2 text-[#717171] hover:text-white"><X size={14}/></button>}
        <Mic size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717171]"/>
      </form>
      {open&&(
        <div className="absolute top-full mt-2 w-full bg-[#212121] rounded-xl border border-[#383838] shadow-2xl overflow-hidden max-h-[70vh] overflow-y-auto z-50">
          {!query&&recent.length>0&&(<div className="p-3"><p className="text-xs text-[#717171] mb-2 px-2">Recent</p>{recent.map((s,i)=><div key={i} className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/5 rounded-lg cursor-pointer" onClick={()=>{setQuery(s);nav(`/search?q=${encodeURIComponent(s)}`);setOpen(false);}}><Clock size={14} className="text-[#717171]"/><span className="text-sm text-white flex-1">{s}</span><button onClick={e=>{e.stopPropagation();removeRecent(s);}}><X size={12} className="text-[#717171]"/></button></div>)}</div>)}
          {!query&&!recent.length&&(<div className="p-3"><p className="text-xs text-[#717171] mb-2 px-2">Trending</p>{['Latest Hits','Arijit Singh','Punjabi Songs','Chill Vibes'].map((s,i)=><div key={i} className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/5 rounded-lg cursor-pointer" onClick={()=>{setQuery(s);nav(`/search?q=${encodeURIComponent(s)}`);setOpen(false);}}><TrendingUp size={14} className="text-[#717171]"/><span className="text-sm text-white">{s}</span></div>)}</div>)}
          {query&&hasResults?(
            <div className="p-2">
              {results.songs.length>0&&<><p className="text-xs text-[#717171] px-2 py-1">Songs</p>{results.songs.map(s=><div key={s.id} className="flex items-center gap-3 px-2 py-2 hover:bg-white/5 rounded-lg cursor-pointer" onClick={()=>{nav(`/search?q=${encodeURIComponent(s.title)}`);setOpen(false);}}><img src={s.thumbnail} alt="" className="w-9 h-9 rounded object-cover"/><div className="min-w-0"><p className="text-sm text-white truncate">{s.title}</p><p className="text-xs text-[#AAAAAA] truncate">{s.artist}</p></div></div>)}</>}
              {results.artists.length>0&&<><p className="text-xs text-[#717171] px-2 py-1 mt-2">Artists</p>{results.artists.map(a=><div key={a.id} className="flex items-center gap-3 px-2 py-2 hover:bg-white/5 rounded-lg cursor-pointer" onClick={()=>{nav(`/artist/${a.id}`);setOpen(false);}}><img src={a.image} alt="" className="w-9 h-9 rounded-full object-cover"/><p className="text-sm text-white">{a.name}</p></div>)}</>}
              {results.albums.length>0&&<><p className="text-xs text-[#717171] px-2 py-1 mt-2">Albums</p>{results.albums.map(a=><div key={a.id} className="flex items-center gap-3 px-2 py-2 hover:bg-white/5 rounded-lg cursor-pointer" onClick={()=>{nav(`/album/${a.id}`);setOpen(false);}}><img src={a.thumbnail} alt="" className="w-9 h-9 rounded object-cover"/><div className="min-w-0"><p className="text-sm text-white truncate">{a.title}</p><p className="text-xs text-[#AAAAAA]">{a.artist}</p></div></div>)}</>}
            </div>
          ):query&&<p className="p-4 text-sm text-[#717171] text-center">No results</p>}
        </div>
      )}
    </div>
  );
}
