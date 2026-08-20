import { useState, useMemo, useEffect } from 'react';
import { Clock, BarChart3, Download, Plus, ListMusic, Play, Trash2, Pencil, Check, X, Heart, Shuffle, Trophy } from 'lucide-react';
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

  const tabs = [
    { id: 'playlists', label: 'Playlists', count: playlists.length },
    { id: 'downloads', label: 'Downloads', count: downloadedFromHistory.length },
    { id: 'history', label: 'History', count: history.length },
    { id: 'stats', label: 'Stats' },
  ];

  const viewingPlaylist = openPlaylist ? playlists.find(p => p.id === openPlaylist) : null;

  return (
    <div className="pb-6 pt-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[26px] font-bold text-white tracking-tight">Library</h1>
          <p className="text-[12px] text-white/35 mt-0.5">{history.length} songs played</p>
        </div>
        {tab === 'playlists' && !openPlaylist && (
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-[12px] text-white/60 font-medium transition-all active:scale-95 border border-white/[0.05]">
            <Plus size={13} /> New
          </button>
        )}
        {openPlaylist && (
          <button onClick={() => setOpenPlaylist(null)} className="text-[12px] text-white/40 hover:text-white/70 transition-colors active:scale-95">
            Back
          </button>
        )}
      </div>

      {/* Tabs */}
      {!openPlaylist && (
        <div className="flex gap-1.5 mb-6 overflow-x-auto scroll-x">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all ${
                tab === t.id ? 'bg-white text-black' : 'bg-white/[0.04] text-white/40 hover:text-white/60'
              }`}>
              {t.label}
              {t.count > 0 && <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${tab === t.id ? 'bg-black/10' : 'bg-white/[0.08]'}`}>{t.count}</span>}
            </button>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-6" onClick={() => setShowCreate(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative bg-[#161618] border border-white/[0.08] rounded-2xl p-6 w-full max-w-[320px] animate-scale" onClick={e => e.stopPropagation()}>
            <h3 className="text-[16px] font-bold text-white mb-4">New Playlist</h3>
            <input value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') createPlaylist(); }}
              placeholder="Playlist name..." className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-3 text-[14px] text-white placeholder:text-white/25 focus:outline-none focus:border-white/[0.15] transition-all" autoFocus />
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl bg-white/[0.06] text-[13px] text-white/50 font-medium active:scale-95">Cancel</button>
              <button onClick={createPlaylist} className="flex-1 py-2.5 rounded-xl bg-white text-[13px] text-black font-bold active:scale-95">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Playlist Detail */}
      {openPlaylist && viewingPlaylist && (
        <div className="animate-in">
          <div className="flex items-center gap-3 mb-5">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${viewingPlaylist.id === '__liked__' ? 'bg-rose-500/15' : 'bg-violet-500/15'}`}>
              {viewingPlaylist.id === '__liked__' ? <Heart size={22} className="text-rose-400" /> : <ListMusic size={22} className="text-violet-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-[18px] font-bold text-white truncate">{viewingPlaylist.name}</h2>
              <p className="text-[11px] text-white/30">{viewingPlaylist.songs.length} songs</p>
            </div>
            {viewingPlaylist.songs.length > 0 && (
              <button onClick={() => { const s = [...viewingPlaylist.songs].sort(() => Math.random() - 0.5); playSong(s[0], s); }}
                className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full text-[12px] font-bold shadow-md active:scale-95 transition-all">
                <Shuffle size={12} /> Shuffle
              </button>
            )}
          </div>
          {viewingPlaylist.songs.length > 0 ? (
            <div className="rounded-2xl border border-white/[0.04] overflow-hidden">
              {viewingPlaylist.songs.map((s, i) => <SongRow key={s.id} song={s} index={i} songList={viewingPlaylist.songs} />)}
            </div>
          ) : (
            <p className="text-center text-[13px] text-white/25 py-16">No songs yet</p>
          )}
        </div>
      )}

      {/* Playlists */}
      {tab === 'playlists' && !openPlaylist && (
        <div className="space-y-1.5 animate-in">
          {playlists.length === 0 ? (
            <p className="text-center text-[13px] text-white/25 py-16">No playlists yet</p>
          ) : playlists.map(pl => (
            <div key={pl.id} onClick={() => setOpenPlaylist(pl.id)}
              className="flex items-center gap-3 p-3 bg-white/[0.02] hover:bg-white/[0.04] rounded-xl border border-white/[0.03] hover:border-white/[0.06] transition-all cursor-pointer group">
              <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${pl.id === '__liked__' ? 'bg-rose-500/15' : 'bg-violet-500/10'}`}>
                {pl.id === '__liked__' ? <Heart size={16} className="text-rose-400" /> : <ListMusic size={16} className="text-violet-400" />}
              </div>
              <div className="flex-1 min-w-0">
                {renaming === pl.id ? (
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <input value={renameText} onChange={e => setRenameText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') renamePlaylist(pl.id); }}
                      className="flex-1 bg-white/[0.06] border border-white/[0.1] rounded px-2 py-1 text-[12px] text-white focus:outline-none" autoFocus />
                    <button onClick={() => renamePlaylist(pl.id)} className="text-emerald-400"><Check size={14} /></button>
                    <button onClick={() => setRenaming(null)} className="text-white/25"><X size={14} /></button>
                  </div>
                ) : (
                  <>
                    <p className="text-[13px] font-medium text-white truncate">{pl.name}</p>
                    <p className="text-[10px] text-white/25">{pl.songs.length} songs</p>
                  </>
                )}
              </div>
              {pl.id !== '__liked__' && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={e => { e.stopPropagation(); setRenaming(pl.id); setRenameText(pl.name); }} className="w-7 h-7 rounded-full flex items-center justify-center text-white/20 hover:text-white/50 hover:bg-white/[0.06]"><Pencil size={11} /></button>
                  <button onClick={e => { e.stopPropagation(); deletePlaylist(pl.id); }} className="w-7 h-7 rounded-full flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-500/10"><Trash2 size={11} /></button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Downloads */}
      {tab === 'downloads' && !openPlaylist && (
        downloadedFromHistory.length > 0 ? (
          <div className="animate-in">
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => { const s = [...downloadedFromHistory].sort(() => Math.random() - 0.5); playSong(s[0], s); }}
                className="flex items-center gap-2 px-4 py-2 bg-white text-black text-[12px] font-bold rounded-full shadow-md active:scale-95 transition-all">
                <Shuffle size={12} /> Shuffle
              </button>
              <span className="text-[11px] text-white/25">{downloadedFromHistory.length} songs</span>
            </div>
            <div className="rounded-2xl border border-white/[0.04] overflow-hidden">
              {downloadedFromHistory.map((s, i) => <SongRow key={s.id} song={s} index={i} songList={downloadedFromHistory} />)}
            </div>
          </div>
        ) : <p className="text-center text-[13px] text-white/25 py-16">No downloads yet</p>
      )}

      {/* History */}
      {tab === 'history' && !openPlaylist && (
        history.length > 0 ? (
          <div className="animate-in">
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => { const s = [...history.slice(0, 30)].sort(() => Math.random() - 0.5); playSong(s[0], s); }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white text-[12px] font-bold rounded-full shadow-md active:scale-95 transition-all">
                <Shuffle size={12} /> Shuffle
              </button>
              <span className="text-[11px] text-white/25">{history.length} total</span>
            </div>
            <div className="rounded-2xl border border-white/[0.04] overflow-hidden">
              {history.slice(0, 50).map((s, i) => <SongRow key={`${s.id}-${i}`} song={s} index={i} songList={history} />)}
            </div>
          </div>
        ) : <p className="text-center text-[13px] text-white/25 py-16">No history yet</p>
      )}

      {/* Stats */}
      {tab === 'stats' && !openPlaylist && (
        prefs && prefs.totalPlays > 0 ? (
          <div className="animate-in space-y-4">
            <div className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.04]">
              <p className="text-[11px] text-white/30 uppercase tracking-wider font-medium mb-1">Total Plays</p>
              <p className="text-[32px] font-bold text-white">{prefs.totalPlays}</p>
            </div>
            {prefs.topArtists?.length > 0 && (
              <div className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.04]">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy size={14} className="text-amber-400" />
                  <p className="text-[13px] text-white font-bold">Top Artists</p>
                </div>
                <div className="space-y-3">
                  {prefs.topArtists.slice(0, 5).map((a, i) => (
                    <div key={typeof a === 'string' ? a : i} className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${
                        i === 0 ? 'bg-amber-500/15 text-amber-400' : 'bg-white/[0.04] text-white/25'
                      }`}>{i + 1}</span>
                      <span className="text-[13px] text-white/80 font-medium">{typeof a === 'string' ? a : a.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : <p className="text-center text-[13px] text-white/25 py-16">Play more songs to see stats</p>
      )}
    </div>
  );
}
