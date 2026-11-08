import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "./components/Primitives";
import { WorldExperience } from "./components/WorldExperiences";
import { YoutubePlayer } from "./components/YoutubePlayer";
import type { PlaylistVideo } from "./content/youtube";
import { journeys, World, WorldId, worlds } from "./data";
import {
  completedVideos,
  currentStreak,
  formatDate,
  journeyStats,
  longestStreak,
  totalMinutes,
  weekActivity,
} from "./progress";
import {
  addReflection,
  loadState,
  LocalState,
  markJourneyDay,
  recordSession,
  recordVideo,
  saveState,
  setSankalpa,
} from "./storage";

type View = "home" | "explore" | "practice" | "journeys" | "journey" | "me" | WorldId;

type Route = { view: View; journeyId?: string };

type PlayerState = {
  duration: number;
  intention: string;
  world: string;
  video?: PlaylistVideo;
  journey?: { id: string; day: number };
};

function getTimeContext() {
  const hour = new Date().getHours();
  if (hour < 5)
    return {
      greeting: "The world is quiet",
      label: "Brahma Muhurta",
      icon: "moon" as const,
      practice: "A quiet pre-dawn sit",
    };
  if (hour < 9)
    return {
      greeting: "Begin gently",
      label: "Morning",
      icon: "sun" as const,
      practice: "Morning awareness",
    };
  if (hour < 17)
    return {
      greeting: "Return to clarity",
      label: "Daytime",
      icon: "sun" as const,
      practice: "Three-minute reset",
    };
  if (hour < 20)
    return {
      greeting: "Meet the evening",
      label: "Sandhya",
      icon: "sun" as const,
      practice: "Evening release",
    };
  return {
    greeting: "Let the day soften",
    label: "Night",
    icon: "moon" as const,
    practice: "Restful body scan",
  };
}

const VALID_VIEWS: View[] = [
  "home",
  "explore",
  "practice",
  "journeys",
  "journey",
  "me",
  ...worlds.map((world) => world.id),
];

function parseHash(): Route {
  const raw = location.hash.replace(/^#\/?/, "").split("?")[0];
  const [name, id] = raw.split("/");
  if (name === "journey" && id) return { view: "journey", journeyId: id };
  if (name === "journey") return { view: "journeys" };
  return { view: VALID_VIEWS.includes(name as View) ? (name as View) : "home" };
}

/**
 * The fixed header must stay legible over whatever sits behind it. Some pages mix
 * dark and light sections, so the tone is derived from the section under the
 * header at the current scroll position rather than from the route alone.
 */
function useHeaderTone(view: View) {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".app");
    if (!root) return;

    let frame = 0;
    let current = "";

    const compute = () => {
      frame = 0;
      const band = document.querySelector<HTMLElement>(".site-header")?.offsetHeight ?? 88;
      let tone = "";
      let bestArea = 0;
      for (const el of root.querySelectorAll<HTMLElement>("[data-tone]")) {
        const rect = el.getBoundingClientRect();
        const overlap = Math.max(0, Math.min(rect.bottom, band) - Math.max(rect.top, 0));
        if (overlap > bestArea) {
          bestArea = overlap;
          tone = el.dataset.tone ?? "";
        }
      }
      const next = tone || "light";
      if (next !== current) {
        current = next;
        document.body.dataset.headerTone = next;
      }
    };

    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(compute);
    };

    compute();
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    return () => {
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
      delete document.body.dataset.headerTone;
    };
  }, [view]);
}

function Header({ view, navigate }: { view: View; navigate: (v: View) => void }) {
  const [open, setOpen] = useState(false);
  const links: [string, View][] = [
    ["Home", "home"],
    ["Explore", "explore"],
    ["Practice", "practice"],
    ["Journeys", "journeys"],
    ["My Dhyaana", "me"],
  ];
  return (
    <header className="site-header">
      <button className="brand" onClick={() => navigate("home")} aria-label="Dhyaana home">
        <span className="brand-mark">
          <i />
        </span>
        <span>
          DHYAANA<small>ध्यान</small>
        </span>
      </button>
      <nav className={open ? "nav open" : "nav"} aria-label="Primary navigation">
        {links.map(([label, target]) => (
          <button
            key={target}
            className={view === target ? "active" : ""}
            onClick={() => {
              navigate(target);
              setOpen(false);
            }}
          >
            {label}
          </button>
        ))}
      </nav>
      <button
        className="menu-button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label="Toggle navigation"
      >
        <Icon name={open ? "close" : "menu"} />
      </button>
    </header>
  );
}

function Mandala({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`mandala ${compact ? "compact" : ""}`} aria-hidden="true">
      <span className="ring r1" />
      <span className="ring r2" />
      <span className="ring r3" />
      <span className="petal p1" />
      <span className="petal p2" />
      <span className="petal p3" />
      <span className="petal p4" />
      <span className="mandala-core" />
    </div>
  );
}

function Home({
  navigate,
  startPractice,
  state,
}: {
  navigate: (v: View, id?: string) => void;
  startPractice: () => void;
  state: LocalState;
}) {
  const time = useMemo(getTimeContext, []);
  return (
    <>
      <main>
        <section className="hero" data-tone="dark">
          <div className="hero-landscape" />
          <div className="hero-content">
            <div className="time-note">
              <Icon name={time.icon} size={16} /> {time.label} · {time.greeting}
            </div>
            <p className="kicker">A contemplative space for modern life</p>
            <h1>
              Return to the
              <br />
              <em>stillness within.</em>
            </h1>
            <p className="hero-copy">
              Sit for three quiet minutes, follow a guided breath, or take one carefully sourced
              idea into the day.
            </p>
            <div className="hero-actions">
              <button className="button primary" onClick={startPractice}>
                Start a 3-minute practice <Icon name="arrow" />
              </button>
              <button className="button text-button" onClick={() => navigate("explore")}>
                Explore the six worlds
              </button>
            </div>
          </div>
          <button
            className="scroll-cue"
            onClick={() =>
              document.getElementById("daily")?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          >
            <span /> Discover your path
          </button>
        </section>

        <section className="daily section-shell" id="daily" data-tone="light">
          <div>
            <p className="kicker">Your practice, right now</p>
            <h2>{time.practice}</h2>
            <p>
              A guided pause shaped for this moment of your day. No preparation needed—simply arrive
              as you are.
            </p>
          </div>
          <button
            className="practice-orb"
            onClick={startPractice}
            aria-label={`Begin ${time.practice}`}
          >
            <span>
              <Icon name="play" size={26} />
            </span>
            <small>BEGIN</small>
            <strong>3 min</strong>
          </button>
        </section>

        <WorldConstellation navigate={navigate} />

        <section className="editorial-feature" data-tone="dark">
          <div className="editorial-image" role="img" aria-label="Misty mountain ridges in India" />
          <div className="editorial-copy">
            <p className="kicker">Wisdom, made inhabitable</p>
            <h2>
              Not knowledge to collect.
              <br />
              <em>Wisdom to live.</em>
            </h2>
            <p>
              Move slowly through foundational ideas, their philosophical context, and a question
              you can carry into daily life.
            </p>
            <button className="line-link" onClick={() => navigate("gyaan")}>
              Enter Gyaan <Icon name="arrow" />
            </button>
          </div>
        </section>

        <section className="journey-preview section-shell" data-tone="light">
          <div className="section-heading">
            <div>
              <p className="kicker">Guided journeys</p>
              <h2>
                A path unfolds
                <br />
                through practice.
              </h2>
            </div>
            <button className="line-link" onClick={() => navigate("journeys")}>
              View all journeys <Icon name="arrow" />
            </button>
          </div>
          <div className="path-line" />
          <div className="journey-row">
            {journeys.slice(0, 3).map((journey, index) => {
              const stats = journeyStats(journey, state);
              return (
                <button
                  className="journey-mini"
                  key={journey.id}
                  onClick={() => navigate("journey", journey.id)}
                >
                  <span>0{index + 1}</span>
                  <small>{journey.eyebrow}</small>
                  <h3>{journey.title}</h3>
                  <p>
                    {journey.days} days · {journey.description}
                  </p>
                  {stats.completed > 0 && (
                    <em className="journey-mini-progress">
                      {stats.completed} of {stats.total} days
                    </em>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      </main>
      <Footer navigate={navigate} />
    </>
  );
}

function WorldConstellation({ navigate }: { navigate: (v: View, id?: string) => void }) {
  const [selected, setSelected] = useState<World>(worlds[0]);
  return (
    <section className="world-section section-shell" data-tone="light">
      <div className="section-heading centered">
        <p className="kicker">Six worlds · one inner journey</p>
        <h2>Choose where you wish to begin.</h2>
        <p>Each world offers a different doorway into awareness, understanding and rest.</p>
      </div>
      <div className="constellation">
        <svg className="connections" viewBox="0 0 800 620" aria-hidden="true">
          <circle cx="400" cy="310" r="200" />
          <path d="M400 110 575 210 575 410 400 510 225 410 225 210Z" />
        </svg>
        <div className="constellation-center">
          <Mandala compact />
          <span>DHYAANA</span>
          <small>THE INNER CENTRE</small>
        </div>
        {worlds.map((world, index) => (
          <button
            key={world.id}
            style={{ "--i": index, "--world": world.color } as React.CSSProperties}
            className={`world-node ${selected.id === world.id ? "selected" : ""}`}
            onMouseEnter={() => setSelected(world)}
            onFocus={() => setSelected(world)}
            onClick={() => navigate(world.id)}
          >
            <span className="world-dot" />
            <small>0{index + 1}</small>
            <strong>{world.name}</strong>
            <em>{world.devanagari}</em>
          </button>
        ))}
        <div className="world-detail">
          <small>{selected.essence}</small>
          <h3>
            {selected.name} <em>{selected.devanagari}</em>
          </h3>
          <p>{selected.description}</p>
          <button onClick={() => navigate(selected.id)}>
            {selected.cue} <Icon name="arrow" size={18} />
          </button>
        </div>
      </div>
      <div className="mobile-worlds">
        {worlds.map((world, index) => (
          <button key={world.id} onClick={() => navigate(world.id)}>
            <span style={{ background: world.color }}>0{index + 1}</span>
            <div>
              <small>
                {world.devanagari} · {world.essence}
              </small>
              <strong>{world.name}</strong>
              <p>{world.description}</p>
            </div>
            <Icon name="arrow" />
          </button>
        ))}
      </div>
    </section>
  );
}

function Explore({ navigate }: { navigate: (v: View, id?: string) => void }) {
  return (
    <main className="page warm-page">
      <section className="page-intro" data-tone="light">
        <p className="kicker">The Dhyaana cosmos</p>
        <h1>
          Six doorways.
          <br />
          <em>One return inward.</em>
        </h1>
        <p>Practice, study, breathe, rest, and reflect. Begin with what you need today.</p>
      </section>
      <WorldConstellation navigate={navigate} />
    </main>
  );
}

function PracticeComposer({ start }: { start: (duration: number, state: string) => void }) {
  const [duration, setDuration] = useState(5);
  const [feeling, setFeeling] = useState("find calm");
  return (
    <main className="page composer-page">
      <section className="composer" data-tone="light">
        <p className="kicker">Guided session</p>
        <h1>
          What do you need
          <br />
          <em>in this moment?</em>
        </h1>
        <div className="composer-step">
          <span>01</span>
          <div>
            <h2>Choose your intention</h2>
            <div className="choice-row">
              {["find calm", "focus", "rest", "release", "feel grateful"].map((value) => (
                <button
                  className={feeling === value ? "active" : ""}
                  onClick={() => setFeeling(value)}
                  key={value}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="composer-step">
          <span>02</span>
          <div>
            <h2>How much time do you have?</h2>
            <div className="duration-row">
              {[1, 3, 5, 10, 21].map((value) => (
                <button
                  className={duration === value ? "active" : ""}
                  onClick={() => setDuration(value)}
                  key={value}
                >
                  <strong>{value}</strong> min
                </button>
              ))}
            </div>
          </div>
        </div>
        <button className="button primary compose-button" onClick={() => start(duration, feeling)}>
          Compose my practice <Icon name="arrow" />
        </button>
        <p className="privacy-note">Your preferences and progress stay on this device.</p>
      </section>
    </main>
  );
}

function Player({
  player,
  routeKey,
  close,
  complete,
}: {
  player: PlayerState;
  routeKey: string;
  close: () => void;
  complete: (seconds: number, full: boolean, videoDuration?: number) => void;
}) {
  const isVideo = Boolean(player.video);
  const total = Math.max(1, player.duration * 60);
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [done, setDone] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);

  // The timer and the route watcher must not be restarted by unrelated parent
  // re-renders, so they read the latest callbacks through refs.
  const completeRef = useRef(complete);
  completeRef.current = complete;

  const handleClose = () => {
    if (done) {
      close();
      return;
    }
    if (isVideo && elapsed >= 5) {
      completeRef.current(elapsed, false, videoDuration);
    } else if (!isVideo && elapsed >= 30) {
      completeRef.current(elapsed, false);
    }
    close();
  };

  const handleCloseRef = useRef(handleClose);
  handleCloseRef.current = handleClose;

  useEffect(() => {
    if (isVideo || !playing || done) return;
    const timer = window.setInterval(
      () =>
        setElapsed((value) => {
          if (value + 1 >= total) {
            window.clearInterval(timer);
            setDone(true);
            setPlaying(false);
            completeRef.current(total, true);
            return total;
          }
          return value + 1;
        }),
      1000,
    );
    return () => clearInterval(timer);
  }, [isVideo, playing, done, total]);

  /**
   * Modal behaviour: lock the page behind, move focus inside, keep Tab within
   * the dialog, and let Escape dismiss it.
   */
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const html = document.documentElement;
    const body = document.body;
    const previousOverflow = { html: html.style.overflow, body: body.style.overflow };
    const previousPadding = body.style.paddingRight;
    const scrollbar = window.innerWidth - html.clientWidth;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    /*
     * The YouTube iframe is deliberately excluded: a cross-document iframe
     * would swallow Tab and Escape, letting focus leave the dialog.
     */
    const focusables = () =>
      Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.closest("iframe"));

    (focusables()[0] ?? dialog).focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      if (!items.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;
      const inside = active ? dialog.contains(active) : false;
      if (event.shiftKey) {
        if (!inside || active === firstItem) {
          event.preventDefault();
          lastItem.focus();
        }
      } else if (!inside || active === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    };

    /*
     * Listening on window (not document) means Escape still reaches us when
     * focus sits inside the YouTube iframe, which otherwise swallows it.
     */
    window.addEventListener("keydown", onKeyDown, true);

    /*
     * An aria-modal dialog must keep focus inside itself. The YouTube player
     * is a cross-origin iframe: clicking the video moves focus into it, and
     * key events there never reach this document.
     *
     * `focusout` does not fire when focus enters a cross-document iframe, and
     * the iframe element itself lives inside the dialog, so containment alone
     * cannot detect it. The iframe is instead explicitly blurred whenever it
     * receives focus, which returns control to the dialog while leaving mouse
     * interaction with the player untouched.
     */
    const keepFocusInside = () => {
      const frame = dialog.querySelector<HTMLIFrameElement>(".yt-mount iframe");
      if (!frame) return;
      if (document.activeElement === frame) {
        const closeButton = dialog.querySelector<HTMLElement>(".player-close");
        (closeButton ?? dialog).focus();
      }
    };

    dialog.addEventListener("focusin", keepFocusInside);
    window.addEventListener("focus", keepFocusInside, true);

    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("focus", keepFocusInside, true);
      dialog.removeEventListener("focusin", keepFocusInside);
      html.style.overflow = previousOverflow.html;
      body.style.overflow = previousOverflow.body;
      body.style.paddingRight = previousPadding;
      previouslyFocused?.focus?.();
    };
  }, []);

  /**
   * A route change (browser back/forward, or any hash edit) must not leave the
   * overlay mounted: it covers the whole page and swallows every click, which
   * made the navigation unreachable while a practice was open.
   */
  const routeRef = useRef(routeKey);
  useEffect(() => {
    if (routeRef.current === routeKey) return;
    routeRef.current = routeKey;
    handleCloseRef.current();
  }, [routeKey]);

  const pct = isVideo
    ? videoDuration
      ? Math.min(100, (elapsed / videoDuration) * 100)
      : 0
    : (elapsed / total) * 100;
  const remaining = isVideo ? Math.max(0, videoDuration - elapsed) : Math.max(0, total - elapsed);

  return (
    <div
      className="player"
      role="dialog"
      aria-modal="true"
      aria-label="Practice player"
      ref={dialogRef}
      tabIndex={-1}
    >
      <div className="player-bg" />
      <button className="player-close" onClick={handleClose} aria-label="Close practice">
        <Icon name="close" />
      </button>
      <div className="player-top">
        <span>DHYAANA</span>
        <small>
          {player.video ? player.video.playlistTitle : player.intention}
          {!player.video && ` · ${player.duration} min`}
        </small>
      </div>

      {player.video ? (
        <div className={`player-video is-${player.video.orientation}`}>
          <YoutubePlayer
            videoId={player.video.id}
            title={player.video.title}
            onProgress={(seconds, duration) => {
              setElapsed(seconds);
              if (duration) setVideoDuration(duration);
            }}
            onEnded={(seconds, duration) => {
              setDone(true);
              setVideoDuration(duration || seconds);
              complete(seconds || duration, true, duration || seconds);
            }}
          />
        </div>
      ) : (
        <div className={`player-orb ${playing ? "playing" : ""}`}>
          <Mandala compact />
        </div>
      )}

      <div className="player-copy">
        <small>
          {done
            ? "Practice complete"
            : elapsed < total * 0.2
              ? "SETTLE"
              : elapsed < total * 0.8
                ? "PRACTICE"
                : "RETURN"}
        </small>
        <h2>
          {done
            ? "Carry this quality with you."
            : isVideo
              ? player.video?.title
              : elapsed < total * 0.2
                ? "Let the body arrive."
                : elapsed < total * 0.8
                  ? "Stay with the natural breath."
                  : "Notice the space around you."}
        </h2>
      </div>

      {!isVideo && (
        <div className="player-controls">
          <span>
            {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}
          </span>
          <button
            onClick={() => (done ? close() : setPlaying(!playing))}
            aria-label={done ? "Finish" : playing ? "Pause" : "Resume"}
          >
            <Icon name={done ? "arrow" : playing ? "pause" : "play"} size={26} />
          </button>
          <span>
            -{Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}
          </span>
        </div>
      )}

      <div className="player-progress">
        <i style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function JourneysPage({
  navigate,
  state,
}: {
  navigate: (v: View, id?: string) => void;
  state: LocalState;
}) {
  return (
    <main className="page journeys-page">
      <section className="page-intro" data-tone="light">
        <p className="kicker">Practice with continuity</p>
        <h1>
          Journeys for a<br />
          <em>life in motion.</em>
        </h1>
        <p>
          Progress comes from returning, not perfection. Missed days never erase the path you have
          walked.
        </p>
      </section>
      <section className="journey-library section-shell" data-tone="light">
        {journeys.map((journey, index) => {
          const stats = journeyStats(journey, state);
          return (
            <article key={journey.id}>
              <div className="journey-index">0{index + 1}</div>
              <div>
                <small>{journey.eyebrow}</small>
                <h2>{journey.title}</h2>
                <p>{journey.description}</p>
              </div>
              <div className="journey-meta">
                <span>{journey.days} days</span>
                {stats.completed > 0 && (
                  <>
                    <div>
                      <i style={{ width: `${stats.percent}%` }} />
                    </div>
                    <small>
                      {stats.completed} of {stats.total} days · {stats.percent}%
                    </small>
                  </>
                )}
                <button onClick={() => navigate("journey", journey.id)}>
                  {stats.completed > 0 ? "Continue journey" : "View journey"} <Icon name="arrow" />
                </button>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}

function JourneyDetail({
  journeyId,
  state,
  startDay,
}: {
  journeyId?: string;
  state: LocalState;
  startDay: (journeyId: string, day: number) => void;
}) {
  const journey = journeys.find((item) => item.id === journeyId) ?? journeys[0];
  const stats = journeyStats(journey, state);
  const completed = new Set(state.journeys[journey.id]?.completedDays ?? []);
  const groups: { label: string; plans: typeof journey.dayPlans }[] = [];
  for (let start = 0; start < journey.dayPlans.length; start += 7) {
    const plans = journey.dayPlans.slice(start, start + 7);
    groups.push({
      label: `Movement ${groups.length + 1} · Days ${plans[0].day}–${plans[plans.length - 1].day}`,
      plans,
    });
  }
  return (
    <main className="journey-detail page">
      <header className="journey-detail-header section-shell" data-tone="light">
        <p className="section-label">{journey.eyebrow}</p>
        <div>
          <h1>{journey.title}</h1>
          <span>{journey.days}</span>
        </div>
        <p>
          One short teaching, one practice, and one reflection each day. Progress follows
          completion—not consecutive attendance.
        </p>
        <div className="journey-detail-actions">
          <button className="button primary" onClick={() => startDay(journey.id, stats.nextDay)}>
            {stats.finished ? "Revisit day " : "Continue day "}
            {stats.nextDay} <Icon name="arrow" />
          </button>
          <span>
            {stats.completed} of {stats.total} days · {stats.percent}%
          </span>
        </div>
      </header>
      {groups.map((group) => (
        <section className="curriculum section-shell" key={group.label} data-tone="light">
          <header>
            <p className="section-label">{group.label}</p>
            <h2>{journey.title.split(" ").slice(-1)[0]} practice</h2>
          </header>
          <div>
            {group.plans.map((plan) => (
              <button
                key={plan.day}
                className={completed.has(plan.day) ? "is-complete" : ""}
                onClick={() => startDay(journey.id, plan.day)}
              >
                <span>{completed.has(plan.day) ? "✓" : String(plan.day).padStart(2, "0")}</span>
                <strong>{plan.title}</strong>
                <small>{plan.practice}</small>
                <em>{plan.minutes} min</em>
                <Icon name="arrow" />
              </button>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}

function MePage({
  state,
  setState,
  navigate,
  startPractice,
}: {
  state: LocalState;
  setState: (state: LocalState) => void;
  navigate: (v: View, id?: string) => void;
  startPractice: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(state.sankalpa);
  const [showHistory, setShowHistory] = useState(false);
  const time = getTimeContext();
  const minutes = totalMinutes(state.sessions);
  const streak = currentStreak(state.sessions);
  const longest = longestStreak(state.sessions);
  const week = weekActivity(state.sessions);
  const videosWatched = completedVideos(state);
  const activeJourney =
    journeys.find((journey) => journeyStats(journey, state).completed > 0) ?? journeys[0];
  const activeStats = journeyStats(activeJourney, state);

  return (
    <main className="page me-page">
      <section className="dashboard section-shell" data-tone="light">
        <p className="kicker">
          {time.label} · Your Dhyaana
        </p>
        <h1>{time.greeting}.</h1>
        <p className="dashboard-lead">
          {state.sessions.length
            ? "Continue gently from where you are."
            : "Your first sit is waiting. Three minutes is enough to begin."}
        </p>
        <div className="dashboard-grid">
          <button className="continue-card" onClick={startPractice}>
            <small>Recommended now</small>
            <h2>{time.practice}</h2>
            <p>3 minutes · guided awareness</p>
            <span>
              <Icon name="play" /> Begin practice
            </span>
          </button>
          <div className="stats-card">
            <small>Your practice</small>
            <strong>
              {minutes}
              <span>minutes</span>
            </strong>
            <p>
              {state.sessions.length} {state.sessions.length === 1 ? "session" : "sessions"} ·{" "}
              {videosWatched} {videosWatched === 1 ? "video" : "videos"} completed
            </p>
          </div>
          <div className="streak-card">
            <small>Current streak</small>
            <strong>
              {streak}
              <span>{streak === 1 ? "day" : "days"}</span>
            </strong>
            <p>
              Longest: {longest} {longest === 1 ? "day" : "days"} · resets only after a missed day
            </p>
          </div>
          <div className="sankalpa-card">
            <small>Personal Sankalpa</small>
            {editing ? (
              <>
                <textarea value={draft} onChange={(event) => setDraft(event.target.value)} />
                <button
                  onClick={() => {
                    const next = setSankalpa(state, draft);
                    setState(next);
                    saveState(next);
                    setEditing(false);
                  }}
                >
                  Save intention
                </button>
              </>
            ) : (
              <>
                <blockquote>“{state.sankalpa}”</blockquote>
                <button onClick={() => setEditing(true)}>Edit intention</button>
                {state.sankalpaHistory.length > 0 && (
                  <button className="quiet-link" onClick={() => setShowHistory(!showHistory)}>
                    {showHistory ? "Hide history" : `History · ${state.sankalpaHistory.length}`}
                  </button>
                )}
              </>
            )}
            {showHistory && (
              <ul className="sankalpa-history">
                {state.sankalpaHistory
                  .slice()
                  .reverse()
                  .map((entry) => (
                    <li key={`${entry.changedAt}-${entry.text}`}>
                      <span>{entry.text}</span>
                      <small>{formatDate(entry.changedAt)}</small>
                    </li>
                  ))}
              </ul>
            )}
          </div>
          <div className="progress-card">
            <small>Current journey</small>
            <h2>{activeJourney.title}</h2>
            <div>
              <i style={{ width: `${activeStats.percent}%` }} />
            </div>
            <p>
              {activeStats.finished
                ? `${activeStats.total} of ${activeStats.total} days complete`
                : `Day ${activeStats.nextDay} of ${activeStats.total} · ${activeStats.percent}% complete`}
            </p>
            <button onClick={() => navigate("journey", activeJourney.id)}>Open journey</button>
          </div>
          <div className="week-card">
            <small>Last seven days</small>
            <div className="week-strip">
              {week.map((slot) => (
                <div
                  key={slot.key}
                  className={slot.sessions ? "week-day has-practice" : "week-day"}
                  title={`${slot.key}: ${slot.minutes} min`}
                >
                  <span>{slot.label}</span>
                  <i style={{ height: `${Math.min(100, 18 + slot.minutes * 9)}%` }} />
                  <small>{slot.minutes || ""}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
        {state.journeys && Object.keys(state.journeys).length > 0 && (
          <div className="journey-summary">
            <p className="kicker">All journeys</p>
            <div>
              {journeys
                .filter((journey) => state.journeys[journey.id]?.completedDays.length)
                .map((journey) => {
                  const stats = journeyStats(journey, state);
                  return (
                    <button key={journey.id} onClick={() => navigate("journey", journey.id)}>
                      <span>{journey.title}</span>
                      <small>
                        {stats.completed}/{stats.total} · {stats.percent}%
                      </small>
                      <i style={{ width: `${stats.percent}%` }} />
                    </button>
                  );
                })}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function Footer({ navigate }: { navigate: (v: View, id?: string) => void }) {
  return (
    <footer className="site-footer" data-tone="dark">
      <div className="footer-brand">
        <span className="brand-mark">
          <i />
        </span>
        <h2>DHYAANA</h2>
        <p>Return to the stillness within.</p>
      </div>
      <div>
        <small>EXPLORE</small>
        {worlds.map((world) => (
          <button key={world.id} onClick={() => navigate(world.id)}>
            {world.name} <span>{world.devanagari}</span>
          </button>
        ))}
      </div>
      <div>
        <small>JOURNEY</small>
        <button onClick={() => navigate("practice")}>Begin a practice</button>
        <button onClick={() => navigate("journeys")}>Guided journeys</button>
        <button onClick={() => navigate("me")}>My Dhyaana</button>
      </div>
      <p className="footer-note">
        Dhyaana offers contemplative wellness practices, not medical care. © 2026
      </p>
    </footer>
  );
}

export default function App() {
  const [route, setRoute] = useState<Route>(parseHash);
  const [player, setPlayer] = useState<PlayerState | null>(null);
  const [localState, setLocalState] = useState<LocalState>(loadState);
  const [inquirySeed, setInquirySeed] = useState<string | undefined>(undefined);
  const completionRef = useRef(false);

  useEffect(() => {
    const handle = () => setRoute(parseHash());
    addEventListener("hashchange", handle);
    return () => removeEventListener("hashchange", handle);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    document.body.dataset.view = route.view;
  }, [route.view]);

  useHeaderTone(route.view);

  const navigate = (target: View, journeyId?: string) => {
    if (target === "journey" && journeyId) {
      location.hash = `/journey/${journeyId}`;
      setRoute({ view: "journey", journeyId });
      return;
    }
    location.hash = `/${target}`;
    setRoute({ view: target });
  };

  const persist = (next: LocalState) => {
    setLocalState(next);
    saveState(next);
  };

  const openPractice = (duration = 3, intention = "return to calm", world = "practice") => {
    completionRef.current = false;
    setPlayer({ duration, intention, world });
  };

  const complete = (seconds: number, full: boolean, videoDuration?: number) => {
    if (completionRef.current) return;
    completionRef.current = true;
    setLocalState((previous) => {
      let next = recordSession(previous, player?.world ?? "practice", player?.intention ?? "practice", seconds);
      if (player?.journey && full) {
        next = markJourneyDay(next, player.journey.id, player.journey.day);
      }
      if (player?.video) {
        next = recordVideo(next, {
          videoId: player.video.id,
          playlistId: player.video.playlistId,
          world: player.world,
          secondsWatched: seconds,
          duration: videoDuration ?? seconds,
          completed: full,
        });
      }
      saveState(next);
      return next;
    });
  };

  const startJourneyDay = (journeyId: string, day: number) => {
    const journey = journeys.find((item) => item.id === journeyId);
    const plan = journey?.dayPlans.find((item) => item.day === day);
    if (!journey || !plan) return;
    completionRef.current = false;
    setPlayer({
      duration: plan.minutes,
      intention: plan.intention,
      world: plan.world,
      journey: { id: journey.id, day: plan.day },
    });
  };

  const world = worlds.find((item) => item.id === route.view);

  return (
    <div className="app">
      <Header view={route.view} navigate={navigate} />
      {route.view === "home" && (
        <Home
          navigate={navigate}
          startPractice={() => openPractice()}
          state={localState}
        />
      )}
      {route.view === "explore" && <Explore navigate={navigate} />}
      {route.view === "practice" && (
        <PracticeComposer
          start={(duration, intention) => openPractice(duration, intention, "practice")}
        />
      )}
      {route.view === "journeys" && <JourneysPage navigate={navigate} state={localState} />}
      {route.view === "journey" && (
        <JourneyDetail
          journeyId={route.journeyId}
          state={localState}
          startDay={startJourneyDay}
        />
      )}
      {route.view === "me" && (
        <MePage
          state={localState}
          setState={setLocalState}
          navigate={navigate}
          startPractice={() => openPractice()}
        />
      )}
      {world && (
        <WorldExperience
          world={world}
          navigate={navigate}
          startPractice={(duration = 3, intention = "return to calm") =>
            openPractice(duration, intention, world.id)
          }
          playVideo={(video) => {
            completionRef.current = false;
            setPlayer({
              duration: 0,
              intention: video.title,
              world: world.id,
              video,
            });
          }}
          state={localState}
          openInquiry={(question) => {
            setInquirySeed(question);
            navigate("prajna");
          }}
          onSaveReflection={(text, prompt) => persist(addReflection(localState, text, prompt))}
          onPranayamaComplete={(seconds) => {
            completionRef.current = false;
            const next = recordSession(localState, "pranayama", "equal breath", seconds);
            persist(next);
          }}
          inquirySeed={inquirySeed}
        />
      )}
      {player && (
        <Player
          player={player}
          routeKey={`${route.view}:${route.journeyId ?? ""}`}
          close={() => setPlayer(null)}
          complete={complete}
        />
      )}
    </div>
  );
}
