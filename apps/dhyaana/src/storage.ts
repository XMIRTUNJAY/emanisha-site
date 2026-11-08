export type Session = {
  id: string;
  world: string;
  intention: string;
  seconds: number;
  completedAt: string;
};

export type Reflection = {
  text: string;
  prompt: string;
  date: string;
};

export type SankalpaEntry = {
  text: string;
  changedAt: string;
};

export type JourneyState = {
  completedDays: number[];
  startedAt: string;
  lastOpened?: string;
};

export type VideoState = {
  videoId: string;
  playlistId: string;
  world: string;
  secondsWatched: number;
  duration: number;
  completed: boolean;
  completedAt?: string;
};

export type LocalState = {
  version: 2;
  sessions: Session[];
  sankalpa: string;
  sankalpaHistory: SankalpaEntry[];
  reflections: Reflection[];
  journeys: Record<string, JourneyState>;
  videos: Record<string, VideoState>;
};

const KEY = "dhyaana-state-v2";
const LEGACY_KEY = "dhyaana-state-v1";

const DEFAULT_SANKALPA = "Meet this day with a clear and gentle mind.";

export function emptyState(): LocalState {
  return {
    version: 2,
    sessions: [],
    sankalpa: DEFAULT_SANKALPA,
    sankalpaHistory: [],
    reflections: [],
    journeys: {},
    videos: {},
  };
}

function migrateLegacy(state: LocalState): LocalState {
  try {
    const saved = localStorage.getItem(LEGACY_KEY);
    if (!saved) return state;
    const old = JSON.parse(saved) as {
      sankalpa?: string;
      reflections?: { text?: string; date?: string }[];
    };
    if (typeof old.sankalpa === "string" && old.sankalpa.trim()) {
      state.sankalpa = old.sankalpa;
    }
    if (Array.isArray(old.reflections)) {
      state.reflections = old.reflections
        .filter((r) => typeof r?.text === "string" && r.text.trim())
        .map((r) => ({
          text: r.text as string,
          prompt: "Earlier reflection",
          date: r.date ?? new Date().toISOString(),
        }));
    }
  } catch {
    // A broken legacy value is treated as no legacy value.
  }
  return state;
}

export function loadState(): LocalState {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<LocalState>;
      return {
        ...emptyState(),
        ...parsed,
        version: 2,
        sankalpa:
          typeof parsed.sankalpa === "string" && parsed.sankalpa.trim()
            ? parsed.sankalpa
            : DEFAULT_SANKALPA,
        sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
        sankalpaHistory: Array.isArray(parsed.sankalpaHistory) ? parsed.sankalpaHistory : [],
        reflections: Array.isArray(parsed.reflections) ? parsed.reflections : [],
        journeys: parsed.journeys && typeof parsed.journeys === "object" ? parsed.journeys : {},
        videos: parsed.videos && typeof parsed.videos === "object" ? parsed.videos : {},
      };
    }
  } catch {
    // Fall through to a clean state.
  }
  return migrateLegacy(emptyState());
}

export function saveState(state: LocalState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage can be unavailable (private mode, quota). The app keeps working in memory.
  }
}

function id() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function recordSession(
  state: LocalState,
  world: string,
  intention: string,
  seconds: number,
  completedAt = new Date().toISOString(),
): LocalState {
  if (!Number.isFinite(seconds) || seconds <= 0) return state;
  const session: Session = {
    id: id(),
    world,
    intention,
    seconds: Math.round(seconds),
    completedAt,
  };
  return { ...state, sessions: [...state.sessions, session] };
}

export function setSankalpa(state: LocalState, text: string): LocalState {
  const next = text.trim();
  if (!next || next === state.sankalpa) return state;
  return {
    ...state,
    sankalpa: next,
    sankalpaHistory: [...state.sankalpaHistory, { text: next, changedAt: new Date().toISOString() }],
  };
}

export function addReflection(state: LocalState, text: string, prompt: string): LocalState {
  const next = text.trim();
  if (!next) return state;
  return {
    ...state,
    reflections: [
      ...state.reflections,
      { text: next, prompt, date: new Date().toISOString() },
    ],
  };
}

export function markJourneyDay(state: LocalState, journeyId: string, day: number): LocalState {
  const current = state.journeys[journeyId] ?? {
    completedDays: [],
    startedAt: new Date().toISOString(),
  };
  if (current.completedDays.includes(day)) return state;
  return {
    ...state,
    journeys: {
      ...state.journeys,
      [journeyId]: {
        ...current,
        completedDays: [...current.completedDays, day].sort((a, b) => a - b),
        lastOpened: new Date().toISOString(),
      },
    },
  };
}

export function recordVideo(
  state: LocalState,
  update: {
    videoId: string;
    playlistId: string;
    world: string;
    secondsWatched: number;
    duration: number;
    completed: boolean;
  },
): LocalState {
  const previous = state.videos[update.videoId];
  const completed = previous?.completed || update.completed;
  return {
    ...state,
    videos: {
      ...state.videos,
      [update.videoId]: {
        videoId: update.videoId,
        playlistId: update.playlistId,
        world: update.world,
        secondsWatched: Math.max(previous?.secondsWatched ?? 0, Math.round(update.secondsWatched)),
        duration: Math.max(previous?.duration ?? 0, Math.round(update.duration)),
        completed,
        completedAt: completed
          ? (previous?.completedAt ?? new Date().toISOString())
          : previous?.completedAt,
      },
    },
  };
}
