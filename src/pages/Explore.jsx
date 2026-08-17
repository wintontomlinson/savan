import { useState } from 'react';
import { Loader2, User2 } from 'lucide-react';
import { searchSongs } from '../data/api';
import { usePlayer } from '../context/PlayerContext';
import SongCard from '../components/SongCard';
import SongRow from '../components/SongRow';
import HorizontalScroll from '../components/HorizontalScroll';

const ARTISTS = [
  // Punjabi
  { name: 'Karan Aujla', img: 'https://c.saavncdn.com/artists/Karan_Aujla_20190911053827_150x150.jpg', lang: 'Punjabi' },
  { name: 'AP Dhillon', img: 'https://c.saavncdn.com/artists/Ap_Dhillon_20200301062147_150x150.jpg', lang: 'Punjabi' },
  { name: 'Sidhu Moosewala', img: 'https://c.saavncdn.com/artists/Sidhu_Moose_Wala_20190627113332_150x150.jpg', lang: 'Punjabi' },
  { name: 'Shubh', img: 'https://c.saavncdn.com/artists/Shubh_20230418091451_150x150.jpg', lang: 'Punjabi' },
  { name: 'Diljit Dosanjh', img: 'https://c.saavncdn.com/artists/Diljit_Dosanjh_005_20231025080853_150x150.jpg', lang: 'Punjabi' },
  // Bollywood
  { name: 'Arijit Singh', img: 'https://c.saavncdn.com/artists/Arijit_Singh_004_20241118063717_150x150.jpg', lang: 'Bollywood' },
  { name: 'Jubin Nautiyal', img: 'https://c.saavncdn.com/artists/Jubin_Nautiyal_003_20200507042539_150x150.jpg', lang: 'Bollywood' },
  { name: 'Shreya Ghoshal', img: 'https://c.saavncdn.com/artists/Shreya_Ghoshal_006_20200826074542_150x150.jpg', lang: 'Bollywood' },
  { name: 'B Praak', img: 'https://c.saavncdn.com/artists/B_Praak_003_20191118112005_150x150.jpg', lang: 'Bollywood' },
  { name: 'Pritam', img: 'https://c.saavncdn.com/artists/Pritam_Chakraborty-20170711073326_150x150.jpg', lang: 'Bollywood' },
  // English
  { name: 'The Weeknd', img: 'https://c.saavncdn.com/artists/The_Weeknd_20201029161643_150x150.jpg', lang: 'English' },
  { name: 'Dua Lipa', img: 'https://c.saavncdn.com/artists/Dua_Lipa_20190626073840_150x150.jpg', lang: 'English' },
  { name: 'Drake', img: 'https://c.saavncdn.com/artists/Drake_20190228060332_150x150.jpg', lang: 'English' },
  { name: 'Taylor Swift', img: 'https://c.saavncdn.com/artists/Taylor_Swift_20200226074119_150x150.jpg', lang: 'English' },
  { name: 'Ed Sheeran', img: 'https://c.saavncdn.com/artists/Ed_Sheeran_20200211050537_150x150.jpg', lang: 'English' },
  // More
  { name: 'Badshah', img: 'https://c.saavncdn.com/artists/Badshah_005_20230608084021_150x150.jpg', lang: 'Hip-Hop' },
  { name: 'Honey Singh', img: 'https://c.saavncdn.com/artists/Yo_Yo_Honey_Singh_20201222072751_150x150.jpg', lang: 'Hip-Hop' },
  { name: 'King', img: 'https://c.saavncdn.com/artists/King_20200924113451_150x150.jpg', lang: 'Hip-Hop' },
];

const CATEGORIES = ['All', 'Punjabi', 'Bollywood', 'English', 'Hip-Hop'];

export default function Explore() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeArtist, setActiveArtist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const { playSong } = usePlayer();

  const filteredArtists = activeCategory === 'All' ? ARTISTS : ARTISTS.filter(a => a.lang === activeCategory);

  const loadArtist = async (artist) => {
    setActiveArtist(artist.name);
    setLoading(true);
    const s = await searchSongs(artist.name, 15);
    setSongs(s);
    setLoading(false);
  };

  return (
    <div className="pb-6">
      <h1 className="text-2xl font-bold text-white mb-5">Explore Artists</h1>

      {/* Category Filter */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => { setActiveCategory(c); setActiveArtist(null); setSongs([]); }}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeCategory === c ? 'bg-white text-black' : 'bg-[#272727] text-[#AAAAAA] hover:text-white'}`}
          >{c}</button>
        ))}
      </div>

      {/* Artist Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 mb-6">
        {filteredArtists.map(a => (
          <button key={a.name} onClick={() => loadArtist(a)}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all active:scale-95 ${activeArtist === a.name ? 'bg-[#FF0000]/20 ring-1 ring-[#FF0000]' : 'hover:bg-[#1A1A1A]'}`}
          >
            <img src={a.img} alt={a.name} className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover" />
            <p className="text-[11px] sm:text-xs font-medium text-white text-center leading-tight">{a.name}</p>
          </button>
        ))}
      </div>

      {/* Artist Songs */}
      {loading && <div className="flex justify-center py-10"><Loader2 size={22} className="text-[#FF0000] animate-spin" /></div>}

      {!loading && activeArtist && songs.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">{activeArtist}</h2>
            <button onClick={() => { if (songs.length) playSong(songs[0], songs); }}
              className="text-xs text-[#FF0000] font-medium hover:underline">Play All</button>
          </div>
          <div className="bg-[#1A1A1A] rounded-xl overflow-hidden">
            {songs.map((s, i) => <SongRow key={s.id} song={s} index={i} songList={songs} />)}
          </div>
        </section>
      )}
    </div>
  );
}
