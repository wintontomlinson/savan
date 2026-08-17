import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import { searchSongs } from '../data/api';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchQuery.length < 2) { setSuggestions([]); return; }
    setLoadingSuggestions(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchSongs(searchQuery, 5);
        setSuggestions(results);
      } catch { setSuggestions([]); }
      setLoadingSuggestions(false);
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false);
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
    <header className="sticky top-0 z-30 glass px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3">
      <div ref={searchRef} className="w-full max-w-xl mx-auto relative">
        <form onSubmit={handleSearch} className="relative">
          <Search size={16} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[#AAAAAA]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search songs, artists..."
            className="w-full bg-[#282828] text-white text-sm pl-9 sm:pl-11 pr-4 py-2.5 sm:py-3 rounded-full placeholder:text-[#666] focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
          />
        </form>

        {/* Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full mt-2 w-full bg-[#1F1F1F] rounded-xl shadow-2xl border border-white/5 overflow-hidden max-h-[60vh] overflow-y-auto animate-scale-in z-50">
            {suggestions.map((song) => (
              <button
                key={song.id}
                onClick={() => {
                  navigate(`/search?q=${encodeURIComponent(song.title)}`);
                  setShowSuggestions(false);
                  setSearchQuery(song.title);
                }}
                className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-white/5 transition-colors"
              >
                <img src={song.image} alt="" className="w-9 h-9 sm:w-10 sm:h-10 rounded object-cover flex-shrink-0" />
                <div className="text-left min-w-0 flex-1">
                  <p className="text-sm text-white truncate">{song.title}</p>
                  <p className="text-xs text-[#AAAAAA] truncate">{song.artist}</p>
                </div>
              </button>
            ))}
            {loadingSuggestions && (
              <div className="flex justify-center py-2">
                <Loader2 size={14} className="text-[#AAAAAA] animate-spin" />
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
