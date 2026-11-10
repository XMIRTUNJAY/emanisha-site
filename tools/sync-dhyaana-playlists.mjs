// Refresh apps/dhyaana/src/content/youtube.json from the live YouTube playlists.
//
//   node ./tools/sync-dhyaana-playlists.mjs
//
// Reads each playlist in apps/dhyaana/src/content/youtube.ts (PLAYLIST_META keys)
// via the public playlist page, and rewrites the manifest with the current
// video ids, titles, and thumbnail URLs.
//
// Requires no API key: the playlist page embeds its items as JSON.
// Use --check to verify the manifest is current without writing (CI-friendly).
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const manifestPath = join(root, 'apps', 'dhyaana', 'src', 'content', 'youtube.json');
const metaPath = join(root, 'apps', 'dhyaana', 'src', 'content', 'youtube.ts');

const checkOnly = process.argv.includes('--check');

// Playlist ids come from PLAYLIST_META in youtube.ts, so the two stay in sync.
const metaSource = readFileSync(metaPath, 'utf8');
const playlistIds = [...metaSource.matchAll(/^\s*"(PL[A-Za-z0-9_-]+)":\s*\{/gm)].map((m) => m[1]);
if (!playlistIds.length) {
  console.error('No playlist ids found in youtube.ts PLAYLIST_META');
  process.exit(1);
}

/** Pull the video list out of a YouTube playlist page. */
async function fetchPlaylist(id) {
  const url = `https://www.youtube.com/playlist?list=${id}`;
  const res = await fetch(url, {
    headers: {
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
      'accept-language': 'en-US,en;q=0.9',
    },
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`${id}: HTTP ${res.status}`);
  const html = await res.text();

  // The page carries an initial data blob with the playlist contents.
  const marker = 'var ytInitialData = ';
  const start = html.indexOf(marker);
  if (start === -1) throw new Error(`${id}: ytInitialData not found`);
  const jsonStart = start + marker.length;
  const end = html.indexOf(';</script>', jsonStart);
  if (end === -1) throw new Error(`${id}: ytInitialData truncated`);

  let data;
  try {
    data = JSON.parse(html.slice(jsonStart, end));
  } catch (e) {
    throw new Error(`${id}: ytInitialData not valid JSON (${e.message})`);
  }

  // Walk the structure for playlist entries. These playlists hold Shorts, so
  // items appear as shortsLockupViewModel (with a reelWatchEndpoint) rather
  // than the usual playlistVideoRenderer.
  const videos = [];
  const seen = new Set();
  const walk = (node) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }

    const shorts = node.shortsLockupViewModel;
    const renderer = node.playlistVideoRenderer || node.videoRenderer;
    const endpoint =
      shorts?.onTap?.innertubeCommand?.reelWatchEndpoint ??
      renderer?.onTap?.innertubeCommand?.reelWatchEndpoint ??
      renderer?.navigationEndpoint?.reelWatchEndpoint ??
      renderer?.navigationEndpoint?.watchEndpoint;

    const videoId = endpoint?.videoId ?? renderer?.videoId ?? shorts?.onTap?.innertubeCommand?.reelWatchEndpoint?.videoId;
    if (videoId && !seen.has(videoId)) {
      seen.add(videoId);
      const title =
        renderer?.title?.runs?.[0]?.text ??
        renderer?.title?.simpleText ??
        renderer?.headline?.simpleText ??
        shorts?.overlayMetadata?.primaryText?.content ??
        shorts?.accessibilityText ??
        shorts?.headline ??
        '';
      videos.push({
        id: videoId,
        title: String(title).replace(/^#/, '').replace(/\s*–\s*play Short$/i, '').trim(),
        thumb: `https://i.ytimg.com/vi/${videoId}/frame0.jpg`,
      });
    }

    for (const value of Object.values(node)) walk(value);
  };
  walk(data);

  // Fetch the real clip length so the app can show it and apply proportional
  // completion rules without asking YouTube at runtime.
  await Promise.all(
    videos.map(async (video) => {
      video.duration = await fetchDuration(video.id);
    }),
  );

  return videos;
}

/** Clip length in seconds, or 0 when it cannot be read. */
async function fetchDuration(videoId) {
  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(20000),
    });
    const html = await res.text();
    const match = html.match(/"lengthSeconds":"(\d+)"/);
    return match ? parseInt(match[1], 10) : 0;
  } catch {
    return 0;
  }
}

const existing = JSON.parse(readFileSync(manifestPath, 'utf8'));
const next = {};
let changed = 0;

for (const id of playlistIds) {
  const slug = existing[id]?.slug ?? id.toLowerCase();
  try {
    const videos = await fetchPlaylist(id);
    if (!videos.length) {
      console.error(`  ! ${id} (${slug}): no videos parsed, keeping existing entry`);
      next[id] = existing[id];
      continue;
    }
    const before = existing[id]?.videos?.length ?? 0;
    next[id] = { slug, videos };
    if (before !== videos.length) changed++;
    console.log(`  ${id} (${slug}): ${videos.length} videos${before !== videos.length ? ` (was ${before})` : ''}`);
  } catch (e) {
    console.error(`  ! ${id} (${slug}): ${e.message}`);
    next[id] = existing[id];
  }
}

const same =
  JSON.stringify(Object.keys(existing).sort().map((k) => [k, existing[k]])) ===
  JSON.stringify(Object.keys(next).sort().map((k) => [k, next[k]]));

if (checkOnly) {
  if (same) {
    console.log('youtube.json is up to date.');
    process.exit(0);
  }
  console.error('youtube.json is OUT OF DATE. Run: node ./tools/sync-dhyaana-playlists.mjs');
  process.exit(1);
}

if (same) {
  console.log('youtube.json unchanged.');
} else {
  writeFileSync(manifestPath, `${JSON.stringify(next, null, 2)}\n`);
  console.log(`youtube.json updated (${changed} playlist(s) changed).`);
}
