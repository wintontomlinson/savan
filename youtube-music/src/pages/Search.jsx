import { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { songs, artists, albums, playlists } from '../data/data';
import { usePlayer } from '../context/PlayerContext';
import SongRow from '../components/SongRow';
import ArtistCard from '../components/ArtistCard';
import PlaylistCard from '../components/PlaylistCard';

const filterChips = ['All', 'Songs', 'Albums', 'Artists', 'Playlists'];

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [activeFilter, setActiveFilter] = useState('All');
  const navigate = useNavigate();
  const { playSong } = usePlayer();

  const results = useMemo(() => {
    if (!query) return { songs: [], artists: [], albums: [], playlists: [] };
    const q = query.toLowerCase();
    return {
      songs: songs.filter((s) => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q)),
      artists: artists.filter((a) => a.name.toLowerCase().includes(q)),
      albums: albums.filter((a) => a.title.toLowerCase().includes(q) || a.artist.toLowerCase().includes(q)),
      playlists: playlists.filter((p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)),
    };
  }, [query]);

  const hasResults = results.songs.length > 0 || results.artists.length > 0 || results.albums.length > 0 || results.playlists.length > 0;

  if (!query) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-lg text-white font-medium mb-2">Search YouTube Music</p>
          <p className="text-sm text-[#AAAAAA]">Find songs, artists, albums, and playlists</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-8">
      {/* Query Display */}
      <div className="mb-4 px-2">
        <h1 className="text-2xl font-bold text-white">
          Results for &quot;{query}&quot;
        </h1>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide px-2 mb-6" style={{ scrollbarWidth: 'none' }}>
        {filterChips.map((chip) => (
          <button
            key={chip}
            onClick={() => setActiveFilter(chip)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              activeFilter === chip
                ? 'bg-white text-black'
                : 'bg-[#282828] text-[#AAAAAA] hover:bg-[#383838] hover:text-white'
            }`}
          >
            {chip}
          </button>
        ))}
      </div>

      {!hasResults ? (
        <div className="text-center py-12 px-2">
          <p className="text-lg text-white mb-2">No results found</p>
          <p className="text-sm text-[#AAAAAA]">Try searching for something else</p>
        </div>
      ) : (
        <>
          {/* Top Result */}
          {(activeFilter === 'All') && results.songs.length > 0 && (
            <section className="mb-8 px-2">
              <h2 className="text-xl font-bold text-white mb-4">Top Result</h2>
              <button
                onClick={() => playSong(results.songs[0], results.songs)}
                className="group w-full sm:w-[400px] p-5 bg-[#1F1F1F] rounded-xl hover:bg-[#282828] transition-colors duration-200 text-left"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={results.songs[0].image}
                    alt=""
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xl font-bold text-white truncate">{results.songs[0].title}</p>
                    <p className="text-sm text-[#AAAAAA]">{results.songs[0].artist}</p>
                    <span className="inline-block mt-2 text-xs bg-[#282828] px-2 py-1 rounded text-[#AAAAAA]">Song</span>
                  </div>
                  <div className="w-12 h-12 bg-[#FF0000] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                    <Play size={20} className="text-white ml-0.5" fill="white" />
                  </div>
                </div>
              </button>
            </section>
          )}

          {/* Songs */}
          {(activeFilter === 'All' || activeFilter === 'Songs') && results.songs.length > 0 && (
            <section className="mb-8 px-2">
              <h2 className="text-xl font-bold text-white mb-4">Songs</h2>
              <div className="bg-[#1F1F1F] rounded-xl overflow-hidden">
                {results.songs.slice(0, activeFilter === 'Songs' ? 50 : 6).map((song, index) => (
                  <SongRow key={song.id} song={song} index={index} songList={results.songs} />
                ))}
              </div>
            </section>
          )}

          {/* Albums */}
          {(activeFilter === 'All' || activeFilter === 'Albums') && results.albums.length > 0 && (
            <section className="mb-8 px-2">
              <h2 className="text-xl font-bold text-white mb-4">Albums</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {results.albums.map((album) => (
                  <div
                    key={album.id}
                    className="group cursor-pointer"
                    onClick={() => navigate(`/album/${album.id}`)}
                  >
                    <div className="relative aspect-square rounded-lg overflow-hidden mb-2">
                      <img src={album.image} alt={album.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-12 h-12 bg-[#FF0000] rounded-full flex items-center justify-center shadow-lg">
                          <Play size={20} className="text-white ml-0.5" fill="white" />
                        </div>
                      </div>
                    </div>
                    <h3 className="text-sm font-medium text-white truncate">{album.title}</h3>
                    <p className="text-xs text-[#AAAAAA]">{album.artist} • {album.year}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Artists */}
          {(activeFilter === 'All' || activeFilter === 'Artists') && results.artists.length > 0 && (
            <section className="mb-8 px-2">
              <h2 className="text-xl font-bold text-white mb-4">Artists</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {results.artists.map((artist) => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))}
              </div>
            </section>
          )}

          {/* Playlists */}
          {(activeFilter === 'All' || activeFilter === 'Playlists') && results.playlists.length > 0 && (
            <section className="mb-8 px-2">
              <h2 className="text-xl font-bold text-white mb-4">Playlists</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {results.playlists.map((playlist) => (
                  <PlaylistCard key={playlist.id} playlist={playlist} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
