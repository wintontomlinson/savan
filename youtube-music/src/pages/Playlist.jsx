import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Play, Shuffle, Loader2 } from 'lucide-react';
import { getPlaylistById } from '../data/api';
import { formatDuration } from '../data/data';
import { usePlayer } from '../context/PlayerContext';
import SongRow from '../components/SongRow';

export default function Playlist() {
  const { id } = useParams();
  const { playSong } = usePlayer();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlaylist() {
      setLoading(true);
      const data = await getPlaylistById(id);
      setPlaylist(data);
      setLoading(false);
    }
    fetchPlaylist();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="text-[#FF0000] animate-spin" />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[#AAAAAA]">Playlist not found</p>
      </div>
    );
  }

  const playlistSongs = playlist.songs || [];

  return (
    <div className="pb-8 animate-fade-in-up">
      {/* Header */}
      <section className="flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-8 px-2">
        <img src={playlist.image} alt={playlist.title} className="w-[200px] h-[200px] sm:w-[240px] sm:h-[240px] rounded-xl shadow-2xl object-cover" />
        <div className="text-center sm:text-left">
          <p className="text-xs uppercase text-[#AAAAAA] font-medium mb-2">Playlist</p>
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">{playlist.title}</h1>
          {playlist.description && <p className="text-sm text-[#AAAAAA] mb-2">{playlist.description}</p>}
          <p className="text-sm text-[#AAAAAA]">{playlistSongs.length} songs</p>
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center gap-3 mb-6 px-2">
        <button
          onClick={() => playlistSongs.length > 0 && playSong(playlistSongs[0], playlistSongs)}
          className="w-12 h-12 bg-[#FF0000] rounded-full flex items-center justify-center hover:bg-[#CC0000] transition-colors shadow-lg btn-press"
        >
          <Play size={22} className="text-white ml-0.5" fill="white" />
        </button>
        <button
          onClick={() => {
            const shuffled = [...playlistSongs].sort(() => Math.random() - 0.5);
            if (shuffled.length > 0) playSong(shuffled[0], shuffled);
          }}
          className="p-3 rounded-full hover:bg-[#282828] transition-colors text-[#AAAAAA] hover:text-white"
        >
          <Shuffle size={22} />
        </button>
      </div>

      {/* Songs */}
      <div className="px-2">
        <div className="bg-[#1F1F1F] rounded-xl overflow-hidden">
          {playlistSongs.map((song, index) => (
            <SongRow key={song.id} song={song} index={index} songList={playlistSongs} />
          ))}
        </div>
      </div>
    </div>
  );
}
