// YouTube Music API - Search & Discovery
// Audio playback uses JioSaavn (YT doesn't provide direct stream URLs)

const YTM_BASE = 'https://music.youtube.com/youtubei/v1';
const CLIENT = { clientName: 'WEB_REMIX', clientVersion: '1.20231204.01.00', hl: 'en', gl: 'IN' };

// Songs filter param
const SONG_FILTER = 'EgWKAQIIAWoSEAMQBBAJEAoQBRAREBAQFRAV';

async function ytmFetch(endpoint, body) {
  try {
    const res = await fetch(`${YTM_BASE}${endpoint}?prettyPrint=false`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context: { client: CLIENT }, ...body }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

// Search YouTube Music for songs
export async function ytmSearchSongs(query, limit = 10) {
  if (!query?.trim()) return [];
  const data = await ytmFetch('/search', { query, params: SONG_FILTER });
  if (!data) return [];

  try {
    const sections = data?.contents?.tabbedSearchResultsRenderer?.tabs?.[0]
      ?.tabRenderer?.content?.sectionListRenderer?.contents || [];

    const results = [];
    for (const sec of sections) {
      const items = sec?.musicShelfRenderer?.contents || [];
      for (const item of items) {
        if (results.length >= limit) break;
        const r = item?.musicResponsiveListItemRenderer;
        if (!r) continue;

        const title = r?.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.text;
        const artistRuns = r?.flexColumns?.[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs || [];
        const artist = artistRuns.filter(run => run?.navigationEndpoint?.browseEndpoint?.browseEndpointContextSupportedConfigs).map(run => run.text).join(', ') || artistRuns[0]?.text || '';
        const videoId = r?.overlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer?.playNavigationEndpoint?.watchEndpoint?.videoId;
        const thumbs = r?.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || [];
        const thumbnail = thumbs[thumbs.length - 1]?.url || thumbs[0]?.url || '';
        const durationText = r?.fixedColumns?.[0]?.musicResponsiveListItemFixedColumnRenderer?.text?.runs?.[0]?.text || '';
        const duration = parseDuration(durationText);

        if (title && videoId) {
          results.push({
            id: `ytm_${videoId}`,
            videoId,
            title: title.trim(),
            artist: artist.trim(),
            thumbnail: thumbnail.replace(/w60-h60|w120-h120/, 'w300-h300'),
            duration,
            source: 'youtube',
          });
        }
      }
    }
    return results;
  } catch { return []; }
}

function parseDuration(text) {
  if (!text) return 0;
  const parts = text.split(':').map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

// Get YTM suggestions/related
export async function ytmGetRelated(videoId) {
  if (!videoId) return [];
  const data = await ytmFetch('/next', { videoId, isAudioOnly: true });
  if (!data) return [];

  try {
    const tabs = data?.contents?.singleColumnMusicWatchNextResultsRenderer?.tabbedRenderer
      ?.watchNextTabbedResultsRenderer?.tabs || [];
    const relatedTab = tabs.find(t => t?.tabRenderer?.endpoint?.browseEndpoint?.browseId === 'MPREb_');
    // Try automix playlist
    const automix = data?.contents?.singleColumnMusicWatchNextResultsRenderer?.tabbedRenderer
      ?.watchNextTabbedResultsRenderer?.tabs?.[0]?.tabRenderer?.content
      ?.musicQueueRenderer?.content?.playlistPanelRenderer?.contents || [];

    return automix.slice(1, 11).map(item => {
      const r = item?.playlistPanelVideoRenderer;
      if (!r) return null;
      return {
        id: `ytm_${r.videoId}`,
        videoId: r.videoId,
        title: r?.title?.runs?.[0]?.text || '',
        artist: r?.shortBylineText?.runs?.[0]?.text || '',
        thumbnail: (r?.thumbnail?.thumbnails || [])[0]?.url?.replace(/w60-h60/, 'w300-h300') || '',
        duration: parseDuration(r?.lengthText?.runs?.[0]?.text),
        source: 'youtube',
      };
    }).filter(Boolean);
  } catch { return []; }
}
