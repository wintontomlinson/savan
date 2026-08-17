import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';

export default function PlaylistCard({ playlist }) {
  const navigate = useNavigate();

  return (
    <div
      className="group flex-shrink-0 w-[160px] sm:w-[180px] cursor-pointer"
      onClick={() => navigate(`/playlist/${playlist.id}`)}
    >
      <div className="relative aspect-square rounded-lg overflow-hidden mb-2">
        <div className={`absolute inset-0 bg-gradient-to-br ${playlist.gradient} opacity-80`}></div>
        <img
          src={playlist.image}
          alt={playlist.title}
          className="w-full h-full object-cover mix-blend-overlay"
        />
        <div className="absolute inset-0 flex items-end p-3">
          <p className="text-xs text-white/80 font-medium">{playlist.description}</p>
        </div>
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="w-12 h-12 bg-[#FF0000] rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-200">
            <Play size={20} className="text-white ml-0.5" fill="white" />
          </div>
        </div>
      </div>
      <h3 className="text-sm font-medium text-white truncate">{playlist.title}</h3>
      <p className="text-xs text-[#AAAAAA] truncate">{playlist.songIds.length} songs</p>
    </div>
  );
}
