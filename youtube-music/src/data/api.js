const BASE = 'https://jiosavan-api2.vercel.app/api';

async function fetchApi(endpoint) {
  try {
    const res = await fetch(`${BASE}${endpoint}`);
    const data = await res.json();
    if (data.success) return data.data;
    return null;
  } catch { return null; }
}

function bestImage(images) {
  if (!images?.length) return 'https://picsum.photos/seed/def/300/300';
  return images[images.length - 1]?.url || images[0]?.url;
}

function bestAudio(urls) {
  if (!urls?.length) return '';
  const p = urls.find(u => u.quality === '160kbps');
  return p?.url || urls[urls.length - 1]?.url || '';
}

function mapSong(s) {
  return {
    id: s.id,
    title: (s.name || '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#039;/g, "'"),
    artist: s.artists?.primary?.map(a => a.name).join(', ') || s.primaryArtists || '',
    artistId: s.artists?.primary?.[0]?.id || '',
    album: (s.album?.name || '').replace(/&quot;/g, '"'),
    albumId: s.album?.id || '',
    duration: s.duration || 0,
    thumbnail: bestImage(s.image),
    audio: bestAudio(s.downloadUrl),
    plays: s.playCount || 0,
    language: s.language || '',
    year: s.year || '',
  };
}

function mapAlbum(a) {
  return {
    id: a.id,
    title: (a.name || '').replace(/&quot;/g, '"').replace(/&amp;/g, '&'),
    artist: a.artists?.primary?.map(x => x.name).join(', ') || a.primaryArtists || '',
    artistId: a.artists?.primary?.[0]?.id || '',
    year: a.year || '',
    thumbnail: bestImage(a.image),
    songCount: a.songCount || 0,
  };
}

export async function searchSongs(query, limit = 15) {
  const data = await fetchApi(`/search/songs?query=${encodeURIComponent(query)}&limit=${limit}`);
  return (data?.results || []).map(mapSong);
}

export async function searchAlbums(query, limit = 10) {
  const data = await fetchApi(`/search/albums?query=${encodeURIComponent(query)}&limit=${limit}`);
  return (data?.results || []).map(mapAlbum);
}

export async function getAlbumById(id) {
  const data = await fetchApi(`/albums?id=${id}`);
  if (!data) return null;
  return { ...mapAlbum(data), songs: (data.songs || []).map(mapSong) };
}

export async function getPlaylistById(id) {
  const data = await fetchApi(`/playlists?id=${id}`);
  if (!data) return null;
  return {
    id: data.id,
    title: (data.name || '').replace(/&quot;/g, '"'),
    description: data.description || '',
    thumbnail: bestImage(data.image),
    songs: (data.songs || []).map(mapSong),
    songCount: data.songCount || 0,
  };
}

export async function getArtistById(id) {
  const data = await fetchApi(`/artists/${id}`);
  if (!data) return null;
  return {
    id: data.id,
    name: data.name,
    image: bestImage(data.image),
    bio: data.bio?.[0]?.text || data.wiki || '',
    followerCount: data.followerCount || 0,
    topSongs: (data.topSongs || []).map(mapSong),
    topAlbums: (data.topAlbums || []).map(mapAlbum),
  };
}
