import { useState } from 'react';
import { Loader2, Play } from 'lucide-react';
import { searchSongs } from '../data/api';
import { usePlayer } from '../context/PlayerContext';
import SongRow from '../components/SongRow';

const ARTISTS = [
  { name: 'Karan Aujla', img: 'https://c.saavncdn.com/artists/Karan_Aujla_20190911053827_500x500.jpg', lang: 'Punjabi' },
  { name: 'AP Dhillon', img: 'https://c.saavncdn.com/artists/Ap_Dhillon_20200301062147_500x500.jpg', lang: 'Punjabi' },
  { name: 'Sidhu Moosewala', img: 'https://c.saavncdn.com/artists/Sidhu_Moose_Wala_20190627113332_500x500.jpg', lang: 'Punjabi' },
  { name: 'Shubh', img: 'https://c.saavncdn.com/artists/Shubh_20230418091451_500x500.jpg', lang: 'Punjabi' },
  { name: 'Diljit Dosanjh', img: 'https://c.saavncdn.com/artists/Diljit_Dosanjh_005_20231025080853_500x500.jpg', lang: 'Punjabi' },
  { name: 'Arijit Singh', img: 'https://c.saavncdn.com/artists/Arijit_Singh_004_20241118063717_500x500.jpg', lang: 'Bollywood' },
  { name: 'Jubin Nautiyal', img: 'https://c.saavncdn.com/artists/Jubin_Nautiyal_003_20200507042539_500x500.jpg', lang: 'Bollywood' },
  { name: 'Shreya Ghoshal', img: 'https://c.saavncdn.com/artists/Shreya_Ghoshal_006_20200826074542_500x500.jpg', lang: 'Bollywood' },
  { name: 'B Praak', img: 'https://c.saavncdn.com/artists/B_Praak_003_20191118112005_500x500.jpg', lang: 'Bollywood' },
  { name: 'Pritam', img: 'https://c.saavncdn.com/artists/Pritam_Chakraborty-20170711073326_500x500.jpg', lang: 'Bollywood' },
  { name: 'Vishal Mishra', img: 'https://c.saavncdn.com/artists/Vishal_Mishra_004_20230804115745_500x500.jpg', lang: 'Bollywood' },
  { name: 'The Weeknd', img: 'https://c.saavncdn.com/artists/The_Weeknd_20201029161643_500x500.jpg', lang: 'English' },
  { name: 'Dua Lipa', img: 'https://c.saavncdn.com/artists/Dua_Lipa_20190626073840_500x500.jpg', lang: 'English' },
  { name: 'Drake', img: 'https://c.saavncdn.com/artists/Drake_20190228060332_500x500.jpg', lang: 'English' },
  { name: 'Taylor Swift', img: 'https://c.saavncdn.com/artists/Taylor_Swift_20200226074119_500x500.jpg', lang: 'English' },
  { name: 'Ed Sheeran', img: 'https://c.saavncdn.com/artists/Ed_Sheeran_20200211050537_500x500.jpg', lang: 'English' },
  { name: 'Badshah', img: 'https://c.saavncdn.com/artists/Badshah_005_20230608084021_500x500.jpg', lang: 'Hip-Hop' },
  { name: 'King', img: 'https://c.saavncdn.com/artists/King_20200924113451_500x500.jpg', lang: 'Hip-Hop' },
  { name: 'Honey Singh', img: 'https://c.saavncdn.com/artists/Yo_Yo_Honey_Singh_20201222072751_500x500.jpg', lang: 'Hip-Hop' },
  { name: 'Raftaar', img: 'https://c.saavncdn.com/artists/Raftaar_20170703092226_500x500.jpg', lang: 'Hip-Hop' },
];

const CATEGORIES = ['All', 'Punjabi', 'Bollywood', 'English', 'Hip-Hop'];

export default function Explore() {
  const [category, setCategory] = useState('All');
  const [activeArtist, setActiveArtist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const { playSong } = usePlayer();

  const filtered = category === 'All' ? ARTISTS : ARTISTS.filter(a => a.lang === category);

  const loadArtist = async (artist) => {
    setActiveArtist(artist.name);
    setLoading(true);
    const s = await searchSongs(artist.name, 15);
    setSongs(s);
    setLoading(false);
  };

  return (
    <div className="pb-6 pt-2">
      <h1 className="text-xl sm:text-2xl font-bold text-white mb-4">Explore</h1>

      {/* Category tabs */}
      <div className="flex gap-2 mb-5 scroll-x pb-1">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => { setCategory(c); setActiveArtist(null); setSongs([]); }}
            className={`px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-all shrink-0 ${category === c ? 'bg-white text-black' : 'bg-[#1a1a1a] text-[#999] active:bg-[#222]'}`}
          >{c}</button>
        ))}
      </div>

      {/* Artist grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5 sm:gap-3 mb-6">
        {filtered.map(a => (
          <button key={a.name} onClick={() => loadArtist(a)}
            className={`flex flex-col items-center gap-1.5 p-2 sm:p-3 rounded-2xl transition-all active:scale-95 ${activeArtist === a.name ? 'bg-[#FF0000]/15 ring-1 ring-[#FF0000]/50' : 'active:bg-[#1a1a1a]'}`}
          >
            <img
              src={a.img}
              alt={a.name}
              className="w-14 h-14 sm:w-[72px] sm:h-[72px] md:w-20 md:h-20 rounded-full object-cover shadow-lg"
              onError={e => { e.target.src = `https://picsum.photos/seed/${a.name.replace(/\s/g,'')}/200/200`; }}
            />
            <p className="text-[10px] sm:text-[11px] font-medium text-white text-center leading-tight line-clamp-2">{a.name}</p>
          </button>
        ))}
      </div>

      {/* Songs */}
      {loading && <div className="flex justify-center py-10"><Loader2 size={22} className="text-[#FF0000] animate-spin" /></div>}

      {!loading && activeArtist && songs.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base sm:text-lg font-bold text-white">{activeArtist}</h2>
            <button onClick={() => playSong(songs[0], songs)} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF0000] rounded-full text-[11px] text-white font-medium active:scale-95">
              <Play size={12} fill="white" />Play All
            </button>
          </div>
          <div className="bg-[#111] rounded-2xl overflow-hidden border border-[#1a1a1a]">
            {songs.map((s, i) => <SongRow key={s.id} song={s} index={i} songList={songs} />)}
          </div>
        </section>
      )}
    </div>
  );
}
