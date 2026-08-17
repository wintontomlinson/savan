export const genres = ['Pop','Rock','Hip-Hop','Electronic','Classical','Jazz','Bollywood','Punjabi','Tamil','K-Pop','Indie','R&B'];
export const moods = ['Chill','Party','Focus','Workout','Romance','Sleep','Sad','Devotional'];
export const genreColors = {Pop:'from-pink-500 to-rose-600',Rock:'from-red-700 to-orange-600','Hip-Hop':'from-yellow-600 to-amber-800',Electronic:'from-blue-500 to-cyan-400',Classical:'from-amber-600 to-yellow-500',Jazz:'from-purple-700 to-indigo-600',Bollywood:'from-orange-500 to-red-600',Punjabi:'from-green-500 to-emerald-700',Tamil:'from-teal-500 to-cyan-700','K-Pop':'from-fuchsia-500 to-pink-400',Indie:'from-slate-500 to-gray-700','R&B':'from-violet-600 to-purple-800',Devotional:'from-amber-400 to-orange-500',Ambient:'from-sky-700 to-blue-900'};
export const moodColors = {Chill:'from-sky-500 to-indigo-600',Party:'from-pink-500 to-red-500',Focus:'from-emerald-500 to-teal-700',Workout:'from-orange-500 to-red-600',Romance:'from-rose-500 to-pink-600',Sleep:'from-indigo-800 to-purple-900',Sad:'from-blue-700 to-slate-800',Devotional:'from-amber-500 to-yellow-600'};

const img = (s,sz=300) => `https://picsum.photos/seed/${s}/${sz}/${sz}`;

export const songs = Array.from({length:60},(_,i)=>{
  const id=`s${i+1}`;
  const artistPool=['Arijit Singh','The Weeknd','Dua Lipa','Drake','Taylor Swift','AP Dhillon','Billie Eilish','Ed Sheeran','Pritam','BTS','Post Malone','Shreya Ghoshal'];
  const titlePool=['Midnight Dreams','Golden Hour','Stay With Me','Faded Memories','Electric Love','Sunset Blvd','Heartbeat','Neon Lights','Ocean Drive','Stargazer','Wildfire','Gravity','Euphoria','Lost in Time','Paradise','Echoes','Moonlight','Supernova','Breathless','Infinite','Crystal','Thunder','Velvet Sky','Afterglow','Mirage','Solitude','Daybreak','Cascade','Horizon','Twilight','Ember','Serenity','Radiance','Dusk','Wanderlust','Cosmos','Bloom','Whisper','Aurora','Ignite','Tempest','Illusion','Reverie','Genesis','Lullaby','Prism','Zenith','Voyage','Serenade','Phoenix','Nebula','Oasis','Elysium','Rhapsody','Vortex','Labyrinth','Odyssey','Harmony','Anthem','Legacy'];
  const genrePool=['Pop','Bollywood','Punjabi','Hip-Hop','Electronic','R&B','K-Pop','Indie','Rock','Classical'];
  const ai=i%12;
  const ali=i%10;
  return {id,title:titlePool[i],artist:artistPool[ai],album:`Album ${ali+1}`,genre:genrePool[i%genrePool.length],duration:180+Math.floor(Math.random()*120),thumbnail:img(id),artistId:`ar${ai+1}`,albumId:`al${ali+1}`,plays:Math.floor(Math.random()*5000000)+100000,liked:false};
});

export const artists = Array.from({length:12},(_,i)=>{
  const names=['Arijit Singh','The Weeknd','Dua Lipa','Drake','Taylor Swift','AP Dhillon','Billie Eilish','Ed Sheeran','Pritam','BTS','Post Malone','Shreya Ghoshal'];
  const bios=['Soulful Indian playback singer','Canadian R&B and pop sensation','British pop and dance icon','Canadian rapper and singer','American pop-country superstar','Indo-Canadian music producer','Genre-defying American artist','British acoustic pop star','Bollywood music composer','Global K-Pop phenomenon','Genre-blending American artist','Classical Indian vocalist'];
  const listeners=['85M','95M','72M','88M','92M','35M','78M','82M','45M','68M','65M','40M'];
  const g=[['Bollywood','Pop'],['R&B','Pop','Electronic'],['Pop','Electronic'],['Hip-Hop','R&B'],['Pop','Indie'],['Punjabi','Hip-Hop'],['Pop','Indie','Electronic'],['Pop','Rock'],['Bollywood'],['K-Pop','Pop'],['Hip-Hop','Pop','Rock'],['Bollywood','Classical']];
  const id=`ar${i+1}`;
  return {id,name:names[i],bio:bios[i],monthlyListeners:listeners[i],image:img(`a${id}`,400),genres:g[i],topSongs:songs.filter(s=>s.artistId===id).slice(0,5).map(s=>s.id),albums:[`al${(i%10)+1}`]};
});

export const albums = Array.from({length:10},(_,i)=>{
  const titles=['After Hours','Future Nostalgia','Certified Lover Boy','Midnights','Hidden Gems','Happier Than Ever','Divide','Ae Dil Hai Mushkil','Map of the Soul','Hollywoods Bleeding'];
  const id=`al${i+1}`;
  const albumSongs=songs.filter(s=>s.albumId===id);
  return {id,title:titles[i],artistId:`ar${(i%12)+1}`,artist:artists[i%12].name,year:2020+Math.floor(i/3),genre:songs.find(s=>s.albumId===id)?.genre||'Pop',thumbnail:img(`al${id}`),songs:albumSongs.map(s=>s.id),totalDuration:albumSongs.reduce((a,s)=>a+s.duration,0)};
});

export const playlists = Array.from({length:8},(_,i)=>{
  const titles=['Chill Vibes','Party Anthems','Deep Focus','Beast Mode','Love Songs','Sleepy Tunes','Heartbreak Hits','Divine Melodies'];
  const descs=['Relax and unwind','Get the party started','Music for concentration','Pump up your workout','Romantic favorites','Drift off peacefully','Feel all the feels','Spiritual peace'];
  const id=`pl${i+1}`;
  return {id,title:titles[i],description:descs[i],thumbnail:img(`pl${id}`),songs:songs.slice(i*7,(i*7)+7).map(s=>s.id),isPublic:true,owner:'MusicStream',mood:moods[i]};
});

export const lyrics = {
  s1:['Walking through the city lights','Feeling like I own the night','Every star is shining bright','Dancing in the moonlight','Lost in rhythm, lost in sound','Spinning round and round','The music takes me high','I never want to come back down','Echoes of a melody','Playing on repeat for me','This is where I want to be','Forever in this harmony','The bass drops and I fly','Reaching for the sky','Tonight we come alive','Under neon signs'],
  s2:['Golden hour fading slow','Painting shadows as they go','Whispers carried by the breeze','Dancing through the autumn leaves','Time stands still in moments like these','Hearts beating in degrees','A symphony of light and sound','Where peace and love are found','Hold my hand and never let go','Watch the sunset steal the show','Colors bleeding into night','Everything feels so right','Memories we create tonight','Will last beyond our sight','Golden hours never end','When Im here with you my friend'],
  s3:['Stay with me through the night','Hold me close hold me tight','Every moment feels so right','When youre here by my side','The world fades away','In your arms I want to stay','Promise me youll never leave','In this love I believe','Through the storms and the rain','Through the joy and the pain','Ill be yours and youll be mine','Until the end of time','Stay with me forever more','Youre the one that I adore','My heart beats just for you','Every word I say is true'],
};

export const formatDuration = (s) => {if(!s)return'0:00';const m=Math.floor(s/60);const sec=Math.floor(s%60);return`${m}:${sec.toString().padStart(2,'0')}`;};
export const getGreeting = () => {const h=new Date().getHours();if(h<12)return'Good morning';if(h<17)return'Good afternoon';return'Good evening';};
export const getSongById = (id) => songs.find(s=>s.id===id);
export const getArtistById = (id) => artists.find(a=>a.id===id);
export const getAlbumById = (id) => albums.find(a=>a.id===id);
export const getPlaylistById = (id) => playlists.find(p=>p.id===id);
