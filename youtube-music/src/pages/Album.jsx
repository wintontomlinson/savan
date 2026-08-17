import { useParams, useNavigate } from 'react-router-dom';
import { Play, Shuffle, Heart, Download, MoreHorizontal, Clock, Lock } from 'lucide-react';
import { albums, songs, formatDuration } from '../data/data';
import { usePlayer } from '../context/PlayerContext';
import SongRow from '../components/SongRow';

export default function Album() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playSong, showToast } = usePlayer();

  const album = albums.find((a) => a.id === id);
  if (!album) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[#AAAAAA]">Album not found</p>
      </div>
    );
  }

  const albumSongs = songs.filter((s) => s.albumId === id);
  const totalDuration = albumSongs.reduce((acc, s) => acc + s.duration, 0);
  const totalMinutes = Math.floor(totalDuration / 60);

  return (
    <div className="pb-8">
      {/* Header */}
      <section className="flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-8 px-2">
        <div className="w-[200px] h-[200px] sm:w-[240px] sm:h-[240px] rounded-xl overflow-hidden shadow-2xl flex-shrink-0">
          <img src={album.image} alt={album.title} className="w-full h-full object-cover" />
        </div>
        <div className="text-center sm:text-left">
          <p className="text-xs uppercase text-[#AAAAAA] font-medium mb-2">Album</p>
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">{album.title}</h1>
          <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
            <button
              onClick={() => navigate(`/artist/${album.artistId}`)}
              className="text-sm text-white font-medium hover:underline"
            >
              {album.artist}
            </button>
            <span className="text-[#AAAAAA]">•</span>
            <span className="text-sm text-[#AAAAAA]">{album.year}</span>
            <span className="text-[#AAAAAA]">•</span>
            <span className="text-sm text-[#AAAAAA]">{albumSongs.length} songs</span>
            <span className="text-[#AAAAAA]">•</span>
            <span className="text-sm text-[#AAAAAA]">{totalMinutes} min</span>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 mb-6 px-2">
        <button
          onClick={() => albumSongs.length > 0 && playSong(albumSongs[0], albumSongs)}
          className="w-12 h-12 bg-[#FF0000] rounded-full flex items-center justify-center hover:bg-[#CC0000] transition-colors duration-200 shadow-lg"
        >
          <Play size={22} className="text-white ml-0.5" fill="white" />
        </button>
        <button
          onClick={() => {
            const shuffled = [...albumSongs].sort(() => Math.random() - 0.5);
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
        {/* Table Header */}
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
          {albumSongs.map((song, index) => (
            <SongRow key={song.id} song={song} index={index} showAlbum={false} songList={albumSongs} />
          ))}
        </div>
      </section>

      {/* Recommended */}
      {albumSongs.length > 0 && (
        <section className="mt-8 px-2">
          <h2 className="text-xl font-bold text-white mb-4">You Might Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {albums.filter((a) => a.id !== id).slice(0, 5).map((a) => (
              <div
                key={a.id}
                className="group cursor-pointer"
                onClick={() => navigate(`/album/${a.id}`)}
              >
                <div className="relative aspect-square rounded-lg overflow-hidden mb-2">
                  <img src={a.image} alt={a.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 bg-[#FF0000] rounded-full flex items-center justify-center shadow-lg">
                      <Play size={20} className="text-white ml-0.5" fill="white" />
                    </div>
                  </div>
                </div>
                <h3 className="text-sm font-medium text-white truncate">{a.title}</h3>
                <p className="text-xs text-[#AAAAAA]">{a.artist}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
