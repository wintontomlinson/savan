// Mock Data for YouTube Music Clone
// Audio: Free samples from SoundHelix (soundhelix.com) - no license restrictions

// Audio URLs - SoundHelix provides 16 free tracks
const audioBase = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-';
const getAudio = (n) => `${audioBase}${((n - 1) % 16) + 1}.mp3`;

export const artists = [
  { id: 'artist-1', name: 'Arijit Singh', image: 'https://picsum.photos/seed/artist1/300/300', monthlyListeners: '85M', bio: 'Indian playback singer known for his soulful voice and romantic ballads.', location: 'Mumbai, India', language: 'Hindi', genres: ['Bollywood', 'Romantic'] },
  { id: 'artist-2', name: 'The Weeknd', image: 'https://picsum.photos/seed/artist2/300/300', monthlyListeners: '95M', bio: 'Canadian singer-songwriter known for his versatile vocal range and dark R&B style.', location: 'Toronto, Canada', language: 'English', genres: ['R&B', 'Pop', 'Electronic'] },
  { id: 'artist-3', name: 'Dua Lipa', image: 'https://picsum.photos/seed/artist3/300/300', monthlyListeners: '72M', bio: 'English singer-songwriter known for her signature disco-pop sound.', location: 'London, UK', language: 'English', genres: ['Pop', 'Dance', 'Disco'] },
  { id: 'artist-4', name: 'Drake', image: 'https://picsum.photos/seed/artist4/300/300', monthlyListeners: '88M', bio: 'Canadian rapper, singer and songwriter, one of the best-selling music artists.', location: 'Toronto, Canada', language: 'English', genres: ['Hip-Hop', 'Rap', 'R&B'] },
  { id: 'artist-5', name: 'Taylor Swift', image: 'https://picsum.photos/seed/artist5/300/300', monthlyListeners: '92M', bio: 'American singer-songwriter known for narrative songs about her personal life.', location: 'Nashville, USA', language: 'English', genres: ['Pop', 'Country', 'Indie'] },
  { id: 'artist-6', name: 'AP Dhillon', image: 'https://picsum.photos/seed/artist6/300/300', monthlyListeners: '35M', bio: 'Indo-Canadian singer, songwriter, and record producer.', location: 'Punjab, India', language: 'Punjabi', genres: ['Punjabi', 'Hip-Hop', 'R&B'] },
  { id: 'artist-7', name: 'Billie Eilish', image: 'https://picsum.photos/seed/artist7/300/300', monthlyListeners: '78M', bio: 'American singer-songwriter known for her whispered vocals and genre-bending music.', location: 'Los Angeles, USA', language: 'English', genres: ['Pop', 'Electronic', 'Indie'] },
  { id: 'artist-8', name: 'Ed Sheeran', image: 'https://picsum.photos/seed/artist8/300/300', monthlyListeners: '82M', bio: 'English singer-songwriter known for his acoustic pop and heartfelt lyrics.', location: 'Suffolk, UK', language: 'English', genres: ['Pop', 'Acoustic', 'Folk'] },
  { id: 'artist-9', name: 'Pritam', image: 'https://picsum.photos/seed/artist9/300/300', monthlyListeners: '45M', bio: 'Indian music director and composer known for Bollywood film scores.', location: 'Kolkata, India', language: 'Hindi', genres: ['Bollywood', 'Romantic', 'Dance'] },
  { id: 'artist-10', name: 'BTS', image: 'https://picsum.photos/seed/artist10/300/300', monthlyListeners: '68M', bio: 'South Korean boy band known for their energetic performances and global influence.', location: 'Seoul, South Korea', language: 'Korean', genres: ['K-Pop', 'Pop', 'Hip-Hop'] },
  { id: 'artist-11', name: 'Post Malone', image: 'https://picsum.photos/seed/artist11/300/300', monthlyListeners: '65M', bio: 'American rapper and singer known for blending genres.', location: 'Dallas, USA', language: 'English', genres: ['Hip-Hop', 'Pop', 'Rock'] },
  { id: 'artist-12', name: 'Shreya Ghoshal', image: 'https://picsum.photos/seed/artist12/300/300', monthlyListeners: '40M', bio: 'Indian playback singer known for her classical and contemporary vocal style.', location: 'Mumbai, India', language: 'Hindi', genres: ['Bollywood', 'Classical', 'Romantic'] },
];

export const albums = [
  { id: 'album-1', title: 'After Hours', artist: 'The Weeknd', artistId: 'artist-2', year: 2020, image: 'https://picsum.photos/seed/album1/300/300', songCount: 14, genre: 'R&B' },
  { id: 'album-2', title: 'Future Nostalgia', artist: 'Dua Lipa', artistId: 'artist-3', year: 2020, image: 'https://picsum.photos/seed/album2/300/300', songCount: 11, genre: 'Pop' },
  { id: 'album-3', title: 'Certified Lover Boy', artist: 'Drake', artistId: 'artist-4', year: 2021, image: 'https://picsum.photos/seed/album3/300/300', songCount: 21, genre: 'Hip-Hop' },
  { id: 'album-4', title: 'Midnights', artist: 'Taylor Swift', artistId: 'artist-5', year: 2022, image: 'https://picsum.photos/seed/album4/300/300', songCount: 13, genre: 'Pop' },
  { id: 'album-5', title: 'Hidden Gems', artist: 'AP Dhillon', artistId: 'artist-6', year: 2023, image: 'https://picsum.photos/seed/album5/300/300', songCount: 8, genre: 'Punjabi' },
  { id: 'album-6', title: 'Happier Than Ever', artist: 'Billie Eilish', artistId: 'artist-7', year: 2021, image: 'https://picsum.photos/seed/album6/300/300', songCount: 16, genre: 'Indie' },
  { id: 'album-7', title: 'Divide', artist: 'Ed Sheeran', artistId: 'artist-8', year: 2017, image: 'https://picsum.photos/seed/album7/300/300', songCount: 12, genre: 'Pop' },
  { id: 'album-8', title: 'Ae Dil Hai Mushkil', artist: 'Pritam', artistId: 'artist-9', year: 2016, image: 'https://picsum.photos/seed/album8/300/300', songCount: 7, genre: 'Bollywood' },
  { id: 'album-9', title: 'Map of the Soul: 7', artist: 'BTS', artistId: 'artist-10', year: 2020, image: 'https://picsum.photos/seed/album9/300/300', songCount: 20, genre: 'K-Pop' },
  { id: 'album-10', title: "Hollywood's Bleeding", artist: 'Post Malone', artistId: 'artist-11', year: 2019, image: 'https://picsum.photos/seed/album10/300/300', songCount: 17, genre: 'Hip-Hop' },
  { id: 'album-11', title: 'Dawn FM', artist: 'The Weeknd', artistId: 'artist-2', year: 2022, image: 'https://picsum.photos/seed/album11/300/300', songCount: 16, genre: 'Electronic' },
  { id: 'album-12', title: 'Aashiqui 2', artist: 'Arijit Singh', artistId: 'artist-1', year: 2013, image: 'https://picsum.photos/seed/album12/300/300', songCount: 10, genre: 'Bollywood' },
];

export const songs = [
  // === ENGLISH POP ===
  { id: 'song-1', title: 'Blinding Lights', artist: 'The Weeknd', artistId: 'artist-2', album: 'After Hours', albumId: 'album-1', duration: 203, image: 'https://picsum.photos/seed/song1/300/300', audio: getAudio(1), genre: 'Pop', mood: 'Energy', language: 'English' },
  { id: 'song-2', title: 'Levitating', artist: 'Dua Lipa', artistId: 'artist-3', album: 'Future Nostalgia', albumId: 'album-2', duration: 203, image: 'https://picsum.photos/seed/song2/300/300', audio: getAudio(2), genre: 'Pop', mood: 'Party', language: 'English' },
  { id: 'song-4', title: 'Anti-Hero', artist: 'Taylor Swift', artistId: 'artist-5', album: 'Midnights', albumId: 'album-4', duration: 200, image: 'https://picsum.photos/seed/song4/300/300', audio: getAudio(3), genre: 'Pop', mood: 'Chill', language: 'English' },
  { id: 'song-7', title: 'Shape of You', artist: 'Ed Sheeran', artistId: 'artist-8', album: 'Divide', albumId: 'album-7', duration: 234, image: 'https://picsum.photos/seed/song7/300/300', audio: getAudio(4), genre: 'Pop', mood: 'Romance', language: 'English' },
  { id: 'song-11', title: 'Save Your Tears', artist: 'The Weeknd', artistId: 'artist-2', album: 'After Hours', albumId: 'album-1', duration: 215, image: 'https://picsum.photos/seed/song11/300/300', audio: getAudio(5), genre: 'Pop', mood: 'Energy', language: 'English' },
  { id: 'song-12', title: "Don't Start Now", artist: 'Dua Lipa', artistId: 'artist-3', album: 'Future Nostalgia', albumId: 'album-2', duration: 183, image: 'https://picsum.photos/seed/song12/300/300', audio: getAudio(6), genre: 'Pop', mood: 'Party', language: 'English' },
  { id: 'song-14', title: 'Shake It Off', artist: 'Taylor Swift', artistId: 'artist-5', album: 'Midnights', albumId: 'album-4', duration: 219, image: 'https://picsum.photos/seed/song14/300/300', audio: getAudio(7), genre: 'Pop', mood: 'Party', language: 'English' },
  { id: 'song-17', title: 'Perfect', artist: 'Ed Sheeran', artistId: 'artist-8', album: 'Divide', albumId: 'album-7', duration: 263, image: 'https://picsum.photos/seed/song17/300/300', audio: getAudio(8), genre: 'Pop', mood: 'Romance', language: 'English' },
  { id: 'song-22', title: 'Physical', artist: 'Dua Lipa', artistId: 'artist-3', album: 'Future Nostalgia', albumId: 'album-2', duration: 194, image: 'https://picsum.photos/seed/song22/300/300', audio: getAudio(9), genre: 'Pop', mood: 'Workout', language: 'English' },
  { id: 'song-24', title: 'Love Story', artist: 'Taylor Swift', artistId: 'artist-5', album: 'Midnights', albumId: 'album-4', duration: 235, image: 'https://picsum.photos/seed/song24/300/300', audio: getAudio(10), genre: 'Pop', mood: 'Romance', language: 'English' },
  { id: 'song-27', title: 'Photograph', artist: 'Ed Sheeran', artistId: 'artist-8', album: 'Divide', albumId: 'album-7', duration: 258, image: 'https://picsum.photos/seed/song27/300/300', audio: getAudio(11), genre: 'Pop', mood: 'Chill', language: 'English' },
  { id: 'song-34', title: 'Blank Space', artist: 'Taylor Swift', artistId: 'artist-5', album: 'Midnights', albumId: 'album-4', duration: 231, image: 'https://picsum.photos/seed/song34/300/300', audio: getAudio(12), genre: 'Pop', mood: 'Energy', language: 'English' },
  { id: 'song-37', title: 'Thinking Out Loud', artist: 'Ed Sheeran', artistId: 'artist-8', album: 'Divide', albumId: 'album-7', duration: 281, image: 'https://picsum.photos/seed/song37/300/300', audio: getAudio(13), genre: 'Pop', mood: 'Romance', language: 'English' },
  { id: 'song-42', title: 'New Rules', artist: 'Dua Lipa', artistId: 'artist-3', album: 'Future Nostalgia', albumId: 'album-2', duration: 209, image: 'https://picsum.photos/seed/song42/300/300', audio: getAudio(14), genre: 'Pop', mood: 'Party', language: 'English' },
  { id: 'song-44', title: 'Cruel Summer', artist: 'Taylor Swift', artistId: 'artist-5', album: 'Midnights', albumId: 'album-4', duration: 178, image: 'https://picsum.photos/seed/song44/300/300', audio: getAudio(15), genre: 'Pop', mood: 'Energy', language: 'English' },
  { id: 'song-47', title: 'Castle on the Hill', artist: 'Ed Sheeran', artistId: 'artist-8', album: 'Divide', albumId: 'album-7', duration: 261, image: 'https://picsum.photos/seed/song47/300/300', audio: getAudio(16), genre: 'Pop', mood: 'Energy', language: 'English' },

  // === HIP-HOP / RAP ===
  { id: 'song-3', title: "God's Plan", artist: 'Drake', artistId: 'artist-4', album: 'Certified Lover Boy', albumId: 'album-3', duration: 198, image: 'https://picsum.photos/seed/song3/300/300', audio: getAudio(3), genre: 'Hip-Hop', mood: 'Energy', language: 'English' },
  { id: 'song-10', title: 'Circles', artist: 'Post Malone', artistId: 'artist-11', album: "Hollywood's Bleeding", albumId: 'album-10', duration: 215, image: 'https://picsum.photos/seed/song10/300/300', audio: getAudio(4), genre: 'Hip-Hop', mood: 'Chill', language: 'English' },
  { id: 'song-13', title: 'Hotline Bling', artist: 'Drake', artistId: 'artist-4', album: 'Certified Lover Boy', albumId: 'album-3', duration: 267, image: 'https://picsum.photos/seed/song13/300/300', audio: getAudio(5), genre: 'Hip-Hop', mood: 'Chill', language: 'English' },
  { id: 'song-20', title: 'Sunflower', artist: 'Post Malone', artistId: 'artist-11', album: "Hollywood's Bleeding", albumId: 'album-10', duration: 158, image: 'https://picsum.photos/seed/song20/300/300', audio: getAudio(6), genre: 'Hip-Hop', mood: 'Chill', language: 'English' },
  { id: 'song-23', title: 'One Dance', artist: 'Drake', artistId: 'artist-4', album: 'Certified Lover Boy', albumId: 'album-3', duration: 174, image: 'https://picsum.photos/seed/song23/300/300', audio: getAudio(7), genre: 'Hip-Hop', mood: 'Party', language: 'English' },
  { id: 'song-30', title: 'Rockstar', artist: 'Post Malone', artistId: 'artist-11', album: "Hollywood's Bleeding", albumId: 'album-10', duration: 218, image: 'https://picsum.photos/seed/song30/300/300', audio: getAudio(8), genre: 'Hip-Hop', mood: 'Energy', language: 'English' },
  { id: 'song-33', title: 'Nice For What', artist: 'Drake', artistId: 'artist-4', album: 'Certified Lover Boy', albumId: 'album-3', duration: 210, image: 'https://picsum.photos/seed/song33/300/300', audio: getAudio(9), genre: 'Hip-Hop', mood: 'Party', language: 'English' },
  { id: 'song-40', title: 'Congratulations', artist: 'Post Malone', artistId: 'artist-11', album: "Hollywood's Bleeding", albumId: 'album-10', duration: 220, image: 'https://picsum.photos/seed/song40/300/300', audio: getAudio(10), genre: 'Hip-Hop', mood: 'Party', language: 'English' },
  { id: 'song-43', title: 'In My Feelings', artist: 'Drake', artistId: 'artist-4', album: 'Certified Lover Boy', albumId: 'album-3', duration: 217, image: 'https://picsum.photos/seed/song43/300/300', audio: getAudio(11), genre: 'Hip-Hop', mood: 'Romance', language: 'English' },
  { id: 'song-50', title: 'Better Now', artist: 'Post Malone', artistId: 'artist-11', album: "Hollywood's Bleeding", albumId: 'album-10', duration: 231, image: 'https://picsum.photos/seed/song50/300/300', audio: getAudio(12), genre: 'Hip-Hop', mood: 'Chill', language: 'English' },

  // === INDIE / ELECTRONIC ===
  { id: 'song-6', title: 'Bad Guy', artist: 'Billie Eilish', artistId: 'artist-7', album: 'Happier Than Ever', albumId: 'album-6', duration: 194, image: 'https://picsum.photos/seed/song6/300/300', audio: getAudio(13), genre: 'Indie', mood: 'Energy', language: 'English' },
  { id: 'song-16', title: 'Happier Than Ever', artist: 'Billie Eilish', artistId: 'artist-7', album: 'Happier Than Ever', albumId: 'album-6', duration: 298, image: 'https://picsum.photos/seed/song16/300/300', audio: getAudio(14), genre: 'Indie', mood: 'Chill', language: 'English' },
  { id: 'song-26', title: 'Ocean Eyes', artist: 'Billie Eilish', artistId: 'artist-7', album: 'Happier Than Ever', albumId: 'album-6', duration: 200, image: 'https://picsum.photos/seed/song26/300/300', audio: getAudio(15), genre: 'Indie', mood: 'Sleep', language: 'English' },
  { id: 'song-36', title: 'Therefore I Am', artist: 'Billie Eilish', artistId: 'artist-7', album: 'Happier Than Ever', albumId: 'album-6', duration: 174, image: 'https://picsum.photos/seed/song36/300/300', audio: getAudio(16), genre: 'Indie', mood: 'Energy', language: 'English' },
  { id: 'song-46', title: 'Lovely', artist: 'Billie Eilish', artistId: 'artist-7', album: 'Happier Than Ever', albumId: 'album-6', duration: 200, image: 'https://picsum.photos/seed/song46/300/300', audio: getAudio(1), genre: 'Indie', mood: 'Sleep', language: 'English' },
  { id: 'song-21', title: 'Starboy', artist: 'The Weeknd', artistId: 'artist-2', album: 'After Hours', albumId: 'album-1', duration: 230, image: 'https://picsum.photos/seed/song21/300/300', audio: getAudio(2), genre: 'Electronic', mood: 'Energy', language: 'English' },
  { id: 'song-31', title: 'Die For You', artist: 'The Weeknd', artistId: 'artist-2', album: 'Dawn FM', albumId: 'album-11', duration: 260, image: 'https://picsum.photos/seed/song31/300/300', audio: getAudio(3), genre: 'R&B', mood: 'Romance', language: 'English' },
  { id: 'song-41', title: 'Take My Breath', artist: 'The Weeknd', artistId: 'artist-2', album: 'Dawn FM', albumId: 'album-11', duration: 215, image: 'https://picsum.photos/seed/song41/300/300', audio: getAudio(4), genre: 'Electronic', mood: 'Party', language: 'English' },
  { id: 'song-51', title: 'Heartless', artist: 'The Weeknd', artistId: 'artist-2', album: 'After Hours', albumId: 'album-1', duration: 198, image: 'https://picsum.photos/seed/song51/300/300', audio: getAudio(5), genre: 'R&B', mood: 'Energy', language: 'English' },
  { id: 'song-52', title: 'Hallucinate', artist: 'Dua Lipa', artistId: 'artist-3', album: 'Future Nostalgia', albumId: 'album-2', duration: 209, image: 'https://picsum.photos/seed/song52/300/300', audio: getAudio(6), genre: 'Electronic', mood: 'Party', language: 'English' },
  { id: 'song-32', title: 'Break My Heart', artist: 'Dua Lipa', artistId: 'artist-3', album: 'Future Nostalgia', albumId: 'album-2', duration: 222, image: 'https://picsum.photos/seed/song32/300/300', audio: getAudio(7), genre: 'Pop', mood: 'Energy', language: 'English' },

  // === BOLLYWOOD / HINDI ===
  { id: 'song-8', title: 'Tum Hi Ho', artist: 'Arijit Singh', artistId: 'artist-1', album: 'Aashiqui 2', albumId: 'album-12', duration: 261, image: 'https://picsum.photos/seed/song8/300/300', audio: getAudio(8), genre: 'Bollywood', mood: 'Romance', language: 'Hindi' },
  { id: 'song-18', title: 'Channa Mereya', artist: 'Arijit Singh', artistId: 'artist-1', album: 'Ae Dil Hai Mushkil', albumId: 'album-8', duration: 290, image: 'https://picsum.photos/seed/song18/300/300', audio: getAudio(9), genre: 'Bollywood', mood: 'Romance', language: 'Hindi' },
  { id: 'song-28', title: 'Kesariya', artist: 'Arijit Singh', artistId: 'artist-1', album: 'Aashiqui 2', albumId: 'album-12', duration: 268, image: 'https://picsum.photos/seed/song28/300/300', audio: getAudio(10), genre: 'Bollywood', mood: 'Romance', language: 'Hindi' },
  { id: 'song-38', title: 'Raabta', artist: 'Arijit Singh', artistId: 'artist-1', album: 'Aashiqui 2', albumId: 'album-12', duration: 244, image: 'https://picsum.photos/seed/song38/300/300', audio: getAudio(11), genre: 'Bollywood', mood: 'Chill', language: 'Hindi' },
  { id: 'song-48', title: 'Agar Tum Saath Ho', artist: 'Arijit Singh', artistId: 'artist-1', album: 'Aashiqui 2', albumId: 'album-12', duration: 333, image: 'https://picsum.photos/seed/song48/300/300', audio: getAudio(12), genre: 'Bollywood', mood: 'Romance', language: 'Hindi' },
  { id: 'song-53', title: 'Ae Dil Hai Mushkil', artist: 'Arijit Singh', artistId: 'artist-1', album: 'Ae Dil Hai Mushkil', albumId: 'album-8', duration: 270, image: 'https://picsum.photos/seed/song53/300/300', audio: getAudio(13), genre: 'Bollywood', mood: 'Romance', language: 'Hindi' },
  { id: 'song-54', title: 'Sun Saathiya', artist: 'Shreya Ghoshal', artistId: 'artist-12', album: 'Ae Dil Hai Mushkil', albumId: 'album-8', duration: 256, image: 'https://picsum.photos/seed/song54/300/300', audio: getAudio(14), genre: 'Bollywood', mood: 'Romance', language: 'Hindi' },

  // === PUNJABI ===
  { id: 'song-5', title: 'Brown Munde', artist: 'AP Dhillon', artistId: 'artist-6', album: 'Hidden Gems', albumId: 'album-5', duration: 220, image: 'https://picsum.photos/seed/song5/300/300', audio: getAudio(15), genre: 'Punjabi', mood: 'Party', language: 'Punjabi' },
  { id: 'song-15', title: 'Excuses', artist: 'AP Dhillon', artistId: 'artist-6', album: 'Hidden Gems', albumId: 'album-5', duration: 195, image: 'https://picsum.photos/seed/song15/300/300', audio: getAudio(16), genre: 'Punjabi', mood: 'Chill', language: 'Punjabi' },
  { id: 'song-25', title: 'Insane', artist: 'AP Dhillon', artistId: 'artist-6', album: 'Hidden Gems', albumId: 'album-5', duration: 188, image: 'https://picsum.photos/seed/song25/300/300', audio: getAudio(1), genre: 'Punjabi', mood: 'Energy', language: 'Punjabi' },
  { id: 'song-35', title: 'Dil Luteya', artist: 'AP Dhillon', artistId: 'artist-6', album: 'Hidden Gems', albumId: 'album-5', duration: 201, image: 'https://picsum.photos/seed/song35/300/300', audio: getAudio(2), genre: 'Punjabi', mood: 'Romance', language: 'Punjabi' },
  { id: 'song-45', title: 'With You', artist: 'AP Dhillon', artistId: 'artist-6', album: 'Hidden Gems', albumId: 'album-5', duration: 211, image: 'https://picsum.photos/seed/song45/300/300', audio: getAudio(3), genre: 'Punjabi', mood: 'Romance', language: 'Punjabi' },

  // === K-POP ===
  { id: 'song-9', title: 'Dynamite', artist: 'BTS', artistId: 'artist-10', album: 'Map of the Soul: 7', albumId: 'album-9', duration: 199, image: 'https://picsum.photos/seed/song9/300/300', audio: getAudio(4), genre: 'K-Pop', mood: 'Party', language: 'Korean' },
  { id: 'song-19', title: 'Butter', artist: 'BTS', artistId: 'artist-10', album: 'Map of the Soul: 7', albumId: 'album-9', duration: 164, image: 'https://picsum.photos/seed/song19/300/300', audio: getAudio(5), genre: 'K-Pop', mood: 'Party', language: 'Korean' },
  { id: 'song-29', title: 'Boy With Luv', artist: 'BTS', artistId: 'artist-10', album: 'Map of the Soul: 7', albumId: 'album-9', duration: 229, image: 'https://picsum.photos/seed/song29/300/300', audio: getAudio(6), genre: 'K-Pop', mood: 'Romance', language: 'Korean' },
  { id: 'song-39', title: 'Spring Day', artist: 'BTS', artistId: 'artist-10', album: 'Map of the Soul: 7', albumId: 'album-9', duration: 285, image: 'https://picsum.photos/seed/song39/300/300', audio: getAudio(7), genre: 'K-Pop', mood: 'Chill', language: 'Korean' },
  { id: 'song-49', title: 'Fake Love', artist: 'BTS', artistId: 'artist-10', album: 'Map of the Soul: 7', albumId: 'album-9', duration: 242, image: 'https://picsum.photos/seed/song49/300/300', audio: getAudio(8), genre: 'K-Pop', mood: 'Energy', language: 'Korean' },
];

// === CATEGORIZED PLAYLISTS ===
export const playlists = [
  // BY MOOD
  { id: 'playlist-1', title: "Today's Top Hits", description: 'The hottest tracks right now', image: 'https://picsum.photos/seed/pl1/300/300', songIds: ['song-1', 'song-2', 'song-3', 'song-4', 'song-7', 'song-9', 'song-10'], gradient: 'from-purple-600 to-blue-600', category: 'Trending', mood: 'Energy' },
  { id: 'playlist-2', title: 'Chill Vibes', description: 'Relax and unwind with mellow tracks', image: 'https://picsum.photos/seed/pl2/300/300', songIds: ['song-17', 'song-27', 'song-26', 'song-48', 'song-46', 'song-16', 'song-15'], gradient: 'from-green-600 to-teal-600', category: 'Mood', mood: 'Chill' },
  { id: 'playlist-3', title: 'Bollywood Romantic', description: 'Best Hindi love songs', image: 'https://picsum.photos/seed/pl3/300/300', songIds: ['song-8', 'song-18', 'song-28', 'song-38', 'song-48', 'song-53', 'song-54'], gradient: 'from-orange-600 to-red-600', category: 'Language', mood: 'Romance' },
  { id: 'playlist-4', title: 'Workout Pump', description: 'High energy for your grind', image: 'https://picsum.photos/seed/pl4/300/300', songIds: ['song-5', 'song-6', 'song-22', 'song-21', 'song-30', 'song-36', 'song-25'], gradient: 'from-red-600 to-yellow-600', category: 'Mood', mood: 'Workout' },
  { id: 'playlist-5', title: 'Punjabi Fire 🔥', description: 'Latest Punjabi bangers', image: 'https://picsum.photos/seed/pl5/300/300', songIds: ['song-5', 'song-15', 'song-25', 'song-35', 'song-45'], gradient: 'from-yellow-500 to-orange-600', category: 'Language', mood: 'Party' },
  { id: 'playlist-6', title: 'Late Night Feels', description: 'Songs for 2 AM thoughts', image: 'https://picsum.photos/seed/pl6/300/300', songIds: ['song-11', 'song-31', 'song-16', 'song-46', 'song-48', 'song-26', 'song-38'], gradient: 'from-indigo-600 to-purple-700', category: 'Mood', mood: 'Sleep' },
  { id: 'playlist-7', title: 'Pop Party', description: 'Dance-floor ready pop anthems', image: 'https://picsum.photos/seed/pl7/300/300', songIds: ['song-2', 'song-4', 'song-14', 'song-22', 'song-42', 'song-44', 'song-12'], gradient: 'from-pink-500 to-rose-600', category: 'Genre', mood: 'Party' },
  { id: 'playlist-8', title: 'K-Pop Essentials', description: 'Best of Korean pop music', image: 'https://picsum.photos/seed/pl8/300/300', songIds: ['song-9', 'song-19', 'song-29', 'song-39', 'song-49'], gradient: 'from-cyan-500 to-blue-600', category: 'Language', mood: 'Energy' },
  { id: 'playlist-9', title: 'Rap Caviar', description: 'Top hip-hop & rap tracks', image: 'https://picsum.photos/seed/pl9/300/300', songIds: ['song-3', 'song-13', 'song-23', 'song-30', 'song-40', 'song-50', 'song-33', 'song-43'], gradient: 'from-gray-700 to-gray-900', category: 'Genre', mood: 'Energy' },
  { id: 'playlist-10', title: 'Acoustic Morning ☀️', description: 'Start your day peacefully', image: 'https://picsum.photos/seed/pl10/300/300', songIds: ['song-7', 'song-17', 'song-27', 'song-37', 'song-47', 'song-24'], gradient: 'from-amber-500 to-orange-400', category: 'Mood', mood: 'Focus' },
  { id: 'playlist-11', title: 'Romantic Feels ❤️', description: 'Love songs across all languages', image: 'https://picsum.photos/seed/pl11/300/300', songIds: ['song-8', 'song-17', 'song-24', 'song-31', 'song-35', 'song-29', 'song-37', 'song-43'], gradient: 'from-red-500 to-pink-600', category: 'Mood', mood: 'Romance' },
  { id: 'playlist-12', title: 'Desi Hits', description: 'Hindi + Punjabi top tracks', image: 'https://picsum.photos/seed/pl12/300/300', songIds: ['song-8', 'song-5', 'song-18', 'song-15', 'song-28', 'song-25', 'song-53', 'song-54', 'song-35'], gradient: 'from-green-500 to-yellow-500', category: 'Language', mood: 'Party' },
];

export const genres = [
  { id: 'genre-1', name: 'Pop', color: 'bg-pink-600', songCount: songs.filter(s => s.genre === 'Pop').length },
  { id: 'genre-2', name: 'Hip-Hop', color: 'bg-yellow-600', songCount: songs.filter(s => s.genre === 'Hip-Hop').length },
  { id: 'genre-3', name: 'Bollywood', color: 'bg-orange-600', songCount: songs.filter(s => s.genre === 'Bollywood').length },
  { id: 'genre-4', name: 'K-Pop', color: 'bg-cyan-500', songCount: songs.filter(s => s.genre === 'K-Pop').length },
  { id: 'genre-5', name: 'Punjabi', color: 'bg-green-600', songCount: songs.filter(s => s.genre === 'Punjabi').length },
  { id: 'genre-6', name: 'Indie', color: 'bg-teal-600', songCount: songs.filter(s => s.genre === 'Indie').length },
  { id: 'genre-7', name: 'Electronic', color: 'bg-blue-600', songCount: songs.filter(s => s.genre === 'Electronic').length },
  { id: 'genre-8', name: 'R&B', color: 'bg-rose-600', songCount: songs.filter(s => s.genre === 'R&B').length },
  { id: 'genre-9', name: 'Rock', color: 'bg-red-700', songCount: 0 },
  { id: 'genre-10', name: 'Classical', color: 'bg-amber-700', songCount: 0 },
  { id: 'genre-11', name: 'Jazz', color: 'bg-purple-700', songCount: 0 },
  { id: 'genre-12', name: 'Latin', color: 'bg-fuchsia-600', songCount: 0 },
];

export const moods = [
  { id: 'mood-1', name: 'Chill', color: 'bg-sky-600', icon: '😌', songIds: songs.filter(s => s.mood === 'Chill').map(s => s.id) },
  { id: 'mood-2', name: 'Party', color: 'bg-pink-600', icon: '🎉', songIds: songs.filter(s => s.mood === 'Party').map(s => s.id) },
  { id: 'mood-3', name: 'Romance', color: 'bg-red-500', icon: '❤️', songIds: songs.filter(s => s.mood === 'Romance').map(s => s.id) },
  { id: 'mood-4', name: 'Workout', color: 'bg-orange-600', icon: '💪', songIds: songs.filter(s => s.mood === 'Workout').map(s => s.id) },
  { id: 'mood-5', name: 'Focus', color: 'bg-indigo-600', icon: '🎯', songIds: songs.filter(s => s.mood === 'Focus' || s.mood === 'Chill').map(s => s.id) },
  { id: 'mood-6', name: 'Sleep', color: 'bg-purple-800', icon: '🌙', songIds: songs.filter(s => s.mood === 'Sleep').map(s => s.id) },
  { id: 'mood-7', name: 'Desi', color: 'bg-green-600', icon: '🇮🇳', songIds: songs.filter(s => s.language === 'Hindi' || s.language === 'Punjabi').map(s => s.id) },
  { id: 'mood-8', name: 'Energy', color: 'bg-yellow-600', icon: '⚡', songIds: songs.filter(s => s.mood === 'Energy').map(s => s.id) },
];

// Helper functions
export const formatDuration = (seconds) => {
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

// Get songs by category
export const getSongsByGenre = (genre) => songs.filter(s => s.genre === genre);
export const getSongsByMood = (mood) => songs.filter(s => s.mood === mood);
export const getSongsByLanguage = (lang) => songs.filter(s => s.language === lang);
