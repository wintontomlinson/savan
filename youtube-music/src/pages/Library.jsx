import{useState}from'react';
import{Heart,Clock,Plus,Grid3X3,List}from'lucide-react';
import{songs,playlists,albums}from'../data/mockData';
import{usePlayer}from'../context/PlayerContext';
import SongRow from'../components/SongRow';
import AlbumCard from'../components/AlbumCard';
import PlaylistCard from'../components/PlaylistCard';
import Modal from'../components/Modal';

const tabs=['Playlists','Albums','Songs','Artists'];

export default function Library(){
  const[tab,setTab]=useState('Songs');
  const[view,setView]=useState('list');
  const[modal,setModal]=useState(false);
  const[newName,setNewName]=useState('');
  const{likedSongs,showToast,playSong}=usePlayer();

  const likedSongsList=songs.filter(s=>likedSongs.includes(s.id));

  return(
    <div className="pb-8 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Your Library</h1>
        <button onClick={()=>setModal(true)} className="flex items-center gap-1.5 px-4 py-2 bg-[#272727] hover:bg-[#383838] rounded-full text-sm text-white"><Plus size={14}/>Create</button>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2 overflow-x-auto" style={{scrollbarWidth:'none'}}>
          {tabs.map(t=><button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${tab===t?'bg-white text-black':'bg-[#272727] text-[#AAAAAA] hover:text-white'}`}>{t}</button>)}
        </div>
        <div className="flex gap-1 ml-2 shrink-0">
          <button onClick={()=>setView('grid')} className={`p-1.5 rounded ${view==='grid'?'bg-white/10 text-white':'text-[#717171]'}`}><Grid3X3 size={16}/></button>
          <button onClick={()=>setView('list')} className={`p-1.5 rounded ${view==='list'?'bg-white/10 text-white':'text-[#717171]'}`}><List size={16}/></button>
        </div>
      </div>

      {/* Liked Songs Banner */}
      {tab==='Songs'&&(
        <button onClick={()=>{if(likedSongsList.length)playSong(likedSongsList[0],likedSongsList);}} className="w-full flex items-center gap-4 p-4 mb-4 rounded-xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-white/5 hover:border-white/10 transition-colors">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center"><Heart size={20} className="text-white" fill="white"/></div>
          <div className="text-left"><p className="text-sm font-bold text-white">Liked Songs</p><p className="text-xs text-[#AAAAAA]">{likedSongs.length} songs</p></div>
        </button>
      )}

      {/* Content */}
      {tab==='Songs'&&(
        likedSongsList.length>0?<div className="bg-[#1A1A1A] rounded-xl overflow-hidden">{likedSongsList.map((s,i)=><SongRow key={s.id} song={s} index={i} songList={likedSongsList}/>)}</div>
        :<p className="text-center text-[#717171] py-12">No liked songs yet. Tap ❤️ to save songs.</p>
      )}
      {tab==='Albums'&&<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">{albums.map(a=><AlbumCard key={a.id} album={a}/>)}</div>}
      {tab==='Playlists'&&<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">{playlists.map(p=><PlaylistCard key={p.id} playlist={p}/>)}</div>}
      {tab==='Artists'&&<p className="text-center text-[#717171] py-12">Your followed artists will appear here.</p>}

      {/* Create Playlist Modal */}
      <Modal isOpen={modal} onClose={()=>setModal(false)} title="Create Playlist">
        <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Playlist name" className="w-full bg-[#272727] text-white px-4 py-3 rounded-xl text-sm placeholder:text-[#717171] focus:outline-none focus:ring-1 focus:ring-[#FF0000] mb-4"/>
        <button onClick={()=>{showToast('Playlist created!','success');setModal(false);setNewName('');}} className="w-full py-3 bg-[#FF0000] hover:bg-[#CC0000] text-white rounded-full text-sm font-medium">Create</button>
      </Modal>
    </div>
  );
}
