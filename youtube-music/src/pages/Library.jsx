import { Heart, Clock } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import SongRow from '../components/SongRow';

export default function Library() {
  const { likedSongs, recentlyPlayed } = usePlayer();

  return (
    <div className="pb-8 animate-fade-in-up">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 px-2">Your Library</h1>

      {/* Liked Songs */}
      <section className="px-2 mb-8">
        <div className="flex items-center gap-4 mb-4 p-4 rounded-xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-white/5">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Heart size={20} className="text-white" fill="white" />
          </div>
          <div>
            <p className="text-base font-bold text-white">Liked Songs</p>
            <p className="text-sm text-[#AAAAAA]">{likedSongs.length} songs</p>
          </div>
        </div>

        {likedSongs.length === 0 ? (
          <div className="text-center py-10">
            <Heart size={40} className="text-[#AAAAAA]/30 mx-auto mb-3" />
            <p className="text-[#AAAAAA] text-sm">No liked songs yet</p>
            <p className="text-xs text-[#AAAAAA]/50 mt-1">Play a song and tap ❤️ to save it here</p>
          </div>
        ) : (
          <div className="bg-[#1F1F1F] rounded-xl overflow-hidden">
            {likedSongs.map((song, index) => (
              <SongRow key={song.id} song={song} index={index} songList={likedSongs} />
            ))}
          </div>
        )}
      </section>

      {/* Recently Played */}
      {recentlyPlayed.length > 0 && (
        <section className="px-2">
          <div className="flex items-center gap-3 mb-4">
            <Clock size={20} className="text-[#AAAAAA]" />
            <h2 className="text-xl font-bold text-white">Recently Played</h2>
          </div>
          <div className="bg-[#1F1F1F] rounded-xl overflow-hidden">
            {recentlyPlayed.slice(0, 20).map((song, index) => (
              <SongRow key={song.id} song={song} index={index} songList={recentlyPlayed} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
