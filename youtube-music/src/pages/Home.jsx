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
      className="group flex-shrink-0 w-[160px] sm:w-[180px] cursor-pointer card-hover-tilt"
      onClick={() => navigate(`/album/${album.id}`)}
    >
      <div className="relative aspect-square rounded-lg overflow-hidden mb-2">
        <img
          src={album.image}
          alt={album.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-12 h-12 bg-[#FF0000] rounded-full flex items-center justify-center shadow-lg transform scale-50 group-hover:scale-100 transition-all duration-300 btn-press">
            <Play size={20} className="text-white ml-0.5" fill="white" />
          </div>
        </div>
      </div>
      <h3 className="text-sm font-medium text-white truncate transition-colors duration-200 group-hover:text-[#FF0000]">{album.title}</h3>
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
      <section className="mb-8 px-2 animate-fade-in-up">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#FF0000]/20 via-[#1F1F1F] to-[#1F1F1F] p-8 sm:p-12 group hover:from-[#FF0000]/30 transition-all duration-500">
          <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 animate-text-reveal">{getGreeting()}</h1>
            <p className="text-[#AAAAAA] text-sm sm:text-base animate-fade-in" style={{ animationDelay: '0.3s' }}>Here&apos;s what&apos;s trending for you today</p>
          </div>
          <div className="absolute right-0 top-0 w-1/2 h-full opacity-10 transition-opacity duration-500 group-hover:opacity-20">
            <svg viewBox="0 0 200 200" className="w-full h-full fill-[#FF0000] animate-float">
              <circle cx="100" cy="100" r="80" />
            </svg>
          </div>
        </div>
      </section>

      {/* Quick Picks Grid */}
      <section className="mb-8 px-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Quick Picks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 stagger-children">
          {quickPicks.map((song, i) => (
            <button
              key={song.id}
              onClick={() => playSong(song, quickPicks)}
              className="group flex items-center gap-3 p-2 rounded-lg bg-[#1F1F1F] hover:bg-[#282828] transition-all duration-200 hover:scale-[1.02] hover:shadow-lg animate-fade-in-up"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <img src={song.image} alt={song.title} className="w-12 h-12 rounded object-cover transition-transform duration-300 group-hover:scale-110" />
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-white truncate group-hover:text-[#FF0000] transition-colors duration-200">{song.title}</p>
                <p className="text-xs text-[#AAAAAA] truncate">{song.artist}</p>
              </div>
              <div className="w-8 h-8 bg-[#FF0000] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg transform scale-75 group-hover:scale-100 btn-press">
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
      <section className="mb-8 px-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">🔥 Hot Songs</h2>
        <div className="bg-[#1F1F1F] rounded-xl overflow-hidden">
          {hotSongs.map((song, index) => (
            <SongRow key={song.id} song={song} index={index} songList={hotSongs} />
          ))}
        </div>
      </section>

      {/* Moods & Genres */}
      <section className="mb-8 px-2 animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Moods & Genres</h2>
        <div className="flex flex-wrap gap-3">
          {moods.map((mood, i) => (
            <button
              key={mood.id}
              className={`${mood.color} px-5 py-2.5 rounded-full text-white text-sm font-medium transition-all duration-300 flex items-center gap-2 hover:scale-110 hover:shadow-lg btn-press`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <span className="transition-transform duration-200 hover:scale-125">{mood.icon}</span>
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
