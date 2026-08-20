import { useState, useMemo, useEffect, useRef } from 'react';
import { Clock, BarChart3, Download, Plus, ListMusic, Play, Trash2, Pencil, Check, X, Heart, Shuffle, Trophy, Music, Headphones, Disc3, MoreVertical } from 'lucide-react';
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
    { id: 'playlists', label: 'Playlists' },
    { id: 'downloads', label: 'Saved' },
    { id: 'history', label: 'History' },
    { id: 'stats', label: 'Stats' },
  ];

  const viewingPlaylist = openPlaylist ? playlists.find(p => p.id === openPlaylist) : null;

  return (
    <div className="pb-6 pt-3">
      {/* Header */}
      {!openPlaylist && (
        <div className="animate-in mb-5">
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-[24px] font-bold text-white tracking-tight">Library</h1>
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white text-[11px] font-bold shadow-lg shadow-fuchsia-500/15 hover:shadow-fuchsia-500/25 hover:scale-[1.04] active:scale-95 transition-all">
              <Plus size={12} /> Create
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto scroll-x">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-4 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all duration-200 ${
                  tab === t.id
                    ? 'bg-white text-black'
                    : 'bg-white/[0.05] text-white/40 hover:text-white/60'
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Back */}
      {openPlaylist && (
        <button onClick={() => setOpenPlaylist(null)} className="flex items-center gap-1.5 mb-5 text-[12px] text-white/40 hover:text-white/70 transition-colors active:scale-95">
          &larr; Back
        </button>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-6" onClick={() => setShowCreate(false)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
          <div className="relative bg-[#141416] border border-white/[0.08] rounded-2xl p-6 w-full max-w-[320px] animate-scale shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-[16px] font-bold text-white mb-4">New Playlist</h3>
            <input value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') createPlaylist(); }}
              placeholder="Playlist name..." className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-3 text-[14px] text-white placeholder:text-white/20 focus:outline-none focus:border-white/[0.15] transition-all" autoFocus />
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
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${viewingPlaylist.id === '__liked__' ? 'bg-rose-500/10' : 'bg-violet-500/10'}`}>
              {viewingPlaylist.id === '__liked__' ? <Heart size={22} className="text-rose-400" /> : <ListMusic size={22} className="text-violet-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-[18px] font-bold text-white truncate">{viewingPlaylist.name}</h2>
              <p className="text-[11px] text-white/30">{viewingPlaylist.songs.length} songs</p>
            </div>
            {viewingPlaylist.songs.length > 0 && (
              <button onClick={() => { const s = [...viewingPlaylist.songs].sort(() => Math.random() - 0.5); playSong(s[0], s); }}
                className="flex items-center gap-2 px-4 py-2.5 bg-white text-black rounded-full text-[12px] font-bold shadow-md active:scale-95 transition-all">
                <Play size={12} fill="black" /> Play
              </button>
            )}
          </div>
          {viewingPlaylist.songs.length > 0 ? (
            <div className="rounded-2xl border border-white/[0.04] overflow-hidden">
              {viewingPlaylist.songs.map((s, i) => <SongRow key={s.id} song={s} index={i} songList={viewingPlaylist.songs} />)}
            </div>
          ) : (
            <div className="text-center py-16">
              <Music size={24} className="text-white/10 mx-auto mb-3" />
              <p className="text-[13px] text-white/25">No songs yet</p>
              <p className="text-[11px] text-white/15 mt-1">Like songs to add them here</p>
            </div>
          )}
        </div>
      )}

      {/* Playlists */}
      {tab === 'playlists' && !openPlaylist && (
        <div className="space-y-1.5 animate-in">
          {playlists.map(pl => (
            <div key={pl.id} onClick={() => setOpenPlaylist(pl.id)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-all cursor-pointer group">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${pl.id === '__liked__' ? 'bg-rose-500/10' : 'bg-violet-500/10'}`}>
                {pl.id === '__liked__' ? <Heart size={16} className="text-rose-400" /> : <ListMusic size={16} className="text-violet-400" />}
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
                    <p className="text-[13px] font-medium text-white truncate">{pl.name}</p>
                    <p className="text-[10px] text-white/25">{pl.songs.length} songs</p>
                  </>
                )}
              </div>
              {pl.id !== '__liked__' && renaming !== pl.id && (
                <PlaylistMenu
                  onRename={e => { e.stopPropagation(); setRenaming(pl.id); setRenameText(pl.name); }}
                  onDelete={e => { e.stopPropagation(); deletePlaylist(pl.id); }}
                />
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
        ) : (
          <div className="text-center py-16">
            <Download size={24} className="text-white/10 mx-auto mb-3" />
            <p className="text-[13px] text-white/25">No downloads</p>
            <p className="text-[11px] text-white/15 mt-1">Download songs for offline access</p>
          </div>
        )
      )}

      {/* History */}
      {tab === 'history' && !openPlaylist && (
        history.length > 0 ? (
          <div className="animate-in">
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => { const s = [...history.slice(0, 30)].sort(() => Math.random() - 0.5); playSong(s[0], s); }}
                className="flex items-center gap-2 px-4 py-2 bg-white text-black text-[12px] font-bold rounded-full shadow-md active:scale-95 transition-all">
                <Shuffle size={12} /> Shuffle
              </button>
              <span className="text-[11px] text-white/25">{history.length} songs</span>
            </div>
            <div className="rounded-2xl border border-white/[0.04] overflow-hidden">
              {history.slice(0, 50).map((s, i) => <SongRow key={`${s.id}-${i}`} song={s} index={i} songList={history} />)}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <Clock size={24} className="text-white/10 mx-auto mb-3" />
            <p className="text-[13px] text-white/25">No history</p>
            <p className="text-[11px] text-white/15 mt-1">Songs you play will show here</p>
          </div>
        )
      )}

      {/* Stats */}
      {tab === 'stats' && !openPlaylist && (
        prefs && prefs.totalPlays > 0 ? (
          <div className="animate-in space-y-3">
            {/* Hero Stat */}
            <div className="relative overflow-hidden rounded-2xl p-5 border border-white/[0.06]" style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #15102a 50%, #0d0620 100%)' }}>
              <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-fuchsia-500/[0.08] rounded-full blur-[50px]" />
              <div className="absolute bottom-[-20%] left-[-10%] w-28 h-28 bg-violet-500/[0.06] rounded-full blur-[40px]" />
              <div className="relative flex items-end justify-between">
                <div>
                  <p className="text-[10px] text-fuchsia-300/60 uppercase tracking-wider font-medium">Total Plays</p>
                  <p className="text-[36px] font-black text-white leading-none mt-1">{prefs.totalPlays}</p>
                </div>
                <div className="flex gap-4">
                  <div className="text-right">
                    <p className="text-[18px] font-bold text-white">{likedSongs_full.length}</p>
                    <p className="text-[9px] text-white/30">Liked</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[18px] font-bold text-white">{downloadedFromHistory.length}</p>
                    <p className="text-[9px] text-white/30">Saved</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Artists */}
            {prefs.topArtists?.length > 0 && (
              <div className="rounded-2xl p-4 bg-white/[0.02] border border-white/[0.05]">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy size={13} className="text-amber-400" />
                  <p className="text-[12px] text-white/60 font-semibold">Most Played</p>
                </div>
                <div className="space-y-3">
                  {prefs.topArtists.slice(0, 5).map((a, i) => {
                    const name = typeof a === 'string' ? a : a.name;
                    const widths = ['w-full', 'w-4/5', 'w-3/5', 'w-2/5', 'w-1/4'];
                    return (
                      <div key={name || i} className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${
                          i === 0 ? 'bg-amber-500/15 text-amber-400' : i === 1 ? 'bg-white/[0.06] text-white/40' : i === 2 ? 'bg-orange-500/10 text-orange-300' : 'bg-white/[0.03] text-white/20'
                        }`}>{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] text-white/80 font-medium truncate">{name}</p>
                          <div className="mt-1 h-1 rounded-full bg-white/[0.04] overflow-hidden">
                            <div className={`h-full rounded-full ${i === 0 ? 'bg-gradient-to-r from-fuchsia-500 to-violet-400' : i === 1 ? 'bg-white/20' : i === 2 ? 'bg-white/15' : 'bg-white/10'} ${widths[i]}`} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <BarChart3 size={24} className="text-white/10 mx-auto mb-3" />
            <p className="text-[13px] text-white/25">No stats yet</p>
            <p className="text-[11px] text-white/15 mt-1">Play songs to see your stats</p>
          </div>
        )
      )}
    </div>
  );
}

function PlaylistMenu({ onRename, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  return (
    <div ref={ref} className="relative" onClick={e => e.stopPropagation()}>
      <button onClick={() => setOpen(!open)} className="w-8 h-8 rounded-full flex items-center justify-center text-white/20 hover:text-white/50 hover:bg-white/[0.06] active:scale-90 transition-all">
        <MoreVertical size={14} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-32 bg-[#1a1a1d] rounded-xl border border-white/[0.08] shadow-2xl overflow-hidden z-50 animate-scale">
          <button onClick={e => { onRename(e); setOpen(false); }} className="flex items-center gap-2 w-full px-3.5 py-2.5 text-[11px] text-white/60 hover:bg-white/[0.05] transition-colors">
            <Pencil size={11} /> Rename
          </button>
          <button onClick={e => { onDelete(e); setOpen(false); }} className="flex items-center gap-2 w-full px-3.5 py-2.5 text-[11px] text-red-400 hover:bg-red-500/5 transition-colors border-t border-white/[0.04]">
            <Trash2 size={11} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}
