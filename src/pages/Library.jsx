import { useState, useMemo, useEffect } from 'react';
import { Clock, BarChart3, Download, Plus, ListMusic, Play, Trash2, Pencil, Check, X, Heart, Shuffle, Trophy, Music, Headphones, Disc3 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { getHistory, analyzePreferences } from '../data/algorithm';
import SongRow from '../components/SongRow';

export default function Library() {
  const { downloadedSongs, playSong, likedSongs } = usePlayer();
  const [tab, setTab] = useState('playlists');
  const [playlists, setPlaylists] = useState(() => { try { return JSON.parse(localStorage.getItem('ma_playlists')) || []; } catch { return []; } });
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [renaming, setRenaming] = useState(null);
  const [renameText, setRenameText] = useState('');
  const [openPlaylist, setOpenPlaylist] = useState(null);
  const history = useMemo(() => getHistory(), []);
  const prefs = useMemo(() => analyzePreferences(), []);
  const downloadedFromHistory = useMemo(() => { try { return JSON.parse(localStorage.getItem('ma_downloaded_songs')) || []; } catch { return []; } }, [downloadedSongs]);
  const likedSongs_full = useMemo(() => { try { return JSON.parse(localStorage.getItem('ma_liked_songs')) || []; } catch { return []; } }, [likedSongs]);

  useEffect(() => {
    setPlaylists(prev => {
      const likedPl = prev.find(p => p.id === '__liked__');
      if (!likedPl) return [{ id: '__liked__', name: 'Liked Songs', songs: likedSongs_full, created: Date.now(), auto: true }, ...prev];
      return prev.map(p => p.id === '__liked__' ? { ...p, songs: likedSongs_full } : p);
    });
  }, [likedSongs_full]);

  useEffect(() => { try { localStorage.setItem('ma_playlists', JSON.stringify(playlists)); } catch {} }, [playlists]);

  const createPlaylist = () => { if (!newName.trim()) return; setPlaylists(p => [...p, { id: Date.now().toString(), name: newName.trim(), songs: [], created: Date.now() }]); setNewName(''); setShowCreate(false); };
  const deletePlaylist = (id) => { if (id === '__liked__') return; setPlaylists(p => p.filter(pl => pl.id !== id)); };
  const renamePlaylist = (id) => { if (!renameText.trim()) { setRenaming(null); return; } setPlaylists(p => p.map(pl => pl.id === id ? { ...pl, name: renameText.trim() } : pl)); setRenaming(null); };

  const viewingPlaylist = openPlaylist ? playlists.find(p => p.id === openPlaylist) : null;
  const totalSaved = likedSongs_full.length + downloadedFromHistory.length;

  return (
    <div className="pb-6 pt-3">
      {/* Header */}
      {!openPlaylist && (
        <div className="animate-in mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-[26px] font-black text-transparent bg-clip-text tracking-tight" style={{ backgroundImage: 'linear-gradient(90deg, #fff 0%, #e879f9 60%, #a78bfa 100%)' }}>Library</h1>
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white text-[11px] font-bold shadow-md shadow-fuchsia-500/20 hover:scale-[1.04] active:scale-95 transition-all">
              <Plus size={13} /> New
            </button>
          </div>

          {/* Quick Stats Bar */}
          <div className="flex items-center gap-3 mt-4">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
              <Heart size={12} className="text-rose-400" />
              <span className="text-[11px] text-white/50 font-medium">{likedSongs_full.length} liked</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
              <Download size={12} className="text-emerald-400" />
              <span className="text-[11px] text-white/50 font-medium">{downloadedFromHistory.length} saved</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
              <Headphones size={12} className="text-violet-400" />
              <span className="text-[11px] text-white/50 font-medium">{history.length} played</span>
            </div>
          </div>
        </div>
      )}

      {/* Back button */}
      {openPlaylist && (
        <button onClick={() => setOpenPlaylist(null)} className="flex items-center gap-1.5 mb-4 px-3 py-1.5 rounded-full bg-white/[0.04] text-[11px] text-white/40 font-medium hover:bg-white/[0.08] active:scale-95 transition-all">
          &larr; Library
        </button>
      )}

      {/* Navigation Cards (replaces tabs) */}
      {!openPlaylist && (
        <div className="grid grid-cols-2 gap-2.5 mb-6 animate-in" style={{ animationDelay: '0.04s' }}>
          <NavCard active={tab === 'playlists'} onClick={() => setTab('playlists')} icon={ListMusic} label="Playlists" count={playlists.length} color="violet" />
          <NavCard active={tab === 'downloads'} onClick={() => setTab('downloads')} icon={Download} label="Downloads" count={downloadedFromHistory.length} color="emerald" />
          <NavCard active={tab === 'history'} onClick={() => setTab('history')} icon={Clock} label="History" count={history.length} color="blue" />
          <NavCard active={tab === 'stats'} onClick={() => setTab('stats')} icon={BarChart3} label="Stats" count={prefs?.totalPlays || 0} color="amber" />
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-6" onClick={() => setShowCreate(false)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
          <div className="relative border border-white/[0.08] rounded-3xl p-7 w-full max-w-[340px] animate-scale shadow-2xl" style={{ background: 'linear-gradient(145deg, #1a1025 0%, #12101a 100%)' }} onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-fuchsia-500/20 to-violet-500/10 flex items-center justify-center mb-4 border border-fuchsia-500/10">
              <Music size={18} className="text-fuchsia-400" />
            </div>
            <h3 className="text-[18px] font-bold text-white mb-1">Create Playlist</h3>
            <p className="text-[11px] text-white/30 mb-5">Give it a name</p>
            <input value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') createPlaylist(); }}
              placeholder="My Playlist..." className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-3.5 text-[14px] text-white placeholder:text-white/20 focus:outline-none focus:border-fuchsia-500/30 transition-all" autoFocus />
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowCreate(false)} className="flex-1 py-3 rounded-xl bg-white/[0.06] text-[13px] text-white/50 font-medium active:scale-95">Cancel</button>
              <button onClick={createPlaylist} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-fuchsia-500 to-violet-500 text-[13px] text-white font-bold shadow-lg shadow-fuchsia-500/20 active:scale-95">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Playlist Detail */}
      {openPlaylist && viewingPlaylist && (
        <div className="animate-in">
          <div className="flex items-center gap-4 mb-5 p-5 rounded-2xl border border-white/[0.06]" style={{ background: 'linear-gradient(135deg, rgba(26,16,37,0.6) 0%, rgba(12,10,20,0.4) 100%)' }}>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${viewingPlaylist.id === '__liked__' ? 'bg-gradient-to-br from-rose-500/30 to-pink-600/15 shadow-rose-500/10' : 'bg-gradient-to-br from-violet-500/25 to-purple-600/15 shadow-violet-500/10'}`}>
              {viewingPlaylist.id === '__liked__' ? <Heart size={24} className="text-rose-400" /> : <ListMusic size={24} className="text-violet-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-[20px] font-bold text-white truncate">{viewingPlaylist.name}</h2>
              <p className="text-[12px] text-white/30 mt-0.5">{viewingPlaylist.songs.length} songs</p>
            </div>
            {viewingPlaylist.songs.length > 0 && (
              <button onClick={() => { const s = [...viewingPlaylist.songs].sort(() => Math.random() - 0.5); playSong(s[0], s); }}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white rounded-full text-[12px] font-bold shadow-lg shadow-fuchsia-500/20 hover:scale-[1.03] active:scale-95 transition-all">
                <Play size={14} fill="white" /> Play
              </button>
            )}
          </div>
          {viewingPlaylist.songs.length > 0 ? (
            <div className="rounded-2xl border border-white/[0.04] overflow-hidden">
              {viewingPlaylist.songs.map((s, i) => <SongRow key={s.id} song={s} index={i} songList={viewingPlaylist.songs} />)}
            </div>
          ) : (
            <EmptyBox icon={Music} title="Empty playlist" desc="Play and like songs to add them here" />
          )}
        </div>
      )}

      {/* Playlists */}
      {tab === 'playlists' && !openPlaylist && (
        <div className="space-y-2 animate-in" style={{ animationDelay: '0.06s' }}>
          {playlists.map((pl, i) => (
            <div key={pl.id} onClick={() => setOpenPlaylist(pl.id)} style={{ animationDelay: `${i * 30}ms` }}
              className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-white/[0.04] hover:border-white/[0.08] transition-all duration-200 cursor-pointer group hover:bg-white/[0.02] animate-in">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-md ${pl.id === '__liked__' ? 'bg-gradient-to-br from-rose-500/25 to-pink-600/10 shadow-rose-500/10' : 'bg-gradient-to-br from-violet-500/20 to-purple-600/10 shadow-violet-500/10'}`}>
                {pl.id === '__liked__' ? <Heart size={17} className="text-rose-400" /> : <ListMusic size={17} className="text-violet-400" />}
              </div>
              <div className="flex-1 min-w-0">
                {renaming === pl.id ? (
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <input value={renameText} onChange={e => setRenameText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') renamePlaylist(pl.id); }}
                      className="flex-1 bg-white/[0.08] border border-white/[0.1] rounded-lg px-3 py-1.5 text-[12px] text-white focus:outline-none" autoFocus />
                    <button onClick={() => renamePlaylist(pl.id)} className="text-emerald-400"><Check size={14} /></button>
                    <button onClick={() => setRenaming(null)} className="text-white/25"><X size={14} /></button>
                  </div>
                ) : (
                  <>
                    <p className="text-[13px] font-semibold text-white truncate">{pl.name}</p>
                    <p className="text-[10px] text-white/25 mt-0.5">{pl.songs.length} songs</p>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                {pl.songs.length > 0 && (
                  <button onClick={e => { e.stopPropagation(); const s = [...pl.songs].sort(() => Math.random() - 0.5); playSong(s[0], s); }}
                    className="w-9 h-9 rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500 flex items-center justify-center shadow-md shadow-fuchsia-500/20 active:scale-90 transition-all">
                    <Play size={12} className="text-white ml-0.5" fill="white" />
                  </button>
                )}
                {pl.id !== '__liked__' && (
                  <>
                    <button onClick={e => { e.stopPropagation(); setRenaming(pl.id); setRenameText(pl.name); }} className="w-7 h-7 rounded-full flex items-center justify-center text-white/15 hover:text-white/50 hover:bg-white/[0.06]"><Pencil size={11} /></button>
                    <button onClick={e => { e.stopPropagation(); deletePlaylist(pl.id); }} className="w-7 h-7 rounded-full flex items-center justify-center text-white/15 hover:text-red-400 hover:bg-red-500/10"><Trash2 size={11} /></button>
                  </>
                )}
              </div>
            </div>
          ))}
          {playlists.length <= 1 && (
            <div className="mt-4 p-4 rounded-2xl border border-dashed border-white/[0.06] text-center">
              <p className="text-[12px] text-white/25">Create playlists to organize your music</p>
              <button onClick={() => setShowCreate(true)} className="mt-3 text-[11px] text-fuchsia-400 font-semibold hover:text-fuchsia-300 transition-colors">
                + Create your first playlist
              </button>
            </div>
          )}
        </div>
      )}

      {/* Downloads */}
      {tab === 'downloads' && !openPlaylist && (
        downloadedFromHistory.length > 0 ? (
          <div className="animate-in">
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => { const s = [...downloadedFromHistory].sort(() => Math.random() - 0.5); playSong(s[0], s); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white text-[12px] font-bold rounded-full shadow-lg shadow-fuchsia-500/20 hover:scale-[1.03] active:scale-95 transition-all">
                <Shuffle size={13} /> Shuffle Play
              </button>
              <span className="text-[11px] text-white/25">{downloadedFromHistory.length} songs</span>
            </div>
            <div className="rounded-2xl border border-white/[0.04] overflow-hidden">
              {downloadedFromHistory.map((s, i) => <SongRow key={s.id} song={s} index={i} songList={downloadedFromHistory} />)}
            </div>
          </div>
        ) : <EmptyBox icon={Download} title="No downloads" desc="Tap the download button on any song to save it for offline" />
      )}

      {/* History */}
      {tab === 'history' && !openPlaylist && (
        history.length > 0 ? (
          <div className="animate-in">
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => { const s = [...history.slice(0, 30)].sort(() => Math.random() - 0.5); playSong(s[0], s); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white text-[12px] font-bold rounded-full shadow-lg shadow-fuchsia-500/20 hover:scale-[1.03] active:scale-95 transition-all">
                <Shuffle size={13} /> Shuffle
              </button>
              <span className="text-[11px] text-white/25">{history.length} songs</span>
            </div>
            <div className="rounded-2xl border border-white/[0.04] overflow-hidden">
              {history.slice(0, 50).map((s, i) => <SongRow key={`${s.id}-${i}`} song={s} index={i} songList={history} />)}
            </div>
          </div>
        ) : <EmptyBox icon={Headphones} title="Start listening" desc="Songs you play will appear here so you can find them again" />
      )}

      {/* Stats */}
      {tab === 'stats' && !openPlaylist && (
        prefs && prefs.totalPlays > 0 ? (
          <div className="animate-in space-y-4">
            <div className="rounded-2xl p-6 border border-white/[0.06]" style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #15102a 100%)' }}>
              <p className="text-[10px] text-fuchsia-300/50 uppercase tracking-widest font-medium mb-2">Total Plays</p>
              <p className="text-[42px] font-black text-transparent bg-clip-text leading-none" style={{ backgroundImage: 'linear-gradient(90deg, #fff 0%, #e879f9 60%, #a78bfa 100%)' }}>{prefs.totalPlays}</p>
            </div>
            {prefs.topArtists?.length > 0 && (
              <div className="rounded-2xl p-5 border border-white/[0.05] bg-white/[0.02]">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy size={14} className="text-amber-400" />
                  <p className="text-[13px] text-white font-bold">Top Artists</p>
                </div>
                <div className="space-y-3">
                  {prefs.topArtists.slice(0, 5).map((a, i) => {
                    const name = typeof a === 'string' ? a : a.name;
                    return (
                      <div key={name || i} className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                          i === 0 ? 'bg-gradient-to-br from-amber-500/20 to-yellow-500/10 text-amber-400' : i === 1 ? 'bg-white/[0.06] text-white/40' : i === 2 ? 'bg-orange-500/10 text-orange-400' : 'bg-white/[0.03] text-white/20'
                        }`}>{i + 1}</span>
                        <span className="text-[13px] text-white/80 font-medium flex-1">{name}</span>
                        {i < 3 && <div className="w-16 h-1.5 rounded-full bg-white/[0.06] overflow-hidden"><div className={`h-full rounded-full ${i === 0 ? 'bg-amber-400 w-full' : i === 1 ? 'bg-white/30 w-3/4' : 'bg-orange-400 w-1/2'}`} /></div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : <EmptyBox icon={Disc3} title="Your stats will show here" desc="Listen to more music to unlock insights about your taste" />
      )}
    </div>
  );
}

function NavCard({ active, onClick, icon: Icon, label, count, color }) {
  const colors = {
    violet: { bg: 'from-violet-500/15 to-purple-600/5', icon: 'text-violet-400', border: 'border-violet-500/20' },
    emerald: { bg: 'from-emerald-500/15 to-teal-600/5', icon: 'text-emerald-400', border: 'border-emerald-500/20' },
    blue: { bg: 'from-blue-500/15 to-indigo-600/5', icon: 'text-blue-400', border: 'border-blue-500/20' },
    amber: { bg: 'from-amber-500/15 to-orange-600/5', icon: 'text-amber-400', border: 'border-amber-500/20' },
  };
  const c = colors[color];
  return (
    <button onClick={onClick}
      className={`relative p-4 rounded-2xl text-left transition-all duration-300 active:scale-[0.96] ${
        active
          ? `bg-gradient-to-br ${c.bg} border ${c.border} shadow-lg`
          : 'bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.07]'
      }`}>
      <Icon size={18} className={active ? c.icon : 'text-white/25'} />
      <p className={`text-[12px] font-semibold mt-2 ${active ? 'text-white' : 'text-white/50'}`}>{label}</p>
      <p className={`text-[10px] mt-0.5 ${active ? 'text-white/40' : 'text-white/20'}`}>{count > 0 ? `${count} items` : 'Empty'}</p>
    </button>
  );
}

function EmptyBox({ icon: Icon, title, desc }) {
  return (
    <div className="text-center py-16 animate-in">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06] flex items-center justify-center">
        <Icon size={24} className="text-white/15" />
      </div>
      <p className="text-[14px] text-white/50 font-medium">{title}</p>
      <p className="text-[11px] text-white/20 mt-1.5 max-w-[240px] mx-auto leading-relaxed">{desc}</p>
    </div>
  );
}
