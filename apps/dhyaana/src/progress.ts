import type { Journey } from "./data";
import type { LocalState, Session } from "./storage";

export function dayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function shiftDay(date: Date, delta: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + delta);
  return next;
}

export function totalSeconds(sessions: Session[]): number {
  return sessions.reduce((sum, session) => sum + Math.max(0, session.seconds), 0);
}

export function totalMinutes(sessions: Session[]): number {
  return Math.round(totalSeconds(sessions) / 60);
}

export function activeDays(sessions: Session[]): string[] {
  return [...new Set(sessions.map((session) => dayKey(new Date(session.completedAt))))].sort();
}

export function currentStreak(sessions: Session[], today = new Date()): number {
  const days = new Set(activeDays(sessions));
  if (!days.size) return 0;
  let cursor = new Date(today);
  if (!days.has(dayKey(cursor))) {
    cursor = shiftDay(cursor, -1);
    if (!days.has(dayKey(cursor))) return 0;
  }
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor = shiftDay(cursor, -1);
  }
  return streak;
}

export function longestStreak(sessions: Session[]): number {
  const days = activeDays(sessions);
  let best = 0;
  let run = 0;
  let previous: Date | null = null;
  for (const key of days) {
    const date = new Date(`${key}T12:00:00`);
    if (previous && dayKey(shiftDay(previous, 1)) === key) {
      run += 1;
    } else {
      run = 1;
    }
    best = Math.max(best, run);
    previous = date;
  }
  return best;
}

export type WeekSlot = {
  key: string;
  label: string;
  minutes: number;
  sessions: number;
  today: boolean;
};

const WEEK_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export function weekActivity(sessions: Session[], today = new Date()): WeekSlot[] {
  const byDay = new Map<string, { seconds: number; sessions: number }>();
  for (const session of sessions) {
    const key = dayKey(new Date(session.completedAt));
    const entry = byDay.get(key) ?? { seconds: 0, sessions: 0 };
    entry.seconds += Math.max(0, session.seconds);
    entry.sessions += 1;
    byDay.set(key, entry);
  }
  const slots: WeekSlot[] = [];
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = shiftDay(today, -offset);
    const key = dayKey(date);
    const entry = byDay.get(key) ?? { seconds: 0, sessions: 0 };
    slots.push({
      key,
      label: WEEK_LABELS[date.getDay()],
      minutes: Math.round(entry.seconds / 60),
      sessions: entry.sessions,
      today: offset === 0,
    });
  }
  return slots;
}

export type JourneyStats = {
  completed: number;
  total: number;
  percent: number;
  nextDay: number;
  finished: boolean;
};

export function journeyStats(journey: Journey, state: LocalState): JourneyStats {
  const stored = state.journeys[journey.id]?.completedDays ?? [];
  const completed = new Set(stored.filter((day) => day >= 1 && day <= journey.days));
  const total = journey.days;
  const firstMissing = journey.dayPlans.find((plan) => !completed.has(plan.day));
  return {
    completed: completed.size,
    total,
    percent: total ? Math.round((completed.size / total) * 100) : 0,
    nextDay: firstMissing?.day ?? total,
    finished: completed.size >= total,
  };
}

export function completedVideos(state: LocalState): number {
  return Object.values(state.videos).filter((video) => video.completed).length;
}

export function formatDate(value: string): string {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return "";
  }
}
