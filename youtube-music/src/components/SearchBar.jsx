import{useState,useRef,useEffect}from'react';
import{useNavigate}from'react-router-dom';
import{Search,Mic,X}from'lucide-react';
import{searchSongs}from'../data/api';

export default function SearchBar(){
  const[query,setQuery]=useState('');
  const[open,setOpen]=useState(false);
  const[results,setResults]=useState([]);
  const ref=useRef(null);
  const timer=useRef(null);
  const nav=useNavigate();

  useEffect(()=>{const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};document.addEventListener('mousedown',h);return()=>document.removeEventListener('mousedown',h);},[]);

  useEffect(()=>{
    if(query.length<2){setResults([]);return;}
    if(timer.current)clearTimeout(timer.current);
    timer.current=setTimeout(async()=>{const s=await searchSongs(query,5);setResults(s);},300);
  },[query]);

  const submit=e=>{e.preventDefault();if(query.trim()){nav(`/search?q=${encodeURIComponent(query.trim())}`);setOpen(false);}};

  return(
    <div ref={ref} className="relative w-full max-w-[500px]">
      <form onSubmit={submit} className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#717171]"/>
        <input value={query} onChange={e=>{setQuery(e.target.value);setOpen(true);}} onFocus={()=>setOpen(true)} placeholder="Search songs, artists..." className="w-full bg-[#272727] text-white text-sm pl-9 pr-9 py-2.5 rounded-full placeholder:text-[#717171] focus:outline-none focus:ring-1 focus:ring-[#FF0000]/50"/>
        {query&&<button type="button" onClick={()=>{setQuery('');setResults([]);}} className="absolute right-9 top-1/2 -translate-y-1/2 text-[#717171]"><X size={14}/></button>}
        <Mic size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717171]"/>
      </form>
      {open&&results.length>0&&(
        <div className="absolute top-full mt-2 w-full bg-[#212121] rounded-xl border border-[#383838] shadow-2xl overflow-hidden max-h-[60vh] overflow-y-auto z-50">
          {results.map(s=><button key={s.id} onClick={()=>{nav(`/search?q=${encodeURIComponent(s.title)}`);setOpen(false);setQuery(s.title);}} className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-white/5 transition-colors">
            <img src={s.thumbnail} alt="" className="w-9 h-9 rounded object-cover"/>
            <div className="min-w-0 text-left flex-1"><p className="text-sm text-white truncate">{s.title}</p><p className="text-xs text-[#AAAAAA] truncate">{s.artist}</p></div>
          </button>)}
        </div>
      )}
    </div>
  );
}
