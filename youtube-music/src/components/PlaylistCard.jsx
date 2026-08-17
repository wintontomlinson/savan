import{useNavigate}from'react-router-dom';
import{Play}from'lucide-react';
import{moodColors}from'../data/mockData';

export default function PlaylistCard({playlist}){
  const nav=useNavigate();
  const gradient=moodColors[playlist.mood]||'from-gray-700 to-gray-900';
  return(
    <div className="group flex-shrink-0 w-[160px] cursor-pointer" onClick={()=>nav(`/playlist/${playlist.id}`)}>
      <div className="relative aspect-square rounded-lg overflow-hidden mb-2 shadow-md">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-80`}/>
        <img src={playlist.thumbnail} alt="" className="w-full h-full object-cover mix-blend-overlay"/>
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-11 h-11 bg-[#FF0000] rounded-full flex items-center justify-center shadow-xl"><Play size={18} className="text-white ml-0.5" fill="white"/></div>
        </div>
        <div className="absolute bottom-3 left-3 right-3"><p className="text-xs text-white/80 font-medium">{playlist.description}</p></div>
      </div>
      <p className="text-[13px] font-medium text-white truncate">{playlist.title}</p>
      <p className="text-[11px] text-[#AAAAAA]">{playlist.songs.length} songs</p>
    </div>
  );
}
