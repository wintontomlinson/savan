import { useState, useMemo, useEffect } from 'react';
import { Clock, BarChart3, Music, Trophy, Download, Plus, ListMusic, Play, Trash2, Pencil, Check, X, Heart, Shuffle, Disc3, Headphones, TrendingUp } from 'lucide-react';
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

  // Quick stats for hero
  const totalSongs = likedSongs_full.length + downloadedFromHistory.length;

  return (
    <div className="pb-6 pt-2">
      {/* Hero Section */}
      {!openPlaylist && (
        <div className="mb-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a1a2e] via-[#16162a] to-[#0f0f1a] p-6 border border-white/[0.05]">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-rose-500/8 to-transparent rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-violet-500/6 to-transparent rounded-full blur-2xl" />
            
            <div className="relative flex items-center justify-between">
              <div>
                <h1 className="text-[26px] font-bold text-white tracking-tight">Your Library</h1>
                <p className="text-[13px] text-white/40 mt-1">
                  {totalSongs > 0 ? `${totalSongs} saved songs` : 'Your music collection'}
                </p>
              </div>
              {tab === 'playlists' && (
                <button onClick={() => setShowCreate(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white text-black text-[12px] font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all active:scale-95">
                  <Plus size={14} /> New
                </button>
              )}
            </div>

            {/* Quick Stats Row */}
            <div className="relative flex gap-4 mt-5">
              <MiniStat icon={Heart} value={likedSongs_full.length} label="Liked" />
              <MiniStat icon={Download} value={downloadedFromHistory.length} label="Downloads" />
              <MiniStat icon={Clock} value={history.length} label="Played" />
              <MiniStat icon={ListMusic} value={playlists.length} label="Playlists" />
            </div>
          </div>
        </div>
      )}

      {/* Back button when viewing playlist */}
      {openPlaylist && (
        <button onClick={() => setOpenPlaylist(null)} className="flex items-center gap-2 mb-4 text-[13px] text-white/40 hover:text-white/70 transition-colors active:scale-95">
          <X size={14} /> Back to Library
        </button>
      )}

      {/* Tabs */}
      {!openPlaylist && (
        <div className="flex gap-2 mb-6 overflow-x-auto scroll-x pb-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[12px] font-semibold whitespace-nowrap shrink-0 transition-all duration-200 ${
                tab === t.id
                  ? 'bg-white text-black shadow-md'
                  : 'bg-white/[0.05] text-white/45 hover:bg-white/[0.08] hover:text-white/65 border border-white/[0.04]'
              }`}>
              <t.icon size={14} />
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Create Playlist Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-6" onClick={() => setShowCreate(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
          <div className="relative bg-[#161618] border border-white/[0.08] rounded-3xl p-7 w-full max-w-[360px] animate-scale shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-600/10 flex items-center justify-center mb-4 border border-violet-500/10">
              <ListMusic size={20} className="text-violet-400" />
            </div>
            <h3 className="text-[18px] font-bold text-white mb-1">New Playlist</h3>
            <p className="text-[12px] text-white/35 mb-5">Give your playlist a name to get started</p>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') createPlaylist(); }}
              placeholder="My awesome playlist..."
              className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-3.5 text-[14px] text-white placeholder:text-white/25 focus:outline-none focus:border-white/[0.15] focus:bg-white/[0.08] transition-all"
              autoFocus
            />
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreate(false)} className="flex-1 py-3 rounded-xl bg-white/[0.06] text-[13px] text-white/60 font-medium hover:bg-white/[0.1] transition-colors active:scale-95">
                Cancel
              </button>
              <button onClick={createPlaylist} className="flex-1 py-3 rounded-xl bg-white text-[13px] text-black font-bold transition-all active:scale-95 hover:bg-white/90 shadow-lg">
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Viewing Playlist Detail */}
      {openPlaylist && viewingPlaylist && (
        <div className="animate-in">
          {/* Playlist Header */}
          <div className="flex items-center gap-4 mb-6 p-5 bg-gradient-to-r from-white/[0.04] via-white/[0.02] to-transparent rounded-2xl border border-white/[0.05]">
            <div className={`w-18 h-18 rounded-2xl flex items-center justify-center shrink-0 ${
              viewingPlaylist.id === '__liked__'
                ? 'bg-gradient-to-br from-rose-500/30 to-pink-600/15 shadow-lg shadow-rose-500/10'
                : 'bg-gradient-to-br from-violet-500/25 to-indigo-600/15 shadow-lg shadow-violet-500/10'
            }`} style={{ width: '72px', height: '72px' }}>
              {viewingPlaylist.id === '__liked__' ? <Heart size={28} className="text-rose-400" /> : <ListMusic size={28} className="text-violet-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-[22px] font-bold text-white truncate">{viewingPlaylist.name}</h2>
              <p className="text-[12px] text-white/35 mt-0.5">{viewingPlaylist.songs.length} songs</p>
            </div>
          </div>

          {/* Actions */}
          {viewingPlaylist.songs.length > 0 && (
            <div className="flex items-center gap-3 mb-5">
              <button onClick={() => { playSong(viewingPlaylist.songs[0], viewingPlaylist.songs); }}
                className="flex items-center gap-2 px-6 py-3 bg-white text-black text-[13px] font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all active:scale-95">
                <Play size={14} fill="black" /> Play
              </button>
              <button onClick={() => { const s = [...viewingPlaylist.songs].sort(() => Math.random() - 0.5); playSong(s[0], s); }}
                className="flex items-center gap-2 px-5 py-3 bg-white/[0.06] text-white text-[13px] font-semibold rounded-full hover:bg-white/[0.1] transition-all active:scale-95 border border-white/[0.06]">
                <Shuffle size={14} /> Shuffle
              </button>
            </div>
          )}

          {/* Songs */}
          {viewingPlaylist.songs.length > 0 ? (
            <div className="rounded-2xl overflow-hidden border border-white/[0.04]">
              {viewingPlaylist.songs.map((s, i) => <SongRow key={s.id} song={s} index={i} songList={viewingPlaylist.songs} />)}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-4 bg-white/[0.04] rounded-2xl flex items-center justify-center border border-white/[0.05]">
                <Music size={24} className="text-white/15" />
              </div>
              <p className="text-[14px] text-white/60 font-medium">Empty playlist</p>
              <p className="text-[12px] text-white/25 mt-1">Like songs or add them from the player</p>
            </div>
          )}
        </div>
      )}

      {/* Playlists Tab */}
      {tab === 'playlists' && !openPlaylist && (
        <div className="animate-in space-y-2.5">
          {playlists.length === 0 ? (
            <EmptyState
              icon={ListMusic}
              title="No playlists yet"
              subtitle="Create your first playlist to organize music"
              action={() => setShowCreate(true)}
              actionLabel="Create Playlist"
            />
          ) : (
            playlists.map(pl => (
              <PlaylistCard
                key={pl.id}
                playlist={pl}
                onOpen={() => setOpenPlaylist(pl.id)}
                onPlay={() => { if (pl.songs.length > 0) { const s = [...pl.songs].sort(() => Math.random() - 0.5); playSong(s[0], s); } }}
                onRename={() => { setRenaming(pl.id); setRenameText(pl.name); }}
                onDelete={() => deletePlaylist(pl.id)}
                renaming={renaming === pl.id}
                renameText={renameText}
                setRenameText={setRenameText}
                onRenameConfirm={() => renamePlaylist(pl.id)}
                onRenameCancel={() => setRenaming(null)}
              />
            ))
          )}
        </div>
      )}

      {/* Downloads Tab */}
      {tab === 'downloads' && !openPlaylist && (
        downloadedFromHistory.length > 0 ? (
          <div className="animate-in">
            <div className="flex items-center gap-3 mb-5">
              <button onClick={() => { const s = [...downloadedFromHistory].sort(() => Math.random() - 0.5); playSong(s[0], s); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-[12px] font-bold rounded-full shadow-lg active:scale-95 transition-all">
                <Shuffle size={13} /> Shuffle Play
              </button>
              <span className="text-[12px] text-white/30">{downloadedFromHistory.length} songs saved</span>
            </div>
            <div className="rounded-2xl overflow-hidden border border-white/[0.04]">
              {downloadedFromHistory.map((s, i) => <SongRow key={s.id} song={s} index={i} songList={downloadedFromHistory} />)}
            </div>
          </div>
        ) : (
          <EmptyState icon={Download} title="No downloads" subtitle="Download songs to access them anytime" />
        )
      )}

      {/* History Tab */}
      {tab === 'history' && !openPlaylist && (
        history.length > 0 ? (
          <div className="animate-in">
            <div className="flex items-center gap-3 mb-5">
              <button onClick={() => { const s = [...history.slice(0, 50)].sort(() => Math.random() - 0.5); playSong(s[0], s); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-[12px] font-bold rounded-full shadow-lg active:scale-95 transition-all">
                <Shuffle size={13} /> Shuffle
              </button>
              <span className="text-[12px] text-white/30">{history.length} recently played</span>
            </div>
            <div className="rounded-2xl overflow-hidden border border-white/[0.04]">
              {history.slice(0, 50).map((s, i) => <SongRow key={`${s.id}-${i}`} song={s} index={i} songList={history} />)}
            </div>
          </div>
        ) : (
          <EmptyState icon={Clock} title="No history yet" subtitle="Start playing music to see your history here" />
        )
      )}

      {/* Stats Tab */}
      {tab === 'stats' && !openPlaylist && (
        prefs && prefs.totalPlays > 0 ? (
          <div className="animate-in space-y-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={Headphones} value={prefs.totalPlays} label="Total Plays" gradient="from-rose-500/15 to-pink-600/5" iconColor="text-rose-400" />
              <StatCard icon={Disc3} value={prefs.topArtists?.length || 0} label="Artists" gradient="from-violet-500/15 to-purple-600/5" iconColor="text-violet-400" />
            </div>

            {/* Top Artists */}
            {prefs.topArtists?.length > 0 && (
              <div className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.05]">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
                    <Trophy size={14} className="text-amber-400" />
                  </div>
                  <div>
                    <p className="text-[14px] text-white font-bold">Top Artists</p>
                    <p className="text-[10px] text-white/30">Based on your listening</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {prefs.topArtists.slice(0, 8).map((a, i) => {
                    const name = typeof a === 'string' ? a : a.name;
                    const barWidth = i === 0 ? '100%' : i === 1 ? '80%' : i === 2 ? '65%' : `${Math.max(20, 55 - i * 8)}%`;
                    return (
                      <div key={name || i} className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          i === 0 ? 'bg-amber-500/20 text-amber-400' : i === 1 ? 'bg-white/[0.08] text-white/50' : i === 2 ? 'bg-orange-500/15 text-orange-400' : 'bg-white/[0.04] text-white/25'
                        }`}>{i + 1}</span>
                        <span className="text-[13px] text-white font-medium flex-1 truncate">{name}</span>
                        <div className="w-24 h-1.5 rounded-full bg-white/[0.06] overflow-hidden shrink-0">
                          <div className={`h-full rounded-full ${i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-white/40' : i === 2 ? 'bg-orange-400' : 'bg-white/20'}`} style={{ width: barWidth }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Listening Insight */}
            <div className="bg-gradient-to-r from-rose-500/8 to-violet-500/5 rounded-2xl p-5 border border-rose-500/8">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={14} className="text-rose-400" />
                <p className="text-[12px] text-rose-400 font-semibold">Insight</p>
              </div>
              <p className="text-[13px] text-white/70">
                {prefs.topArtists?.[0] && `You love ${typeof prefs.topArtists[0] === 'string' ? prefs.topArtists[0] : prefs.topArtists[0].name}! `}
                You've played {prefs.totalPlays} songs so far. Keep discovering!
              </p>
            </div>
          </div>
        ) : (
          <EmptyState icon={BarChart3} title="Not enough data" subtitle="Listen to more songs to unlock your stats" />
        )
      )}
    </div>
  );
}

function MiniStat({ icon: Icon, value, label }) {
  return (
    <div className="flex items-center gap-2 bg-white/[0.04] rounded-xl px-3 py-2 border border-white/[0.04]">
      <Icon size={12} className="text-white/30" />
      <span className="text-[12px] text-white font-bold">{value}</span>
      <span className="text-[10px] text-white/30">{label}</span>
    </div>
  );
}

function PlaylistCard({ playlist: pl, onOpen, onPlay, onRename, onDelete, renaming, renameText, setRenameText, onRenameConfirm, onRenameCancel }) {
  const isLiked = pl.id === '__liked__';
  return (
    <div onClick={onOpen}
      className="flex items-center gap-4 p-4 bg-white/[0.02] hover:bg-white/[0.05] rounded-2xl border border-white/[0.04] hover:border-white/[0.08] transition-all duration-200 group cursor-pointer">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
        isLiked
          ? 'bg-gradient-to-br from-rose-500/30 to-pink-600/15 shadow-rose-500/10'
          : 'bg-gradient-to-br from-violet-500/25 to-indigo-600/15 shadow-violet-500/10'
      }`}>
        {isLiked ? <Heart size={20} className="text-rose-400" /> : <ListMusic size={20} className="text-violet-400" />}
      </div>
      <div className="flex-1 min-w-0">
        {renaming ? (
          <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
            <input value={renameText} onChange={e => setRenameText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') onRenameConfirm(); }}
              className="flex-1 bg-white/[0.08] border border-white/[0.12] rounded-lg px-3 py-1.5 text-[13px] text-white focus:outline-none" autoFocus />
            <button onClick={onRenameConfirm} className="text-emerald-400 hover:text-emerald-300"><Check size={15} /></button>
            <button onClick={onRenameCancel} className="text-white/30 hover:text-white/60"><X size={15} /></button>
          </div>
        ) : (
          <>
            <p className="text-[14px] font-semibold text-white truncate">{pl.name}</p>
            <p className="text-[11px] text-white/30 mt-0.5">{pl.songs.length} songs</p>
          </>
        )}
      </div>
      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
        {pl.songs.length > 0 && (
          <button onClick={e => { e.stopPropagation(); onPlay(); }}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg active:scale-90 transition-all">
            <Play size={14} className="text-black ml-0.5" fill="black" />
          </button>
        )}
        {!isLiked && (
          <>
            <button onClick={e => { e.stopPropagation(); onRename(); }} className="w-8 h-8 rounded-full flex items-center justify-center text-white/20 hover:text-white/60 hover:bg-white/[0.06] transition-all">
              <Pencil size={12} />
            </button>
            <button onClick={e => { e.stopPropagation(); onDelete(); }} className="w-8 h-8 rounded-full flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all">
              <Trash2 size={12} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, value, label, gradient, iconColor }) {
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-5 border border-white/[0.05]`}>
      <Icon size={20} className={`${iconColor} mb-3`} />
      <p className="text-[30px] font-bold text-white leading-none">{value}</p>
      <p className="text-[11px] text-white/35 mt-1.5 font-medium">{label}</p>
    </div>
  );
}

function EmptyState({ icon: Icon, title, subtitle, action, actionLabel }) {
  return (
    <div className="text-center py-24 animate-in">
      <div className="w-18 h-18 mx-auto mb-5 bg-gradient-to-br from-white/[0.04] to-white/[0.02] rounded-3xl flex items-center justify-center border border-white/[0.06]" style={{ width: '72px', height: '72px' }}>
        <Icon size={28} className="text-white/15" />
      </div>
      <p className="text-[16px] text-white font-semibold">{title}</p>
      <p className="text-[12px] text-white/30 mt-1.5 max-w-[240px] mx-auto">{subtitle}</p>
      {action && (
        <button onClick={action} className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-white text-black text-[12px] font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all active:scale-95">
          <Plus size={14} /> {actionLabel}
        </button>
      )}
    </div>
  );
}
