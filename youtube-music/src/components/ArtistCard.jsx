import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';

export default function ArtistCard({ artist }) {
  const navigate = useNavigate();

  return (
    <div
      className="group flex-shrink-0 w-[140px] sm:w-[160px] cursor-pointer"
      onClick={() => navigate(`/artist/${artist.id}`)}
    >
      <div className="relative w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] mx-auto rounded-full overflow-hidden mb-3 transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(255,0,0,0.2)]">
        <img
          src={artist.image}
          alt={artist.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
          <div className="w-10 h-10 bg-[#FF0000] rounded-full flex items-center justify-center shadow-lg transform scale-50 group-hover:scale-100 transition-all duration-300 btn-press">
            <Play size={18} className="text-white ml-0.5" fill="white" />
          </div>
        </div>
      </div>
      <p className="text-sm font-medium text-white text-center truncate transition-colors duration-200 group-hover:text-[#FF0000]">{artist.name}</p>
      <p className="text-xs text-[#AAAAAA] text-center">Artist</p>
    </div>
  );
}
