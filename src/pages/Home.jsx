import { useState, useEffect, useMemo, useCallback } from 'react';
import { Shuffle, Zap, Heart, Music4, Sparkles, Radio, Moon, RefreshCw, Play, TriangleAlert } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { getHistory, analyzePreferences, getHomeQueries } from '../data/algorithm';
import { searchSongs, searchArtists } from '../data/api';
import { getGreeting } from '../data/format';
import SongCard from '../components/SongCard';
import SongList from '../components/SongList';
import SongRow from '../components/SongRow';
import Shelf from '../components/Shelf';
import ChipRow from '../components/ChipRow';
import ArtistCircle from '../components/ArtistCircle';

const MOODS = [
  { id: 'chill', label: 'Chill', icon: Music4, query: 'lofi chill hindi' },
  { id: 'energy', label: 'Energy', icon: Zap, query: 'workout motivation songs' },
  { id: 'romance', label: 'Romance', icon: Heart, query: 'romantic hindi songs' },
  { id: 'party', label: 'Party', icon: Sparkles, query: 'dance party bollywood' },
  { id: 'sad', label: 'Feels', icon: Radio, query: 'sad hindi heartbreak' },
  { id: 'focus', label: 'Focus', icon: Moon, query: 'study instrumental focus' },
];

const CHARTS = [
  { id: 'trending', query: 'trending hindi songs 2024', title: 'Trending now', subtitle: 'What everyone is playing today' },
  { id: 'new', query: 'new releases hindi 2024', title: 'New releases', subtitle: 'Fresh from this week' },
  { id: 'viral', query: 'viral songs 2024', title: 'Going viral', subtitle: 'Blowing up right now' },
];

export default function Home() {
  const { playSong, playShuffled, currentSong, upNext } = usePlayer();

  const [charts, setCharts] = useState({});
  const [personal, setPersonal] = useState({});
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const [mood, setMood] = useState(null);
  const [moodSongs, setMoodSongs] = useState([]);
  const [moodLoading, setMoodLoading] = useState(false);

  const queries = useMemo(() => getHomeQueries(currentSong), [currentSong]);
  const history = useMemo(() => getHistory(), []);
  const prefs = useMemo(() => analyzePreferences(), []);

  const shortcuts = history.slice(0, 8);
  const quickPicks = (currentSong && upNext.length > 0 ? upNext : history).slice(0, 9);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const [chartPairs, personalPairs] = await Promise.all([
        Promise.all(CHARTS.map(async (c) => [c.id, await searchSongs(c.query, 16)])),
        Promise.all(queries.map(async (s) => [s.key, await searchSongs(s.query, 14)])),
      ]);

      const chartData = Object.fromEntries(chartPairs);
      setCharts(chartData);
      setPersonal(Object.fromEntries(personalPairs));

      if (Object.values(chartData).every((list) => !list?.length)) {
        setFailed(true);
        setLoading(false);
        return;
      }

      // Rank artists by how often they appear across the charts we just loaded,
      // remembering one of their tracks so the avatar always has something.
      const counts = {};
      const artwork = {};
      Object.values(chartData)
        .flat()
        .forEach((song) => {
          const name = song?.artist?.split(',')[0]?.trim();
          if (!name) return;
          counts[name] = (counts[name] || 0) + 1;
          if (!artwork[name]) artwork[name] = song.thumbnail;
        });
      const top = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name]) => name);
      const profiles = await Promise.all(
        top.map((name) => searchArtists(name, 1).then((r) => r[0]).catch(() => null)),
      );
      setArtists(profiles.filter(Boolean).map((p) => ({ ...p, art: artwork[p.name] || '' })));
      setLoading(false);
    } catch {
      setFailed(true);
      setLoading(false);
    }
  }, [queries]);

  useEffect(() => {
    load();
  }, [load]);

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

  return (
    <div className="pt-6">
      {/* Greeting */}
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[26px] font-bold tracking-tight sm:text-[32px]">{getGreeting()}</h1>
          <p className="mt-1 text-[13px] text-white/40">
            {prefs
              ? `${prefs.totalPlays} plays${prefs.topArtists?.[0] ? ` · on repeat: ${prefs.topArtists[0]}` : ''}`
              : 'Pick a mood, or let the queue build itself.'}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {history.length > 1 && (
            <button
              onClick={() => playShuffled(history.slice(0, 40))}
              className="press flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[12px] font-bold text-black transition-transform hover:scale-[1.03]"
            >
              <Shuffle size={14} /> Shuffle history
            </button>
          )}
          <button
            onClick={load}
            aria-label="Refresh recommendations"
            className="press flex items-center gap-2 rounded-full border border-hair bg-white/[0.05] px-4 py-2.5 text-[12px] font-semibold text-white/65 hover:bg-white/[0.09]"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </header>

      {/* Recently played shortcuts */}
      {shortcuts.length > 0 && (
        <section className="mb-8 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {shortcuts.map((song) => (
            <button
              key={song.id}
              onClick={() => playSong(song, shortcuts)}
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
        </section>
      )}

      {/* Mood chips */}
      <ChipRow items={MOODS} activeId={mood} onSelect={pickMood} className="mb-8" />

      {/* Mood mix */}
      {mood && (
        <section className="mb-9">
          <div className="mb-3.5 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-[17px] font-bold tracking-tight sm:text-[19px]">
                {MOODS.find((m) => m.id === mood)?.label} mix
              </h2>
              <p className="mt-0.5 text-[11.5px] text-white/35">
                {moodLoading ? 'Building your mix…' : `${moodSongs.length} tracks queued`}
              </p>
            </div>
            {moodSongs.length > 0 && (
              <button
                onClick={() => playShuffled(moodSongs)}
                className="press flex shrink-0 items-center gap-1.5 rounded-full bg-white/[0.07] px-3.5 py-2 text-[11.5px] font-semibold text-white/70 hover:bg-white/[0.12]"
              >
                <Shuffle size={12} /> Shuffle
              </button>
            )}
          </div>
          {moodLoading ? <ListSkeleton rows={5} /> : <SongList songs={moodSongs.slice(0, 12)} />}
        </section>
      )}

      {/* Quick picks */}
      {quickPicks.length > 0 && (
        <section className="mb-9">
          <div className="mb-3.5">
            <h2 className="text-[17px] font-bold tracking-tight sm:text-[19px]">
              {currentSong ? 'Up next' : 'Quick picks'}
            </h2>
            <p className="mt-0.5 text-[11.5px] text-white/35">
              {currentSong ? 'Chosen to follow what you are playing' : 'Straight back into your rotation'}
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

      {loading && <HomeSkeleton />}

      {failed && !loading && (
        <div className="py-16 text-center">
          <TriangleAlert size={26} className="mx-auto mb-3 text-white/15" />
          <p className="text-[14px] font-semibold text-white/60">Couldn&apos;t reach the music catalogue</p>
          <p className="mb-5 mt-1 text-[12px] text-white/30">Check your connection and try again.</p>
          <button
            onClick={load}
            className="press inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[12px] font-bold text-black"
          >
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      )}

      {!loading && !failed && (
        <>
          {artists.length > 0 && (
            <Shelf title="Artists on rotation" subtitle="Pulled from today's charts">
              {artists.map((a) => (
                <ArtistCircle
                  key={a.id || a.name}
                  name={a.name}
                  image={a.img}
                  fallbackImage={a.art}
                  onClick={() => playArtist(a)}
                />
              ))}
            </Shelf>
          )}

          {CHARTS.map((chart) => {
            const songs = charts[chart.id] || [];
            if (!songs.length) return null;
            return (
              <Shelf key={chart.id} title={chart.title} subtitle={chart.subtitle} seeAllTo={`/search?q=${encodeURIComponent(chart.query)}`}>
                {songs.map((song) => (
                  <SongCard key={song.id} song={song} songList={songs} />
                ))}
              </Shelf>
            );
          })}

          {queries.map((section) => {
            const songs = personal[section.key] || [];
            if (!songs.length) return null;
            return (
              <Shelf key={section.key} title={section.title} seeAllTo={`/search?q=${encodeURIComponent(section.query)}`}>
                {songs.map((song) => (
                  <SongCard key={song.id} song={song} songList={songs} />
                ))}
              </Shelf>
            );
          })}
        </>
      )}
    </div>
  );
}

function ListSkeleton({ rows = 4 }) {
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

function HomeSkeleton() {
  return (
    <div className="space-y-9">
      {[0, 1, 2].map((row) => (
        <div key={row}>
          <div className="skeleton mb-4 h-4 w-40" />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-[144px] shrink-0 sm:w-[164px]">
                <div className="skeleton mb-2.5 aspect-square rounded-xl" />
                <div className="skeleton mb-1.5 h-3 w-3/4" />
                <div className="skeleton h-2.5 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
