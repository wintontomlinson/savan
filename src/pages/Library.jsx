import { useState, useMemo, useEffect } from 'react';
import { Clock, BarChart3, Music, Trophy, Download, Plus, ListMusic, Play, Trash2, Pencil, Check, X } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { getHistory, analyzePreferences } from '../data/algorithm';
import SongRow from '../components/SongRow';

export default function Library() {
  const { downloadedSongs, playSong, likedSongs } = usePlayer();
  const [tab, setTab] = useState('playlists');
  const [playlists, setPlaylists] = useState(() => { try { return JSON.parse(localStorage.getItem('ma_playlists')) || []; } catch { return []; } });
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [renaming, setRenaming] = useState(null); // playlist id being renamed
  const [renameText, setRenameText] = useState('');
  const [openPlaylist, setOpenPlaylist] = useState(null); // playlist id to view songs
  const history = useMemo(() => getHistory(), []);
  const prefs = useMemo(() => analyzePreferences(), []);
  const downloadedFromHistory = useMemo(() => { try { return JSON.parse(localStorage.getItem('ma_downloaded_songs')) || []; } catch { return []; } }, [downloadedSongs]);

  // Liked songs auto-playlist — sync from localStorage
  const likedSongs_full = useMemo(() => { try { return JSON.parse(localStorage.getItem('ma_liked_songs')) || []; } catch { return []; } }, [likedSongs]);

  // Ensure "Liked Songs" playlist exists and stays synced
  useEffect(() => {
    setPlaylists(prev => {
      const likedPl = prev.find(p => p.id === '__liked__');
      if (!likedPl) {
        return [{ id: '__liked__', name: 'Liked Songs', songs: likedSongs_full, created: Date.now(), auto: true }, ...prev];
      }
      return prev.map(p => p.id === '__liked__' ? { ...p, songs: likedSongs_full } : p);
    });
  }, [likedSongs_full]);

  // Save playlists
  useEffect(() => { try { localStorage.setItem('ma_playlists', JSON.stringify(playlists)); } catch {} }, [playlists]);

  const createPlaylist = () => {
    if (!newName.trim()) return;
    const pl = { id: Date.now().toString(), name: newName.trim(), songs: [], created: Date.now() };
    setPlaylists(p => [...p, pl]);
    setNewName('');
    setShowCreate(false);
  };

  const deletePlaylist = (id) => {
    if (id === '__liked__') return; // can't delete liked
    setPlaylists(p => p.filter(pl => pl.id !== id));
  };

  const renamePlaylist = (id) => {
    if (!renameText.trim()) { setRenaming(null); return; }
    setPlaylists(p => p.map(pl => pl.id === id ? { ...pl, name: renameText.trim() } : pl));
    setRenaming(null);
    setRenameText('');
  };

  const tabs = [
    { id: 'playlists', label: 'Playlists', icon: ListMusic, count: playlists.length },
    { id: 'downloads', label: 'Downloads', icon: Download, count: downloadedFromHistory.length },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
  ];

  const viewingPlaylist = openPlaylist ? playlists.find(p => p.id === openPlaylist) : null;

  return (
    <div className="pb-6 pt-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[22px] sm:text-[26px] font-bold text-white">Library</h1>
          <p className="text-[12px] text-white/30 mt-0.5">{playlists.length} playlists • {history.length} played</p>
        </div>
        {tab === 'playlists' && !openPlaylist && (
          <button onClick={() => setShowCreate(true)} className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.1] transition-colors active:scale-90 border border-white/[0.05]">
            <Plus size={18} className="text-white/70" />
          </button>
        )}
        {openPlaylist && (
          <button onClick={() => setOpenPlaylist(null)} className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.1] transition-colors active:scale-90">
            <X size={18} className="text-white/70" />
          </button>
        )}
      </div>

      {/* Tabs */}
      {!openPlaylist && (
        <div className="flex gap-2 mb-6 scroll-x pb-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[12px] font-semibold whitespace-nowrap shrink-0 transition-all duration-300 ${
                tab === t.id
                  ? 'bg-white text-black shadow-lg shadow-white/10'
                  : 'bg-white/[0.04] text-white/50 hover:bg-white/[0.08] hover:text-white/70 border border-white/[0.04]'
              }`}>
              <t.icon size={13} />
              {t.label}
              {t.count > 0 && <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${tab === t.id ? 'bg-black/10' : 'bg-white/10'}`}>{t.count}</span>}
            </button>
          ))}
        </div>
      )}

      {/* Create Playlist Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-6" onClick={() => setShowCreate(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-[#141414] border border-white/[0.08] rounded-3xl p-6 w-full max-w-[320px] animate-scale" onClick={e => e.stopPropagation()}>
            <h3 className="text-[16px] font-bold text-white mb-4">New Playlist</h3>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') createPlaylist(); }}
              placeholder="Playlist name..."
              className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-3 text-[14px] text-white placeholder:text-white/30 focus:outline-none focus:border-rose-500/30 transition-colors"
              autoFocus
            />
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl bg-white/[0.06] text-[13px] text-white/60 font-medium hover:bg-white/[0.1] transition-colors active:scale-95">
                Cancel
              </button>
              <button onClick={createPlaylist} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-[13px] text-white font-bold shadow-lg shadow-rose-500/20 transition-all active:scale-95">
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Viewing Playlist Songs */}
      {openPlaylist && viewingPlaylist && (
        <div className="animate-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-rose-500/20 to-purple-500/10 flex items-center justify-center">
              <ListMusic size={22} className="text-rose-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-[18px] font-bold text-white truncate">{viewingPlaylist.name}</h2>
              <p className="text-[12px] text-white/30">{viewingPlaylist.songs.length} songs</p>
            </div>
            {viewingPlaylist.songs.length > 0 && (
              <button onClick={() => { const s = [...viewingPlaylist.songs].sort(() => Math.random() - 0.5); playSong(s[0], s); }}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 rounded-full text-[12px] text-white font-bold shadow-lg shadow-rose-500/25 active:scale-95 transition-all">
                <Play size={13} fill="white" /> Play
              </button>
            )}
          </div>
          {viewingPlaylist.songs.length > 0 ? (
            <div className="bg-[#0a0a0a] rounded-2xl overflow-hidden border border-white/[0.04]">
              {viewingPlaylist.songs.map((s, i) => <SongRow key={s.id} song={s} index={i} songList={viewingPlaylist.songs} />)}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-[13px] text-white/30">No songs in this playlist</p>
              <p className="text-[11px] text-white/20 mt-1">Like songs to add them here</p>
            </div>
          )}
        </div>
      )}

      {/* Playlists List */}
      {tab === 'playlists' && !openPlaylist && (
        <div className="animate-in">
          {playlists.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-rose-500/10 to-purple-500/5 rounded-2xl flex items-center justify-center border border-rose-500/10">
                <ListMusic size={28} className="text-rose-400/60" />
              </div>
              <p className="text-[14px] text-white font-medium">No playlists yet</p>
              <p className="text-[12px] text-white/30 mt-1 mb-4">Like songs to auto-create your playlist</p>
              <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 rounded-full text-[12px] text-white font-bold shadow-lg shadow-rose-500/20 active:scale-95 transition-all">
                <Plus size={14} /> Create Playlist
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {playlists.map(pl => (
                <div key={pl.id} onClick={() => setOpenPlaylist(pl.id)} className="flex items-center gap-3 p-3 bg-white/[0.03] hover:bg-white/[0.05] rounded-2xl border border-white/[0.04] transition-all duration-200 group cursor-pointer">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${pl.id === '__liked__' ? 'bg-gradient-to-br from-rose-500/25 to-pink-500/15' : 'bg-gradient-to-br from-violet-500/20 to-purple-500/10'}`}>
                    {pl.id === '__liked__' ? <Music size={18} className="text-rose-400" /> : <ListMusic size={18} className="text-violet-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    {renaming === pl.id ? (
                      <div className="flex items-center gap-2">
                        <input value={renameText} onChange={e => setRenameText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') renamePlaylist(pl.id); }}
                          className="flex-1 bg-white/[0.06] border border-white/[0.1] rounded-lg px-2 py-1 text-[13px] text-white focus:outline-none" autoFocus onClick={e => e.stopPropagation()} />
                        <button onClick={e => { e.stopPropagation(); renamePlaylist(pl.id); }} className="text-emerald-400"><Check size={14} /></button>
                        <button onClick={e => { e.stopPropagation(); setRenaming(null); }} className="text-white/30"><X size={14} /></button>
                      </div>
                    ) : (
                      <>
                        <p className="text-[14px] font-semibold text-white truncate">{pl.name}</p>
                        <p className="text-[11px] text-white/30">{pl.songs.length} songs</p>
                      </>
                    )}
                  </div>
                  {pl.songs.length > 0 && (
                    <button onClick={e => { e.stopPropagation(); const s = [...pl.songs].sort(() => Math.random() - 0.5); playSong(s[0], s); }}
                      className="w-9 h-9 rounded-full bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/20 active:scale-90 transition-all opacity-0 group-hover:opacity-100">
                      <Play size={13} className="text-white ml-0.5" fill="white" />
                    </button>
                  )}
                  {pl.id !== '__liked__' && (
                    <>
                      <button onClick={e => { e.stopPropagation(); setRenaming(pl.id); setRenameText(pl.name); }} className="w-8 h-8 rounded-full flex items-center justify-center text-white/20 hover:text-white/60 hover:bg-white/[0.06] transition-all active:scale-90 opacity-0 group-hover:opacity-100">
                        <Pencil size={13} />
                      </button>
                      <button onClick={e => { e.stopPropagation(); deletePlaylist(pl.id); }} className="w-8 h-8 rounded-full flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all active:scale-90 opacity-0 group-hover:opacity-100">
                        <Trash2 size={13} />
                      </button>
                    </>
                  )}
                </div>
              ))}
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
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 rounded-full text-[12px] text-white font-bold shadow-lg shadow-rose-500/25 active:scale-95 transition-all">
                <Play size={13} fill="white" /> Shuffle Play
              </button>
              <span className="text-[11px] text-white/30">{downloadedFromHistory.length} songs</span>
            </div>
            <div className="bg-[#0a0a0a] rounded-2xl overflow-hidden border border-white/[0.04]">
              {downloadedFromHistory.map((s, i) => <SongRow key={s.id} song={s} index={i} songList={downloadedFromHistory} />)}
            </div>
          </div>
        ) : (
          <EmptyState icon={Download} text="No downloads yet" sub="Tap download on songs to save them" />
        )
      )}

      {/* History */}
      {tab === 'history' && !openPlaylist && (
        history.length > 0 ? (
          <div className="animate-in">
            <div className="bg-[#0a0a0a] rounded-2xl overflow-hidden border border-white/[0.04]">
              {history.slice(0, 50).map((s, i) => <SongRow key={`${s.id}-${i}`} song={s} index={i} songList={history} />)}
            </div>
          </div>
        ) : (
          <EmptyState icon={Clock} text="No history yet" sub="Start playing songs" />
        )
      )}

      {/* Stats */}
      {tab === 'stats' && !openPlaylist && (
        prefs ? (
          <div className="space-y-3 animate-in">
            <div className="bg-gradient-to-br from-rose-500/10 to-purple-500/5 rounded-2xl p-5 border border-rose-500/10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-rose-500/20 rounded-xl flex items-center justify-center">
                  <Music size={20} className="text-rose-400" />
                </div>
                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider font-medium">Total Played</p>
                  <p className="text-[32px] font-bold text-white leading-none">{prefs.totalPlays}</p>
                </div>
              </div>
            </div>
            <div className="bg-[#0a0a0a] rounded-2xl p-5 border border-white/[0.04]">
              <div className="flex items-center gap-2 mb-4">
                <Trophy size={15} className="text-amber-400" />
                <p className="text-[14px] text-white font-bold">Top Artists</p>
              </div>
              <div className="space-y-3">
                {prefs.topArtists.map((a, i) => (
                  <div key={typeof a === 'string' ? a : i} className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      i === 0 ? 'bg-amber-500/20 text-amber-400' : i === 1 ? 'bg-gray-400/20 text-gray-400' : i === 2 ? 'bg-orange-500/20 text-orange-400' : 'bg-white/[0.04] text-white/30'
                    }`}>{i + 1}</span>
                    <span className="text-[14px] text-white flex-1 font-medium">{typeof a === 'string' ? a : a.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <EmptyState icon={BarChart3} text="Not enough data" sub="Play more songs to see stats" />
        )
      )}
    </div>
  );
}

function EmptyState({ icon: Icon, text, sub }) {
  return (
    <div className="text-center py-16 animate-in">
      <div className="w-16 h-16 mx-auto mb-4 bg-white/[0.03] rounded-2xl flex items-center justify-center border border-white/[0.04]">
        <Icon size={28} className="text-white/20" />
      </div>
      <p className="text-[14px] text-white font-medium">{text}</p>
      <p className="text-[12px] text-white/30 mt-1">{sub}</p>
    </div>
  );
}
