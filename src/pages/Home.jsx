import { useState, useEffect, useMemo, useCallback } from 'react';
import { Shuffle, Zap, Heart, Music4, Sparkles, Radio, Moon, RefreshCw, Play, TriangleAlert } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { getHistory, analyzePreferences, getHomeQueries } from '../data/algorithm';
import { searchSongs, searchArtists } from '../data/api';
import { getGreeting } from '../data/format';
import FeatureHero from '../components/FeatureHero';
import ChartList from '../components/ChartList';
import SongCard from '../components/SongCard';
import SongRow from '../components/SongRow';
import SongList from '../components/SongList';
import Shelf from '../components/Shelf';
import ChipRow from '../components/ChipRow';
import ArtistCircle from '../components/ArtistCircle';

const MOODS = [
  { id: 'chill', label: 'Chill', icon: Music4, query: 'lofi chill hindi' },
  { id: 'energy', label: 'Energy', icon: Zap, query: 'workout motivation songs' },
  { id: 'romance', label: 'Romance', icon: Heart, query: 'romantic hindi songs' },
  { id: 'party', label: 'Party', icon: Sparkles, query: 'dance party bollywood' },
  { id: 'feels', label: 'Feels', icon: Radio, query: 'sad hindi heartbreak' },
  { id: 'focus', label: 'Focus', icon: Moon, query: 'study instrumental focus' },
];

/**
 * Queries deliberately carry no year. "new releases hindi 2024" returns zero
 * results now, which is exactly how that shelf silently disappeared.
 */
const LEAD = { id: 'trending', query: 'trending hindi songs' };

const SHELVES = [
  { id: 'new', query: 'new hindi songs', title: 'New releases', subtitle: 'Fresh from this week' },
  { id: 'viral', query: 'viral hindi songs', title: 'Going viral', subtitle: 'Blowing up right now' },
];

/**
 * The catalogue lists the same recording under several ids, so match on title
 * plus lead artist as well as id. The `(From "Film")` suffix is dropped because
 * the same song ships both with and without it, but other bracketed parts are
 * kept: "(Female Version)" really is a different recording.
 */
function signature(song) {
  const clean = (value) =>
    (value || '')
      .toLowerCase()
      .replace(/\(from[^)]*\)/g, ' ')
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .trim();
  return `${clean(song.title)}::${clean((song.artist || '').split(',')[0])}`;
}

function claim(song, used) {
  used.add(`id:${song.id}`);
  used.add(`sig:${signature(song)}`);
}

function isRepeat(song, used) {
  return used.has(`id:${song.id}`) || used.has(`sig:${signature(song)}`);
}

/**
 * The catalogue carries shortened edits of the same song ("Vaaroon" alongside
 * "Vaaroon Trending Version"), which makes a chart read like it is repeating
 * itself. Group those together and keep the longest cut, which is the full
 * song. Deliberately does not touch "Female Version" style markers, since
 * those are separate recordings.
 */
function variantTitle(song) {
  return (song.title || '')
    .toLowerCase()
    .replace(/\(from[^)]*\)/g, ' ')
    .replace(/\b(?:trending|acoustic|lofi|slowed|reverb|remix)\s+version\b/g, ' ')
    .replace(/[-|(]\s*(?:jo\s+tere\s+sang\s+)?trending\b/g, ' ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

/**
 * Variants are credited to different lead artists ("Jugraafiya" to Udit
 * Narayan, its trending edit to Amitabh Bhattacharya), so the artist cannot be
 * part of the key. Require the credit lists to overlap instead, which keeps two
 * unrelated songs that happen to share a title apart.
 */
function sharesCredit(a, b) {
  const names = (song) =>
    (song.artist || '')
      .split(',')
      .map((n) => n.trim().toLowerCase())
      .filter(Boolean);
  const left = new Set(names(a));
  return names(b).some((name) => left.has(name));
}

function pickBestVariants(list) {
  const groups = [];
  (list || []).forEach((song, index) => {
    const title = variantTitle(song);
    const group = groups.find((g) => g.title === title && sharesCredit(g.song, song));
    if (!group) {
      groups.push({ title, song, index });
      return;
    }
    // Keep the longest cut, which is the full song rather than a short edit.
    if ((song.duration || 0) > (group.song.duration || 0)) group.song = song;
  });
  return groups.sort((a, b) => a.index - b.index).map((group) => group.song);
}

/** Removes repeats inside a single result list. */
function collapse(list) {
  const seen = new Set();
  return (list || []).filter((song) => {
    if (isRepeat(song, seen)) return false;
    claim(song, seen);
    return true;
  });
}

/**
 * Drops tracks already shown further up the page. A section that has nothing
 * new left is dropped by the caller rather than padded back out with repeats.
 */
function withoutRepeats(list, used) {
  const fresh = collapse(list).filter((song) => !isRepeat(song, used));
  fresh.forEach((song) => claim(song, used));
  return fresh;
}

/** Below this a shelf looks like a mistake, so it is left out entirely. */
const MIN_SHELF = 3;

export default function Home() {
  const { playSong, playShuffled, currentSong, upNext } = usePlayer();

  const history = useMemo(getHistory, []);
  const prefs = useMemo(analyzePreferences, []);

  // Frozen on mount so the feed does not rearrange itself while you listen.
  const [queries, setQueries] = useState(() => getHomeQueries(currentSong));
  const [nonce, setNonce] = useState(0);

  const [lead, setLead] = useState([]);
  const [shelfData, setShelfData] = useState({});
  const [artists, setArtists] = useState([]);
  const [status, setStatus] = useState('loading');

  const [mood, setMood] = useState(null);
  const [moodSongs, setMoodSongs] = useState([]);
  const [moodLoading, setMoodLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    setStatus('loading');
    setLead([]);
    setShelfData({});
    setArtists([]);

    (async () => {
      // First wave: everything above the fold comes from one request.
      const trending = (await searchSongs(LEAD.query, 18)) || [];
      if (cancelled) return;
      if (!trending.length) {
        setStatus('error');
        return;
      }
      setLead(trending);
      setStatus('ready');

      // Second wave: each section appears the moment its own data lands.
      [...SHELVES, ...queries].forEach(async (section) => {
        const songs = (await searchSongs(section.query, 16)) || [];
        if (!cancelled && songs.length) {
          setShelfData((prev) => ({ ...prev, [section.id || section.key]: songs }));
        }
      });

      const artwork = {};
      trending.forEach((song) => {
        const name = song.artist?.split(',')[0]?.trim();
        if (name && !artwork[name]) artwork[name] = song.thumbnail;
      });
      const profiles = await Promise.all(
        Object.keys(artwork)
          .slice(0, 8)
          .map((name) => searchArtists(name, 1).then((r) => r[0]).catch(() => null)),
      );
      if (!cancelled) {
        setArtists(profiles.filter(Boolean).map((p) => ({ ...p, art: artwork[p.name] || '' })));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [queries, nonce]);

  const refresh = useCallback(() => {
    setQueries(getHomeQueries(currentSong));
    setNonce((n) => n + 1);
  }, [currentSong]);

  const pickMood = async (item) => {
    if (mood === item.id) {
      setMood(null);
      setMoodSongs([]);
      return;
    }
    setMood(item.id);
    setMoodLoading(true);
    const songs = (await searchSongs(item.query, 24)) || [];
    setMoodSongs(songs);
    setMoodLoading(false);
    if (songs.length) playShuffled(songs);
  };

  const playArtist = async (artist) => {
    const songs = (await searchSongs(artist.name, 24)) || [];
    if (songs.length) playShuffled(songs);
  };

  const feed = useMemo(() => {
    const used = new Set();
    const chart = [];
    const picks = [];
    for (const song of pickBestVariants(lead)) {
      claim(song, used);
      (chart.length < 10 ? chart : picks).push(song);
    }

    const shelves = [];
    for (const section of SHELVES) {
      const songs = withoutRepeats(shelfData[section.id], used);
      if (songs.length >= MIN_SHELF) shelves.push({ ...section, songs });
    }
    for (const section of queries) {
      const songs = withoutRepeats(shelfData[section.key], used);
      if (songs.length >= MIN_SHELF) {
        shelves.push({ id: section.key, title: section.title, query: section.query, songs });
      }
    }
    return { chart, picks, shelves };
  }, [lead, shelfData, queries]);

  const resumeSong = history[0];
  const heroSong = resumeSong || feed.chart[0];
  const shortcuts = resumeSong ? history.slice(1, 7) : [];
  const quickPicks = currentSong && upNext.length > 0 ? upNext.slice(0, 8) : feed.picks;
  const pendingShelves = SHELVES.length + queries.length - feed.shelves.length;

  return (
    <div className="pt-6">
      <header className="mb-7 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[26px] font-bold tracking-tight sm:text-[32px]">{getGreeting()}</h1>
          <p className="mt-1 text-[13px] text-white/40">
            {prefs
              ? `${prefs.totalPlays} ${prefs.totalPlays === 1 ? 'play' : 'plays'} so far${
                  prefs.topArtists?.[0] ? `, mostly ${prefs.topArtists[0]}` : ''
                }`
              : 'Pick a mood, or just hit play.'}
          </p>
        </div>
        <button
          onClick={refresh}
          aria-label="Refresh recommendations"
          title="Refresh"
          className="press flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-hair bg-white/[0.05] text-white/55 transition-colors hover:bg-white/[0.1] hover:text-white"
        >
          <RefreshCw size={15} className={status === 'loading' ? 'animate-spin' : ''} />
        </button>
      </header>

      {status === 'loading' && <HeroSkeleton />}

      {status === 'error' && (
        <div className="py-20 text-center">
          <TriangleAlert size={26} className="mx-auto mb-3 text-white/15" />
          <p className="text-[14px] font-semibold text-white/60">Couldn&apos;t reach the music catalogue</p>
          <p className="mb-5 mt-1 text-[12px] text-white/30">Check your connection and try again.</p>
          <button
            onClick={refresh}
            className="press inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[12px] font-bold text-black"
          >
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      )}

      {heroSong && (
        <FeatureHero
          eyebrow={resumeSong ? 'Pick up where you left off' : 'Featured today'}
          song={heroSong}
          meta={heroSong.album && heroSong.album !== heroSong.title ? heroSong.album : null}
          onPlay={() =>
            resumeSong ? playSong(resumeSong, history.slice(0, 40)) : playSong(feed.chart[0], feed.chart)
          }
          onShuffle={() => (resumeSong ? playShuffled(history.slice(0, 40)) : playShuffled(lead))}
          shuffleLabel={resumeSong ? 'Shuffle history' : 'Shuffle chart'}
        />
      )}

      {shortcuts.length > 0 && (
        <section className="mb-9">
          <h2 className="mb-3.5 text-[17px] font-bold tracking-tight sm:text-[19px]">Jump back in</h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {shortcuts.map((song) => (
              <button
                key={song.id}
                onClick={() => playSong(song, history)}
                className="group flex items-center gap-3 overflow-hidden rounded-xl bg-white/[0.05] pr-3 text-left transition-colors hover:bg-white/[0.1]"
              >
                <img src={song.thumbnail} alt="" className="h-[54px] w-[54px] shrink-0 object-cover" loading="lazy" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-semibold">{song.title}</span>
                  <span className="block truncate text-[11px] text-white/40">{song.artist}</span>
                </span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                  <Play size={13} fill="white" className="ml-0.5" />
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      <ChipRow items={MOODS} activeId={mood} onSelect={pickMood} className="mb-9" />

      {mood && (
        <section className="mb-9">
          <div className="mb-3.5 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-[17px] font-bold tracking-tight sm:text-[19px]">
                {MOODS.find((m) => m.id === mood)?.label} mix
              </h2>
              <p className="mt-0.5 text-[11.5px] text-white/35">
                {moodLoading ? 'Building your mix' : `${moodSongs.length} tracks queued`}
              </p>
            </div>
            {moodSongs.length > 0 && (
              <button
                onClick={() => playShuffled(moodSongs)}
                className="press flex shrink-0 items-center gap-1.5 rounded-full bg-white/[0.07] px-3.5 py-2 text-[11.5px] font-semibold text-white/70 hover:bg-white/[0.12]"
              >
                <Shuffle size={12} /> Reshuffle
              </button>
            )}
          </div>
          {moodLoading ? <RowSkeleton rows={5} /> : <SongList songs={moodSongs.slice(0, 12)} />}
        </section>
      )}

      {status === 'loading' && <ChartSkeleton />}

      {feed.chart.length > 0 && (
        <section className="mb-9">
          <div className="mb-3.5">
            <h2 className="text-[17px] font-bold tracking-tight sm:text-[19px]">Top 10 today</h2>
            <p className="mt-0.5 text-[11.5px] text-white/35">The most played tracks right now</p>
          </div>
          <ChartList songs={feed.chart} />
        </section>
      )}

      {quickPicks.length > 0 && (
        <section className="mb-9">
          <div className="mb-3.5">
            <h2 className="text-[17px] font-bold tracking-tight sm:text-[19px]">
              {currentSong && upNext.length > 0 ? 'Up next' : 'Quick picks'}
            </h2>
            <p className="mt-0.5 text-[11.5px] text-white/35">
              {currentSong && upNext.length > 0
                ? 'Lined up to follow what you are playing'
                : 'A few more worth a listen'}
            </p>
          </div>
          <div className="grid gap-x-6 rounded-2xl border border-hair bg-surface-2/40 p-1.5 xl:grid-cols-2">
            {quickPicks.map((song, i) => (
              <SongRow
                key={`${song.id}-${i}`}
                song={song}
                index={i}
                songList={quickPicks}
                showAlbum={false}
                showDuration={false}
              />
            ))}
          </div>
        </section>
      )}

      {artists.length > 0 && (
        <Shelf title="Artists on rotation" subtitle="Pulled from today's chart">
          {artists.map((artist) => (
            <ArtistCircle
              key={artist.id || artist.name}
              name={artist.name}
              image={artist.img}
              fallbackImage={artist.art}
              onClick={() => playArtist(artist)}
            />
          ))}
        </Shelf>
      )}

      {feed.shelves.map((section) => (
        <Shelf
          key={section.id}
          title={section.title}
          subtitle={section.subtitle}
          seeAllTo={`/search?q=${encodeURIComponent(section.query)}`}
        >
          {section.songs.map((song) => (
            <SongCard key={song.id} song={song} songList={section.songs} />
          ))}
        </Shelf>
      ))}

      {status === 'ready' &&
        pendingShelves > 0 &&
        Array.from({ length: Math.min(pendingShelves, 2) }).map((_, i) => <ShelfSkeleton key={i} />)}
    </div>
  );
}

/* ---------------- Skeletons, shaped like the real thing ---------------- */

function HeroSkeleton() {
  return (
    <div className="mb-9 flex flex-col gap-5 rounded-2xl border border-hair bg-surface-2/40 p-5 sm:p-7 lg:flex-row lg:items-center lg:gap-10 lg:p-8">
      <div className="skeleton h-32 w-32 shrink-0 rounded-2xl sm:h-40 sm:w-40 lg:order-last lg:h-[200px] lg:w-[200px]" />
      <div className="flex-1 space-y-3">
        <div className="skeleton h-2.5 w-24" />
        <div className="skeleton h-7 w-3/4 lg:h-9" />
        <div className="skeleton h-3 w-1/3" />
        <div className="flex gap-2.5 pt-2">
          <div className="skeleton h-11 w-28 rounded-full" />
          <div className="skeleton h-11 w-32 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="mb-9">
      <div className="skeleton mb-4 h-4 w-32" />
      <div className="grid gap-x-7 md:grid-cols-2">
        {[0, 1].map((column) => (
          <div key={column} className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-1">
                <div className="skeleton h-3 w-4" />
                <div className="skeleton h-11 w-11 shrink-0 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-3 w-1/2" />
                  <div className="skeleton h-2.5 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function ShelfSkeleton() {
  return (
    <div className="mb-9">
      <div className="skeleton mb-4 h-4 w-36" />
      <div className="flex gap-3.5 overflow-hidden sm:gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="w-[144px] shrink-0 sm:w-[164px]">
            <div className="skeleton mb-2.5 aspect-square rounded-xl" />
            <div className="skeleton mb-1.5 h-3 w-3/4" />
            <div className="skeleton h-2.5 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

function RowSkeleton({ rows = 4 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="skeleton h-11 w-11 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-3 w-2/5" />
            <div className="skeleton h-2.5 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}
