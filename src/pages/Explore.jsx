import { useState, useRef, useEffect } from 'react';
import { Loader2, Play, X, Shuffle } from 'lucide-react';
import { searchSongs } from '../data/api';
import { usePlayer } from '../context/PlayerContext';
import SongRow from '../components/SongRow';

const ARTISTS = [
  { name: 'AP Dhillon', img: 'https://c.saavncdn.com/artists/AP_Dhillon_004_20251023102150_500x500.jpg', cat: 'Punjabi' },
  { name: 'Diljit Dosanjh', img: 'https://c.saavncdn.com/artists/Diljit_Dosanjh_005_20231025073054_500x500.jpg', cat: 'Punjabi' },
  { name: 'Sidhu Moosewala', img: 'https://c.saavncdn.com/artists/Sidhu_Moose_Wala_004_20250617183705_500x500.jpg', cat: 'Punjabi' },
  { name: 'Karan Aujla', img: 'https://c.saavncdn.com/artists/Karan_Aujla_004_20260810121947_500x500.jpg', cat: 'Punjabi' },
  { name: 'Shubh', img: 'https://c.saavncdn.com/artists/Shubh_000_20220921112507_500x500.jpg', cat: 'Punjabi' },
  { name: 'Guru Randhawa', img: 'https://c.saavncdn.com/artists/Guru_Randhawa_004_20250701125845_500x500.jpg', cat: 'Punjabi' },
  { name: 'Harrdy Sandhu', img: 'https://c.saavncdn.com/artists/Hardy_Sandhu_001_20190913112018_500x500.jpg', cat: 'Punjabi' },
  { name: 'B Praak', img: 'https://c.saavncdn.com/artists/B_Praak_001_20191118112005_500x500.jpg', cat: 'Punjabi' },
  { name: 'Ammy Virk', img: 'https://c.saavncdn.com/artists/Ammy_Virk_005_20241101070506_500x500.jpg', cat: 'Punjabi' },
  { name: 'Bohemia', img: 'https://c.saavncdn.com/artists/Bohemia_500x500.jpg', cat: 'Punjabi' },
  { name: 'Garry Sandhu', img: 'https://c.saavncdn.com/artists/Garry_Sandhu_500x500.jpg', cat: 'Punjabi' },
  { name: 'Jasmine Sandlas', img: 'https://c.saavncdn.com/artists/Jasmine_Sandlas_002_20240314115630_500x500.jpg', cat: 'Punjabi' },
  { name: 'Mankirt Aulakh', img: 'https://c.saavncdn.com/artists/Mankirt_Aulakh_500x500.jpg', cat: 'Punjabi' },
  { name: 'Arijit Singh', img: 'https://c.saavncdn.com/artists/Arijit_Singh_004_20241118063717_500x500.jpg', cat: 'Bollywood' },
  { name: 'Shreya Ghoshal', img: 'https://c.saavncdn.com/artists/Shreya_Ghoshal_007_20241101074144_500x500.jpg', cat: 'Bollywood' },
  { name: 'Jubin Nautiyal', img: 'https://c.saavncdn.com/artists/Jubin_Nautiyal_003_20231130204020_500x500.jpg', cat: 'Bollywood' },
  { name: 'Vishal Mishra', img: 'https://c.saavncdn.com/artists/Vishal_Mishra_005_20251120085316_500x500.jpg', cat: 'Bollywood' },
  { name: 'Neha Kakkar', img: 'https://c.saavncdn.com/artists/Neha_Kakkar_007_20241212115832_500x500.jpg', cat: 'Bollywood' },
  { name: 'Atif Aslam', img: 'https://c.saavncdn.com/artists/Atif_Aslam_500x500.jpg', cat: 'Bollywood' },
  { name: 'Darshan Raval', img: 'https://c.saavncdn.com/artists/Darshan_Raval_006_20250807060352_500x500.jpg', cat: 'Bollywood' },
  { name: 'A.R. Rahman', img: 'https://c.saavncdn.com/artists/AR_Rahman_002_20210120084455_500x500.jpg', cat: 'Bollywood' },
  { name: 'Pritam', img: 'https://c.saavncdn.com/artists/Pritam_Chakraborty-20170711073326_500x500.jpg', cat: 'Bollywood' },
  { name: 'Armaan Malik', img: 'https://c.saavncdn.com/artists/Armaan_Malik_006_20260813132832_500x500.jpg', cat: 'Bollywood' },
  { name: 'Sonu Nigam', img: 'https://c.saavncdn.com/artists/Sonu_Nigam_500x500.jpg', cat: 'Bollywood' },
  { name: 'Sunidhi Chauhan', img: 'https://c.saavncdn.com/artists/Sunidhi_Chauhan_500x500.jpg', cat: 'Bollywood' },
  { name: 'The Weeknd', img: 'https://c.saavncdn.com/artists/The_Weeknd_002_20241003071400_500x500.jpg', cat: 'English' },
  { name: 'Drake', img: 'https://c.saavncdn.com/artists/Drake_006_20260520062317_500x500.jpg', cat: 'English' },
  { name: 'Taylor Swift', img: 'https://c.saavncdn.com/artists/Taylor_Swift_003_20200226074119_500x500.jpg', cat: 'English' },
  { name: 'Ed Sheeran', img: 'https://c.saavncdn.com/artists/Ed_Sheeran_002_20250625073038_500x500.jpg', cat: 'English' },
  { name: 'Dua Lipa', img: 'https://c.saavncdn.com/artists/Dua_Lipa_004_20231120090922_500x500.jpg', cat: 'English' },
  { name: 'Justin Bieber', img: 'https://c.saavncdn.com/artists/Justin_Bieber_005_20201127112218_500x500.jpg', cat: 'English' },
  { name: 'Eminem', img: 'https://c.saavncdn.com/artists/Eminem_003_20240403152835_500x500.jpg', cat: 'English' },
  { name: 'Billie Eilish', img: 'https://c.saavncdn.com/artists/Billie_Eilish_20190211151539_500x500.jpg', cat: 'English' },
  { name: 'Bruno Mars', img: 'https://c.saavncdn.com/artists/Bruno_Mars_500x500.jpg', cat: 'English' },
  { name: 'Selena Gomez', img: 'https://c.saavncdn.com/artists/Selena_Gomez_003_20231023065157_500x500.jpg', cat: 'English' },
  { name: 'Charlie Puth', img: 'https://c.saavncdn.com/artists/Charlie_Puth_003_20231023065325_500x500.jpg', cat: 'English' },
  { name: 'Post Malone', img: 'https://c.saavncdn.com/artists/Post_Malone_004_20190911070147_500x500.jpg', cat: 'English' },
  { name: 'Imagine Dragons', img: 'https://c.saavncdn.com/artists/Imagine_Dragons_500x500.jpg', cat: 'English' },
  { name: 'Marshmello', img: 'https://c.saavncdn.com/artists/Marshmello_500x500.jpg', cat: 'English' },
  { name: 'Badshah', img: 'https://c.saavncdn.com/artists/Badshah_006_20241118064015_500x500.jpg', cat: 'Hip-Hop' },
  { name: 'Honey Singh', img: 'https://c.saavncdn.com/artists/Yo_Yo_Honey_Singh_004_20260811095253_500x500.jpg', cat: 'Hip-Hop' },
  { name: 'Divine', img: 'https://c.saavncdn.com/artists/DIVINE_006_20250911071442_500x500.jpg', cat: 'Hip-Hop' },
  { name: 'Raftaar', img: 'https://c.saavncdn.com/artists/Raftaar_009_20230223100912_500x500.jpg', cat: 'Hip-Hop' },
  { name: 'Kishore Kumar', img: 'https://c.saavncdn.com/artists/Kishore_Kumar_500x500.jpg', cat: 'Legends' },
  { name: 'Lata Mangeshkar', img: 'https://c.saavncdn.com/artists/Lata_Mangeshkar_004_20230623105323_500x500.jpg', cat: 'Legends' },
  { name: 'Mohammed Rafi', img: 'https://c.saavncdn.com/artists/Mohammed_Rafi_500x500.jpg', cat: 'Legends' },
  { name: 'Mukesh', img: 'https://c.saavncdn.com/artists/Mukesh_500x500.jpg', cat: 'Legends' },
];

const CATEGORIES = ['All', 'Punjabi', 'Bollywood', 'English', 'Hip-Hop', 'Legends'];

export default function Explore() {
  const [category, setCategory] = useState('All');
  const [activeArtist, setActiveArtist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const { playSong } = usePlayer();
  const songsRef = useRef(null);

  const filtered = category === 'All' ? ARTISTS : ARTISTS.filter(a => a.cat === category);

  const loadArtist = async (artist) => {
    if (activeArtist === artist.name) { setActiveArtist(null); setSongs([]); return; }
    setActiveArtist(artist.name);
    setLoading(true);
    const s = await searchSongs(artist.name, 20) || [];
    setSongs(s);
    setLoading(false);
  };

  useEffect(() => {
    if (songs.length > 0 && songsRef.current) {
      songsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [songs]);

  const shufflePlay = (list) => {
    const shuffled = [...list].sort(() => Math.random() - 0.5);
    playSong(shuffled[0], shuffled);
  };

  return (
    <div className="pb-6 pt-1">
      {/* Category chips */}
      <div className="flex gap-2 mb-5 scroll-x pb-1">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => { setCategory(c); setActiveArtist(null); setSongs([]); }}
            className={`px-4 py-2.5 rounded-full text-[13px] font-semibold whitespace-nowrap shrink-0 transition-all duration-200 ${
              category === c ? 'bg-white text-black shadow-lg shadow-white/10' : 'bg-[#161616] text-[#bbb] hover:bg-[#1e1e1e]'
            }`}>{c}</button>
        ))}
      </div>

      {/* Artist cards - horizontal per row, bigger, cleaner */}
      <div className="space-y-2">
        {filtered.map(a => (
          <button key={a.name} onClick={() => loadArtist(a)}
            className={`flex items-center gap-4 w-full p-3 rounded-2xl transition-all duration-200 text-left ${
              activeArtist === a.name ? 'bg-white/[0.07]' : 'hover:bg-white/[0.03] active:bg-white/[0.05]'
            }`}>
            <img src={a.img} alt={a.name} className={`w-14 h-14 rounded-full object-cover shrink-0 transition-all duration-200 ${
              activeArtist === a.name ? 'ring-[3px] ring-white shadow-lg shadow-white/20' : 'ring-1 ring-white/[0.08]'
            }`} loading="lazy" />
            <div className="flex-1 min-w-0">
              <p className={`text-[15px] font-semibold truncate transition-colors ${activeArtist === a.name ? 'text-white' : 'text-[#eee]'}`}>{a.name}</p>
              <p className="text-[11px] text-[#666] mt-0.5">{a.cat}</p>
            </div>
            {activeArtist === a.name ? (
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0">
                <Play size={14} className="text-black ml-0.5" fill="black" />
              </div>
            ) : (
              <Play size={16} className="text-[#555] shrink-0" />
            )}
          </button>
        ))}
      </div>

      {/* Songs Panel */}
      <div ref={songsRef}>
        {loading && <div className="flex justify-center py-12 mt-4"><Loader2 size={20} className="text-white animate-spin" /></div>}

        {!loading && activeArtist && songs.length > 0 && (
          <div className="mt-5 animate-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex items-center gap-3 min-w-0">
                <img src={ARTISTS.find(a => a.name === activeArtist)?.img} alt="" className="w-11 h-11 rounded-full object-cover ring-2 ring-white/10 shrink-0" />
                <div className="min-w-0">
                  <h2 className="text-[16px] font-bold text-white truncate">{activeArtist}</h2>
                  <p className="text-[11px] text-[#777]">{songs.length} songs</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => shufflePlay(songs)} className="w-9 h-9 rounded-full bg-white/[0.08] flex items-center justify-center btn-press">
                  <Shuffle size={14} className="text-white" />
                </button>
                <button onClick={() => playSong(songs[0], songs)} className="flex items-center gap-1.5 px-4 py-2.5 bg-white rounded-full text-[12px] text-black font-bold btn-press shadow-md">
                  <Play size={12} fill="black" /> Play
                </button>
                <button onClick={() => { setActiveArtist(null); setSongs([]); }} className="w-9 h-9 rounded-full bg-white/[0.08] flex items-center justify-center btn-press">
                  <X size={14} className="text-[#aaa]" />
                </button>
              </div>
            </div>

            {/* Song list */}
            <div className="bg-[#0c0c0c] rounded-2xl overflow-hidden border border-white/[0.04]">
              {songs.map((s, i) => <SongRow key={s.id} song={s} index={i} songList={songs} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
