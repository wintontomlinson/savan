import { useState } from 'react';
import { Heart, Play } from 'lucide-react';
import { songs as fallbackSongs } from '../data/data';
import { usePlayer } from '../context/PlayerContext';
import SongRow from '../components/SongRow';

export default function Library() {
  const { likedSongs, playSong } = usePlayer();
  const [tab, setTab] = useState('liked');

  // In a real app this would fetch from API/localStorage
  // For now just show liked songs
  const likedSongsList = fallbackSongs.filter((s) => likedSongs.includes(s.id));

  return (
    <div className="pb-8 animate-fade-in-up">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 px-2">Your Library</h1>

      {/* Liked Songs */}
      <section className="px-2">
        <div className="flex items-center gap-4 mb-4 p-4 rounded-xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-white/5">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Heart size={24} className="text-white" fill="white" />
          </div>
          <div className="flex-1">
            <p className="text-base font-bold text-white">Liked Songs</p>
            <p className="text-sm text-[#AAAAAA]">{likedSongs.length} songs</p>
          </div>
        </div>

        {likedSongs.length === 0 ? (
          <div className="text-center py-12">
            <Heart size={48} className="text-[#AAAAAA]/30 mx-auto mb-4" />
            <p className="text-[#AAAAAA]">No liked songs yet</p>
            <p className="text-xs text-[#AAAAAA]/60 mt-1">Songs you like will appear here</p>
          </div>
        ) : (
          <div className="bg-[#1F1F1F] rounded-xl overflow-hidden">
            {likedSongsList.map((song, index) => (
              <SongRow key={song.id} song={song} index={index} songList={likedSongsList} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
