import{useState,useMemo}from'react';
import{Heart,Clock,Music,BarChart3}from'lucide-react';
import{usePlayer}from'../context/PlayerContext';
import{getHistory,analyzePreferences}from'../data/algorithm';
import SongRow from'../components/SongRow';

export default function Library(){
  const{likedSongs}=usePlayer();
  const[tab,setTab]=useState('history');
  const history=useMemo(()=>getHistory(),[]);
  const prefs=useMemo(()=>analyzePreferences(),[]);

  // Liked songs are stored as IDs only - need full objects from history
  const likedFromHistory=history.filter(s=>likedSongs.includes(s.id));

  const tabs=[{id:'history',label:'History',icon:Clock},{id:'liked',label:'Liked',icon:Heart},{id:'stats',label:'Stats',icon:BarChart3}];

  return(
    <div className="pb-6">
      <h1 className="text-2xl font-bold text-white mb-5">Library</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${tab===t.id?'bg-white text-black':'bg-[#272727] text-[#AAAAAA] hover:text-white'}`}><t.icon size={14}/>{t.label}</button>)}
      </div>

      {/* History */}
      {tab==='history'&&(
        history.length>0?
          <div className="bg-[#1A1A1A] rounded-xl overflow-hidden">{history.slice(0,30).map((s,i)=><SongRow key={`${s.id}-${i}`} song={s} index={i} songList={history}/>)}</div>
        :<div className="text-center py-16"><Clock size={40} className="text-[#383838] mx-auto mb-3"/><p className="text-[#AAAAAA]">Your listening history will appear here</p></div>
      )}

      {/* Liked */}
      {tab==='liked'&&(
        likedFromHistory.length>0?
          <div className="bg-[#1A1A1A] rounded-xl overflow-hidden">{likedFromHistory.map((s,i)=><SongRow key={s.id} song={s} index={i} songList={likedFromHistory}/>)}</div>
        :<div className="text-center py-16"><Heart size={40} className="text-[#383838] mx-auto mb-3"/><p className="text-[#AAAAAA]">Tap ❤️ on songs to save them here</p></div>
      )}

      {/* Stats */}
      {tab==='stats'&&(
        <div className="space-y-4">
          {prefs?(
            <>
              <div className="bg-[#1A1A1A] rounded-xl p-5">
                <p className="text-xs text-[#717171] uppercase mb-3">Your Stats</p>
                <p className="text-3xl font-bold text-white">{prefs.totalPlays}</p>
                <p className="text-sm text-[#AAAAAA]">songs played</p>
              </div>
              <div className="bg-[#1A1A1A] rounded-xl p-5">
                <p className="text-xs text-[#717171] uppercase mb-3">Top Artists</p>
                <div className="space-y-2">
                  {prefs.topArtists.map((a,i)=>(
                    <div key={a.name} className="flex items-center gap-3">
                      <span className="text-lg font-bold text-[#FF0000] w-6">{i+1}</span>
                      <span className="text-sm text-white flex-1">{a.name}</span>
                      <span className="text-xs text-[#717171]">{a.count} plays</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-[#1A1A1A] rounded-xl p-5">
                <p className="text-xs text-[#717171] uppercase mb-3">You listen most during</p>
                <p className="text-lg font-semibold text-white capitalize">{prefs.peakTime}</p>
              </div>
            </>
          ):<div className="text-center py-16"><BarChart3 size={40} className="text-[#383838] mx-auto mb-3"/><p className="text-[#AAAAAA]">Play more songs to see your stats</p></div>}
        </div>
      )}
    </div>
  );
}
