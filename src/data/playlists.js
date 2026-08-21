const KEY = 'ma_playlists';
const EVENT = 'ma:playlists';

function read() {
  try {
    const list = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function write(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {}
  window.dispatchEvent(new Event(EVENT));
  return list;
}

/**
 * User playlists only — Liked Songs and Downloads have their own stores.
 * Entries are normalised because earlier versions of the app wrote a
 * different shape (and an auto "__liked__" playlist) into the same key.
 */
export function getPlaylists() {
  return read()
    .filter((p) => p && typeof p === 'object' && p.id && p.id !== '__liked__')
    .map((p) => ({
      ...p,
      name: typeof p.name === 'string' && p.name ? p.name : 'Untitled playlist',
      songs: Array.isArray(p.songs) ? p.songs.filter((s) => s && s.id) : [],
    }));
}

export function onPlaylistsChange(handler) {
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}

export function createPlaylist(name) {
  const playlist = { id: `pl_${Date.now()}`, name: name.trim(), songs: [], created: Date.now() };
  write([...getPlaylists(), playlist]);
  return playlist;
}

export function renamePlaylist(id, name) {
  write(getPlaylists().map((p) => (p.id === id ? { ...p, name: name.trim() } : p)));
}

export function deletePlaylist(id) {
  write(getPlaylists().filter((p) => p.id !== id));
}

/** @returns {boolean} false when the track is already in that playlist. */
export function addSongToPlaylist(id, song) {
  const list = getPlaylists();
  const target = list.find((p) => p.id === id);
  if (!target || target.songs.some((s) => s.id === song.id)) return false;
  write(list.map((p) => (p.id === id ? { ...p, songs: [...p.songs, song] } : p)));
  return true;
}

export function removeSongFromPlaylist(id, songId) {
  write(
    getPlaylists().map((p) => (p.id === id ? { ...p, songs: p.songs.filter((s) => s.id !== songId) } : p)),
  );
}
