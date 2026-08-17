import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Play, Loader2 } from 'lucide-react';
import { searchSongs, searchAlbums, searchArtists } from '../data/api';
import { usePlayer } from '../context/PlayerContext';
import SongRow from '../components/SongRow';

const filterChips = ['All', 'Songs', 'Albums', 'Artists'];

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [activeFilter, setActiveFilter] = useState('All');
  const navigate = useNavigate();
  const { playSong } = usePlayer();

  const [songResults, setSongResults] = useState([]);
  const [albumResults, setAlbumResults] = useState([]);
  const [artistResults, setArtistResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;
    setLoading(true);

    async function fetchResults() {
      try {
        const [songs, albums, artists] = await Promise.all([
          searchSongs(query, 20),
          searchAlbums(query, 10),
          searchArtists(query, 10),
        ]);
        setSongResults(songs);
        setAlbumResults(albums);
        setArtistResults(artists);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    fetchResults();
  }, [query]);

  const hasResults = songResults.length > 0 || albumResults.length > 0 || artistResults.length > 0;

  if (!query) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-lg text-white font-medium mb-2">Search YouTube Music</p>
          <p className="text-sm text-[#AAAAAA]">Find songs, artists, albums from JioSaavn</p>
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

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12 animate-fade-in">
          <Loader2 size={32} className="text-[#FF0000] animate-spin" />
          <span className="ml-3 text-[#AAAAAA]">Searching JioSaavn...</span>
        </div>
      )}

      {!loading && !hasResults && (
        <div className="text-center py-12 px-2">
          <p className="text-lg text-white mb-2">No results found</p>
          <p className="text-sm text-[#AAAAAA]">Try searching for something else</p>
        </div>
      )}

      {!loading && hasResults && (
        <>
          {/* Top Result */}
          {(activeFilter === 'All') && songResults.length > 0 && (
            <section className="mb-8 px-2">
              <h2 className="text-xl font-bold text-white mb-4">Top Result</h2>
              <button
                onClick={() => playSong(songResults[0], songResults)}
                className="group w-full sm:w-[400px] p-5 bg-[#1F1F1F] rounded-xl hover:bg-[#282828] transition-colors duration-200 text-left"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={songResults[0].image}
                    alt=""
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xl font-bold text-white truncate">{songResults[0].title}</p>
                    <p className="text-sm text-[#AAAAAA]">{songResults[0].artist}</p>
                    <span className="inline-block mt-2 text-xs bg-[#282828] px-2 py-1 rounded text-[#AAAAAA]">Song • {songResults[0].language}</span>
                  </div>
                  <div className="w-12 h-12 bg-[#FF0000] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                    <Play size={20} className="text-white ml-0.5" fill="white" />
                  </div>
                </div>
              </button>
            </section>
          )}

          {/* Songs */}
          {(activeFilter === 'All' || activeFilter === 'Songs') && songResults.length > 0 && (
            <section className="mb-8 px-2">
              <h2 className="text-xl font-bold text-white mb-4">Songs</h2>
              <div className="bg-[#1F1F1F] rounded-xl overflow-hidden">
                {songResults.slice(0, activeFilter === 'Songs' ? 50 : 8).map((song, index) => (
                  <SongRow key={song.id} song={song} index={index} songList={songResults} />
                ))}
              </div>
            </section>
          )}

          {/* Albums */}
          {(activeFilter === 'All' || activeFilter === 'Albums') && albumResults.length > 0 && (
            <section className="mb-8 px-2">
              <h2 className="text-xl font-bold text-white mb-4">Albums</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {albumResults.map((album) => (
                  <div
                    key={album.id}
                    className="group cursor-pointer card-hover-tilt"
                    onClick={() => navigate(`/album/${album.id}`)}
                  >
                    <div className="relative aspect-square rounded-lg overflow-hidden mb-2">
                      <img src={album.image} alt={album.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
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
          {(activeFilter === 'All' || activeFilter === 'Artists') && artistResults.length > 0 && (
            <section className="mb-8 px-2">
              <h2 className="text-xl font-bold text-white mb-4">Artists</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {artistResults.map((artist) => (
                  <div key={artist.id} className="group cursor-pointer text-center" onClick={() => navigate(`/artist/${artist.id}`)}>
                    <div className="relative w-[120px] h-[120px] mx-auto rounded-full overflow-hidden mb-3 transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(255,0,0,0.2)]">
                      <img src={artist.image} alt={artist.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    </div>
                    <p className="text-sm font-medium text-white truncate group-hover:text-[#FF0000] transition-colors">{artist.name}</p>
                    <p className="text-xs text-[#AAAAAA]">Artist</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
