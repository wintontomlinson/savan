import { useParams, useNavigate } from 'react-router-dom';
import { Play, Shuffle, Radio, UserPlus, MoreHorizontal } from 'lucide-react';
import { artists, songs, albums } from '../data/data';
import { usePlayer } from '../context/PlayerContext';
import SongRow from '../components/SongRow';
import ArtistCard from '../components/ArtistCard';

export default function Artist() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playSong, showToast } = usePlayer();

  const artist = artists.find((a) => a.id === id);
  if (!artist) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[#AAAAAA]">Artist not found</p>
      </div>
    );
  }

  const artistSongs = songs.filter((s) => s.artistId === id);
  const artistAlbums = albums.filter((a) => a.artistId === id);
  const similarArtists = artists.filter((a) => a.id !== id).slice(0, 6);

  return (
    <div className="pb-8">
      {/* Hero Banner */}
      <section className="relative h-[300px] sm:h-[350px] -mx-4 sm:-mx-6 -mt-4 mb-8 px-2">
        <img
          src={artist.image}
          alt={artist.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-[#0F0F0F]/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-2">{artist.name}</h1>
          <p className="text-sm text-[#AAAAAA]">{artist.monthlyListeners} monthly listeners</p>
        </div>
      </section>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <button
          onClick={() => artistSongs.length > 0 && playSong(artistSongs[0], artistSongs)}
          className="flex items-center gap-2 px-6 py-3 bg-[#FF0000] text-white rounded-full font-medium hover:bg-[#CC0000] transition-colors duration-200"
        >
          <Shuffle size={18} />
          <span>Shuffle</span>
        </button>
        <button className="flex items-center gap-2 px-6 py-3 bg-[#282828] text-white rounded-full font-medium hover:bg-[#383838] transition-colors duration-200">
          <Radio size={18} />
          <span>Radio</span>
        </button>
        <button
          onClick={() => showToast('Subscribed!')}
          className="flex items-center gap-2 px-5 py-3 border border-white/20 text-white rounded-full font-medium hover:bg-white/10 transition-colors duration-200"
        >
          <UserPlus size={18} />
          <span className="hidden sm:inline">Subscribe</span>
        </button>
        <button className="p-3 rounded-full hover:bg-[#282828] transition-colors duration-200 ml-auto">
          <MoreHorizontal size={20} className="text-white" />
        </button>
      </div>

      {/* Popular Songs */}
      <section className="mb-8 px-2">
        <h2 className="text-xl font-bold text-white mb-4">Popular Songs</h2>
        <div className="bg-[#1F1F1F] rounded-xl overflow-hidden">
          {artistSongs.slice(0, 5).map((song, index) => (
            <SongRow key={song.id} song={song} index={index} songList={artistSongs} />
          ))}
        </div>
        {artistSongs.length > 5 && (
          <button className="mt-3 text-sm text-[#AAAAAA] hover:text-white transition-colors">
            Show more
          </button>
        )}
      </section>

      {/* Albums */}
      {artistAlbums.length > 0 && (
        <section className="mb-8 px-2">
          <h2 className="text-xl font-bold text-white mb-4">Albums</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {artistAlbums.map((album) => (
              <div
                key={album.id}
                className="group cursor-pointer"
                onClick={() => navigate(`/album/${album.id}`)}
              >
                <div className="relative aspect-square rounded-lg overflow-hidden mb-2">
                  <img
                    src={album.image}
                    alt={album.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 bg-[#FF0000] rounded-full flex items-center justify-center shadow-lg">
                      <Play size={20} className="text-white ml-0.5" fill="white" />
                    </div>
                  </div>
                </div>
                <h3 className="text-sm font-medium text-white truncate">{album.title}</h3>
                <p className="text-xs text-[#AAAAAA]">{album.year} • Album</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Fans Also Like */}
      <section className="mb-8 px-2">
        <h2 className="text-xl font-bold text-white mb-4">Fans Also Like</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {similarArtists.map((a) => (
            <ArtistCard key={a.id} artist={a} />
          ))}
        </div>
      </section>

      {/* About */}
      <section className="px-2">
        <h2 className="text-xl font-bold text-white mb-4">About</h2>
        <div className="bg-[#1F1F1F] rounded-xl p-6 border border-white/5">
          <div className="flex items-start gap-4">
            <img src={artist.image} alt="" className="w-20 h-20 rounded-full object-cover flex-shrink-0" />
            <div>
              <p className="text-sm text-[#AAAAAA] leading-relaxed mb-3">{artist.bio}</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="text-[#AAAAAA]">
                  <span className="text-white font-medium">{artist.monthlyListeners}</span> monthly listeners
                </span>
                <span className="text-[#AAAAAA]">
                  📍 {artist.location}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
