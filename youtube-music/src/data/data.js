// Mock Data for YouTube Music Clone

export const artists = [
  { id: 'artist-1', name: 'Arijit Singh', image: 'https://picsum.photos/seed/artist1/300/300', monthlyListeners: '85M', bio: 'Indian playback singer known for his soulful voice and romantic ballads.', location: 'Mumbai, India' },
  { id: 'artist-2', name: 'The Weeknd', image: 'https://picsum.photos/seed/artist2/300/300', monthlyListeners: '95M', bio: 'Canadian singer-songwriter known for his versatile vocal range and dark R&B style.', location: 'Toronto, Canada' },
  { id: 'artist-3', name: 'Dua Lipa', image: 'https://picsum.photos/seed/artist3/300/300', monthlyListeners: '72M', bio: 'English singer-songwriter known for her signature disco-pop sound.', location: 'London, UK' },
  { id: 'artist-4', name: 'Drake', image: 'https://picsum.photos/seed/artist4/300/300', monthlyListeners: '88M', bio: 'Canadian rapper, singer and songwriter, one of the best-selling music artists.', location: 'Toronto, Canada' },
  { id: 'artist-5', name: 'Taylor Swift', image: 'https://picsum.photos/seed/artist5/300/300', monthlyListeners: '92M', bio: 'American singer-songwriter known for narrative songs about her personal life.', location: 'Nashville, USA' },
  { id: 'artist-6', name: 'AP Dhillon', image: 'https://picsum.photos/seed/artist6/300/300', monthlyListeners: '35M', bio: 'Indo-Canadian singer, songwriter, and record producer.', location: 'Punjab, India' },
  { id: 'artist-7', name: 'Billie Eilish', image: 'https://picsum.photos/seed/artist7/300/300', monthlyListeners: '78M', bio: 'American singer-songwriter known for her whispered vocals and genre-bending music.', location: 'Los Angeles, USA' },
  { id: 'artist-8', name: 'Ed Sheeran', image: 'https://picsum.photos/seed/artist8/300/300', monthlyListeners: '82M', bio: 'English singer-songwriter known for his acoustic pop and heartfelt lyrics.', location: 'Suffolk, UK' },
  { id: 'artist-9', name: 'Pritam', image: 'https://picsum.photos/seed/artist9/300/300', monthlyListeners: '45M', bio: 'Indian music director and composer known for Bollywood film scores.', location: 'Kolkata, India' },
  { id: 'artist-10', name: 'BTS', image: 'https://picsum.photos/seed/artist10/300/300', monthlyListeners: '68M', bio: 'South Korean boy band known for their energetic performances and global influence.', location: 'Seoul, South Korea' },
  { id: 'artist-11', name: 'Post Malone', image: 'https://picsum.photos/seed/artist11/300/300', monthlyListeners: '65M', bio: 'American rapper and singer known for blending genres.', location: 'Dallas, USA' },
  { id: 'artist-12', name: 'Shreya Ghoshal', image: 'https://picsum.photos/seed/artist12/300/300', monthlyListeners: '40M', bio: 'Indian playback singer known for her classical and contemporary vocal style.', location: 'Mumbai, India' },
];

export const albums = [
  { id: 'album-1', title: 'After Hours', artist: 'The Weeknd', artistId: 'artist-2', year: 2020, image: 'https://picsum.photos/seed/album1/300/300', songCount: 14 },
  { id: 'album-2', title: 'Future Nostalgia', artist: 'Dua Lipa', artistId: 'artist-3', year: 2020, image: 'https://picsum.photos/seed/album2/300/300', songCount: 11 },
  { id: 'album-3', title: 'Certified Lover Boy', artist: 'Drake', artistId: 'artist-4', year: 2021, image: 'https://picsum.photos/seed/album3/300/300', songCount: 21 },
  { id: 'album-4', title: 'Midnights', artist: 'Taylor Swift', artistId: 'artist-5', year: 2022, image: 'https://picsum.photos/seed/album4/300/300', songCount: 13 },
  { id: 'album-5', title: 'Hidden Gems', artist: 'AP Dhillon', artistId: 'artist-6', year: 2023, image: 'https://picsum.photos/seed/album5/300/300', songCount: 8 },
  { id: 'album-6', title: 'Happier Than Ever', artist: 'Billie Eilish', artistId: 'artist-7', year: 2021, image: 'https://picsum.photos/seed/album6/300/300', songCount: 16 },
  { id: 'album-7', title: 'Divide', artist: 'Ed Sheeran', artistId: 'artist-8', year: 2017, image: 'https://picsum.photos/seed/album7/300/300', songCount: 12 },
  { id: 'album-8', title: 'Ae Dil Hai Mushkil', artist: 'Pritam', artistId: 'artist-9', year: 2016, image: 'https://picsum.photos/seed/album8/300/300', songCount: 7 },
  { id: 'album-9', title: 'Map of the Soul: 7', artist: 'BTS', artistId: 'artist-10', year: 2020, image: 'https://picsum.photos/seed/album9/300/300', songCount: 20 },
  { id: 'album-10', title: 'Hollywood\'s Bleeding', artist: 'Post Malone', artistId: 'artist-11', year: 2019, image: 'https://picsum.photos/seed/album10/300/300', songCount: 17 },
  { id: 'album-11', title: 'Dawn FM', artist: 'The Weeknd', artistId: 'artist-2', year: 2022, image: 'https://picsum.photos/seed/album11/300/300', songCount: 16 },
  { id: 'album-12', title: 'Aashiqui 2', artist: 'Arijit Singh', artistId: 'artist-1', year: 2013, image: 'https://picsum.photos/seed/album12/300/300', songCount: 10 },
];

export const songs = [
  { id: 'song-1', title: 'Blinding Lights', artist: 'The Weeknd', artistId: 'artist-2', album: 'After Hours', albumId: 'album-1', duration: 203, image: 'https://picsum.photos/seed/song1/300/300' },
  { id: 'song-2', title: 'Levitating', artist: 'Dua Lipa', artistId: 'artist-3', album: 'Future Nostalgia', albumId: 'album-2', duration: 203, image: 'https://picsum.photos/seed/song2/300/300' },
  { id: 'song-3', title: 'God\'s Plan', artist: 'Drake', artistId: 'artist-4', album: 'Certified Lover Boy', albumId: 'album-3', duration: 198, image: 'https://picsum.photos/seed/song3/300/300' },
  { id: 'song-4', title: 'Anti-Hero', artist: 'Taylor Swift', artistId: 'artist-5', album: 'Midnights', albumId: 'album-4', duration: 200, image: 'https://picsum.photos/seed/song4/300/300' },
  { id: 'song-5', title: 'Brown Munde', artist: 'AP Dhillon', artistId: 'artist-6', album: 'Hidden Gems', albumId: 'album-5', duration: 220, image: 'https://picsum.photos/seed/song5/300/300' },
  { id: 'song-6', title: 'Bad Guy', artist: 'Billie Eilish', artistId: 'artist-7', album: 'Happier Than Ever', albumId: 'album-6', duration: 194, image: 'https://picsum.photos/seed/song6/300/300' },
  { id: 'song-7', title: 'Shape of You', artist: 'Ed Sheeran', artistId: 'artist-8', album: 'Divide', albumId: 'album-7', duration: 234, image: 'https://picsum.photos/seed/song7/300/300' },
  { id: 'song-8', title: 'Tum Hi Ho', artist: 'Arijit Singh', artistId: 'artist-1', album: 'Aashiqui 2', albumId: 'album-12', duration: 261, image: 'https://picsum.photos/seed/song8/300/300' },
  { id: 'song-9', title: 'Dynamite', artist: 'BTS', artistId: 'artist-10', album: 'Map of the Soul: 7', albumId: 'album-9', duration: 199, image: 'https://picsum.photos/seed/song9/300/300' },
  { id: 'song-10', title: 'Circles', artist: 'Post Malone', artistId: 'artist-11', album: 'Hollywood\'s Bleeding', albumId: 'album-10', duration: 215, image: 'https://picsum.photos/seed/song10/300/300' },
  { id: 'song-11', title: 'Save Your Tears', artist: 'The Weeknd', artistId: 'artist-2', album: 'After Hours', albumId: 'album-1', duration: 215, image: 'https://picsum.photos/seed/song11/300/300' },
  { id: 'song-12', title: 'Don\'t Start Now', artist: 'Dua Lipa', artistId: 'artist-3', album: 'Future Nostalgia', albumId: 'album-2', duration: 183, image: 'https://picsum.photos/seed/song12/300/300' },
  { id: 'song-13', title: 'Hotline Bling', artist: 'Drake', artistId: 'artist-4', album: 'Certified Lover Boy', albumId: 'album-3', duration: 267, image: 'https://picsum.photos/seed/song13/300/300' },
  { id: 'song-14', title: 'Shake It Off', artist: 'Taylor Swift', artistId: 'artist-5', album: 'Midnights', albumId: 'album-4', duration: 219, image: 'https://picsum.photos/seed/song14/300/300' },
  { id: 'song-15', title: 'Excuses', artist: 'AP Dhillon', artistId: 'artist-6', album: 'Hidden Gems', albumId: 'album-5', duration: 195, image: 'https://picsum.photos/seed/song15/300/300' },
  { id: 'song-16', title: 'Happier Than Ever', artist: 'Billie Eilish', artistId: 'artist-7', album: 'Happier Than Ever', albumId: 'album-6', duration: 298, image: 'https://picsum.photos/seed/song16/300/300' },
  { id: 'song-17', title: 'Perfect', artist: 'Ed Sheeran', artistId: 'artist-8', album: 'Divide', albumId: 'album-7', duration: 263, image: 'https://picsum.photos/seed/song17/300/300' },
  { id: 'song-18', title: 'Channa Mereya', artist: 'Arijit Singh', artistId: 'artist-1', album: 'Ae Dil Hai Mushkil', albumId: 'album-8', duration: 290, image: 'https://picsum.photos/seed/song18/300/300' },
  { id: 'song-19', title: 'Butter', artist: 'BTS', artistId: 'artist-10', album: 'Map of the Soul: 7', albumId: 'album-9', duration: 164, image: 'https://picsum.photos/seed/song19/300/300' },
  { id: 'song-20', title: 'Sunflower', artist: 'Post Malone', artistId: 'artist-11', album: 'Hollywood\'s Bleeding', albumId: 'album-10', duration: 158, image: 'https://picsum.photos/seed/song20/300/300' },
  { id: 'song-21', title: 'Starboy', artist: 'The Weeknd', artistId: 'artist-2', album: 'After Hours', albumId: 'album-1', duration: 230, image: 'https://picsum.photos/seed/song21/300/300' },
  { id: 'song-22', title: 'Physical', artist: 'Dua Lipa', artistId: 'artist-3', album: 'Future Nostalgia', albumId: 'album-2', duration: 194, image: 'https://picsum.photos/seed/song22/300/300' },
  { id: 'song-23', title: 'One Dance', artist: 'Drake', artistId: 'artist-4', album: 'Certified Lover Boy', albumId: 'album-3', duration: 174, image: 'https://picsum.photos/seed/song23/300/300' },
  { id: 'song-24', title: 'Love Story', artist: 'Taylor Swift', artistId: 'artist-5', album: 'Midnights', albumId: 'album-4', duration: 235, image: 'https://picsum.photos/seed/song24/300/300' },
  { id: 'song-25', title: 'Insane', artist: 'AP Dhillon', artistId: 'artist-6', album: 'Hidden Gems', albumId: 'album-5', duration: 188, image: 'https://picsum.photos/seed/song25/300/300' },
  { id: 'song-26', title: 'Ocean Eyes', artist: 'Billie Eilish', artistId: 'artist-7', album: 'Happier Than Ever', albumId: 'album-6', duration: 200, image: 'https://picsum.photos/seed/song26/300/300' },
  { id: 'song-27', title: 'Photograph', artist: 'Ed Sheeran', artistId: 'artist-8', album: 'Divide', albumId: 'album-7', duration: 258, image: 'https://picsum.photos/seed/song27/300/300' },
  { id: 'song-28', title: 'Kesariya', artist: 'Arijit Singh', artistId: 'artist-1', album: 'Aashiqui 2', albumId: 'album-12', duration: 268, image: 'https://picsum.photos/seed/song28/300/300' },
  { id: 'song-29', title: 'Boy With Luv', artist: 'BTS', artistId: 'artist-10', album: 'Map of the Soul: 7', albumId: 'album-9', duration: 229, image: 'https://picsum.photos/seed/song29/300/300' },
  { id: 'song-30', title: 'Rockstar', artist: 'Post Malone', artistId: 'artist-11', album: 'Hollywood\'s Bleeding', albumId: 'album-10', duration: 218, image: 'https://picsum.photos/seed/song30/300/300' },
  { id: 'song-31', title: 'Die For You', artist: 'The Weeknd', artistId: 'artist-2', album: 'Dawn FM', albumId: 'album-11', duration: 260, image: 'https://picsum.photos/seed/song31/300/300' },
  { id: 'song-32', title: 'Break My Heart', artist: 'Dua Lipa', artistId: 'artist-3', album: 'Future Nostalgia', albumId: 'album-2', duration: 222, image: 'https://picsum.photos/seed/song32/300/300' },
  { id: 'song-33', title: 'Nice For What', artist: 'Drake', artistId: 'artist-4', album: 'Certified Lover Boy', albumId: 'album-3', duration: 210, image: 'https://picsum.photos/seed/song33/300/300' },
  { id: 'song-34', title: 'Blank Space', artist: 'Taylor Swift', artistId: 'artist-5', album: 'Midnights', albumId: 'album-4', duration: 231, image: 'https://picsum.photos/seed/song34/300/300' },
  { id: 'song-35', title: 'Dil Luteya', artist: 'AP Dhillon', artistId: 'artist-6', album: 'Hidden Gems', albumId: 'album-5', duration: 201, image: 'https://picsum.photos/seed/song35/300/300' },
  { id: 'song-36', title: 'Therefore I Am', artist: 'Billie Eilish', artistId: 'artist-7', album: 'Happier Than Ever', albumId: 'album-6', duration: 174, image: 'https://picsum.photos/seed/song36/300/300' },
  { id: 'song-37', title: 'Thinking Out Loud', artist: 'Ed Sheeran', artistId: 'artist-8', album: 'Divide', albumId: 'album-7', duration: 281, image: 'https://picsum.photos/seed/song37/300/300' },
  { id: 'song-38', title: 'Raabta', artist: 'Arijit Singh', artistId: 'artist-1', album: 'Aashiqui 2', albumId: 'album-12', duration: 244, image: 'https://picsum.photos/seed/song38/300/300' },
  { id: 'song-39', title: 'Spring Day', artist: 'BTS', artistId: 'artist-10', album: 'Map of the Soul: 7', albumId: 'album-9', duration: 285, image: 'https://picsum.photos/seed/song39/300/300' },
  { id: 'song-40', title: 'Congratulations', artist: 'Post Malone', artistId: 'artist-11', album: 'Hollywood\'s Bleeding', albumId: 'album-10', duration: 220, image: 'https://picsum.photos/seed/song40/300/300' },
  { id: 'song-41', title: 'Take My Breath', artist: 'The Weeknd', artistId: 'artist-2', album: 'Dawn FM', albumId: 'album-11', duration: 215, image: 'https://picsum.photos/seed/song41/300/300' },
  { id: 'song-42', title: 'New Rules', artist: 'Dua Lipa', artistId: 'artist-3', album: 'Future Nostalgia', albumId: 'album-2', duration: 209, image: 'https://picsum.photos/seed/song42/300/300' },
  { id: 'song-43', title: 'In My Feelings', artist: 'Drake', artistId: 'artist-4', album: 'Certified Lover Boy', albumId: 'album-3', duration: 217, image: 'https://picsum.photos/seed/song43/300/300' },
  { id: 'song-44', title: 'Cruel Summer', artist: 'Taylor Swift', artistId: 'artist-5', album: 'Midnights', albumId: 'album-4', duration: 178, image: 'https://picsum.photos/seed/song44/300/300' },
  { id: 'song-45', title: 'With You', artist: 'AP Dhillon', artistId: 'artist-6', album: 'Hidden Gems', albumId: 'album-5', duration: 211, image: 'https://picsum.photos/seed/song45/300/300' },
  { id: 'song-46', title: 'Lovely', artist: 'Billie Eilish', artistId: 'artist-7', album: 'Happier Than Ever', albumId: 'album-6', duration: 200, image: 'https://picsum.photos/seed/song46/300/300' },
  { id: 'song-47', title: 'Castle on the Hill', artist: 'Ed Sheeran', artistId: 'artist-8', album: 'Divide', albumId: 'album-7', duration: 261, image: 'https://picsum.photos/seed/song47/300/300' },
  { id: 'song-48', title: 'Agar Tum Saath Ho', artist: 'Arijit Singh', artistId: 'artist-1', album: 'Aashiqui 2', albumId: 'album-12', duration: 333, image: 'https://picsum.photos/seed/song48/300/300' },
  { id: 'song-49', title: 'Fake Love', artist: 'BTS', artistId: 'artist-10', album: 'Map of the Soul: 7', albumId: 'album-9', duration: 242, image: 'https://picsum.photos/seed/song49/300/300' },
  { id: 'song-50', title: 'Better Now', artist: 'Post Malone', artistId: 'artist-11', album: 'Hollywood\'s Bleeding', albumId: 'album-10', duration: 231, image: 'https://picsum.photos/seed/song50/300/300' },
  { id: 'song-51', title: 'Heartless', artist: 'The Weeknd', artistId: 'artist-2', album: 'After Hours', albumId: 'album-1', duration: 198, image: 'https://picsum.photos/seed/song51/300/300' },
  { id: 'song-52', title: 'Hallucinate', artist: 'Dua Lipa', artistId: 'artist-3', album: 'Future Nostalgia', albumId: 'album-2', duration: 209, image: 'https://picsum.photos/seed/song52/300/300' },
  { id: 'song-53', title: 'Ae Dil Hai Mushkil', artist: 'Arijit Singh', artistId: 'artist-1', album: 'Ae Dil Hai Mushkil', albumId: 'album-8', duration: 270, image: 'https://picsum.photos/seed/song53/300/300' },
  { id: 'song-54', title: 'Sun Saathiya', artist: 'Shreya Ghoshal', artistId: 'artist-12', album: 'Ae Dil Hai Mushkil', albumId: 'album-8', duration: 256, image: 'https://picsum.photos/seed/song54/300/300' },
];

export const playlists = [
  { id: 'playlist-1', title: 'Today\'s Top Hits', description: 'The most popular songs right now', image: 'https://picsum.photos/seed/pl1/300/300', songIds: ['song-1', 'song-2', 'song-3', 'song-4', 'song-7', 'song-9', 'song-10'], gradient: 'from-purple-600 to-blue-600' },
  { id: 'playlist-2', title: 'Chill Vibes', description: 'Relax and unwind with these mellow tracks', image: 'https://picsum.photos/seed/pl2/300/300', songIds: ['song-17', 'song-27', 'song-26', 'song-48', 'song-46'], gradient: 'from-green-600 to-teal-600' },
  { id: 'playlist-3', title: 'Bollywood Hits', description: 'Best of Hindi music', image: 'https://picsum.photos/seed/pl3/300/300', songIds: ['song-8', 'song-18', 'song-28', 'song-38', 'song-48', 'song-53', 'song-54'], gradient: 'from-orange-600 to-red-600' },
  { id: 'playlist-4', title: 'Workout Energy', description: 'High energy tracks to fuel your workout', image: 'https://picsum.photos/seed/pl4/300/300', songIds: ['song-5', 'song-6', 'song-9', 'song-21', 'song-30'], gradient: 'from-red-600 to-yellow-600' },
  { id: 'playlist-5', title: 'Punjabi Fire', description: 'Latest Punjabi bangers', image: 'https://picsum.photos/seed/pl5/300/300', songIds: ['song-5', 'song-15', 'song-25', 'song-35', 'song-45'], gradient: 'from-yellow-500 to-orange-600' },
  { id: 'playlist-6', title: 'Late Night Feels', description: 'Songs for those late night thoughts', image: 'https://picsum.photos/seed/pl6/300/300', songIds: ['song-11', 'song-31', 'song-16', 'song-46', 'song-48'], gradient: 'from-indigo-600 to-purple-700' },
  { id: 'playlist-7', title: 'Pop Party', description: 'Ultimate pop playlist to keep the party going', image: 'https://picsum.photos/seed/pl7/300/300', songIds: ['song-2', 'song-4', 'song-14', 'song-22', 'song-42', 'song-44'], gradient: 'from-pink-500 to-rose-600' },
  { id: 'playlist-8', title: 'K-Pop Essentials', description: 'The best of Korean pop music', image: 'https://picsum.photos/seed/pl8/300/300', songIds: ['song-9', 'song-19', 'song-29', 'song-39', 'song-49'], gradient: 'from-cyan-500 to-blue-600' },
  { id: 'playlist-9', title: 'Rap Caviar', description: 'The most iconic hip-hop tracks', image: 'https://picsum.photos/seed/pl9/300/300', songIds: ['song-3', 'song-13', 'song-23', 'song-30', 'song-40', 'song-50'], gradient: 'from-gray-700 to-gray-900' },
  { id: 'playlist-10', title: 'Acoustic Morning', description: 'Start your day with acoustic vibes', image: 'https://picsum.photos/seed/pl10/300/300', songIds: ['song-7', 'song-17', 'song-27', 'song-37', 'song-47'], gradient: 'from-amber-500 to-orange-400' },
];

export const genres = [
  { id: 'genre-1', name: 'Pop', color: 'bg-pink-600' },
  { id: 'genre-2', name: 'Rock', color: 'bg-red-700' },
  { id: 'genre-3', name: 'Hip-Hop', color: 'bg-yellow-600' },
  { id: 'genre-4', name: 'Electronic', color: 'bg-blue-600' },
  { id: 'genre-5', name: 'Classical', color: 'bg-amber-700' },
  { id: 'genre-6', name: 'Jazz', color: 'bg-purple-700' },
  { id: 'genre-7', name: 'Indie', color: 'bg-teal-600' },
  { id: 'genre-8', name: 'Bollywood', color: 'bg-orange-600' },
  { id: 'genre-9', name: 'Punjabi', color: 'bg-green-600' },
  { id: 'genre-10', name: 'Tamil', color: 'bg-indigo-600' },
  { id: 'genre-11', name: 'K-Pop', color: 'bg-cyan-500' },
  { id: 'genre-12', name: 'R&B', color: 'bg-rose-600' },
  { id: 'genre-13', name: 'Country', color: 'bg-lime-700' },
  { id: 'genre-14', name: 'Metal', color: 'bg-gray-700' },
  { id: 'genre-15', name: 'Reggae', color: 'bg-emerald-600' },
  { id: 'genre-16', name: 'Latin', color: 'bg-fuchsia-600' },
];

export const moods = [
  { id: 'mood-1', name: 'Chill', color: 'bg-sky-600', icon: '😌' },
  { id: 'mood-2', name: 'Party', color: 'bg-pink-600', icon: '🎉' },
  { id: 'mood-3', name: 'Romance', color: 'bg-red-500', icon: '❤️' },
  { id: 'mood-4', name: 'Workout', color: 'bg-orange-600', icon: '💪' },
  { id: 'mood-5', name: 'Focus', color: 'bg-indigo-600', icon: '🎯' },
  { id: 'mood-6', name: 'Sleep', color: 'bg-purple-800', icon: '🌙' },
  { id: 'mood-7', name: 'Desi', color: 'bg-green-600', icon: '🇮🇳' },
  { id: 'mood-8', name: 'Hip-Hop', color: 'bg-yellow-600', icon: '🎤' },
];

export const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};
