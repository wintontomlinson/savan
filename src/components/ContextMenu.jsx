import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, EllipsisVertical, Heart, ListPlus, ListStart, Play, Plus } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { addSongToPlaylist, createPlaylist, getPlaylists } from '../data/playlists';

export default function ContextMenu({ song }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState('main');
  const wrapRef = useRef(null);
  const { playSong, playNextInQueue, addToQueue, toggleLike, likedSongs, showToast } = usePlayer();
  const liked = likedSongs.includes(song.id);

  useEffect(() => {
    if (!open) return;
    const onDown = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => event.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open) setView('main');
  }, [open]);

  const saveTo = (playlist) => {
    const added = addSongToPlaylist(playlist.id, song);
    showToast(added ? `Added to ${playlist.name}` : `Already in ${playlist.name}`);
    setOpen(false);
  };

  const saveToNew = () => {
    const name = window.prompt('New playlist name');
    if (!name?.trim()) return;
    const playlist = createPlaylist(name);
    addSongToPlaylist(playlist.id, song);
    showToast(`Created “${playlist.name}”`);
    setOpen(false);
  };

  const items = [
    { icon: Play, label: 'Play', run: () => playSong(song) },
    { icon: ListStart, label: 'Play next', run: () => playNextInQueue(song) },
    { icon: ListPlus, label: 'Add to queue', run: () => addToQueue(song) },
    { icon: Plus, label: 'Save to playlist', submenu: true },
    { icon: Heart, label: liked ? 'Remove from Liked' : 'Add to Liked', run: () => toggleLike(song) },
  ];
  const playlists = view === 'playlists' ? getPlaylists() : [];

  return (
    <div ref={wrapRef} className="relative">
      <button onClick={(event) => { event.stopPropagation(); setOpen((value) => !value); }} aria-label={`More options for ${song.title}`} aria-expanded={open} className={`press rounded-full p-1.5 text-white/30 transition-all hover:bg-white/10 hover:text-white ${open ? 'bg-white/10 text-white' : 'sm:opacity-0 sm:group-hover:opacity-100'}`}>
        <EllipsisVertical size={16} />
      </button>
      {open && (
        <div onClick={(event) => event.stopPropagation()} className="a-pop absolute right-0 top-[calc(100%+4px)] z-50 w-[210px] overflow-hidden rounded-xl border border-hair bg-surface-2/95 py-1 shadow-2xl shadow-black/70 backdrop-blur-xl">
          {view === 'main' && items.map((item) => (
            <button key={item.label} onClick={() => { if (item.submenu) setView('playlists'); else { item.run(); setOpen(false); } }} className="flex w-full items-center gap-3 px-3.5 py-2 text-left text-[12.5px] text-white/85 transition-colors hover:bg-white/[0.08]">
              <item.icon size={14} className="shrink-0 text-white/45" /><span className="flex-1">{item.label}</span>{item.submenu && <ChevronRight size={13} className="text-white/30" />}
            </button>
          ))}
          {view === 'playlists' && <>
            <button onClick={() => setView('main')} className="flex w-full items-center gap-2 border-b border-hair px-3.5 py-2 text-left text-[11.5px] font-semibold text-white/45 hover:text-white"><ChevronLeft size={13} /> Save to playlist</button>
            <div className="max-h-[188px] overflow-y-auto">
              {playlists.length === 0 && <p className="px-3.5 py-3 text-[11.5px] text-white/30">No playlists yet.</p>}
              {playlists.map((playlist) => <button key={playlist.id} onClick={() => saveTo(playlist)} className="flex w-full items-center justify-between gap-2 px-3.5 py-2 text-left text-[12.5px] text-white/85 transition-colors hover:bg-white/[0.08]"><span className="truncate">{playlist.name}</span><span className="shrink-0 text-[10.5px] text-white/25">{playlist.songs.length}</span></button>)}
            </div>
            <button onClick={saveToNew} className="flex w-full items-center gap-3 border-t border-hair px-3.5 py-2 text-left text-[12.5px] font-semibold text-accent transition-colors hover:bg-white/[0.08]"><Plus size={14} /> New playlist</button>
          </>}
        </div>
      )}
    </div>
  );
}
