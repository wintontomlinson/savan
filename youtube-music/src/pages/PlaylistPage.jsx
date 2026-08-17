import{useState,useEffect}from'react';
import{useParams}from'react-router-dom';
import{Play,Loader2}from'lucide-react';
import{getPlaylistById}from'../data/api';
import{formatDuration}from'../data/mockData';
import{usePlayer}from'../context/PlayerContext';
import SongRow from'../components/SongRow';

export default function PlaylistPage(){
  const{id}=useParams();
  const{playSong}=usePlayer();
  const[playlist,setPlaylist]=useState(null);
  const[loading,setLoading]=useState(true);

  useEffect(()=>{getPlaylistById(id).then(p=>{setPlaylist(p);setLoading(false);});},[id]);

  if(loading)return<div className="flex justify-center py-20"><Loader2 size={24} className="text-[#FF0000] animate-spin"/></div>;
  if(!playlist)return<p className="text-center text-[#717171] py-20">Playlist not found</p>;

  const songs=playlist.songs||[];

  return(
    <div className="pb-8 animate-[fadeIn_0.3s_ease-out]">
      <section className="flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-6">
        <img src={playlist.thumbnail} alt="" className="w-[200px] h-[200px] rounded-xl shadow-2xl object-cover"/>
        <div className="text-center sm:text-left">
          <p className="text-xs text-[#717171] uppercase mb-1">Playlist</p>
          <h1 className="text-2xl font-bold text-white mb-1">{playlist.title}</h1>
          {playlist.description&&<p className="text-sm text-[#AAAAAA] mb-1">{playlist.description}</p>}
          <p className="text-xs text-[#717171]">{songs.length} songs</p>
        </div>
      </section>
      <button onClick={()=>songs.length&&playSong(songs[0],songs)} className="w-11 h-11 bg-[#FF0000] rounded-full flex items-center justify-center hover:bg-[#CC0000] mb-6"><Play size={20} className="text-white ml-0.5" fill="white"/></button>
      <div className="bg-[#1A1A1A] rounded-xl overflow-hidden">{songs.map((s,i)=><SongRow key={s.id} song={s} index={i} songList={songs}/>)}</div>
    </div>
  );
}
