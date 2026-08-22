import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Heart,
  Moon,
  Music2,
  Pause,
  Play,
  Radio,
  RefreshCw,
  Shuffle,
  Sparkles,
  TriangleAlert,
  Zap,
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { getHistory, getHomeQueries } from '../data/algorithm';
import { searchArtists, searchSongs } from '../data/api';
import ArtistCircle from '../components/ArtistCircle';
import Shelf from '../components/Shelf';
import SongCard from '../components/SongCard';
import SongRow from '../components/SongRow';

const LEAD = { id: 'trending', query: 'trending hindi songs' };
const FEATURE_SHELVES = [
  { id: 'new', query: 'new hindi songs', title: 'Fresh arrivals' },
  { id: 'viral', query: 'viral hindi songs', title: 'Moving fast' },
];
const MOODS = [
  { id: 'chill', title: 'Golden hour', note: 'Warm and textured', icon: Moon, query: 'lofi chill hindi', color: '#ef8d53' },
  { id: 'focus', title: 'Deep focus', note: 'Clear and steady', icon: Music2, query: 'study instrumental focus', color: '#7669fc' },
  { id: 'romance', title: 'After dark', note: 'Slow and magnetic', icon: Heart, query: 'romantic hindi songs', color: '#df5caa' },
  { id: 'energy', title: 'Fresh air', note: 'Bright and open', icon: Zap, query: 'workout motivation songs', color: '#81d6bd' },
  { id: 'party', title: 'Full volume', note: 'Move without pause', icon: Sparkles, query: 'dance party bollywood', color: '#f1bc46' },
  { id: 'feels', title: 'Take it slow', note: 'Make room for it', icon: Radio, query: 'sad hindi heartbreak', color: '#6594e7' },
];

function signature(song) {
  const clean = (value) => (value || '').toLowerCase().replace(/\(from[^)]*\)/g, ' ').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  return `${clean(song.title)}::${clean((song.artist || '').split(',')[0])}`;
}

function claim(song, used) {
  used.add(`id:${song.id}`);
  used.add(`sig:${signature(song)}`);
}

function isRepeat(song, used) {
  return used.has(`id:${song.id}`) || used.has(`sig:${signature(song)}`);
}

function variantTitle(song) {
  return (song.title || '').toLowerCase().replace(/\(from[^)]*\)/g, ' ').replace(/\b(?:trending|acoustic|lofi|slowed|reverb|remix)\s+version\b/g, ' ').replace(/[-|(]\s*(?:jo\s+tere\s+sang\s+)?trending\b/g, ' ').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

function sharesCredit(leftSong, rightSong) {
  const names = (song) => (song.artist || '').split(',').map((name) => name.trim().toLowerCase()).filter(Boolean);
  const left = new Set(names(leftSong));
  return names(rightSong).some((name) => left.has(name));
}

function pickBestVariants(list) {
  const groups = [];
  (list || []).forEach((song, index) => {
    const title = variantTitle(song);
    const group = groups.find((item) => item.title === title && sharesCredit(item.song, song));
    if (!group) groups.push({ title, song, index });
    else if ((song.duration || 0) > (group.song.duration || 0)) group.song = song;
  });
  return groups.sort((left, right) => left.index - right.index).map((group) => group.song);
}

function uniqueFresh(list, used) {
  const local = new Set();
  const fresh = (list || []).filter((song) => {
    if (isRepeat(song, local) || isRepeat(song, used)) return false;
    claim(song, local);
    return true;
  });
  fresh.forEach((song) => claim(song, used));
  return fresh;
}

export default function Home() {
  const { playSong, playShuffled, currentSong, togglePlay, isPlaying } = usePlayer();
  const history = useMemo(getHistory, []);
  const [queries, setQueries] = useState(() => getHomeQueries(currentSong));
  const [nonce, setNonce] = useState(0);
  const [lead, setLead] = useState([]);
  const [shelfData, setShelfData] = useState({});
  const [artists, setArtists] = useState([]);
  const [status, setStatus] = useState('loading');
  const [activeMood, setActiveMood] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setLead([]);
    setShelfData({});
    setArtists([]);

    (async () => {
      const trending = (await searchSongs(LEAD.query, 24)) || [];
      if (cancelled) return;
      if (!trending.length) {
        setStatus('error');
        return;
      }
      setLead(trending);
      setStatus('ready');
      [...FEATURE_SHELVES, ...queries].forEach(async (section) => {
        const songs = (await searchSongs(section.query, 18)) || [];
        if (!cancelled && songs.length) setShelfData((previous) => ({ ...previous, [section.id || section.key]: songs }));
      });
      const artwork = {};
      trending.forEach((song) => {
        const name = song.artist?.split(',')[0]?.trim();
        if (name && !artwork[name]) artwork[name] = song.thumbnail;
      });
      const profiles = await Promise.all(Object.keys(artwork).slice(0, 8).map((name) => searchArtists(name, 1).then((result) => result[0]).catch(() => null)));
      if (!cancelled) setArtists(profiles.filter(Boolean).map((artist) => ({ ...artist, art: artwork[artist.name] || '' })));
    })();

    return () => { cancelled = true; };
  }, [queries, nonce]);

  const refresh = useCallback(() => {
    setQueries(getHomeQueries(currentSong));
    setNonce((value) => value + 1);
  }, [currentSong]);

  const startMood = async (mood) => {
    setActiveMood(mood.id);
    const songs = (await searchSongs(mood.query, 28)) || [];
    if (songs.length) playShuffled(songs);
  };

  const playArtist = async (artist) => {
    const songs = (await searchSongs(artist.name, 24)) || [];
    if (songs.length) playShuffled(songs);
  };

  const feed = useMemo(() => {
    const used = new Set();
    const chart = uniqueFresh(pickBestVariants(lead), used).slice(0, 10);
    const shelves = [];
    for (const section of FEATURE_SHELVES) {
      const songs = uniqueFresh(shelfData[section.id], used);
      if (songs.length >= 4) shelves.push({ ...section, songs });
    }
    for (const section of queries) {
      const songs = uniqueFresh(shelfData[section.key], used);
      if (songs.length >= 4) shelves.push({ id: section.key, title: section.title, subtitle: section.subtitle, query: section.query, songs });
    }
    return { chart, shelves };
  }, [lead, shelfData, queries]);

  const heroSong = currentSong || history[0] || feed.chart[0];
  const heroQueue = history.length ? history.slice(0, 40) : feed.chart;
  const isHeroCurrent = currentSong?.id === heroSong?.id;
  const heroAction = () => {
    if (isHeroCurrent) togglePlay();
    else playSong(heroSong, heroQueue);
  };
  const moodArt = feed.chart.length ? feed.chart : lead;
  const heroLabel = currentSong ? 'Now in your rotation' : history.length ? 'Pick up where you left off' : 'Your late afternoon mix';

  return (
    <div className="home-page volt-home pb-7 pt-6 sm:pt-9">
      <header className="volt-intro">
        <div>
          <p className="volt-kicker"><Sparkles size={12} /> Savan, selected for you</p>
          <h1>Music for<br /><em>right now.</em></h1>
        </div>
        <button onClick={refresh} aria-label="Refresh recommendations" className="volt-refresh press" title="Refresh recommendations">
          <RefreshCw size={15} className={status === 'loading' ? 'animate-spin' : ''} /><span>Refresh your mix</span>
        </button>
      </header>

      {status === 'loading' && <HomeStageSkeleton />}
      {status === 'error' && <div className="home-error"><TriangleAlert size={27} /><h2>Your music is taking a moment.</h2><p>Check your connection, then let Savan shape another set for you.</p><button onClick={refresh} className="volt-primary press"><RefreshCw size={14} /> Try again</button></div>}

      {heroSong && <section className="volt-stage">
        <img src={heroSong.thumbnail} alt="" className="volt-stage-backdrop" />
        <div className="volt-stage-overlay" />
        <div className="volt-stage-copy">
          <p className="volt-stage-label"><span className="volt-live-dot" /> {heroLabel}</p>
          <h2>{heroSong.title}</h2>
          <p className="volt-stage-artist">{heroSong.artist}</p>
          <p className="volt-stage-description">A living soundtrack shaped around the artists and sounds you keep returning to.</p>
          <div className="volt-stage-actions">
            <button onClick={heroAction} className="volt-primary press">{isHeroCurrent && isPlaying ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}{isHeroCurrent ? (isPlaying ? 'Pause' : 'Resume') : 'Start listening'}</button>
            {heroQueue.length > 1 && <button onClick={() => playShuffled(heroQueue)} className="volt-secondary press"><Shuffle size={14} /> Shuffle</button>}
          </div>
        </div>
        <div className="volt-stage-art" aria-hidden="true">
          {feed.chart[2]?.thumbnail && <img src={feed.chart[2].thumbnail} alt="" className="volt-art-back" />}
          {feed.chart[1]?.thumbnail && <img src={feed.chart[1].thumbnail} alt="" className="volt-art-middle" />}
          <img src={heroSong.thumbnail} alt="" className="volt-art-main" />
        </div>
        <div className="volt-stage-stats"><div><strong>86%</strong><span>Taste match</span></div><i /><div><strong>{heroQueue.length || 31}</strong><span>Tracks for you</span></div></div>
      </section>}

      <section className="volt-section">
        <div className="volt-section-heading"><div><h2>Pick your feeling</h2><p>Let your mood lead the way.</p></div><button onClick={refresh} className="volt-text-button">Refresh picks</button></div>
        <div className="volt-mood-grid">
          {MOODS.slice(0, 4).map((mood, index) => {
            const Icon = mood.icon;
            const art = moodArt[(index + 2) % Math.max(moodArt.length, 1)]?.thumbnail;
            return <button key={mood.id} onClick={() => startMood(mood)} aria-pressed={activeMood === mood.id} className="volt-mood-card press" style={{ '--mood': mood.color }}>
              {art && <img src={art} alt="" loading="lazy" />}<span className="volt-mood-shade" /><span className="volt-mood-icon"><Icon size={15} /></span><span className="volt-mood-copy"><small>{mood.note}</small><strong>{mood.title}</strong></span><ArrowUpRight size={17} className="volt-mood-arrow" />
            </button>;
          })}
        </div>
      </section>

      {feed.chart.length > 0 && <section className="volt-section volt-discovery-grid">
        <div className="volt-track-panel"><div className="volt-section-heading"><div><h2>Made from your signal</h2><p>Tracks we think will stay with you.</p></div><button onClick={() => playShuffled(feed.chart)} className="volt-text-button">Play all</button></div><div className="volt-track-list">{feed.chart.slice(0, 5).map((song, index) => <SongRow key={song.id} song={song} index={index} songList={feed.chart} />)}</div></div>
        <aside className="volt-signal-card"><div className="volt-signal-top"><span><i /> Learning live</span><b>v.02</b></div><h3>Your taste is <em>expanding.</em></h3><p>You have been leaning into warm production and magnetic vocals. We followed the thread.</p><div className="volt-tags"><span>Alt pop</span><span>Bollywood</span><span>Indie</span><span>Downtempo</span></div><div className="volt-signal-art"><i /><i /><i /></div></aside>
      </section>}

      {artists.length > 0 && <Shelf title="Artists worth another listen" className="home-artist-shelf">{artists.map((artist) => <ArtistCircle key={artist.id || artist.name} name={artist.name} image={artist.img} fallbackImage={artist.art} onClick={() => playArtist(artist)} />)}</Shelf>}
      {feed.shelves.map((section) => <Shelf key={section.id} title={section.title} seeAllTo={`/search?q=${encodeURIComponent(section.query)}`} className="home-song-shelf">{section.songs.map((song) => <SongCard key={song.id} song={song} songList={section.songs} subtitle={section.subtitle || song.artist} />)}</Shelf>)}
      {status === 'ready' && feed.shelves.length < 2 && <ShelfSkeleton />}
    </div>
  );
}

function HomeStageSkeleton() {
  return <div className="volt-stage volt-stage-skeleton"><div className="volt-stage-copy space-y-3"><div className="skeleton h-3 w-28" /><div className="skeleton h-10 w-4/5" /><div className="skeleton h-4 w-2/3" /><div className="flex gap-2"><div className="skeleton h-11 w-28 rounded-full" /><div className="skeleton h-11 w-24 rounded-full" /></div></div><div className="skeleton h-[200px] w-[200px] rounded-[28px]" /></div>;
}

function ShelfSkeleton() {
  return <div className="mb-10"><div className="skeleton mb-4 h-5 w-48" /><div className="flex gap-4 overflow-hidden">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="w-[170px] shrink-0"><div className="skeleton aspect-square rounded-2xl" /><div className="skeleton mt-3 h-3 w-3/4" /></div>)}</div></div>;
}
