import{useNavigate}from'react-router-dom';
import{Play}from'lucide-react';

export default function ArtistCard({artist}){
  const nav=useNavigate();
  return(
    <div className="group flex-shrink-0 w-[140px] cursor-pointer text-center" onClick={()=>nav(`/artist/${artist.id}`)}>
      <div className="relative w-[120px] h-[120px] mx-auto rounded-full overflow-hidden mb-2 shadow-lg">
        <img src={artist.image} alt={artist.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"/>
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-10 h-10 bg-[#FF0000] rounded-full flex items-center justify-center"><Play size={16} className="text-white ml-0.5" fill="white"/></div>
        </div>
      </div>
      <p className="text-sm font-medium text-white truncate">{artist.name}</p>
      <p className="text-[11px] text-[#717171]">{artist.monthlyListeners} listeners</p>
    </div>
  );
}
