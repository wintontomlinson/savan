import{useState,useEffect}from'react';
import{useParams}from'react-router-dom';
import{Play,Shuffle,Loader2}from'lucide-react';
import{getArtistById,searchSongs}from'../data/api';
import{usePlayer}from'../context/PlayerContext';
import SongRow from'../components/SongRow';
import AlbumCard from'../components/AlbumCard';
import HorizontalScroll from'../components/HorizontalScroll';

export default function ArtistPage(){
  const{id}=useParams();
  const{playSong}=usePlayer();
  const[artist,setArtist]=useState(null);
  const[loading,setLoading]=useState(true);

  useEffect(()=>{
    async function load(){
      setLoading(true);
      let data=await getArtistById(id);
      if(data&&!data.topSongs?.length){const s=await searchSongs(data.name,10);data.topSongs=s;}
      setArtist(data);setLoading(false);
    }
    load();
  },[id]);

  if(loading)return<div className="flex justify-center py-20"><Loader2 size={24} className="text-[#FF0000] animate-spin"/></div>;
  if(!artist)return<p className="text-center text-[#717171] py-20">Artist not found</p>;

  return(
    <div className="pb-8 animate-[fadeIn_0.3s_ease-out]">
      <section className="relative h-[280px] -mx-4 sm:-mx-6 -mt-4 mb-6">
        <img src={artist.image} alt="" className="absolute inset-0 w-full h-full object-cover"/>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-[#0F0F0F]/60 to-transparent"/>
        <div className="absolute bottom-6 left-6"><h1 className="text-3xl sm:text-4xl font-bold text-white mb-1">{artist.name}</h1>{artist.followerCount>0&&<p className="text-sm text-[#AAAAAA]">{Number(artist.followerCount).toLocaleString()} followers</p>}</div>
      </section>
      <div className="flex gap-3 mb-6">
        <button onClick={()=>artist.topSongs?.length&&playSong(artist.topSongs[0],artist.topSongs)} className="flex items-center gap-2 px-5 py-2.5 bg-[#FF0000] hover:bg-[#CC0000] text-white rounded-full text-sm font-medium"><Play size={16} fill="white"/>Play</button>
        <button onClick={()=>{const s=[...(artist.topSongs||[])].sort(()=>Math.random()-0.5);if(s.length)playSong(s[0],s);}} className="flex items-center gap-2 px-5 py-2.5 bg-[#272727] hover:bg-[#383838] text-white rounded-full text-sm font-medium"><Shuffle size={16}/>Shuffle</button>
      </div>
      {artist.topSongs?.length>0&&<section className="mb-8"><h2 className="text-lg font-semibold text-white mb-3">Popular</h2><div className="bg-[#1A1A1A] rounded-xl overflow-hidden">{artist.topSongs.map((s,i)=><SongRow key={s.id} song={s} index={i} songList={artist.topSongs}/>)}</div></section>}
      {artist.topAlbums?.length>0&&<HorizontalScroll title="Albums">{artist.topAlbums.map(a=><AlbumCard key={a.id} album={a}/>)}</HorizontalScroll>}
      {artist.bio&&<section><h2 className="text-lg font-semibold text-white mb-3">About</h2><p className="text-sm text-[#AAAAAA] bg-[#1A1A1A] rounded-xl p-5">{artist.bio}</p></section>}
    </div>
  );
}
