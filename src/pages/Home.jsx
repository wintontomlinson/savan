import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Heart,
  Moon,
  Music2,
  Play,
  Pause,
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
import ChartList from '../components/ChartList';
import Shelf from '../components/Shelf';
import SongCard from '../components/SongCard';

const LEAD = { id: 'trending', query: 'trending hindi songs' };
const FEATURE_SHELVES = [
  { id: 'new', query: 'new hindi songs', title: 'Fresh arrivals' },
  { id: 'viral', query: 'viral hindi songs', title: 'Moving fast' },
];
const MOODS = [
  { id: 'chill', title: 'Chill', note: 'Unwind', icon: Moon, query: 'lofi chill hindi', color: 'from-sky-400/80 via-indigo-500/70 to-violet-700/70' },
  { id: 'energy', title: 'Energy', note: 'Turn it up', icon: Zap, query: 'workout motivation songs', color: 'from-orange-400/80 via-rose-500/70 to-fuchsia-700/70' },
  { id: 'romance', title: 'Romance', note: 'Stay close', icon: Heart, query: 'romantic hindi songs', color: 'from-rose-300/80 via-pink-500/70 to-red-700/70' },
  { id: 'party', title: 'Party', note: 'No holding back', icon: Sparkles, query: 'dance party bollywood', color: 'from-yellow-300/80 via-orange-500/70 to-red-600/70' },
  { id: 'feels', title: 'Feels', note: 'Let it out', icon: Radio, query: 'sad hindi heartbreak', color: 'from-blue-500/80 via-indigo-600/70 to-slate-900/80' },
  { id: 'focus', title: 'Focus', note: 'Find your flow', icon: Music2, query: 'study instrumental focus', color: 'from-emerald-400/80 via-teal-900/80 to-cyan-900/80' },
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
  const heroLabel = currentSong ? 'Now in your rotation' : history.length ? 'Pick up where you left off' : 'A mix for right now';

  return (
    <div className="home-page pb-7 pt-6 sm:pt-9">
      <header className="home-intro">
        <div>
          <p className="page-kicker"><Sparkles size={12} /> Sound, selected for you</p>
          <h1>Music that moves<br className="hidden sm:block" /> with your mood.</h1>
        </div>
        <button onClick={refresh} aria-label="Refresh recommendations" className="home-refresh press" title="Refresh recommendations">
          <RefreshCw size={16} className={status === 'loading' ? 'animate-spin' : ''} /> <span>Refresh mix</span>
        </button>
      </header>

      {status === 'loading' && <HomeStageSkeleton />}
      {status === 'error' && <div className="home-error"><TriangleAlert size={27} /><h2>Your music is taking a moment.</h2><p>Check your connection, then let Savan shape another set for you.</p><button onClick={refresh} className="home-primary-button press"><RefreshCw size={14} /> Try again</button></div>}

      {heroSong && (
        <section className="home-stage">
          <img src={heroSong.thumbnail} alt="" className="home-stage-backdrop" />
          <div className="home-stage-shade" />
          <div className="home-stage-grid" aria-hidden="true" />
          <div className="home-stage-copy">
            <div className="home-stage-eyebrow"><span className="live-dot" /> {heroLabel}</div>
            <h2>{heroSong.title}</h2>
            <p>{heroSong.artist}</p>
            <div className="home-stage-actions">
              <button onClick={heroAction} className="home-primary-button press">{isHeroCurrent && isPlaying ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />} {isHeroCurrent ? (isPlaying ? 'Pause' : 'Resume') : 'Play now'}</button>
              {heroQueue.length > 1 && <button onClick={() => playShuffled(heroQueue)} className="home-secondary-button press"><Shuffle size={14} /> Shuffle</button>}
            </div>
            <div className="home-stage-meta"><Radio size={13} /> Your taste profile is working in real time</div>
          </div>
          <div className="home-stage-art" aria-hidden="true">
            {feed.chart[2]?.thumbnail && <img src={feed.chart[2].thumbnail} alt="" className="home-stage-art-back" />}
            {feed.chart[1]?.thumbnail && <img src={feed.chart[1].thumbnail} alt="" className="home-stage-art-mid" />}
            <img src={heroSong.thumbnail} alt="" className="home-stage-art-main" />
          </div>
        </section>
      )}

      <section className="home-mood-section">
        <SectionTitle eyebrow="Set the scene" title="Music for the moment" description="A quick route to the feeling you want." />
        <div className="home-mood-grid">
          {MOODS.map((mood, index) => {
            const Icon = mood.icon;
            const art = moodArt[(index + 3) % Math.max(moodArt.length, 1)]?.thumbnail;
            return <button key={mood.id} onClick={() => startMood(mood)} aria-pressed={activeMood === mood.id} className={`home-mood-card group bg-gradient-to-br ${mood.color}`}>
              {art && <img src={art} alt="" loading="lazy" />}
              <span className="home-mood-overlay" /><span className="home-mood-icon"><Icon size={17} /></span>
              <span className="home-mood-copy"><strong>{mood.title}</strong><small>{mood.note}</small></span><ArrowUpRight size={16} className="home-mood-arrow" />
            </button>;
          })}
        </div>
      </section>

      {feed.chart.length > 0 && <section className="home-chart-shell"><div className="home-chart-heading"><SectionTitle eyebrow="Most played" title="The pulse right now" description="Big tracks, updated continuously." /><button onClick={() => playShuffled(feed.chart)} aria-label="Shuffle chart" className="home-chart-shuffle press"><Shuffle size={14} /> <span>Play the chart</span></button></div><ChartList songs={feed.chart} className="home-chart-list" /></section>}

      {artists.length > 0 && <Shelf title="Artists worth another listen" className="home-artist-shelf">{artists.map((artist) => <ArtistCircle key={artist.id || artist.name} name={artist.name} image={artist.img} fallbackImage={artist.art} onClick={() => playArtist(artist)} />)}</Shelf>}
      {feed.shelves.map((section) => <Shelf key={section.id} title={section.title} seeAllTo={`/search?q=${encodeURIComponent(section.query)}`} className="home-song-shelf">{section.songs.map((song) => <SongCard key={song.id} song={song} songList={section.songs} subtitle={section.subtitle || song.artist} />)}</Shelf>)}
      {status === 'ready' && feed.shelves.length < 2 && <ShelfSkeleton />}
    </div>
  );
}

function SectionTitle({ eyebrow, title, description }) {
  return <div className="home-section-title">{eyebrow && <p>{eyebrow}</p>}<h2>{title}</h2>{description && <span>{description}</span>}</div>;
}

function HomeStageSkeleton() {
  return <div className="home-stage home-stage-skeleton"><div className="home-stage-copy space-y-3"><div className="skeleton h-3 w-28" /><div className="skeleton h-10 w-4/5" /><div className="skeleton h-4 w-2/3" /><div className="flex gap-2"><div className="skeleton h-11 w-28 rounded-full" /><div className="skeleton h-11 w-24 rounded-full" /></div></div><div className="skeleton h-[200px] w-[200px] rounded-[28px]" /></div>;
}

function ShelfSkeleton() {
  return <div className="mb-10"><div className="skeleton mb-4 h-5 w-48" /><div className="flex gap-4 overflow-hidden">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="w-[170px] shrink-0"><div className="skeleton aspect-square rounded-2xl" /><div className="skeleton mt-3 h-3 w-3/4" /></div>)}</div></div>;
}
