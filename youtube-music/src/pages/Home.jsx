import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { songs, artists, albums, playlists, moods, getGreeting } from '../data/data';
import { usePlayer } from '../context/PlayerContext';
import SongCard from '../components/SongCard';
import ArtistCard from '../components/ArtistCard';
import PlaylistCard from '../components/PlaylistCard';
import HorizontalScroll from '../components/HorizontalScroll';
import SongRow from '../components/SongRow';

function AlbumCard({ album }) {
  const navigate = useNavigate();

  return (
    <div
      className="group flex-shrink-0 w-[160px] sm:w-[180px] cursor-pointer"
      onClick={() => navigate(`/album/${album.id}`)}
    >
      <div className="relative aspect-square rounded-lg overflow-hidden mb-2">
        <img
          src={album.image}
          alt={album.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="w-12 h-12 bg-[#FF0000] rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-200">
            <Play size={20} className="text-white ml-0.5" fill="white" />
          </div>
        </div>
      </div>
      <h3 className="text-sm font-medium text-white truncate">{album.title}</h3>
      <p className="text-xs text-[#AAAAAA] truncate">{album.artist} • {album.year}</p>
    </div>
  );
}

export default function Home() {
  const { playSong } = usePlayer();

  const quickPicks = songs.slice(0, 8);
  const listenAgain = songs.slice(8, 18);
  const recommendedAlbums = albums.slice(0, 8);
  const hotSongs = songs.slice(0, 10);
  const newReleases = albums.slice(4, 12);
  const topArtists = artists.slice(0, 10);
  const recommendedPlaylists = playlists.slice(0, 8);
  const mixedForYou = playlists.slice(2, 8);

  return (
    <div className="pb-8">
      {/* Greeting Banner */}
      <section className="mb-8 px-2">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#FF0000]/20 via-[#1F1F1F] to-[#1F1F1F] p-8 sm:p-12">
          <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{getGreeting()}</h1>
            <p className="text-[#AAAAAA] text-sm sm:text-base">Here&apos;s what&apos;s trending for you today</p>
          </div>
          <div className="absolute right-0 top-0 w-1/2 h-full opacity-10">
            <svg viewBox="0 0 200 200" className="w-full h-full fill-[#FF0000]">
              <circle cx="100" cy="100" r="80" />
            </svg>
          </div>
        </div>
      </section>

      {/* Quick Picks Grid */}
      <section className="mb-8 px-2">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Quick Picks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {quickPicks.map((song) => (
            <button
              key={song.id}
              onClick={() => playSong(song, quickPicks)}
              className="group flex items-center gap-3 p-2 rounded-lg bg-[#1F1F1F] hover:bg-[#282828] transition-colors duration-200"
            >
              <img src={song.image} alt={song.title} className="w-12 h-12 rounded object-cover" />
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-white truncate">{song.title}</p>
                <p className="text-xs text-[#AAAAAA] truncate">{song.artist}</p>
              </div>
              <div className="w-8 h-8 bg-[#FF0000] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg">
                <Play size={14} className="text-white ml-0.5" fill="white" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Listen Again */}
      <HorizontalScroll title="Listen Again">
        {listenAgain.map((song) => (
          <SongCard key={song.id} song={song} />
        ))}
      </HorizontalScroll>

      {/* Recommended Albums */}
      <HorizontalScroll title="Recommended Albums">
        {recommendedAlbums.map((album) => (
          <AlbumCard key={album.id} album={album} />
        ))}
      </HorizontalScroll>

      {/* Hot Songs */}
      <section className="mb-8 px-2">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">🔥 Hot Songs</h2>
        <div className="bg-[#1F1F1F] rounded-xl overflow-hidden">
          {hotSongs.map((song, index) => (
            <SongRow key={song.id} song={song} index={index} songList={hotSongs} />
          ))}
        </div>
      </section>

      {/* Moods & Genres */}
      <section className="mb-8 px-2">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Moods & Genres</h2>
        <div className="flex flex-wrap gap-3">
          {moods.map((mood) => (
            <button
              key={mood.id}
              className={`${mood.color} px-5 py-2.5 rounded-full text-white text-sm font-medium hover:opacity-80 transition-opacity duration-200 flex items-center gap-2`}
            >
              <span>{mood.icon}</span>
              <span>{mood.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* New Releases */}
      <HorizontalScroll title="New Releases">
        {newReleases.map((album) => (
          <AlbumCard key={album.id} album={album} />
        ))}
      </HorizontalScroll>

      {/* Top Artists */}
      <HorizontalScroll title="Top Artists">
        {topArtists.map((artist) => (
          <ArtistCard key={artist.id} artist={artist} />
        ))}
      </HorizontalScroll>

      {/* Recommended Playlists */}
      <HorizontalScroll title="Recommended Playlists">
        {recommendedPlaylists.map((playlist) => (
          <PlaylistCard key={playlist.id} playlist={playlist} />
        ))}
      </HorizontalScroll>

      {/* Mixed for You */}
      <HorizontalScroll title="Mixed for You">
        {mixedForYou.map((playlist) => (
          <PlaylistCard key={`mix-${playlist.id}`} playlist={playlist} />
        ))}
      </HorizontalScroll>
    </div>
  );
}
