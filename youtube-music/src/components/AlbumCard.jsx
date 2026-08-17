import{useNavigate}from'react-router-dom';
import{Play}from'lucide-react';

export default function AlbumCard({album}){
  const nav=useNavigate();
  return(
    <div className="group flex-shrink-0 w-[160px] cursor-pointer" onClick={()=>nav(`/album/${album.id}`)}>
      <div className="relative aspect-square rounded-lg overflow-hidden mb-2 shadow-md">
        <img src={album.thumbnail} alt={album.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"/>
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-11 h-11 bg-[#FF0000] rounded-full flex items-center justify-center shadow-xl"><Play size={18} className="text-white ml-0.5" fill="white"/></div>
        </div>
      </div>
      <p className="text-[13px] font-medium text-white truncate">{album.title}</p>
      <p className="text-[11px] text-[#AAAAAA] truncate">{album.artist} • {album.year}</p>
    </div>
  );
}
