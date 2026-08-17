import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Shuffle, Loader2 } from 'lucide-react';
import { getArtistById, searchSongs } from '../data/api';
import { usePlayer } from '../context/PlayerContext';
import SongRow from '../components/SongRow';

export default function Artist() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playSong } = usePlayer();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArtist() {
      setLoading(true);
      const data = await getArtistById(id);
      if (data && data.topSongs?.length === 0) {
        // Fallback: search by artist name
        const songs = await searchSongs(data.name, 10);
        data.topSongs = songs;
      }
      setArtist(data);
      setLoading(false);
    }
    fetchArtist();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="text-[#FF0000] animate-spin" />
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[#AAAAAA]">Artist not found</p>
      </div>
    );
  }

  const artistSongs = artist.topSongs || [];
  const artistAlbums = artist.topAlbums || [];

  return (
    <div className="pb-8 animate-fade-in">
      {/* Hero */}
      <section className="relative h-[280px] sm:h-[320px] -mx-4 sm:-mx-6 -mt-4 mb-8">
        <img src={artist.image} alt={artist.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-[#0F0F0F]/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-1">{artist.name}</h1>
          {artist.followerCount > 0 && (
            <p className="text-sm text-[#AAAAAA]">{Number(artist.followerCount).toLocaleString()} followers</p>
          )}
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <button
          onClick={() => artistSongs.length > 0 && playSong(artistSongs[0], artistSongs)}
          className="flex items-center gap-2 px-6 py-3 bg-[#FF0000] text-white rounded-full font-medium hover:bg-[#CC0000] transition-all btn-press"
        >
          <Shuffle size={18} />
          <span>Shuffle</span>
        </button>
      </div>

      {/* Songs */}
      {artistSongs.length > 0 && (
        <section className="mb-8 px-2">
          <h2 className="text-xl font-bold text-white mb-4">Popular</h2>
          <div className="bg-[#1F1F1F] rounded-xl overflow-hidden">
            {artistSongs.map((song, index) => (
              <SongRow key={song.id} song={song} index={index} songList={artistSongs} />
            ))}
          </div>
        </section>
      )}

      {/* Albums */}
      {artistAlbums.length > 0 && (
        <section className="mb-8 px-2">
          <h2 className="text-xl font-bold text-white mb-4">Albums</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {artistAlbums.map((album) => (
              <div
                key={album.id}
                className="group cursor-pointer card-hover-tilt"
                onClick={() => navigate(`/album/${album.id}`)}
              >
                <div className="relative aspect-square rounded-lg overflow-hidden mb-2">
                  <img src={album.image} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 bg-[#FF0000] rounded-full flex items-center justify-center">
                      <Play size={20} className="text-white ml-0.5" fill="white" />
                    </div>
                  </div>
                </div>
                <h3 className="text-sm font-medium text-white truncate">{album.title}</h3>
                <p className="text-xs text-[#AAAAAA]">{album.year}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Bio */}
      {artist.bio && (
        <section className="px-2">
          <h2 className="text-xl font-bold text-white mb-4">About</h2>
          <p className="text-sm text-[#AAAAAA] leading-relaxed bg-[#1F1F1F] rounded-xl p-5">{artist.bio}</p>
        </section>
      )}
    </div>
  );
}
