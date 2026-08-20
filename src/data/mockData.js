// Helpers only - all real data comes from API

export const formatDuration = (s) => {
  if (!s) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

export const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 5) return 'Still up? Let\u2019s vibe.';
  if (h < 12) return 'Rise & Play';
  if (h < 17) return 'Your Afternoon Mix';
  if (h < 21) return 'Evening Sessions';
  return 'Late Night Listening';
};

// Home page sections to fetch from Saavn
export const HOME_SECTIONS = [
  { key: 'trending', query: 'trending hindi songs 2024', title: '🔥 Trending' },
  { key: 'arijit', query: 'Arijit Singh latest', title: 'Arijit Singh' },
  { key: 'punjabi', query: 'Punjabi hits 2024 AP Dhillon Diljit', title: 'Punjabi Hits' },
  { key: 'pop', query: 'english pop hits 2024', title: 'Global Pop' },
  { key: 'romantic', query: 'romantic hindi love songs', title: 'Romance' },
  { key: 'lofi', query: 'lofi chill hindi beats', title: 'Lo-Fi Chill' },
  { key: 'party', query: 'party bollywood dance 2024', title: 'Party Hits' },
  { key: 'rap', query: 'indian hip hop rap 2024', title: 'Hip-Hop' },
  { key: 'retro', query: 'old hindi classic 90s songs', title: 'Retro Classics' },
  { key: 'new', query: 'new releases hindi 2024', title: 'New Releases' },
];
