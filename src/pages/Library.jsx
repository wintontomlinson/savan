import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ListMusic,
  Heart,
  ArrowDownToLine,
  History,
  Plus,
  Play,
  Shuffle,
  Pencil,
  Trash2,
  EllipsisVertical,
  ChevronLeft,
  Music4,
  Check,
  X,
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { getHistory } from '../data/algorithm';
import {
  getPlaylists,
  onPlaylistsChange,
  createPlaylist,
  renamePlaylist,
  deletePlaylist,
  removeSongFromPlaylist,
} from '../data/playlists';
import SongList from '../components/SongList';

const TABS = [
  { id: 'playlists', label: 'Playlists', icon: ListMusic },
  { id: 'liked', label: 'Liked', icon: Heart },
  { id: 'downloads', label: 'Downloads', icon: ArrowDownToLine },
  { id: 'history', label: 'History', icon: History },
];

function readSongs(key) {
  try {
    const list = JSON.parse(localStorage.getItem(key));
    return Array.isArray(list) ? list.filter((s) => s && s.id) : [];
  } catch {
    return [];
  }
}

export default function Library() {
  const { playSong, playShuffled, likedSongs, downloadedSongs, showToast } = usePlayer();
  const [params, setParams] = useSearchParams();
  const tab = TABS.some((t) => t.id === params.get('tab')) ? params.get('tab') : 'playlists';

  const [playlists, setPlaylists] = useState(getPlaylists);
  const [openId, setOpenId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [draftName, setDraftName] = useState('');

  const refresh = useCallback(() => setPlaylists(getPlaylists()), []);
  useEffect(() => onPlaylistsChange(refresh), [refresh]);

  const liked = useMemo(() => readSongs('ma_liked_songs'), [likedSongs]);
  const downloads = useMemo(() => readSongs('ma_downloaded_songs'), [downloadedSongs]);
  const history = useMemo(() => getHistory(), []);

  const setTab = (id) => {
    setOpenId(null);
    setParams(id === 'playlists' ? {} : { tab: id });
  };

  const submitNew = () => {
    const name = draftName.trim();
    if (!name) return;
    createPlaylist(name);
    setDraftName('');
    setCreating(false);
    showToast(`Created “${name}”`);
  };

  const openPlaylist = playlists.find((p) => p.id === openId);

  /* ---------- Playlist detail ---------- */
  if (openPlaylist) {
    return (
      <div className="a-fade-up pt-6">
        <button
          onClick={() => setOpenId(null)}
          className="press mb-5 flex items-center gap-1.5 text-[12px] font-semibold text-white/50 hover:text-white"
        >
          <ChevronLeft size={14} /> Library
        </button>

        <CollectionHeader
          kind="Playlist"
          title={openPlaylist.name}
          count={openPlaylist.songs.length}
          songs={openPlaylist.songs}
          icon={ListMusic}
          gradient="from-violet-500 to-indigo-700"
          onPlay={() => playSong(openPlaylist.songs[0], openPlaylist.songs)}
          onShuffle={() => playShuffled(openPlaylist.songs)}
        />

        {openPlaylist.songs.length > 0 ? (
          <SongList
            songs={openPlaylist.songs}
            onRemove={(song) => {
              removeSongFromPlaylist(openPlaylist.id, song.id);
              showToast(`Removed “${song.title}”`);
            }}
          />
        ) : (
          <Empty
            icon={Music4}
            title="No songs yet"
            hint="Use the ⋯ menu on any track and pick “Save to playlist”."
          />
        )}
      </div>
    );
  }

  return (
    <div className="pt-6">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight sm:text-[32px]">Library</h1>
          <p className="mt-1 text-[13px] text-white/40">Everything you saved, in one place.</p>
        </div>
        {tab === 'playlists' && (
          <button
            onClick={() => setCreating(true)}
            className="press flex shrink-0 items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[12px] font-bold text-black transition-transform hover:scale-[1.03]"
          >
            <Plus size={14} /> New playlist
          </button>
        )}
      </header>

      <div className="scroll-x mb-7 -mx-1 flex gap-2 px-1 pb-1">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} data-active={tab === t.id} className="chip shrink-0">
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Create playlist dialog */}
      {creating && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center px-6" onClick={() => setCreating(false)}>
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
          <div
            className="a-pop relative w-full max-w-[340px] rounded-2xl border border-hair bg-surface-2 p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 text-[16px] font-bold">New playlist</h2>
            <input
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitNew();
                if (e.key === 'Escape') setCreating(false);
              }}
              placeholder="Playlist name"
              autoFocus
              className="w-full rounded-xl border border-hair bg-white/[0.06] px-4 py-3 text-[14px] placeholder:text-white/25 focus:border-hair-strong focus:outline-none"
            />
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setCreating(false)}
                className="press flex-1 rounded-xl bg-white/[0.07] py-2.5 text-[13px] font-semibold text-white/60"
              >
                Cancel
              </button>
              <button
                onClick={submitNew}
                className="press flex-1 rounded-xl bg-accent py-2.5 text-[13px] font-bold text-white"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Playlists ---------- */}
      {tab === 'playlists' &&
        (playlists.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {playlists.map((playlist) => (
              <PlaylistTile
                key={playlist.id}
                playlist={playlist}
                onOpen={() => setOpenId(playlist.id)}
                onPlay={() => playSong(playlist.songs[0], playlist.songs)}
                onRename={(name) => renamePlaylist(playlist.id, name)}
                onDelete={() => {
                  deletePlaylist(playlist.id);
                  showToast(`Deleted “${playlist.name}”`);
                }}
              />
            ))}
          </div>
        ) : (
          <Empty icon={ListMusic} title="No playlists yet" hint="Create one and start collecting tracks." />
        ))}

      {/* ---------- Liked ---------- */}
      {tab === 'liked' &&
        (liked.length > 0 ? (
          <>
            <CollectionHeader
              kind="Playlist"
              title="Liked Songs"
              count={liked.length}
              songs={liked}
              icon={Heart}
              gradient="from-accent-hi to-accent-lo"
              onPlay={() => playSong(liked[0], liked)}
              onShuffle={() => playShuffled(liked)}
            />
            <SongList songs={liked} />
          </>
        ) : (
          <Empty icon={Heart} title="No liked songs yet" hint="Tap the heart on any track to save it here." />
        ))}

      {/* ---------- Downloads ---------- */}
      {tab === 'downloads' &&
        (downloads.length > 0 ? (
          <>
            <CollectionHeader
              kind="Collection"
              title="Downloads"
              count={downloads.length}
              songs={downloads}
              icon={ArrowDownToLine}
              gradient="from-sky-400 to-blue-700"
              onPlay={() => playSong(downloads[0], downloads)}
              onShuffle={() => playShuffled(downloads)}
            />
            <SongList songs={downloads} />
          </>
        ) : (
          <Empty
            icon={ArrowDownToLine}
            title="Nothing downloaded"
            hint="Save a track from the player to keep a copy on your device."
          />
        ))}

      {/* ---------- History ---------- */}
      {tab === 'history' &&
        (history.length > 0 ? (
          <>
            <CollectionHeader
              kind="Collection"
              title="Recently Played"
              count={history.length}
              songs={history}
              icon={History}
              gradient="from-amber-400 to-orange-700"
              onPlay={() => playSong(history[0], history)}
              onShuffle={() => playShuffled(history.slice(0, 50))}
            />
            <SongList songs={history.slice(0, 100)} />
          </>
        ) : (
          <Empty icon={History} title="No listening history" hint="Tracks you play will show up here." />
        ))}
    </div>
  );
}

/* ---------------- Pieces ---------------- */

function CollectionHeader({ kind, title, count, songs, icon: Icon, gradient, onPlay, onShuffle }) {
  return (
    <div className="mb-6 flex flex-wrap items-end gap-4">
      <div
        className={`flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br shadow-2xl shadow-black/50 sm:h-36 sm:w-36 ${gradient}`}
      >
        <Icon size={38} className="text-white/90" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-white/35">{kind}</p>
        <h2 className="mt-1 text-[24px] font-bold leading-tight tracking-tight sm:text-[32px]">{title}</h2>
        <p className="mt-1.5 text-[12.5px] text-white/45">{count} {count === 1 ? 'track' : 'tracks'}</p>
        {songs.length > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={onPlay}
              className="press flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-[12px] font-bold text-white"
            >
              <Play size={13} fill="white" /> Play
            </button>
            <button
              onClick={onShuffle}
              className="press flex items-center gap-2 rounded-full bg-white/[0.08] px-4 py-2.5 text-[12px] font-semibold text-white/75 hover:bg-white/[0.14]"
            >
              <Shuffle size={13} /> Shuffle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function PlaylistTile({ playlist, onOpen, onPlay, onRename, onDelete }) {
  const [menu, setMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(playlist.name);
  const cover = playlist.songs[0]?.thumbnail;

  const commit = () => {
    if (name.trim() && name.trim() !== playlist.name) onRename(name);
    setEditing(false);
  };

  return (
    <div className="group relative rounded-xl bg-white/[0.03] p-3 transition-colors hover:bg-white/[0.07]">
      <button onClick={onOpen} className="block w-full text-left" aria-label={`Open ${playlist.name}`}>
        <div className="art relative mb-3 aspect-square overflow-hidden rounded-lg">
          {cover ? (
            <img src={cover} alt="" className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500/30 to-indigo-800/30">
              <ListMusic size={26} className="text-white/45" />
            </div>
          )}
        </div>
      </button>

      {playlist.songs.length > 0 && (
        <button
          onClick={onPlay}
          aria-label={`Play ${playlist.name}`}
          className="absolute right-5 top-[46%] flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-accent text-white opacity-0 shadow-xl transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
        >
          <Play size={16} fill="white" className="ml-0.5" />
        </button>
      )}

      {editing ? (
        <div className="flex items-center gap-1.5">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit();
              if (e.key === 'Escape') setEditing(false);
            }}
            autoFocus
            className="min-w-0 flex-1 rounded-md bg-white/[0.1] px-2 py-1 text-[12.5px] focus:outline-none"
          />
          <button onClick={commit} aria-label="Save name" className="press text-emerald-400">
            <Check size={14} />
          </button>
          <button onClick={() => setEditing(false)} aria-label="Cancel" className="press text-white/35">
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-1">
          <button onClick={onOpen} className="min-w-0 flex-1 text-left">
            <p className="truncate text-[13px] font-semibold">{playlist.name}</p>
            <p className="mt-0.5 text-[11px] text-white/35">{playlist.songs.length} tracks</p>
          </button>
          <div className="relative">
            <button
              onClick={() => setMenu((p) => !p)}
              aria-label={`Options for ${playlist.name}`}
              className="press rounded-full p-1 text-white/30 hover:text-white"
            >
              <EllipsisVertical size={15} />
            </button>
            {menu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenu(false)} />
                <div className="a-pop absolute right-0 top-full z-50 w-[140px] overflow-hidden rounded-xl border border-hair bg-surface-2/95 py-1 shadow-2xl backdrop-blur-xl">
                  <button
                    onClick={() => {
                      setEditing(true);
                      setMenu(false);
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-[12px] text-white/85 hover:bg-white/[0.08]"
                  >
                    <Pencil size={13} className="text-white/45" /> Rename
                  </button>
                  <button
                    onClick={() => {
                      setMenu(false);
                      onDelete();
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-[12px] text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Empty({ icon: Icon, title, hint }) {
  return (
    <div className="py-20 text-center">
      <Icon size={26} className="mx-auto mb-3 text-white/12" />
      <p className="text-[14px] font-semibold text-white/55">{title}</p>
      <p className="mx-auto mt-1 max-w-[280px] text-[12px] text-white/25">{hint}</p>
    </div>
  );
}
