import raw from "./youtube.json";
import type { WorldId } from "../content/content";

type RawPlaylist = {
  slug: string;
  videos: { id: string; title: string; thumb: string }[];
};

const rawManifest = raw as Record<string, RawPlaylist>;

const PLAYLIST_META: Record<
  string,
  { title: string; description: string; orientation: "portrait" | "landscape" }
> = {
  "PLLGkwcqLguF0": {
    title: "Guided Meditation",
    description: "Short voice-led sessions for beginners, daily stillness and mindful attention.",
    orientation: "portrait",
  },
  "PLXbdg1tmSWT4": {
    title: "Sleep & Yoga Nidra",
    description: "Slow, voice-led practices for the end of the day.",
    orientation: "portrait",
  },
  "PLD4zM6EtlGR8": {
    title: "Mantra & Sacred Sound",
    description: "Japa, chant and attentive listening.",
    orientation: "portrait",
  },
  "PLdt6td6NsCOY": {
    title: "Breathwork & Pranayama",
    description: "Gentle breath rhythms you can follow anywhere.",
    orientation: "portrait",
  },
  "PLTgSmnHmHk0I": {
    title: "Wisdom & Reflection",
    description: "One Vedic idea at a time, carried into the day.",
    orientation: "portrait",
  },
  "PLej-dbaT8bdM": {
    title: "Yoga & Stretch",
    description: "Slow movement for releasing the body.",
    orientation: "portrait",
  },
  "PLa3NfSBA3Ahs": {
    title: "Nature & Scenery",
    description: "Rest the eyes and let a landscape do the work.",
    orientation: "portrait",
  },
  "PLbd5yPpCr5nU": {
    title: "Sound Therapy",
    description: "Sound-led restoration and quiet listening.",
    orientation: "portrait",
  },
};

export type Playlist = {
  id: string;
  slug: string;
  title: string;
  description: string;
  orientation: "portrait" | "landscape";
  videos: { id: string; title: string; thumb: string }[];
};

export type PlaylistVideo = {
  id: string;
  title: string;
  thumb: string;
  playlistId: string;
  playlistTitle: string;
  orientation: "portrait" | "landscape";
};

export const playlists: Playlist[] = Object.entries(rawManifest).map(([id, value]) => {
  const meta = PLAYLIST_META[id] ?? {
    title: value.slug.replace(/-/g, " "),
    description: "",
    orientation: "portrait" as const,
  };
  return {
    id,
    slug: value.slug,
    title: meta.title,
    description: meta.description,
    orientation: meta.orientation,
    videos: value.videos,
  };
});

/**
 * Where each world's shelves come from, and how many cards to show.
 * The full catalogue always stays available through the playlist link.
 */
export const worldPlaylists: Record<WorldId, { playlistId: string; limit: number }[]> = {
  dhyana: [{ playlistId: "PLLGkwcqLguF0", limit: 12 }],
  gyaan: [
    { playlistId: "PLTgSmnHmHk0I", limit: 8 },
    { playlistId: "PLD4zM6EtlGR8", limit: 6 },
  ],
  nidra: [{ playlistId: "PLXbdg1tmSWT4", limit: 10 }],
  prajna: [{ playlistId: "PLTgSmnHmHk0I", limit: 6 }],
  pranayama: [{ playlistId: "PLdt6td6NsCOY", limit: 8 }],
  therapy: [
    { playlistId: "PLbd5yPpCr5nU", limit: 8 },
    { playlistId: "PLa3NfSBA3Ahs", limit: 8 },
    { playlistId: "PLej-dbaT8bdM", limit: 8 },
  ],
};

const playlistById = new Map(playlists.map((playlist) => [playlist.id, playlist]));

export function videosForWorld(world: WorldId): PlaylistVideo[] {
  const seen = new Set<string>();
  const out: PlaylistVideo[] = [];
  for (const source of worldPlaylists[world]) {
    const playlist = playlistById.get(source.playlistId);
    if (!playlist) continue;
    for (const video of playlist.videos.slice(0, source.limit)) {
      if (seen.has(video.id)) continue;
      seen.add(video.id);
      out.push({
        ...video,
        playlistId: playlist.id,
        playlistTitle: playlist.title,
        orientation: playlist.orientation,
      });
    }
  }
  return out;
}

export function playlistUrl(playlistId: string): string {
  return `https://www.youtube.com/playlist?list=${playlistId}`;
}
