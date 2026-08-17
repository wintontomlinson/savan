import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { songs, artists, albums, genres, playlists } from '../data/data';
import { usePlayer } from '../context/PlayerContext';
import SongCard from '../components/SongCard';
import ArtistCard from '../components/ArtistCard';
import HorizontalScroll from '../components/HorizontalScroll';
import SongRow from '../components/SongRow';

const filterTabs = ['All', 'Songs', 'Albums', 'Artists', 'Playlists', 'Podcasts'];

export default function Explore() {
  const [activeTab, setActiveTab] = useState('All');
  const { playSong } = usePlayer();
  const navigate = useNavigate();

  const topSongs = songs.slice(0, 20);
  const featuredArtists = artists.slice(0, 8);
  const newAlbums = albums.slice(0, 8);

  return (
    <div className="pb-8">
      {/* Filter Tabs */}
      <div className="sticky top-0 z-10 bg-[#0F0F0F] px-2 pb-4 pt-2">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1" style={{ scrollbarWidth: 'none' }}>
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-white text-black'
                  : 'bg-[#282828] text-[#AAAAAA] hover:bg-[#383838] hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Charts - Top Songs */}
      {(activeTab === 'All' || activeTab === 'Songs') && (
        <section className="mb-8 px-2">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">📊 Top 100 Songs</h2>
          <div className="bg-[#1F1F1F] rounded-xl overflow-hidden">
            {topSongs.map((song, index) => (
              <SongRow key={song.id} song={song} index={index} songList={topSongs} />
            ))}
          </div>
        </section>
      )}

      {/* Genre Grid */}
      {(activeTab === 'All' || activeTab === 'Playlists') && (
        <section className="mb-8 px-2">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Genres</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {genres.map((genre) => (
              <button
                key={genre.id}
                className={`${genre.color} rounded-xl p-5 text-left hover:opacity-80 transition-opacity duration-200 min-h-[100px] flex items-end`}
              >
                <span className="text-lg font-bold text-white">{genre.name}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* New Releases */}
      {(activeTab === 'All' || activeTab === 'Albums') && (
        <section className="mb-8 px-2">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">New Releases</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {newAlbums.map((album) => (
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
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <div className="w-12 h-12 bg-[#FF0000] rounded-full flex items-center justify-center shadow-lg">
                      <Play size={20} className="text-white ml-0.5" fill="white" />
                    </div>
                  </div>
                </div>
                <h3 className="text-sm font-medium text-white truncate">{album.title}</h3>
                <p className="text-xs text-[#AAAAAA] truncate">{album.artist} • {album.year}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured Artists */}
      {(activeTab === 'All' || activeTab === 'Artists') && (
        <HorizontalScroll title="Featured Artists">
          {featuredArtists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </HorizontalScroll>
      )}

      {/* Trending Songs Carousel */}
      {(activeTab === 'All' || activeTab === 'Songs') && (
        <HorizontalScroll title="Trending Now">
          {songs.slice(10, 22).map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </HorizontalScroll>
      )}
    </div>
  );
}
