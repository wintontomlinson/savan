import { useState, useMemo, useEffect, useRef } from 'react';
import { Clock, Download, Plus, ListMusic, Play, Trash2, Pencil, Check, X, Heart, Shuffle, Music, MoreVertical, BarChart3, Trophy, Sparkles, RotateCcw } from 'lucide-react';
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
    { id: 'playlists', label: 'Playlists', icon: ListMusic },
    { id: 'liked', label: 'Liked', icon: Heart },
    { id: 'downloads', label: 'Downloads', icon: Download },
    { id: 'history', label: 'History', icon: Clock },
  ];

  const viewingPlaylist = openPlaylist ? playlists.find(p => p.id === openPlaylist) : null;

  return (
    <div className="pb-6 pt-3">
      {/* Header */}
      {!openPlaylist && (
        <div className="animate-in mb-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-[24px] font-bold text-white tracking-tight">Library</h1>
              <p className="text-[11px] text-white/30 mt-0.5">Your music, organized</p>
            </div>
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-rose-500 to-fuchsia-500 text-white text-[11px] font-bold shadow-lg shadow-fuchsia-500/15 hover:shadow-fuchsia-500/25 hover:scale-[1.04] active:scale-95 transition-all">
              <Plus size={12} /> New Playlist
            </button>
          </div>

          {/* Tabs - Clean Pill Style */}
          <div className="flex gap-2 overflow-x-auto scroll-x pb-2">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex shrink-0 items-center gap-2 px-4 py-2.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all duration-200 ${
                  tab === t.id
                    ? 'bg-white text-black shadow-md shadow-white/10'
                    : 'bg-white/[0.04] text-white/40 hover:bg-white/[0.07] hover:text-white/70'
                }`}>
                <t.icon size={14} />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Back Button */}
      {openPlaylist && (
        <button onClick={() => setOpenPlaylist(null)} className="flex items-center gap-1.5 mb-5 text-[12px] text-white/40 hover:text-white/70 transition-colors active:scale-95">
          <RotateCcw size={12} /> Back
        </button>
      )}

      {/* Create Playlist Modal */}
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

      {/* Playlist Detail View */}
      {openPlaylist && viewingPlaylist && (
        <div className="animate-in">
          <div className="flex items-center gap-3 mb-5">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${viewingPlaylist.id === '__liked__' ? 'bg-rose-500/15' : 'bg-violet-500/15'}`}>
              {viewingPlaylist.id === '__liked__' ? <Heart size={24} className="text-rose-400" /> : <ListMusic size={24} className="text-violet-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-[18px] font-bold text-white truncate">{viewingPlaylist.name}</h2>
              <p className="text-[11px] text-white/30">{viewingPlaylist.songs.length} songs</p>
            </div>
            {viewingPlaylist.songs.length > 0 && (
              <button onClick={() => { const s = [...viewingPlaylist.songs].sort(() => Math.random() - 0.5); playSong(s[0], s); }}
                className="flex items-center gap-2 px-4 py-2.5 bg-white text-black rounded-full text-[12px] font-bold shadow-md active:scale-95 transition-all">
                <Shuffle size={12} /> Shuffle
              </button>
            )}
            {viewingPlaylist.songs.length > 0 && (
              <button onClick={() => playSong(viewingPlaylist.songs[0], viewingPlaylist.songs)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white text-[12px] font-bold rounded-full shadow-lg shadow-fuchsia-500/20 hover:shadow-fuchsia-500/30 active:scale-95 transition-all">
                <Play size={12} /> Play
              </button>
            )}
          </div>
          {viewingPlaylist.songs.length > 0 ? (
            <div className="rounded-2xl border border-white/[0.04] overflow-hidden bg-[#0c0c0c]">
              {viewingPlaylist.songs.map((s, i) => <SongRow key={s.id} song={s} index={i} songList={viewingPlaylist.songs} />)}
            </div>
          ) : (
            <div className="text-center py-16">
              <Music size={24} className="text-white/10 mx-auto mb-3" />
              <p className="text-[13px] text-white/25">No songs yet</p>
              <p className="text-[11px] text-white/15 mt-1">{viewingPlaylist.id === '__liked__' ? 'Like songs to add them here' : 'Add songs from search or explore'}</p>
            </div>
          )}
        </div>
      )}

      {/* Playlists Tab */}
      {tab === 'playlists' && !openPlaylist && (
        <div className="space-y-2 animate-in">
          {playlists.map(pl => (
            <div key={pl.id} onClick={() => setOpenPlaylist(pl.id)}
              className="group flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-all cursor-pointer">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${pl.id === '__liked__' ? 'bg-rose-500/15' : 'bg-violet-500/15'}`}>
                {pl.id === '__liked__' ? <Heart size={18} className="text-rose-400" /> : <ListMusic size={18} className="text-violet-400" />}
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
                    <p className="text-[10px] text-white/25">{pl.songs.length} songs {pl.auto && '· Auto'}</p>
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
          
          {playlists.length === 0 && (
            <div className="text-center py-12">
              <Music size={24} className="text-white/10 mx-auto mb-3" />
              <p className="text-[13px] text-white/25">No playlists yet</p>
              <p className="text-[11px] text-white/15 mt-1">Create your first playlist</p>
            </div>
          )}
        </div>
      )}

      {/* Liked Songs Tab */}
      {tab === 'liked' && !openPlaylist && (
        likedSongs_full.length > 0 ? (
          <>
            <div className="animate-in mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => { const s = [...likedSongs_full].sort(() => Math.random() - 0.5); playSong(s[0], s); }}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-black text-[12px] font-bold rounded-full shadow-md active:scale-95 transition-all">
                  <Shuffle size={12} /> Shuffle
                </button>
                <button onClick={() => playSong(likedSongs_full[0], likedSongs_full)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white text-[12px] font-bold rounded-full shadow-lg shadow-rose-500/20 hover:shadow-rose-500/30 active:scale-95 transition-all">
                  <Play size={12} /> Play
                </button>
              </div>
              <span className="text-[11px] text-white/25">{likedSongs_full.length} songs</span>
            </div>
            <div className="rounded-2xl border border-white/[0.04] overflow-hidden bg-[#0c0c0c]">
              {likedSongs_full.map((s, i) => <SongRow key={s.id} song={s} index={i} songList={likedSongs_full} />)}
            </div>
          </>
        ) : (
          <div className="text-center py-16 animate-in">
            <Heart size={24} className="text-rose-400/30 mx-auto mb-3" />
            <p className="text-[13px] text-white/25">No liked songs yet</p>
            <p className="text-[11px] text-white/15 mt-1">Tap the heart on any song to add it here</p>
          </div>
        )
      )}

      {/* Downloads Tab */}
      {tab === 'downloads' && !openPlaylist && (
        downloadedFromHistory.length > 0 ? (
          <div className="animate-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button onClick={() => { const s = [...downloadedFromHistory].sort(() => Math.random() - 0.5); playSong(s[0], s); }}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-black text-[12px] font-bold rounded-full shadow-md active:scale-95 transition-all">
                  <Shuffle size={12} /> Shuffle
                </button>
                <button onClick={() => playSong(downloadedFromHistory[0], downloadedFromHistory)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-[12px] font-bold rounded-full shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-95 transition-all">
                  <Play size={12} /> Play
                </button>
              </div>
              <span className="text-[11px] text-white/25">{downloadedFromHistory.length} songs</span>
            </div>
            <div className="rounded-2xl border border-white/[0.04] overflow-hidden bg-[#0c0c0c]">
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

      {/* History Tab */}
      {tab === 'history' && !openPlaylist && (
        history.length > 0 ? (
          <div className="animate-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button onClick={() => { const s = history.slice(0, 50).sort(() => Math.random() - 0.5); playSong(s[0], s); }}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-black text-[12px] font-bold rounded-full shadow-md active:scale-95 transition-all">
                  <Shuffle size={12} /> Shuffle
                </button>
                <button onClick={() => playSong(history[0], history)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[12px] font-bold rounded-full shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 active:scale-95 transition-all">
                  <Play size={12} /> Play Recent
                </button>
              </div>
              <span className="text-[11px] text-white/25">{history.length} songs</span>
            </div>
            <div className="rounded-2xl border border-white/[0.04] overflow-hidden bg-[#0c0c0c]">
              {history.slice(0, 100).map((s, i) => <SongRow key={`${s.id}-${i}`} song={s} index={i} songList={history} />)}
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

      {/* Stats Tab - Clean & Visual */}
      {tab === 'stats' && !openPlaylist && (
        prefs && prefs.totalPlays > 0 ? (
          <div className="animate-in space-y-4">
            {/* Hero Stats Card */}
            <div className="relative overflow-hidden rounded-2xl p-5 border border-white/[0.06]" style={{ background: 'linear-gradient(135deg, #0f0818 0%, #1a0a2e 50%, #0f0818 100%)' }}>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(225,29,72,0.08)_0%,_transparent_70%)]" />
              <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  <p className="text-[10px] text-rose-300/60 uppercase tracking-wider font-medium">Total Plays</p>
                  <p className="text-[40px] sm:text-[48px] font-black text-white leading-none mt-1">{prefs.totalPlays.toLocaleString()}</p>
                  <p className="text-[10px] text-white/30 mt-2">Listening since {new Date(prefs.firstPlay || Date.now()).getFullYear()}</p>
                </div>
                <div className="flex gap-4 sm:gap-6">
                  <div className="text-center">
                    <p className="text-[20px] font-bold text-white">{likedSongs_full.length}</p>
                    <p className="text-[9px] text-white/30 mt-0.5">Liked</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[20px] font-bold text-white">{downloadedFromHistory.length}</p>
                    <p className="text-[9px] text-white/30 mt-0.5">Downloaded</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[20px] font-bold text-white">{history.length}</p>
                    <p className="text-[9px] text-white/30 mt-0.5">History</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Artists */}
            {prefs.topArtists?.length > 0 && (
              <div className="rounded-2xl p-4 bg-white/[0.02] border border-white/[0.05]">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy size={14} className="text-amber-400" />
                  <p className="text-[12px] text-white/60 font-semibold">Most Played Artists</p>
                </div>
                <div className="space-y-3">
                  {prefs.topArtists.slice(0, 8).map((a, i) => {
                    const name = typeof a === 'string' ? a : a.name;
                    const widths = ['w-full', 'w-4/5', 'w-3/5', 'w-2/5', 'w-1/3', 'w-1/4', 'w-1/5', 'w-1/6'];
                    return (
                      <div key={name || i} className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          i === 0 ? 'bg-amber-500/15 text-amber-400' : i === 1 ? 'bg-white/[0.06] text-white/40' : i === 2 ? 'bg-orange-500/10 text-orange-300' : 'bg-white/[0.03] text-white/20'
                        }`}>{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] text-white/80 font-medium truncate">{name}</p>
                          <div className="mt-1 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                            <div className={`h-full rounded-full ${i === 0 ? 'bg-gradient-to-r from-rose-500 to-fuchsia-400' : i === 1 ? 'bg-white/20' : i === 2 ? 'bg-white/15' : 'bg-white/10'} ${widths[i] || 'w-1/6'}`} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Top Genres/Moods from history */}
            {prefs.topGenres?.length > 0 && (
              <div className="rounded-2xl p-4 bg-white/[0.02] border border-white/[0.05]">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={14} className="text-rose-400" />
                  <p className="text-[12px] text-white/60 font-semibold">Your Vibe</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {prefs.topGenres.slice(0, 6).map(g => (
                    <span key={g} className="px-3 py-1.5 rounded-full bg-white/[0.05] text-white/60 text-[10px] font-medium border border-white/[0.05]">{g}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <BarChart3 size={24} className="text-white/10 mx-auto mb-3" />
            <p className="text-[13px] text-white/25">No stats yet</p>
            <p className="text-[11px] text-white/15 mt-1">Play songs to see your listening insights</p>
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
        <div className="absolute right-0 top-full mt-1 w-36 bg-[#1a1a1d] rounded-xl border border-white/[0.08] shadow-2xl overflow-hidden z-50 animate-scale">
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