import { useParams, useNavigate } from 'react-router-dom';
import { Play, Shuffle, Heart, Download, MoreHorizontal, Clock, Lock } from 'lucide-react';
import { playlists, songs, formatDuration } from '../data/data';
import { usePlayer } from '../context/PlayerContext';
import SongRow from '../components/SongRow';

export default function Playlist() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playSong, showToast } = usePlayer();

  const playlist = playlists.find((p) => p.id === id);
  if (!playlist) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[#AAAAAA]">Playlist not found</p>
      </div>
    );
  }

  const playlistSongs = playlist.songIds
    .map((sid) => songs.find((s) => s.id === sid))
    .filter(Boolean);
  const totalDuration = playlistSongs.reduce((acc, s) => acc + s.duration, 0);
  const totalMinutes = Math.floor(totalDuration / 60);

  return (
    <div className="pb-8">
      {/* Header */}
      <section className="flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-8 px-2">
        <div className={`w-[200px] h-[200px] sm:w-[240px] sm:h-[240px] rounded-xl overflow-hidden shadow-2xl flex-shrink-0 bg-gradient-to-br ${playlist.gradient}`}>
          <img src={playlist.image} alt={playlist.title} className="w-full h-full object-cover mix-blend-overlay" />
        </div>
        <div className="text-center sm:text-left">
          <p className="text-xs uppercase text-[#AAAAAA] font-medium mb-2">Playlist</p>
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">{playlist.title}</h1>
          <p className="text-sm text-[#AAAAAA] mb-2">{playlist.description}</p>
          <div className="flex items-center gap-2 justify-center sm:justify-start text-sm text-[#AAAAAA]">
            <span>{playlistSongs.length} songs</span>
            <span>•</span>
            <span>{totalMinutes} min</span>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 mb-6 px-2">
        <button
          onClick={() => playlistSongs.length > 0 && playSong(playlistSongs[0], playlistSongs)}
          className="w-12 h-12 bg-[#FF0000] rounded-full flex items-center justify-center hover:bg-[#CC0000] transition-colors duration-200 shadow-lg"
        >
          <Play size={22} className="text-white ml-0.5" fill="white" />
        </button>
        <button
          onClick={() => {
            const shuffled = [...playlistSongs].sort(() => Math.random() - 0.5);
            if (shuffled.length > 0) playSong(shuffled[0], shuffled);
          }}
          className="p-3 rounded-full hover:bg-[#282828] transition-colors duration-200 text-[#AAAAAA] hover:text-white"
        >
          <Shuffle size={22} />
        </button>
        <button
          onClick={() => showToast('Added to library')}
          className="p-3 rounded-full hover:bg-[#282828] transition-colors duration-200 text-[#AAAAAA] hover:text-white"
        >
          <Heart size={22} />
        </button>
        <button
          onClick={() => showToast('Premium feature')}
          className="p-3 rounded-full hover:bg-[#282828] transition-colors duration-200 text-[#AAAAAA] hover:text-white relative"
        >
          <Download size={22} />
          <Lock size={10} className="absolute top-1 right-1 text-[#AAAAAA]" />
        </button>
        <button className="p-3 rounded-full hover:bg-[#282828] transition-colors duration-200 text-[#AAAAAA] hover:text-white">
          <MoreHorizontal size={22} />
        </button>
      </div>

      {/* Song List */}
      <section className="px-2">
        <div className="flex items-center gap-4 px-4 py-2 text-xs text-[#AAAAAA] uppercase border-b border-white/5 mb-2">
          <span className="w-8 text-center">#</span>
          <span className="w-10"></span>
          <span className="flex-1">Title</span>
          <span className="hidden md:block w-32 lg:w-48">Album</span>
          <span className="w-12 text-right">
            <Clock size={14} className="inline" />
          </span>
          <span className="w-8"></span>
          <span className="w-8"></span>
        </div>

        <div className="bg-[#1F1F1F] rounded-xl overflow-hidden">
          {playlistSongs.map((song, index) => (
            <SongRow key={song.id} song={song} index={index} songList={playlistSongs} />
          ))}
        </div>
      </section>
    </div>
  );
}
