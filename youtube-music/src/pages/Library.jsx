import { Heart, Music } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import SongRow from '../components/SongRow';

export default function Library() {
  const { likedSongs } = usePlayer();

  return (
    <div className="pb-8 animate-fade-in-up">
      <h1 className="text-[26px] sm:text-[32px] font-bold text-white tracking-tight mb-6">Library</h1>

      <section>
        {/* Liked Songs header */}
        <div className="flex items-center gap-4 mb-5 p-4 bg-gradient-to-r from-[#FC3C44]/20 to-[#1C1C1E] rounded-2xl border border-white/5">
          <div className="w-14 h-14 bg-gradient-to-br from-[#FC3C44] to-[#FF2D55] rounded-xl flex items-center justify-center shadow-lg">
            <Heart size={22} className="text-white" fill="white" />
          </div>
          <div>
            <p className="text-[16px] font-bold text-white">Loved Songs</p>
            <p className="text-[13px] text-[#98989F]">{likedSongs.length} songs</p>
          </div>
        </div>

        {likedSongs.length === 0 ? (
          <div className="text-center py-16">
            <Music size={44} className="text-[#48484A] mx-auto mb-4" />
            <p className="text-[15px] text-[#98989F]">Songs you love will appear here</p>
            <p className="text-[12px] text-[#48484A] mt-1">Tap ❤️ on any song to save it</p>
          </div>
        ) : (
          <div className="bg-[#1C1C1E] rounded-2xl overflow-hidden border border-white/5">
            {likedSongs.map((song, i) => (
              <SongRow key={song.id} song={song} index={i} songList={likedSongs} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
