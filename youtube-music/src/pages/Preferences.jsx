import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Music2 } from 'lucide-react';

const ARTISTS = [
  { id: 'arijit', name: 'Arijit Singh', image: 'https://c.saavncdn.com/artists/Arijit_Singh_004_20241118063717_150x150.jpg', query: 'Arijit Singh' },
  { id: 'shreya', name: 'Shreya Ghoshal', image: 'https://c.saavncdn.com/artists/Shreya_Ghoshal_006_20200826074542_150x150.jpg', query: 'Shreya Ghoshal' },
  { id: 'pritam', name: 'Pritam', image: 'https://c.saavncdn.com/artists/Pritam_Chakraborty-20170711073326_150x150.jpg', query: 'Pritam' },
  { id: 'jubin', name: 'Jubin Nautiyal', image: 'https://c.saavncdn.com/artists/Jubin_Nautiyal_003_20200507042539_150x150.jpg', query: 'Jubin Nautiyal' },
  { id: 'bpraak', name: 'B Praak', image: 'https://c.saavncdn.com/artists/B_Praak_003_20191118112005_150x150.jpg', query: 'B Praak' },
  { id: 'ap', name: 'AP Dhillon', image: 'https://c.saavncdn.com/artists/Ap_Dhillon_20200301062147_150x150.jpg', query: 'AP Dhillon' },
  { id: 'diljit', name: 'Diljit Dosanjh', image: 'https://c.saavncdn.com/artists/Diljit_Dosanjh_005_20231025080853_150x150.jpg', query: 'Diljit Dosanjh' },
  { id: 'sidhu', name: 'Sidhu Moosewala', image: 'https://c.saavncdn.com/artists/Sidhu_Moose_Wala_20190627113332_150x150.jpg', query: 'Sidhu Moosewala' },
  { id: 'karan', name: 'Karan Aujla', image: 'https://c.saavncdn.com/artists/Karan_Aujla_20190911053827_150x150.jpg', query: 'Karan Aujla' },
  { id: 'weeknd', name: 'The Weeknd', image: 'https://c.saavncdn.com/artists/The_Weeknd_20201029161643_150x150.jpg', query: 'The Weeknd' },
  { id: 'taylor', name: 'Taylor Swift', image: 'https://c.saavncdn.com/artists/Taylor_Swift_20200226074119_150x150.jpg', query: 'Taylor Swift' },
  { id: 'dua', name: 'Dua Lipa', image: 'https://c.saavncdn.com/artists/Dua_Lipa_20190626073840_150x150.jpg', query: 'Dua Lipa' },
  { id: 'drake', name: 'Drake', image: 'https://c.saavncdn.com/artists/Drake_20190228060332_150x150.jpg', query: 'Drake' },
  { id: 'billie', name: 'Billie Eilish', image: 'https://c.saavncdn.com/artists/Billie_Eilish_20200228054023_150x150.jpg', query: 'Billie Eilish' },
  { id: 'ed', name: 'Ed Sheeran', image: 'https://c.saavncdn.com/artists/Ed_Sheeran_20200211050537_150x150.jpg', query: 'Ed Sheeran' },
  { id: 'bts', name: 'BTS', image: 'https://c.saavncdn.com/artists/BTS_20190507042630_150x150.jpg', query: 'BTS' },
  { id: 'badshah', name: 'Badshah', image: 'https://c.saavncdn.com/artists/Badshah_005_20230608084021_150x150.jpg', query: 'Badshah' },
  { id: 'neha', name: 'Neha Kakkar', image: 'https://c.saavncdn.com/artists/Neha_Kakkar_006_20200822042626_150x150.jpg', query: 'Neha Kakkar' },
  { id: 'atif', name: 'Atif Aslam', image: 'https://c.saavncdn.com/artists/Atif_Aslam_003_20200512080015_150x150.jpg', query: 'Atif Aslam' },
  { id: 'lata', name: 'Lata Mangeshkar', image: 'https://c.saavncdn.com/artists/Lata_Mangeshkar_004_20230623062354_150x150.jpg', query: 'Lata Mangeshkar' },
];

const GENRES = [
  { id: 'bollywood', name: 'Bollywood', color: 'from-orange-500 to-red-600' },
  { id: 'punjabi', name: 'Punjabi', color: 'from-yellow-500 to-orange-500' },
  { id: 'pop', name: 'Pop', color: 'from-pink-500 to-purple-500' },
  { id: 'hiphop', name: 'Hip-Hop', color: 'from-gray-700 to-gray-900' },
  { id: 'lofi', name: 'Lo-Fi', color: 'from-indigo-500 to-purple-700' },
  { id: 'romantic', name: 'Romantic', color: 'from-red-500 to-pink-500' },
  { id: 'party', name: 'Party', color: 'from-cyan-500 to-blue-600' },
  { id: 'devotional', name: 'Devotional', color: 'from-amber-500 to-yellow-600' },
  { id: 'retro', name: 'Retro', color: 'from-emerald-500 to-teal-700' },
  { id: 'kpop', name: 'K-Pop', color: 'from-violet-500 to-pink-500' },
  { id: 'workout', name: 'Workout', color: 'from-red-600 to-orange-500' },
  { id: 'sad', name: 'Sad Songs', color: 'from-blue-800 to-indigo-900' },
];

export default function Preferences() {
  const navigate = useNavigate();
  const [selectedArtists, setSelectedArtists] = useState(() => {
    try { return JSON.parse(localStorage.getItem('yt_pref_artists')) || []; } catch { return []; }
  });
  const [selectedGenres, setSelectedGenres] = useState(() => {
    try { return JSON.parse(localStorage.getItem('yt_pref_genres')) || []; } catch { return []; }
  });
  const [step, setStep] = useState(1); // 1 = artists, 2 = genres

  const toggleArtist = (id) => {
    setSelectedArtists(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const toggleGenre = (id) => {
    setSelectedGenres(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);
  };

  const save = () => {
    localStorage.setItem('yt_pref_artists', JSON.stringify(selectedArtists));
    localStorage.setItem('yt_pref_genres', JSON.stringify(selectedGenres));
    navigate('/');
  };

  return (
    <div className="pb-8 animate-fade-in-up">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-[#FC3C44] to-[#FF2D55] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Music2 size={24} className="text-white" />
        </div>
        <h1 className="text-[24px] sm:text-[28px] font-bold text-white">
          {step === 1 ? 'Choose Artists You Like' : 'Pick Your Genres'}
        </h1>
        <p className="text-[14px] text-[#98989F] mt-1">
          {step === 1 ? 'Select at least 3 to get personalized music' : 'We\'ll recommend music based on your taste'}
        </p>
      </div>

      {/* Step 1: Artists */}
      {step === 1 && (
        <>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4 mb-8">
            {ARTISTS.map((artist) => {
              const selected = selectedArtists.includes(artist.id);
              return (
                <button
                  key={artist.id}
                  onClick={() => toggleArtist(artist.id)}
                  className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${selected ? 'bg-[#FC3C44]/20 ring-2 ring-[#FC3C44]' : 'bg-[#1C1C1E] hover:bg-[#2C2C2E]'}`}
                >
                  <div className="relative">
                    <img src={artist.image} alt={artist.name} className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover" />
                    {selected && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#FC3C44] rounded-full flex items-center justify-center">
                        <Check size={14} className="text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] sm:text-[12px] font-medium text-white text-center leading-tight">{artist.name}</p>
                </button>
              );
            })}
          </div>

          <div className="sticky bottom-4 flex justify-center">
            <button
              onClick={() => setStep(2)}
              disabled={selectedArtists.length < 3}
              className={`px-8 py-3 rounded-full font-semibold text-[15px] transition-all ${selectedArtists.length >= 3 ? 'bg-[#FC3C44] text-white active:scale-95' : 'bg-[#2C2C2E] text-[#636366]'}`}
            >
              Next ({selectedArtists.length} selected)
            </button>
          </div>
        </>
      )}

      {/* Step 2: Genres */}
      {step === 2 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8">
            {GENRES.map((genre) => {
              const selected = selectedGenres.includes(genre.id);
              return (
                <button
                  key={genre.id}
                  onClick={() => toggleGenre(genre.id)}
                  className={`relative p-5 sm:p-6 rounded-2xl bg-gradient-to-br ${genre.color} transition-all ${selected ? 'ring-2 ring-white scale-[1.02]' : 'opacity-80 hover:opacity-100'}`}
                >
                  <p className="text-[14px] sm:text-[16px] font-bold text-white">{genre.name}</p>
                  {selected && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <Check size={14} className="text-black" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="sticky bottom-4 flex justify-center gap-3">
            <button onClick={() => setStep(1)} className="px-6 py-3 rounded-full font-medium text-[14px] bg-[#2C2C2E] text-white">
              Back
            </button>
            <button
              onClick={save}
              disabled={selectedGenres.length < 2}
              className={`px-8 py-3 rounded-full font-semibold text-[15px] transition-all ${selectedGenres.length >= 2 ? 'bg-[#FC3C44] text-white active:scale-95' : 'bg-[#2C2C2E] text-[#636366]'}`}
            >
              Done ({selectedGenres.length} selected)
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export { ARTISTS, GENRES };
