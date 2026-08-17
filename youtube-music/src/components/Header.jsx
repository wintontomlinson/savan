import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Mic, Cast, Bell, User, ChevronDown } from 'lucide-react';
import { songs, artists, albums } from '../data/data';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  const suggestions = searchQuery.length > 0 ? {
    songs: songs.filter(s => 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.artist.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 4),
    artists: artists.filter(a => 
      a.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 3),
    albums: albums.filter(a => 
      a.title.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 3),
  } : { songs: [], artists: [], albums: [] };

  const hasSuggestions = suggestions.songs.length > 0 || suggestions.artists.length > 0 || suggestions.albums.length > 0;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 glass px-4 lg:px-6 py-3 flex items-center gap-4 animate-fade-in">
      {/* Search Bar */}
      <div ref={searchRef} className="flex-1 max-w-2xl mx-auto relative">
        <form onSubmit={handleSearch} className="relative">
          <Search size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${isFocused ? 'text-white' : 'text-[#AAAAAA]'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => { setShowSuggestions(true); setIsFocused(true); }}
            onBlur={() => setIsFocused(false)}
            placeholder="Search songs, artists, albums..."
            className={`w-full bg-[#282828] text-white pl-11 pr-11 py-2.5 rounded-full text-sm placeholder:text-[#AAAAAA] focus:outline-none transition-all duration-300 ${isFocused ? 'ring-2 ring-white/20 bg-[#383838] shadow-lg' : ''}`}
          />
          <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-[#AAAAAA] hover:text-white transition-all duration-200 hover:scale-110">
            <Mic size={18} />
          </button>
        </form>

        {/* Search Suggestions Dropdown */}
        {showSuggestions && hasSuggestions && (
          <div className="absolute top-full mt-2 w-full bg-[#282828] rounded-xl shadow-2xl border border-white/5 overflow-hidden max-h-[400px] overflow-y-auto animate-scale-in">
            {suggestions.songs.length > 0 && (
              <div className="p-2">
                <p className="text-xs text-[#AAAAAA] px-3 py-1 uppercase font-medium">Songs</p>
                {suggestions.songs.map((song, i) => (
                  <button
                    key={song.id}
                    onClick={() => {
                      navigate(`/search?q=${encodeURIComponent(song.title)}`);
                      setShowSuggestions(false);
                      setSearchQuery(song.title);
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 hover:pl-4"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <img src={song.image} alt="" className="w-10 h-10 rounded object-cover transition-transform duration-200 hover:scale-105" />
                    <div className="text-left">
                      <p className="text-sm text-white">{song.title}</p>
                      <p className="text-xs text-[#AAAAAA]">{song.artist}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {suggestions.artists.length > 0 && (
              <div className="p-2 border-t border-white/5">
                <p className="text-xs text-[#AAAAAA] px-3 py-1 uppercase font-medium">Artists</p>
                {suggestions.artists.map((artist, i) => (
                  <button
                    key={artist.id}
                    onClick={() => {
                      navigate(`/artist/${artist.id}`);
                      setShowSuggestions(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 hover:pl-4"
                  >
                    <img src={artist.image} alt="" className="w-10 h-10 rounded-full object-cover transition-transform duration-200 hover:scale-110" />
                    <p className="text-sm text-white">{artist.name}</p>
                  </button>
                ))}
              </div>
            )}
            {suggestions.albums.length > 0 && (
              <div className="p-2 border-t border-white/5">
                <p className="text-xs text-[#AAAAAA] px-3 py-1 uppercase font-medium">Albums</p>
                {suggestions.albums.map((album, i) => (
                  <button
                    key={album.id}
                    onClick={() => {
                      navigate(`/album/${album.id}`);
                      setShowSuggestions(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 hover:pl-4"
                  >
                    <img src={album.image} alt="" className="w-10 h-10 rounded object-cover transition-transform duration-200 hover:scale-105" />
                    <div className="text-left">
                      <p className="text-sm text-white">{album.title}</p>
                      <p className="text-xs text-[#AAAAAA]">{album.artist}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Side Actions */}
      <div className="hidden md:flex items-center gap-2">
        <button className="p-2 rounded-full hover:bg-[#282828] transition-all duration-200 hover:scale-110">
          <Cast size={20} className="text-[#AAAAAA]" />
        </button>
        <button className="p-2 rounded-full hover:bg-[#282828] transition-all duration-200 relative hover:scale-110">
          <Bell size={20} className="text-[#AAAAAA]" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF0000] rounded-full animate-pulse"></span>
        </button>
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 pl-1 pr-2 rounded-full hover:bg-[#282828] transition-all duration-200"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center transition-transform duration-300 hover:scale-110">
              <User size={16} className="text-white" />
            </div>
            <ChevronDown size={14} className={`text-[#AAAAAA] transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-[#282828] rounded-xl shadow-2xl border border-white/5 overflow-hidden animate-scale-in">
              <div className="p-3 border-b border-white/5">
                <p className="text-sm text-white font-medium">User</p>
                <p className="text-xs text-[#AAAAAA]">user@email.com</p>
              </div>
              <div className="p-1">
                <button className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 rounded-lg transition-all duration-200 hover:pl-4">Your Channel</button>
                <button className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 rounded-lg transition-all duration-200 hover:pl-4">Settings</button>
                <button className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 rounded-lg transition-all duration-200 hover:pl-4">Sign Out</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
