import{useState}from'react';
import{songs,artists,albums,genres,genreColors}from'../data/mockData';
import{usePlayer}from'../context/PlayerContext';
import SongRow from'../components/SongRow';
import AlbumCard from'../components/AlbumCard';
import ArtistCard from'../components/ArtistCard';
import HorizontalScroll from'../components/HorizontalScroll';

const tabs=['All','Songs','Albums','Artists'];

export default function Explore(){
  const[tab,setTab]=useState('All');
  const{playSong}=usePlayer();
  const topSongs=[...songs].sort((a,b)=>b.plays-a.plays).slice(0,20);

  return(
    <div className="pb-8 animate-[fadeIn_0.3s_ease-out]">
      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1" style={{scrollbarWidth:'none'}}>
        {tabs.map(t=><button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${tab===t?'bg-white text-black':'bg-[#272727] text-[#AAAAAA] hover:text-white'}`}>{t}</button>)}
      </div>

      {/* Charts */}
      {(tab==='All'||tab==='Songs')&&(
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">Top Songs</h2>
          <div className="bg-[#1A1A1A] rounded-xl overflow-hidden">
            {topSongs.map((s,i)=><SongRow key={s.id} song={s} index={i} songList={topSongs}/>)}
          </div>
        </section>
      )}

      {/* Genres */}
      {(tab==='All')&&(
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">Browse Genres</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {genres.map(g=><button key={g} className={`p-5 rounded-xl bg-gradient-to-br ${genreColors[g]||'from-gray-600 to-gray-800'} text-left hover:opacity-80 transition-opacity`}><span className="text-base font-bold text-white">{g}</span></button>)}
          </div>
        </section>
      )}

      {/* Albums */}
      {(tab==='All'||tab==='Albums')&&<HorizontalScroll title="New Albums">{albums.map(a=><AlbumCard key={a.id} album={a}/>)}</HorizontalScroll>}

      {/* Artists */}
      {(tab==='All'||tab==='Artists')&&<HorizontalScroll title="Featured Artists">{artists.map(a=><ArtistCard key={a.id} artist={a}/>)}</HorizontalScroll>}
    </div>
  );
}
