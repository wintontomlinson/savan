import{Play,Heart}from'lucide-react';
import{usePlayer}from'../context/PlayerContext';
import{formatDuration}from'../data/mockData';
import ContextMenu from'./ContextMenu';

export default function SongRow({song,index,songList=[],showAlbum=true}){
  const{playSong,currentSong,isPlaying,toggleLike,likedSongs}=usePlayer();
  const isActive=currentSong?.id===song.id;
  const liked=likedSongs.includes(song.id);

  return(
    <div className={`group flex items-center gap-3 px-4 py-2 rounded-lg transition-colors hover:bg-[#272727] cursor-pointer ${isActive?'bg-white/5':''}`} onClick={()=>playSong(song,songList)}>
      <div className="w-7 text-center shrink-0">
        <span className={`text-sm group-hover:hidden ${isActive?'text-[#FF0000]':'text-[#717171]'}`}>
          {isActive&&isPlaying?<span className="flex items-end justify-center gap-[2px] h-4"><span className="w-[3px] bg-[#FF0000] rounded-full animate-[eq_0.8s_ease-in-out_infinite_alternate]" style={{height:'10px'}}/><span className="w-[3px] bg-[#FF0000] rounded-full animate-[eq_0.8s_ease-in-out_infinite_alternate_0.2s]" style={{height:'6px'}}/><span className="w-[3px] bg-[#FF0000] rounded-full animate-[eq_0.8s_ease-in-out_infinite_alternate_0.4s]" style={{height:'12px'}}/></span>:index+1}
        </span>
        <Play size={14} className="hidden group-hover:block text-white mx-auto" fill="white"/>
      </div>
      <img src={song.thumbnail} alt="" className="w-10 h-10 rounded object-cover shrink-0"/>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isActive?'text-[#FF0000]':'text-white'}`}>{song.title}</p>
        <p className="text-xs text-[#AAAAAA] truncate">{song.artist}</p>
      </div>
      {showAlbum&&<p className="hidden md:block text-xs text-[#717171] truncate w-32">{song.album}</p>}
      <span className="text-xs text-[#717171] w-10 text-right shrink-0">{formatDuration(song.duration)}</span>
      <button onClick={e=>{e.stopPropagation();toggleLike(song.id);}} className={`p-1 shrink-0 transition-colors ${liked?'text-[#FF0000]':'text-[#717171] opacity-0 group-hover:opacity-100'}`}><Heart size={14} fill={liked?'currentColor':'none'}/></button>
      <div onClick={e=>e.stopPropagation()} className="opacity-0 group-hover:opacity-100 shrink-0"><ContextMenu song={song}/></div>
    </div>
  );
}
