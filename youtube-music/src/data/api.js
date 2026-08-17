// JioSaavn API Integration
// Using public JioSaavn API for real music streaming

const BASE_URL = 'https://jiosavan-api2.vercel.app/api';

// Search songs
export async function searchSongs(query, limit = 20) {
  try {
    const res = await fetch(`${BASE_URL}/search/songs?query=${encodeURIComponent(query)}&limit=${limit}`);
    const data = await res.json();
    if (data.success && data.data?.results) {
      return data.data.results.map(mapSong);
    }
    return [];
  } catch (err) {
    console.error('Search error:', err);
    return [];
  }
}

// Search albums
export async function searchAlbums(query, limit = 10) {
  try {
    const res = await fetch(`${BASE_URL}/search/albums?query=${encodeURIComponent(query)}&limit=${limit}`);
    const data = await res.json();
    if (data.success && data.data?.results) {
      return data.data.results.map(mapAlbum);
    }
    return [];
  } catch (err) {
    console.error('Album search error:', err);
    return [];
  }
}

// Search artists
export async function searchArtists(query, limit = 10) {
  try {
    const res = await fetch(`${BASE_URL}/search/artists?query=${encodeURIComponent(query)}&limit=${limit}`);
    const data = await res.json();
    if (data.success && data.data?.results) {
      return data.data.results.map(mapArtist);
    }
    return [];
  } catch (err) {
    console.error('Artist search error:', err);
    return [];
  }
}

// Get song by ID
export async function getSongById(id) {
  try {
    const res = await fetch(`${BASE_URL}/songs/${id}`);
    const data = await res.json();
    if (data.success && data.data?.[0]) {
      return mapSong(data.data[0]);
    }
    return null;
  } catch (err) {
    console.error('Get song error:', err);
    return null;
  }
}

// Get album by ID
export async function getAlbumById(id) {
  try {
    const res = await fetch(`${BASE_URL}/albums?id=${id}`);
    const data = await res.json();
    if (data.success && data.data) {
      return {
        ...mapAlbum(data.data),
        songs: (data.data.songs || []).map(mapSong),
      };
    }
    return null;
  } catch (err) {
    console.error('Get album error:', err);
    return null;
  }
}

// Get playlist by ID
export async function getPlaylistById(id) {
  try {
    const res = await fetch(`${BASE_URL}/playlists?id=${id}`);
    const data = await res.json();
    if (data.success && data.data) {
      return {
        id: data.data.id,
        title: data.data.name,
        description: data.data.description || '',
        image: getBestImage(data.data.image),
        songCount: data.data.songCount,
        songs: (data.data.songs || []).map(mapSong),
      };
    }
    return null;
  } catch (err) {
    console.error('Get playlist error:', err);
    return null;
  }
}

// Get artist by ID
export async function getArtistById(id) {
  try {
    const res = await fetch(`${BASE_URL}/artists/${id}`);
    const data = await res.json();
    if (data.success && data.data) {
      return {
        id: data.data.id,
        name: data.data.name,
        image: getBestImage(data.data.image),
        bio: data.data.bio?.[0]?.text || data.data.wiki || '',
        followerCount: data.data.followerCount || 0,
        isVerified: data.data.isVerified || false,
        topSongs: (data.data.topSongs || []).map(mapSong),
        topAlbums: (data.data.topAlbums || []).map(mapAlbum),
      };
    }
    return null;
  } catch (err) {
    console.error('Get artist error:', err);
    return null;
  }
}

// Fetch trending/home data
export async function getHomePage() {
  try {
    // Fetch multiple searches to build home content
    const [bollywood, english, punjabi, trending] = await Promise.all([
      searchSongs('Arijit Singh latest', 10),
      searchSongs('trending english pop 2024', 10),
      searchSongs('AP Dhillon Punjabi', 8),
      searchSongs('top hits 2024', 10),
    ]);
    return { bollywood, english, punjabi, trending };
  } catch (err) {
    console.error('Home page error:', err);
    return { bollywood: [], english: [], punjabi: [], trending: [] };
  }
}

// === HELPER MAPPERS ===

function getBestImage(images) {
  if (!images || images.length === 0) return 'https://picsum.photos/seed/default/300/300';
  // Get highest quality
  const sorted = [...images].sort((a, b) => {
    const aSize = parseInt(a.quality) || 0;
    const bSize = parseInt(b.quality) || 0;
    return bSize - aSize;
  });
  return sorted[0]?.url || images[images.length - 1]?.url || 'https://picsum.photos/seed/default/300/300';
}

function getBestAudio(downloadUrls) {
  if (!downloadUrls || downloadUrls.length === 0) return '';
  // Prefer 160kbps for balance of quality and speed
  const preferred = downloadUrls.find(d => d.quality === '160kbps');
  if (preferred) return preferred.url;
  // Fallback to highest available
  return downloadUrls[downloadUrls.length - 1]?.url || '';
}

function mapSong(song) {
  return {
    id: song.id,
    title: cleanHtml(song.name),
    artist: song.artists?.primary?.map(a => a.name).join(', ') || song.primaryArtists || 'Unknown',
    artistId: song.artists?.primary?.[0]?.id || '',
    album: cleanHtml(song.album?.name || ''),
    albumId: song.album?.id || '',
    duration: song.duration || 0,
    image: getBestImage(song.image),
    audio: getBestAudio(song.downloadUrl),
    language: song.language || 'hindi',
    year: song.year || '',
    playCount: song.playCount || 0,
    hasLyrics: song.hasLyrics || false,
    genre: mapLanguageToGenre(song.language),
    mood: 'Chill', // default, can be overridden
  };
}

function mapAlbum(album) {
  return {
    id: album.id,
    title: cleanHtml(album.name),
    artist: album.artists?.primary?.map(a => a.name).join(', ') || album.primaryArtists || '',
    artistId: album.artists?.primary?.[0]?.id || '',
    year: album.year || '',
    image: getBestImage(album.image),
    songCount: album.songCount || 0,
    language: album.language || 'hindi',
    genre: mapLanguageToGenre(album.language),
  };
}

function mapArtist(artist) {
  return {
    id: artist.id,
    name: artist.name,
    image: getBestImage(artist.image),
    type: artist.type || 'artist',
  };
}

function cleanHtml(str) {
  if (!str) return '';
  return str.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#039;/g, "'");
}

function mapLanguageToGenre(language) {
  const map = {
    hindi: 'Bollywood',
    punjabi: 'Punjabi',
    english: 'Pop',
    tamil: 'Tamil',
    telugu: 'Telugu',
    korean: 'K-Pop',
    bengali: 'Bengali',
    marathi: 'Marathi',
    gujarati: 'Gujarati',
  };
  return map[language?.toLowerCase()] || 'Pop';
}
