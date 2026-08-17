import{createContext,useContext,useState,useRef,useEffect,useCallback}from'react';
import{songs}from'../data/mockData';

const Ctx=createContext();
export const usePlayer=()=>useContext(Ctx);

export function PlayerProvider({children}){
  const audioRef=useRef(null);
  const[currentSong,setCurrentSong]=useState(null);
  const[queue,setQueue]=useState([]);
  const[isPlaying,setIsPlaying]=useState(false);
  const[volume,setVolumeState]=useState(()=>{try{return parseFloat(localStorage.getItem('volume'))||0.7}catch{return 0.7}});
  const[isMuted,setIsMuted]=useState(false);
  const[currentTime,setCurrentTime]=useState(0);
  const[duration,setDuration]=useState(0);
  const[shuffleMode,setShuffleMode]=useState(()=>{try{return localStorage.getItem('shuffleMode')==='true'}catch{return false}});
  const[repeatMode,setRepeatMode]=useState(()=>{try{return localStorage.getItem('repeatMode')||'none'}catch{return'none'}});
  const[isExpanded,setExpanded]=useState(false);
  const[isQueueOpen,setQueueOpen]=useState(false);
  const[likedSongs,setLikedSongs]=useState(()=>{try{return JSON.parse(localStorage.getItem('likedSongs'))||[]}catch{return[]}});
  const[toasts,setToasts]=useState([]);

  useEffect(()=>{audioRef.current=new Audio();audioRef.current.volume=volume;
    const a=audioRef.current;
    const onTime=()=>setCurrentTime(a.currentTime);
    const onMeta=()=>setDuration(a.duration);
    const onEnd=()=>playNext();
    a.addEventListener('timeupdate',onTime);a.addEventListener('loadedmetadata',onMeta);a.addEventListener('ended',onEnd);
    return()=>{a.removeEventListener('timeupdate',onTime);a.removeEventListener('loadedmetadata',onMeta);a.removeEventListener('ended',onEnd);a.pause();}
  },[]);

  useEffect(()=>{try{localStorage.setItem('likedSongs',JSON.stringify(likedSongs))}catch{}},[likedSongs]);
  useEffect(()=>{try{localStorage.setItem('volume',volume.toString())}catch{}},[volume]);
  useEffect(()=>{try{localStorage.setItem('shuffleMode',shuffleMode.toString())}catch{}},[shuffleMode]);
  useEffect(()=>{try{localStorage.setItem('repeatMode',repeatMode)}catch{}},[repeatMode]);

  const showToast=useCallback((msg,type='info')=>{const id=Date.now();setToasts(p=>[...p,{id,msg,type}]);setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),3000);},[]);
  const dismissToast=useCallback((id)=>setToasts(p=>p.filter(t=>t.id!==id)),[]);

  const playSong=useCallback((song,newQueue)=>{
    if(!song)return;setCurrentSong(song);setCurrentTime(0);setIsPlaying(true);
    if(newQueue)setQueue(newQueue.filter(s=>s.id!==song.id));
    if(audioRef.current){audioRef.current.src=`https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${(parseInt(song.id.replace('s',''))%16)+1}.mp3`;audioRef.current.play().catch(()=>{});}
  },[]);

  const togglePlay=useCallback(()=>{
    if(!currentSong){if(songs.length)playSong(songs[0],songs);return;}
    if(isPlaying){audioRef.current?.pause();setIsPlaying(false);}
    else{audioRef.current?.play().catch(()=>{});setIsPlaying(true);}
  },[currentSong,isPlaying,playSong]);

  const playNext=useCallback(()=>{
    if(repeatMode==='one'&&currentSong){audioRef.current.currentTime=0;audioRef.current.play().catch(()=>{});return;}
    if(queue.length>0){const idx=shuffleMode?Math.floor(Math.random()*queue.length):0;const next=queue[idx];setQueue(p=>p.filter((_,i)=>i!==idx));playSong(next);return;}
    if(repeatMode==='all'){const idx=songs.findIndex(s=>s.id===currentSong?.id);const next=songs[(idx+1)%songs.length];playSong(next,songs);}else{setIsPlaying(false);}
  },[queue,shuffleMode,repeatMode,currentSong,playSong]);

  const playPrev=useCallback(()=>{
    if(currentTime>3){seekTo(0);return;}
    const idx=songs.findIndex(s=>s.id===currentSong?.id);if(idx>0)playSong(songs[idx-1],songs);
  },[currentTime,currentSong,playSong]);

  const seekTo=useCallback((t)=>{if(audioRef.current){audioRef.current.currentTime=t;setCurrentTime(t);}},[]);
  const setVolume=useCallback((v)=>{const val=Math.max(0,Math.min(1,v));setVolumeState(val);if(audioRef.current)audioRef.current.volume=val;setIsMuted(val===0);},[]);
  const toggleMute=useCallback(()=>{if(isMuted){setVolume(0.7);setIsMuted(false);}else{if(audioRef.current)audioRef.current.volume=0;setIsMuted(true);}},[isMuted,setVolume]);
  const toggleShuffle=useCallback(()=>setShuffleMode(p=>!p),[]);
  const cycleRepeat=useCallback(()=>setRepeatMode(p=>p==='none'?'all':p==='all'?'one':'none'),[]);
  const addToQueue=useCallback((song)=>{setQueue(p=>[...p,song]);showToast('Added to queue');},[showToast]);
  const removeFromQueue=useCallback((idx)=>setQueue(p=>p.filter((_,i)=>i!==idx)),[]);
  const clearQueue=useCallback(()=>{setQueue([]);showToast('Queue cleared');},[showToast]);
  const reorderQueue=useCallback((from,to)=>{setQueue(p=>{const n=[...p];const[item]=n.splice(from,1);n.splice(to,0,item);return n;});},[]);
  const toggleLike=useCallback((songId)=>{setLikedSongs(p=>{if(p.includes(songId)){showToast('Removed from Liked Songs');return p.filter(id=>id!==songId);}showToast('Added to Liked Songs ❤️','success');return[...p,songId];});},[showToast]);

  useEffect(()=>{
    const onKey=(e)=>{if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')return;
      switch(e.code){case'Space':e.preventDefault();togglePlay();break;case'ArrowRight':e.preventDefault();seekTo(Math.min(currentTime+10,duration));break;case'ArrowLeft':e.preventDefault();seekTo(Math.max(currentTime-10,0));break;case'ArrowUp':e.preventDefault();setVolume(volume+0.1);break;case'ArrowDown':e.preventDefault();setVolume(volume-0.1);break;case'KeyM':toggleMute();break;case'KeyL':if(currentSong)toggleLike(currentSong.id);break;case'KeyN':playNext();break;case'KeyP':playPrev();break;case'KeyS':toggleShuffle();break;case'KeyQ':setQueueOpen(p=>!p);break;case'Escape':setExpanded(false);break;}
    };window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey);
  },[currentTime,duration,volume,currentSong,togglePlay,seekTo,setVolume,toggleMute,toggleLike,playNext,playPrev,toggleShuffle]);

  return<Ctx.Provider value={{currentSong,queue,isPlaying,volume,isMuted,currentTime,duration,shuffleMode,repeatMode,isExpanded,isQueueOpen,likedSongs,toasts,playSong,togglePlay,playNext,playPrev,seekTo,setVolume,toggleMute,toggleShuffle,cycleRepeat,addToQueue,removeFromQueue,clearQueue,reorderQueue,toggleLike,setExpanded,setQueueOpen,showToast,dismissToast}}>{children}</Ctx.Provider>;
}
