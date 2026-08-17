// Minimal fallback data (used only when API fails)

export const artists = [
  { id: 'artist-1', name: 'Arijit Singh', image: 'https://picsum.photos/seed/artist1/300/300', monthlyListeners: '85M', bio: 'Indian playback singer known for his soulful voice.', location: 'Mumbai, India' },
  { id: 'artist-2', name: 'The Weeknd', image: 'https://picsum.photos/seed/artist2/300/300', monthlyListeners: '95M', bio: 'Canadian singer known for dark R&B.', location: 'Toronto, Canada' },
  { id: 'artist-3', name: 'Dua Lipa', image: 'https://picsum.photos/seed/artist3/300/300', monthlyListeners: '72M', bio: 'English singer known for disco-pop.', location: 'London, UK' },
  { id: 'artist-4', name: 'AP Dhillon', image: 'https://picsum.photos/seed/artist4/300/300', monthlyListeners: '35M', bio: 'Indo-Canadian singer and producer.', location: 'Punjab, India' },
  { id: 'artist-5', name: 'Taylor Swift', image: 'https://picsum.photos/seed/artist5/300/300', monthlyListeners: '92M', bio: 'American singer-songwriter.', location: 'Nashville, USA' },
  { id: 'artist-6', name: 'BTS', image: 'https://picsum.photos/seed/artist6/300/300', monthlyListeners: '68M', bio: 'South Korean boy band.', location: 'Seoul, South Korea' },
];

export const songs = [];

export const albums = [];

export const playlists = [];

export const genres = [
  { id: 'genre-1', name: 'Bollywood', color: 'bg-orange-600' },
  { id: 'genre-2', name: 'Pop', color: 'bg-pink-600' },
  { id: 'genre-3', name: 'Hip-Hop', color: 'bg-yellow-600' },
  { id: 'genre-4', name: 'Punjabi', color: 'bg-green-600' },
  { id: 'genre-5', name: 'K-Pop', color: 'bg-cyan-500' },
  { id: 'genre-6', name: 'R&B', color: 'bg-rose-600' },
  { id: 'genre-7', name: 'Indie', color: 'bg-teal-600' },
  { id: 'genre-8', name: 'Electronic', color: 'bg-blue-600' },
];

export const moods = [
  { id: 'mood-1', name: 'Chill', color: 'bg-sky-600', icon: '😌' },
  { id: 'mood-2', name: 'Party', color: 'bg-pink-600', icon: '🎉' },
  { id: 'mood-3', name: 'Romance', color: 'bg-red-500', icon: '❤️' },
  { id: 'mood-4', name: 'Workout', color: 'bg-orange-600', icon: '💪' },
  { id: 'mood-5', name: 'Focus', color: 'bg-indigo-600', icon: '🎯' },
  { id: 'mood-6', name: 'Sleep', color: 'bg-purple-800', icon: '🌙' },
  { id: 'mood-7', name: 'Desi', color: 'bg-green-600', icon: '🇮🇳' },
  { id: 'mood-8', name: 'Energy', color: 'bg-yellow-600', icon: '⚡' },
];

export const formatDuration = (seconds) => {
  if (!seconds || seconds === 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};
