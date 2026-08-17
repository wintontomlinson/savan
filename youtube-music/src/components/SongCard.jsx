import{Play}from'lucide-react';
import{usePlayer}from'../context/PlayerContext';
import ContextMenu from'./ContextMenu';

export default function SongCard({song,size='md'}){
  const{playSong,currentSong,isPlaying}=usePlayer();
  const isActive=currentSong?.id===song.id;
  const w=size==='sm'?'w-[130px]':size==='lg'?'w-[200px]':'w-[160px]';

  return(
    <div className={`group flex-shrink-0 ${w} cursor-pointer`} onClick={()=>playSong(song)}>
      <div className="relative aspect-square rounded-lg overflow-hidden mb-2 shadow-md">
        <img src={song.thumbnail} alt={song.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"/>
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-11 h-11 bg-[#FF0000] rounded-full flex items-center justify-center shadow-xl hover:bg-[#CC0000] transition-colors">
            <Play size={18} className="text-white ml-0.5" fill="white"/>
          </div>
        </div>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e=>e.stopPropagation()}>
          <ContextMenu song={song}/>
        </div>
        {isActive&&isPlaying&&<div className="absolute bottom-2 left-2 flex items-end gap-0.5"><span className="w-[3px] bg-[#FF0000] rounded-full animate-[eq_0.8s_ease-in-out_infinite_alternate]" style={{height:'12px'}}/><span className="w-[3px] bg-[#FF0000] rounded-full animate-[eq_0.8s_ease-in-out_infinite_alternate_0.2s]" style={{height:'8px'}}/><span className="w-[3px] bg-[#FF0000] rounded-full animate-[eq_0.8s_ease-in-out_infinite_alternate_0.4s]" style={{height:'14px'}}/></div>}
      </div>
      <p className={`text-[13px] font-medium truncate ${isActive?'text-[#FF0000]':'text-white'}`}>{song.title}</p>
      <p className="text-[11px] text-[#AAAAAA] truncate">{song.artist}</p>
    </div>
  );
}
