import { useState, useMemo, useEffect } from 'react';
import { Clock, BarChart3, Music, Trophy, Download, Plus, ListMusic, Play, Trash2, Pencil, Check, X, Heart, Shuffle } from 'lucide-react';
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
      if (!likedPl) {
        return [{ id: '__liked__', name: 'Liked Songs', songs: likedSongs_full, created: Date.now(), auto: true }, ...prev];
      }
      return prev.map(p => p.id === '__liked__' ? { ...p, songs: likedSongs_full } : p);
    });
  }, [likedSongs_full]);

  useEffect(() => { try { localStorage.setItem('ma_playlists', JSON.stringify(playlists)); } catch {} }, [playlists]);

  const createPlaylist = () => {
    if (!newName.trim()) return;
    const pl = { id: Date.now().toString(), name: newName.trim(), songs: [], created: Date.now() };
    setPlaylists(p => [...p, pl]);
    setNewName('');
    setShowCreate(false);
  };

  const deletePlaylist = (id) => {
    if (id === '__liked__') return;
    setPlaylists(p => p.filter(pl => pl.id !== id));
  };

  const renamePlaylist = (id) => {
    if (!renameText.trim()) { setRenaming(null); return; }
    setPlaylists(p => p.map(pl => pl.id === id ? { ...pl, name: renameText.trim() } : pl));
    setRenaming(null);
    setRenameText('');
  };

  const tabs = [
    { id: 'playlists', label: 'Playlists', icon: ListMusic },
    { id: 'downloads', label: 'Downloads', icon: Download },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
  ];

  const viewingPlaylist = openPlaylist ? playlists.find(p => p.id === openPlaylist) : null;

  return (
    <div className="pb-6 pt-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] font-bold text-white tracking-tight">Your Library</h1>
          <p className="text-[12px] text-white/40 mt-0.5">{history.length} songs played</p>
        </div>
        {tab === 'playlists' && !openPlaylist && (
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.06] transition-all active:scale-95">
            <Plus size={14} className="text-white/70" />
            <span className="text-[12px] text-white/70 font-medium">New</span>
          </button>
        )}
        {openPlaylist && (
          <button onClick={() => setOpenPlaylist(null)} className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.1] transition-colors active:scale-90">
            <X size={16} className="text-white/70" />
          </button>
        )}
      </div>

      {/* Tabs */}
      {!openPlaylist && (
        <div className="flex gap-1.5 mb-6 p-1 bg-white/[0.03] rounded-2xl border border-white/[0.04]">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[12px] font-semibold flex-1 justify-center transition-all duration-300 ${
                tab === t.id
                  ? 'bg-white/[0.1] text-white shadow-sm'
                  : 'text-white/40 hover:text-white/60'
              }`}>
              <t.icon size={13} />
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Create Playlist Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-6" onClick={() => setShowCreate(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
          <div className="relative bg-[#161618] border border-white/[0.08] rounded-3xl p-6 w-full max-w-[340px] animate-scale shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-[18px] font-bold text-white mb-1">Create Playlist</h3>
            <p className="text-[12px] text-white/35 mb-5">Give your playlist a name</p>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') createPlaylist(); }}
              placeholder="My Playlist..."
              className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-3.5 text-[14px] text-white placeholder:text-white/25 focus:outline-none focus:border-white/[0.15] focus:bg-white/[0.08] transition-all"
              autoFocus
            />
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowCreate(false)} className="flex-1 py-3 rounded-xl bg-white/[0.06] text-[13px] text-white/60 font-medium hover:bg-white/[0.1] transition-colors active:scale-95">
                Cancel
              </button>
              <button onClick={createPlaylist} className="flex-1 py-3 rounded-xl bg-white text-[13px] text-black font-bold transition-all active:scale-95 hover:bg-white/90">
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Viewing Playlist Songs */}
      {openPlaylist && viewingPlaylist && (
        <div className="animate-in">
          <div className="flex items-center gap-4 mb-5 p-4 bg-gradient-to-r from-white/[0.04] to-transparent rounded-2xl border border-white/[0.04]">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${
              viewingPlaylist.id === '__liked__'
                ? 'bg-gradient-to-br from-rose-500/30 to-pink-600/20'
                : 'bg-gradient-to-br from-violet-500/25 to-purple-600/15'
            }`}>
              {viewingPlaylist.id === '__liked__' ? <Heart size={24} className="text-rose-400" /> : <ListMusic size={24} className="text-violet-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-[20px] font-bold text-white truncate">{viewingPlaylist.name}</h2>
              <p className="text-[12px] text-white/35">{viewingPlaylist.songs.length} songs</p>
            </div>
            {viewingPlaylist.songs.length > 0 && (
              <button onClick={() => { const s = [...viewingPlaylist.songs].sort(() => Math.random() - 0.5); playSong(s[0], s); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-[12px] font-bold rounded-full shadow-lg active:scale-95 transition-all">
                <Shuffle size={13} /> Shuffle
              </button>
            )}
          </div>
          {viewingPlaylist.songs.length > 0 ? (
            <div className="rounded-2xl overflow-hidden border border-white/[0.04]">
              {viewingPlaylist.songs.map((s, i) => <SongRow key={s.id} song={s} index={i} songList={viewingPlaylist.songs} />)}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-[13px] text-white/30">No songs yet</p>
              <p className="text-[11px] text-white/20 mt-1">Like songs or add them to this playlist</p>
            </div>
          )}
        </div>
      )}

      {/* Playlists */}
      {tab === 'playlists' && !openPlaylist && (
        <div className="animate-in">
          {playlists.length === 0 ? (
            <EmptyState icon={ListMusic} text="No playlists yet" sub="Create a playlist to organize your music" action={() => setShowCreate(true)} actionText="Create Playlist" />
          ) : (
            <div className="space-y-2">
              {playlists.map(pl => (
                <div key={pl.id} onClick={() => setOpenPlaylist(pl.id)}
                  className="flex items-center gap-3.5 p-3.5 bg-white/[0.02] hover:bg-white/[0.05] rounded-2xl border border-white/[0.04] hover:border-white/[0.07] transition-all duration-200 group cursor-pointer">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    pl.id === '__liked__'
                      ? 'bg-gradient-to-br from-rose-500/25 to-pink-500/15'
                      : 'bg-gradient-to-br from-violet-500/20 to-indigo-500/10'
                  }`}>
                    {pl.id === '__liked__' ? <Heart size={18} className="text-rose-400" /> : <ListMusic size={18} className="text-violet-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    {renaming === pl.id ? (
                      <div className="flex items-center gap-2">
                        <input value={renameText} onChange={e => setRenameText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') renamePlaylist(pl.id); }}
                          className="flex-1 bg-white/[0.08] border border-white/[0.12] rounded-lg px-3 py-1.5 text-[13px] text-white focus:outline-none" autoFocus onClick={e => e.stopPropagation()} />
                        <button onClick={e => { e.stopPropagation(); renamePlaylist(pl.id); }} className="text-emerald-400 hover:text-emerald-300"><Check size={15} /></button>
                        <button onClick={e => { e.stopPropagation(); setRenaming(null); }} className="text-white/30 hover:text-white/60"><X size={15} /></button>
                      </div>
                    ) : (
                      <>
                        <p className="text-[14px] font-semibold text-white truncate">{pl.name}</p>
                        <p className="text-[11px] text-white/30 mt-0.5">{pl.songs.length} songs</p>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {pl.songs.length > 0 && (
                      <button onClick={e => { e.stopPropagation(); const s = [...pl.songs].sort(() => Math.random() - 0.5); playSong(s[0], s); }}
                        className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-md active:scale-90 transition-all">
                        <Play size={13} className="text-black ml-0.5" fill="black" />
                      </button>
                    )}
                    {pl.id !== '__liked__' && (
                      <>
                        <button onClick={e => { e.stopPropagation(); setRenaming(pl.id); setRenameText(pl.name); }} className="w-8 h-8 rounded-full flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/[0.06] transition-all">
                          <Pencil size={13} />
                        </button>
                        <button onClick={e => { e.stopPropagation(); deletePlaylist(pl.id); }} className="w-8 h-8 rounded-full flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-all">
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
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
            <div className="flex items-center gap-3 mb-5">
              <button onClick={() => { const s = [...downloadedFromHistory].sort(() => Math.random() - 0.5); playSong(s[0], s); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-[12px] font-bold rounded-full shadow-lg active:scale-95 transition-all">
                <Shuffle size={13} /> Shuffle Play
              </button>
              <span className="text-[12px] text-white/30">{downloadedFromHistory.length} songs</span>
            </div>
            <div className="rounded-2xl overflow-hidden border border-white/[0.04]">
              {downloadedFromHistory.map((s, i) => <SongRow key={s.id} song={s} index={i} songList={downloadedFromHistory} />)}
            </div>
          </div>
        ) : (
          <EmptyState icon={Download} text="No downloads yet" sub="Download songs to listen offline" />
        )
      )}

      {/* History */}
      {tab === 'history' && !openPlaylist && (
        history.length > 0 ? (
          <div className="animate-in">
            <div className="flex items-center gap-3 mb-5">
              <button onClick={() => { const s = [...history.slice(0, 50)].sort(() => Math.random() - 0.5); playSong(s[0], s); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-[12px] font-bold rounded-full shadow-lg active:scale-95 transition-all">
                <Shuffle size={13} /> Shuffle
              </button>
              <span className="text-[12px] text-white/30">{history.length} songs</span>
            </div>
            <div className="rounded-2xl overflow-hidden border border-white/[0.04]">
              {history.slice(0, 50).map((s, i) => <SongRow key={`${s.id}-${i}`} song={s} index={i} songList={history} />)}
            </div>
          </div>
        ) : (
          <EmptyState icon={Clock} text="No history yet" sub="Start playing songs to build your history" />
        )
      )}

      {/* Stats */}
      {tab === 'stats' && !openPlaylist && (
        prefs ? (
          <div className="space-y-4 animate-in">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Songs Played" value={prefs.totalPlays} icon={Music} color="rose" />
              <StatCard label="Artists" value={prefs.topArtists?.length || 0} icon={Trophy} color="amber" />
            </div>

            {/* Top Artists */}
            <div className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.04]">
              <div className="flex items-center gap-2 mb-4">
                <Trophy size={15} className="text-amber-400" />
                <p className="text-[14px] text-white font-bold">Most Played Artists</p>
              </div>
              <div className="space-y-3">
                {prefs.topArtists.map((a, i) => (
                  <div key={typeof a === 'string' ? a : i} className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      i === 0 ? 'bg-amber-500/20 text-amber-400' : i === 1 ? 'bg-gray-400/20 text-gray-300' : i === 2 ? 'bg-orange-500/20 text-orange-400' : 'bg-white/[0.04] text-white/30'
                    }`}>{i + 1}</span>
                    <span className="text-[13px] text-white flex-1 font-medium">{typeof a === 'string' ? a : a.name}</span>
                    {i < 3 && <div className="h-1.5 rounded-full bg-white/[0.06] flex-1 max-w-[100px]">
                      <div className={`h-full rounded-full ${i === 0 ? 'bg-amber-400 w-full' : i === 1 ? 'bg-gray-400 w-3/4' : 'bg-orange-400 w-1/2'}`} />
                    </div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <EmptyState icon={BarChart3} text="Not enough data" sub="Play more songs to see your stats" />
        )
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  const colors = {
    rose: 'from-rose-500/15 to-rose-600/5 border-rose-500/10',
    amber: 'from-amber-500/15 to-amber-600/5 border-amber-500/10',
  };
  const iconColors = { rose: 'text-rose-400', amber: 'text-amber-400' };
  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-2xl p-4 border`}>
      <Icon size={18} className={`${iconColors[color]} mb-2`} />
      <p className="text-[28px] font-bold text-white leading-none">{value}</p>
      <p className="text-[11px] text-white/40 mt-1 font-medium">{label}</p>
    </div>
  );
}

function EmptyState({ icon: Icon, text, sub, action, actionText }) {
  return (
    <div className="text-center py-20 animate-in">
      <div className="w-16 h-16 mx-auto mb-4 bg-white/[0.04] rounded-2xl flex items-center justify-center border border-white/[0.05]">
        <Icon size={28} className="text-white/20" />
      </div>
      <p className="text-[15px] text-white font-semibold">{text}</p>
      <p className="text-[12px] text-white/30 mt-1">{sub}</p>
      {action && (
        <button onClick={action} className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black text-[12px] font-bold rounded-full shadow-lg active:scale-95 transition-all">
          <Plus size={14} /> {actionText}
        </button>
      )}
    </div>
  );
}
