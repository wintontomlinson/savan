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

/** User playlists only — Liked Songs and Downloads have their own stores. */
export function getPlaylists() {
  return read().filter((p) => p.id !== '__liked__');
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
