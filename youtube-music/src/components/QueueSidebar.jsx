import{X,GripVertical,Trash2}from'lucide-react';
import{usePlayer}from'../context/PlayerContext';

export default function QueueSidebar(){
  const{isQueueOpen,setQueueOpen,currentSong,queue,removeFromQueue,clearQueue,playSong}=usePlayer();
  if(!isQueueOpen)return null;
  return(
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={()=>setQueueOpen(false)}/>
      <div className="fixed right-0 top-0 bottom-0 z-50 w-[320px] max-w-[85vw] bg-[#1A1A1A] border-l border-[#383838] flex flex-col animate-[slideRight_0.3s_ease-out]">
        <div className="flex items-center justify-between p-4 border-b border-[#383838]">
          <h2 className="text-base font-semibold text-white">Queue</h2>
          <button onClick={()=>setQueueOpen(false)} className="p-1.5 hover:bg-white/10 rounded-full"><X size={18} className="text-white"/></button>
        </div>
        {currentSong&&<div className="p-4 border-b border-[#383838]"><p className="text-xs text-[#717171] uppercase mb-2">Now Playing</p><div className="flex items-center gap-3"><img src={currentSong.thumbnail} alt="" className="w-10 h-10 rounded"/><div className="min-w-0"><p className="text-sm text-white truncate">{currentSong.title}</p><p className="text-xs text-[#AAAAAA] truncate">{currentSong.artist}</p></div></div></div>}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-3"><p className="text-xs text-[#717171] uppercase">Up Next ({queue.length})</p>{queue.length>0&&<button onClick={clearQueue} className="text-xs text-[#AAAAAA] hover:text-white flex items-center gap-1"><Trash2 size={12}/>Clear</button>}</div>
          {queue.length===0?<p className="text-sm text-[#717171] text-center py-8">Queue is empty</p>:
          <div className="space-y-1">{queue.map((s,i)=><div key={`${s.id}-${i}`} className="group flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer" onClick={()=>playSong(s,queue)}>
            <GripVertical size={14} className="text-[#717171] cursor-grab shrink-0"/>
            <img src={s.thumbnail} alt="" className="w-9 h-9 rounded shrink-0"/>
            <div className="flex-1 min-w-0"><p className="text-sm text-white truncate">{s.title}</p><p className="text-[11px] text-[#AAAAAA] truncate">{s.artist}</p></div>
            <button onClick={e=>{e.stopPropagation();removeFromQueue(i);}} className="p-1 opacity-0 group-hover:opacity-100"><X size={14} className="text-[#AAAAAA]"/></button>
          </div>)}</div>}
        </div>
      </div>
    </>
  );
}
