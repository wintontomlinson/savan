import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Grid3X3, List, Heart, ArrowUpDown, Play } from 'lucide-react';
import { songs, albums, artists, playlists } from '../data/data';
import { usePlayer } from '../context/PlayerContext';
import SongRow from '../components/SongRow';
import ArtistCard from '../components/ArtistCard';

const filterTabs = ['Playlists', 'Albums', 'Songs', 'Artists', 'Subscriptions'];
const sortOptions = ['Recently added', 'A-Z', 'By Artist'];

export default function Library() {
  const [activeTab, setActiveTab] = useState('Playlists');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('Recently added');
  const [showSort, setShowSort] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const { likedSongs, playSong, showToast } = usePlayer();
  const navigate = useNavigate();

  const likedSongsList = songs.filter((s) => likedSongs.includes(s.id));

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      showToast(`Playlist "${newPlaylistName}" created`);
      setNewPlaylistName('');
      setShowCreateModal(false);
    }
  };

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Your Library</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#282828] hover:bg-[#383838] rounded-full text-sm text-white font-medium transition-colors duration-200"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">New Playlist</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide px-2 mb-4" style={{ scrollbarWidth: 'none' }}>
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

      {/* View Controls */}
      <div className="flex items-center justify-between px-2 mb-4">
        <div className="relative">
          <button
            onClick={() => setShowSort(!showSort)}
            className="flex items-center gap-2 text-sm text-[#AAAAAA] hover:text-white transition-colors"
          >
            <ArrowUpDown size={16} />
            <span>{sortBy}</span>
          </button>
          {showSort && (
            <div className="absolute top-full mt-2 left-0 bg-[#282828] rounded-xl shadow-2xl border border-white/5 overflow-hidden z-20 w-44">
              {sortOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => { setSortBy(opt); setShowSort(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    sortBy === opt ? 'text-white bg-white/10' : 'text-[#AAAAAA] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-[#AAAAAA] hover:text-white'}`}
          >
            <Grid3X3 size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-[#AAAAAA] hover:text-white'}`}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'Playlists' && (
        <div className="px-2">
          {/* Liked Songs Card */}
          <button
            onClick={() => {}}
            className="group flex items-center gap-4 w-full p-4 rounded-xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-white/5 hover:border-white/10 transition-all duration-200 mb-4"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Heart size={24} className="text-white" fill="white" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-base font-bold text-white">Liked Songs</p>
              <p className="text-sm text-[#AAAAAA]">{likedSongsList.length} songs</p>
            </div>
            <div className="w-10 h-10 bg-[#FF0000] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
              <Play size={18} className="text-white ml-0.5" fill="white" />
            </div>
          </button>

          {/* Playlists Grid */}
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'
            : 'space-y-2'
          }>
            {playlists.map((playlist) => (
              viewMode === 'grid' ? (
                <div
                  key={playlist.id}
                  className="group cursor-pointer"
                  onClick={() => navigate(`/playlist/${playlist.id}`)}
                >
                  <div className="relative aspect-square rounded-lg overflow-hidden mb-2">
                    <div className={`absolute inset-0 bg-gradient-to-br ${playlist.gradient} opacity-80`}></div>
                    <img src={playlist.image} alt="" className="w-full h-full object-cover mix-blend-overlay" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-12 h-12 bg-[#FF0000] rounded-full flex items-center justify-center shadow-lg">
                        <Play size={20} className="text-white ml-0.5" fill="white" />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-white truncate">{playlist.title}</h3>
                  <p className="text-xs text-[#AAAAAA]">{playlist.songIds.length} songs</p>
                </div>
              ) : (
                <button
                  key={playlist.id}
                  onClick={() => navigate(`/playlist/${playlist.id}`)}
                  className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-[#282828] transition-colors"
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${playlist.gradient} flex-shrink-0`}></div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-white">{playlist.title}</p>
                    <p className="text-xs text-[#AAAAAA]">{playlist.songIds.length} songs</p>
                  </div>
                </button>
              )
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Albums' && (
        <div className={`px-2 ${viewMode === 'grid'
          ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'
          : 'space-y-2'
        }`}>
          {albums.map((album) => (
            viewMode === 'grid' ? (
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
            ) : (
              <button
                key={album.id}
                onClick={() => navigate(`/album/${album.id}`)}
                className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-[#282828] transition-colors"
              >
                <img src={album.image} alt="" className="w-12 h-12 rounded object-cover flex-shrink-0" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-white">{album.title}</p>
                  <p className="text-xs text-[#AAAAAA]">{album.artist} • {album.year}</p>
                </div>
              </button>
            )
          ))}
        </div>
      )}

      {activeTab === 'Songs' && (
        <div className="px-2">
          <div className="bg-[#1F1F1F] rounded-xl overflow-hidden">
            {(likedSongsList.length > 0 ? likedSongsList : songs.slice(0, 20)).map((song, index) => (
              <SongRow key={song.id} song={song} index={index} />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Artists' && (
        <div className="px-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {artists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      )}

      {activeTab === 'Subscriptions' && (
        <div className="px-2 text-center py-12">
          <p className="text-[#AAAAAA] text-sm">No subscriptions yet</p>
          <p className="text-[#AAAAAA]/60 text-xs mt-1">Subscribe to artists to see them here</p>
        </div>
      )}

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="relative glass rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-white mb-4">Create Playlist</h3>
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Playlist name"
              className="w-full bg-[#282828] text-white px-4 py-3 rounded-xl text-sm placeholder:text-[#AAAAAA] focus:outline-none focus:ring-2 focus:ring-[#FF0000] mb-4"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm text-[#AAAAAA] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePlaylist}
                className="px-6 py-2 bg-[#FF0000] text-white rounded-full text-sm font-medium hover:bg-[#CC0000] transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
