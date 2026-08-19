import{useState,useRef,useEffect}from'react';
import{useNavigate}from'react-router-dom';
import{MoreVertical,Play,ListPlus,Heart,Disc3,User2,Share2}from'lucide-react';
import{usePlayer}from'../context/PlayerContext';

export default function ContextMenu({song,className=''}){
  const[open,setOpen]=useState(false);
  const ref=useRef(null);
  const nav=useNavigate();
  const{addToQueue,toggleLike,likedSongs,playSong,showToast}=usePlayer();
  const liked=likedSongs.includes(song.id);

  useEffect(()=>{const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};document.addEventListener('mousedown',h);return()=>document.removeEventListener('mousedown',h);},[]);

  const items=[
    {icon:Play,label:'Play now',action:()=>playSong(song)},
    {icon:ListPlus,label:'Add to queue',action:()=>addToQueue(song)},
    {icon:Heart,label:liked?'Remove from Liked':'Add to Liked',action:()=>toggleLike(song.id)},
    {icon:Disc3,label:'Go to album',action:()=>nav(`/search?q=${encodeURIComponent(song.album||song.title)}`)},
    {icon:User2,label:'Go to artist',action:()=>nav(`/search?q=${encodeURIComponent(song.artist?.split(',')[0]?.trim()||song.artist)}`)},
    {icon:Share2,label:'Share',action:async()=>{const text=`${song.title} - ${song.artist}`;if(navigator.share){try{await navigator.share({title:song.title,text});}catch{}}else{await navigator.clipboard?.writeText(text);showToast('Copied!');}}},
  ];

  return(
    <div ref={ref} className={`relative ${className}`}>
      <button onClick={e=>{e.stopPropagation();setOpen(!open);}} className="p-1.5 rounded-full hover:bg-white/10 transition-colors"><MoreVertical size={16} className="text-white"/></button>
      {open&&<div className="absolute right-0 top-full mt-1 w-48 bg-[#282828] rounded-xl border border-[#383838] shadow-2xl overflow-hidden z-50" onClick={e=>e.stopPropagation()}>
        {items.map((it,i)=><button key={i} onClick={()=>{it.action();setOpen(false);}} className="flex items-center gap-3 w-full px-4 py-2.5 text-[13px] text-white hover:bg-white/10 transition-colors"><it.icon size={15} className="text-[#AAAAAA]"/><span className="flex-1 text-left">{it.label}</span></button>)}
      </div>}
    </div>
  );
}
