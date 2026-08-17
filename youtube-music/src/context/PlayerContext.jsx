import{createContext,useContext,useState,useRef,useEffect,useCallback}from'react';
import{searchSongs}from'../data/api';
import{addToHistory,getRelatedQueries}from'../data/algorithm';

const Ctx=createContext();
export const usePlayer=()=>useContext(Ctx);

export function PlayerProvider({children}){
  const audioRef=useRef(null);
  const[currentSong,setCurrentSong]=useState(null);
  const[queue,setQueue]=useState([]);
  const[isPlaying,setIsPlaying]=useState(false);
  const[volume,setVol]=useState(()=>{try{return parseFloat(localStorage.getItem('vol'))||0.7}catch{return 0.7}});
  const[currentTime,setCurrentTime]=useState(0);
  const[duration,setDuration]=useState(0);
  const[shuffleMode,setShuffle]=useState(false);
  const[repeatMode,setRepeat]=useState('none');
  const[isExpanded,setExpanded]=useState(false);
  const[likedSongs,setLikedSongs]=useState(()=>{try{return JSON.parse(localStorage.getItem('liked'))||[]}catch{return[]}});
  const[toasts,setToasts]=useState([]);
  const[upNext,setUpNext]=useState([]); // Related songs suggestion
  const playedIds=useRef(new Set()); // Track played songs to avoid repeats

  useEffect(()=>{
    audioRef.current=new Audio();audioRef.current.volume=volume;
    const a=audioRef.current;
    a.addEventListener('timeupdate',()=>setCurrentTime(a.currentTime));
    a.addEventListener('loadedmetadata',()=>setDuration(a.duration));
    a.addEventListener('ended',()=>playNext());
    a.addEventListener('error',()=>playNext());
    return()=>{a.pause();a.src='';}
  },[]);

  // When current song changes, fetch related songs for "Up Next"
  useEffect(()=>{
    if(!currentSong)return;
    playedIds.current.add(currentSong.id);
    async function fetchRelated(){
      const queries=getRelatedQueries(currentSong);
      if(!queries.length)return;
      // Fetch from multiple queries to get mixed artists
      let allSongs=[];
      for(const q of queries.slice(0,3)){
        const results=await searchSongs(q,8);
        allSongs=[...allSongs,...results];
      }
      // Deduplicate and filter played
      const seen=new Set();
      const unique=allSongs.filter(s=>{
        if(seen.has(s.id)||playedIds.current.has(s.id))return false;
        seen.add(s.id);return true;
      });
      setUpNext(unique);
      // Auto-fill queue with mixed artists (max 8)
      setQueue(prev=>prev.length>0?prev:unique.slice(0,8));
    }
    fetchRelated();
  },[currentSong]);

  useEffect(()=>{try{localStorage.setItem('liked',JSON.stringify(likedSongs))}catch{}},[likedSongs]);
  useEffect(()=>{try{localStorage.setItem('vol',volume.toString())}catch{}},[volume]);

  const showToast=useCallback((msg,type='info')=>{const id=Date.now();setToasts(p=>[...p,{id,msg,type}]);setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),3000);},[]);
  const dismissToast=useCallback((id)=>setToasts(p=>p.filter(t=>t.id!==id)),[]);

  const playSong=useCallback((song,newQueue)=>{
    if(!song)return;
    setCurrentSong(song);setCurrentTime(0);setIsPlaying(true);
    playedIds.current.add(song.id);
    if(newQueue)setQueue(newQueue.filter(s=>s.id!==song.id&&!playedIds.current.has(s.id)));
    addToHistory(song);
    if(audioRef.current&&song.audio){audioRef.current.src=song.audio;audioRef.current.play().catch(()=>{});}
  },[]);

  const togglePlay=useCallback(()=>{
    if(!currentSong)return;
    if(isPlaying){audioRef.current?.pause();setIsPlaying(false);}
    else{audioRef.current?.play().catch(()=>{});setIsPlaying(true);}
  },[currentSong,isPlaying]);

  const playNext=useCallback(async()=>{
    if(repeatMode==='one'&&currentSong){audioRef.current.currentTime=0;audioRef.current.play().catch(()=>{});return;}

    // Play from queue
    if(queue.length>0){
      const idx=shuffleMode?Math.floor(Math.random()*queue.length):0;
      const next=queue[idx];
      setQueue(p=>p.filter((_,i)=>i!==idx));
      setCurrentSong(next);setCurrentTime(0);setIsPlaying(true);
      playedIds.current.add(next.id);
      addToHistory(next);
      if(audioRef.current&&next.audio){audioRef.current.src=next.audio;audioRef.current.play().catch(()=>{});}
      return;
    }

    // Queue empty — fetch from related artists (rotates between artists)
    const queries=getRelatedQueries(currentSong);
    // Try each query — first one that gives unplayed songs wins
    for(const q of queries){
      const results=await searchSongs(q,15);
      const filtered=results.filter(s=>!playedIds.current.has(s.id));
      if(filtered.length>=2){
        // Take 2-3 songs from this artist, then add from next queries
        const take=Math.min(3,filtered.length);
        const next=filtered[0];
        const remaining=filtered.slice(1,take+3);
        setQueue(remaining);
        setUpNext(filtered);
        setCurrentSong(next);setCurrentTime(0);setIsPlaying(true);
        playedIds.current.add(next.id);
        addToHistory(next);
        if(audioRef.current&&next.audio){audioRef.current.src=next.audio;audioRef.current.play().catch(()=>{});}
        return;
      }
    }

    // All exhausted — reset played history and try again
    if(playedIds.current.size>30){
      playedIds.current.clear();
      const q=getRelatedQueries(currentSong);
      if(q.length){const r=await searchSongs(q[0],10);if(r.length){playSong(r[0],r);return;}}
    }
    setIsPlaying(false);
  },[queue,shuffleMode,repeatMode,currentSong]);

  const playPrev=useCallback(()=>{if(currentTime>3){audioRef.current.currentTime=0;setCurrentTime(0);}},[currentTime]);
  const seekTo=useCallback((t)=>{if(audioRef.current){audioRef.current.currentTime=t;setCurrentTime(t);}},[]);
  const setVolume=useCallback((v)=>{const val=Math.max(0,Math.min(1,v));setVol(val);if(audioRef.current)audioRef.current.volume=val;},[]);
  const toggleShuffle=useCallback(()=>setShuffle(p=>!p),[]);
  const cycleRepeat=useCallback(()=>setRepeat(p=>p==='none'?'all':p==='all'?'one':'none'),[]);
  const addToQueue=useCallback((song)=>{setQueue(p=>[...p,song]);showToast('Added to queue');},[showToast]);
  const removeFromQueue=useCallback((idx)=>setQueue(p=>p.filter((_,i)=>i!==idx)),[]);
  const clearQueue=useCallback(()=>{setQueue([]);showToast('Queue cleared');},[showToast]);
  const toggleLike=useCallback((songId)=>{setLikedSongs(p=>{if(p.includes(songId)){showToast('Removed from Liked');return p.filter(id=>id!==songId);}showToast('Liked ❤️','success');return[...p,songId];});},[showToast]);

  return<Ctx.Provider value={{currentSong,queue,upNext,isPlaying,volume,currentTime,duration,shuffleMode,repeatMode,isExpanded,likedSongs,toasts,playSong,togglePlay,playNext,playPrev,seekTo,setVolume,toggleShuffle,cycleRepeat,addToQueue,removeFromQueue,clearQueue,toggleLike,setExpanded,showToast,dismissToast}}>{children}</Ctx.Provider>;
}
