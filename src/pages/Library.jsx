import { useState, useMemo, useEffect } from 'react';
import { Heart, Clock, BarChart3, Music, Trophy, Flame, Download, Plus, ListMusic, Play, Trash2, X } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { getHistory, analyzePreferences } from '../data/algorithm';
import SongRow from '../components/SongRow';

export default function Library() {
  const { likedSongs, downloadedSongs, playSong } = usePlayer();
  const [tab, setTab] = useState('playlists');
  const [playlists, setPlaylists] = useState(() => { try { return JSON.parse(localStorage.getItem('ma_playlists')) || []; } catch { return []; } });
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const history = useMemo(() => getHistory(), []);
  const prefs = useMemo(() => analyzePreferences(), []);

  const likedFromHistory = useMemo(() => { try { return JSON.parse(localStorage.getItem('ma_liked_songs')) || []; } catch { return []; } }, [likedSongs]);
  const downloadedFromHistory = useMemo(() => { try { return JSON.parse(localStorage.getItem('ma_downloaded_songs')) || []; } catch { return []; } }, [downloadedSongs]);

  // Save playlists
  useEffect(() => { try { localStorage.setItem('ma_playlists', JSON.stringify(playlists)); } catch {} }, [playlists]);

  const createPlaylist = () => {
    if (!newName.trim()) return;
    const pl = { id: Date.now().toString(), name: newName.trim(), songs: [], created: Date.now() };
    setPlaylists(p => [pl, ...p]);
    setNewName('');
    setShowCreate(false);
  };

  const deletePlaylist = (id) => {
    setPlaylists(p => p.filter(pl => pl.id !== id));
  };

  const addToPlaylist = (playlistId, song) => {
    setPlaylists(p => p.map(pl => {
      if (pl.id !== playlistId) return pl;
      if (pl.songs.find(s => s.id === song.id)) return pl;
      return { ...pl, songs: [...pl.songs, song] };
    }));
  };

  const tabs = [
    { id: 'playlists', label: 'Playlists', icon: ListMusic, count: playlists.length },
    { id: 'liked', label: 'Liked', icon: Heart, count: likedFromHistory.length },
    { id: 'downloads', label: 'Downloads', icon: Download, count: downloadedFromHistory.length },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
  ];

  return (
    <div className="pb-6 pt-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[22px] sm:text-[26px] font-bold text-white">Library</h1>
          <p className="text-[12px] text-white/30 mt-0.5">{history.length} played • {likedFromHistory.length} liked • {playlists.length} playlists</p>
        </div>
        {tab === 'playlists' && (
          <button onClick={() => setShowCreate(true)} className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.1] transition-colors active:scale-90 border border-white/[0.05]">
            <Plus size={18} className="text-white/70" />
          </button>
        )}
      </div>

      {/* Tabs */}
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
              <button onClick={createPlaylist} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-[13px] text-white font-bold shadow-lg shadow-rose-500/20 hover:shadow-rose-500/40 transition-all active:scale-95">
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Playlists */}
      {tab === 'playlists' && (
        <div className="animate-in">
          {playlists.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-rose-500/10 to-purple-500/5 rounded-2xl flex items-center justify-center border border-rose-500/10">
                <ListMusic size={28} className="text-rose-400/60" />
              </div>
              <p className="text-[14px] text-white font-medium">No playlists yet</p>
              <p className="text-[12px] text-white/30 mt-1 mb-4">Create your first playlist</p>
              <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 rounded-full text-[12px] text-white font-bold shadow-lg shadow-rose-500/20 active:scale-95 transition-all">
                <Plus size={14} /> Create Playlist
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {playlists.map(pl => (
                <div key={pl.id} className="flex items-center gap-3 p-3 bg-white/[0.03] hover:bg-white/[0.05] rounded-2xl border border-white/[0.04] transition-all duration-200 group">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500/20 to-purple-500/10 flex items-center justify-center shrink-0">
                    <ListMusic size={18} className="text-rose-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-white truncate">{pl.name}</p>
                    <p className="text-[11px] text-white/30">{pl.songs.length} songs</p>
                  </div>
                  {pl.songs.length > 0 && (
                    <button onClick={() => { const shuffled = [...pl.songs].sort(() => Math.random() - 0.5); playSong(shuffled[0], shuffled); }}
                      className="w-9 h-9 rounded-full bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/20 active:scale-90 transition-all opacity-0 group-hover:opacity-100">
                      <Play size={14} className="text-white ml-0.5" fill="white" />
                    </button>
                  )}
                  <button onClick={() => deletePlaylist(pl.id)} className="w-8 h-8 rounded-full flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all active:scale-90 opacity-0 group-hover:opacity-100">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Liked */}
      {tab === 'liked' && (
        likedFromHistory.length > 0 ? (
          <div className="animate-in">
            {likedFromHistory.length > 0 && (
              <div className="flex items-center gap-3 mb-4">
                <button onClick={() => { const s = [...likedFromHistory].sort(() => Math.random() - 0.5); playSong(s[0], s); }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 rounded-full text-[12px] text-white font-bold shadow-lg shadow-rose-500/25 active:scale-95 transition-all">
                  <Play size={13} fill="white" /> Shuffle Play
                </button>
                <span className="text-[11px] text-white/30">{likedFromHistory.length} songs</span>
              </div>
            )}
            <div className="bg-[#0a0a0a] rounded-2xl overflow-hidden border border-white/[0.04]">
              {likedFromHistory.map((s, i) => <SongRow key={s.id} song={s} index={i} songList={likedFromHistory} />)}
            </div>
          </div>
        ) : (
          <EmptyState icon={Heart} text="No liked songs yet" sub="Tap ❤️ on songs to save them here" />
        )
      )}

      {/* Downloads */}
      {tab === 'downloads' && (
        downloadedFromHistory.length > 0 ? (
          <div className="animate-in">
            {downloadedFromHistory.length > 0 && (
              <div className="flex items-center gap-3 mb-4">
                <button onClick={() => { const s = [...downloadedFromHistory].sort(() => Math.random() - 0.5); playSong(s[0], s); }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 rounded-full text-[12px] text-white font-bold shadow-lg shadow-rose-500/25 active:scale-95 transition-all">
                  <Play size={13} fill="white" /> Shuffle Play
                </button>
                <span className="text-[11px] text-white/30">{downloadedFromHistory.length} songs</span>
              </div>
            )}
            <div className="bg-[#0a0a0a] rounded-2xl overflow-hidden border border-white/[0.04]">
              {downloadedFromHistory.map((s, i) => <SongRow key={s.id} song={s} index={i} songList={downloadedFromHistory} />)}
            </div>
          </div>
        ) : (
          <EmptyState icon={Download} text="No downloads yet" sub="Tap download on songs to save them here" />
        )
      )}

      {/* History */}
      {tab === 'history' && (
        history.length > 0 ? (
          <div className="animate-in">
            <div className="bg-[#0a0a0a] rounded-2xl overflow-hidden border border-white/[0.04]">
              {history.slice(0, 50).map((s, i) => <SongRow key={`${s.id}-${i}`} song={s} index={i} songList={history} />)}
            </div>
          </div>
        ) : (
          <EmptyState icon={Clock} text="Your listening history will appear here" sub="Start playing songs to build your history" />
        )
      )}

      {/* Stats */}
      {tab === 'stats' && (
        prefs ? (
          <div className="space-y-3 animate-in">
            <div className="bg-gradient-to-br from-rose-500/10 to-purple-500/5 rounded-2xl p-5 border border-rose-500/10">
              <div className="flex items-center gap-3 mb-2">
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
                  <div key={typeof a === 'string' ? a : a.name || i} className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      i === 0 ? 'bg-amber-500/20 text-amber-400' :
                      i === 1 ? 'bg-gray-400/20 text-gray-400' :
                      i === 2 ? 'bg-orange-500/20 text-orange-400' :
                      'bg-white/[0.04] text-white/30'
                    }`}>{i + 1}</span>
                    <span className="text-[14px] text-white flex-1 font-medium">{typeof a === 'string' ? a : a.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <EmptyState icon={BarChart3} text="Not enough data yet" sub="Play more songs to see your stats" />
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
