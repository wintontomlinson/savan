import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Loader2 } from 'lucide-react';
import { songs as fallbackSongs, artists, albums, playlists, moods, getGreeting } from '../data/data';
import { searchSongs } from '../data/api';
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
  const [trendingSongs, setTrendingSongs] = useState([]);
  const [bollywoodSongs, setBollywoodSongs] = useState([]);
  const [punjabiSongs, setPunjabiSongs] = useState([]);
  const [englishSongs, setEnglishSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [trending, bollywood, punjabi, english] = await Promise.all([
          searchSongs('trending hits 2024', 12),
          searchSongs('Arijit Singh romantic', 10),
          searchSongs('AP Dhillon', 8),
          searchSongs('Dua Lipa The Weeknd', 10),
        ]);
        setTrendingSongs(trending);
        setBollywoodSongs(bollywood);
        setPunjabiSongs(punjabi);
        setEnglishSongs(english);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  // Use API data if available, else fallback
  const quickPicks = trendingSongs.length > 0 ? trendingSongs.slice(0, 8) : fallbackSongs.slice(0, 8);
  const listenAgain = bollywoodSongs.length > 0 ? bollywoodSongs : fallbackSongs.slice(8, 18);
  const hotSongs = trendingSongs.length > 0 ? trendingSongs : fallbackSongs.slice(0, 10);

  return (
    <div className="pb-8">
      {/* Greeting Banner */}
      <section className="mb-8 px-2 animate-fade-in-up">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#FF0000]/20 via-[#1F1F1F] to-[#1F1F1F] p-8 sm:p-12 group hover:from-[#FF0000]/30 transition-all duration-500">
          <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 animate-text-reveal">{getGreeting()}</h1>
            <p className="text-[#AAAAAA] text-sm sm:text-base animate-fade-in" style={{ animationDelay: '0.3s' }}>
              {loading ? 'Loading fresh music for you...' : "Here's what's trending for you today"}
            </p>
          </div>
          <div className="absolute right-0 top-0 w-1/2 h-full opacity-10 transition-opacity duration-500 group-hover:opacity-20">
            <svg viewBox="0 0 200 200" className="w-full h-full fill-[#FF0000] animate-float">
              <circle cx="100" cy="100" r="80" />
            </svg>
          </div>
        </div>
      </section>

      {/* Loading Indicator */}
      {loading && (
        <div className="flex items-center justify-center py-8 animate-fade-in">
          <Loader2 size={32} className="text-[#FF0000] animate-spin" />
          <span className="ml-3 text-[#AAAAAA]">Fetching songs from JioSaavn...</span>
        </div>
      )}

      {/* Quick Picks Grid */}
      {quickPicks.length > 0 && (
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
      )}

      {/* Bollywood / Listen Again */}
      {listenAgain.length > 0 && (
        <HorizontalScroll title="❤️ Bollywood Hits">
          {listenAgain.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </HorizontalScroll>
      )}

      {/* Punjabi Songs */}
      {punjabiSongs.length > 0 && (
        <HorizontalScroll title="🔥 Punjabi Fire">
          {punjabiSongs.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </HorizontalScroll>
      )}

      {/* English Pop */}
      {englishSongs.length > 0 && (
        <HorizontalScroll title="🌍 English Pop">
          {englishSongs.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </HorizontalScroll>
      )}

      {/* Hot Songs Chart */}
      {hotSongs.length > 0 && (
        <section className="mb-8 px-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">🔥 Hot Songs</h2>
          <div className="bg-[#1F1F1F] rounded-xl overflow-hidden">
            {hotSongs.slice(0, 10).map((song, index) => (
              <SongRow key={song.id} song={song} index={index} songList={hotSongs} />
            ))}
          </div>
        </section>
      )}

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
              <span>{mood.icon}</span>
              <span>{mood.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Top Artists (static) */}
      <HorizontalScroll title="Top Artists">
        {artists.map((artist) => (
          <ArtistCard key={artist.id} artist={artist} />
        ))}
      </HorizontalScroll>

      {/* Recommended Playlists (static) */}
      <HorizontalScroll title="Recommended Playlists">
        {playlists.slice(0, 8).map((playlist) => (
          <PlaylistCard key={playlist.id} playlist={playlist} />
        ))}
      </HorizontalScroll>
    </div>
  );
}
