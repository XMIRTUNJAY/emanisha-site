export type LocalState = {
  minutes: number;
  sessions: number;
  sankalpa: string;
  reflections: { text: string; date: string }[];
};

const KEY = "dhyaana-state-v1";
const initial: LocalState = {
  minutes: 24,
  sessions: 5,
  sankalpa: "Meet this day with a clear and gentle mind.",
  reflections: [],
};

export function loadState(): LocalState {
  try {
    const saved = localStorage.getItem(KEY);
    return saved ? { ...initial, ...JSON.parse(saved) } : initial;
  } catch {
    return initial;
  }
}

export function saveState(state: LocalState) {
  localStorage.setItem(KEY, JSON.stringify(state));
}
