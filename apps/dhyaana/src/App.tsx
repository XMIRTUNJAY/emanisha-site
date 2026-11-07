import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "./components/Primitives";
import { WorldExperience } from "./components/WorldExperiences";
import { journeys, World, WorldId, worlds } from "./data";
import { loadState, LocalState, saveState } from "./storage";

type View = "home" | "explore" | "practice" | "journeys" | "journey" | "me" | WorldId;

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
}: {
  navigate: (v: View) => void;
  startPractice: () => void;
}) {
  const time = useMemo(getTimeContext, []);
  return (
    <>
      <main>
        <section className="hero">
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
          <a className="scroll-cue" href="#daily">
            <span /> Discover your path
          </a>
        </section>

        <section className="daily section-shell" id="daily">
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

        <section className="editorial-feature">
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

        <section className="journey-preview section-shell">
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
            {journeys.slice(0, 3).map((j, i) => (
              <button className="journey-mini" key={j.title} onClick={() => navigate("journeys")}>
                <span>0{i + 1}</span>
                <small>{j.eyebrow}</small>
                <h3>{j.title}</h3>
                <p>
                  {j.days} days · {j.description}
                </p>
              </button>
            ))}
          </div>
        </section>
      </main>
      <Footer navigate={navigate} />
    </>
  );
}

function WorldConstellation({ navigate }: { navigate: (v: View) => void }) {
  const [selected, setSelected] = useState<World>(worlds[0]);
  return (
    <section className="world-section section-shell">
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
        {worlds.map((w, i) => (
          <button
            key={w.id}
            style={{ "--i": i, "--world": w.color } as React.CSSProperties}
            className={`world-node ${selected.id === w.id ? "selected" : ""}`}
            onMouseEnter={() => setSelected(w)}
            onFocus={() => setSelected(w)}
            onClick={() => navigate(w.id)}
          >
            <span className="world-dot" />
            <small>0{i + 1}</small>
            <strong>{w.name}</strong>
            <em>{w.devanagari}</em>
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
        {worlds.map((w, i) => (
          <button key={w.id} onClick={() => navigate(w.id)}>
            <span style={{ background: w.color }}>0{i + 1}</span>
            <div>
              <small>
                {w.devanagari} · {w.essence}
              </small>
              <strong>{w.name}</strong>
              <p>{w.description}</p>
            </div>
            <Icon name="arrow" />
          </button>
        ))}
      </div>
    </section>
  );
}

function Explore({ navigate }: { navigate: (v: View) => void }) {
  return (
    <main className="page warm-page">
      <section className="page-intro">
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
      <section className="composer">
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
              {["find calm", "focus", "rest", "release", "feel grateful"].map((x) => (
                <button
                  className={feeling === x ? "active" : ""}
                  onClick={() => setFeeling(x)}
                  key={x}
                >
                  {x}
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
              {[1, 3, 5, 10, 21].map((x) => (
                <button
                  className={duration === x ? "active" : ""}
                  onClick={() => setDuration(x)}
                  key={x}
                >
                  <strong>{x}</strong> min
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
  duration,
  intention,
  close,
  complete,
}: {
  duration: number;
  intention: string;
  close: () => void;
  complete: (minutes: number) => void;
}) {
  const total = duration * 60;
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!playing || done) return;
    const timer = window.setInterval(
      () =>
        setElapsed((v) => {
          if (v + 1 >= total) {
            setDone(true);
            setPlaying(false);
            complete(duration);
            return total;
          }
          return v + 1;
        }),
      1000,
    );
    return () => clearInterval(timer);
  }, [playing, done, total, duration, complete]);
  const pct = (elapsed / total) * 100;
  const remaining = Math.max(0, total - elapsed);
  return (
    <div className="player" role="dialog" aria-modal="true" aria-label="Practice player">
      <div className="player-bg" />
      <button className="player-close" onClick={close} aria-label="Close practice">
        <Icon name="close" />
      </button>
      <div className="player-top">
        <span>DHYAANA</span>
        <small>
          {intention} · {duration} min
        </small>
      </div>
      <div className={`player-orb ${playing ? "playing" : ""}`}>
        <Mandala compact />
      </div>
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
            : elapsed < total * 0.2
              ? "Let the body arrive."
              : elapsed < total * 0.8
                ? "Stay with the natural breath."
                : "Notice the space around you."}
        </h2>
      </div>
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
      <div className="player-progress">
        <i style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function JourneysPage({ navigate }: { navigate: (view: View) => void }) {
  return (
    <main className="page journeys-page">
      <section className="page-intro">
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
      <section className="journey-library section-shell">
        {journeys.map((j, i) => (
          <article key={j.title}>
            <div className="journey-index">0{i + 1}</div>
            <div>
              <small>{j.eyebrow}</small>
              <h2>{j.title}</h2>
              <p>{j.description}</p>
            </div>
            <div className="journey-meta">
              <span>{j.days} days</span>
              {j.progress > 0 && (
                <>
                  <div>
                    <i style={{ width: `${(j.progress / j.days) * 100}%` }} />
                  </div>
                  <small>
                    Day {j.progress} of {j.days}
                  </small>
                </>
              )}
              <button onClick={() => navigate("journey")}>
                View journey <Icon name="arrow" />
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

function JourneyDetail({ startPractice }: { startPractice: () => void }) {
  const days = [
    ["Arrive", "Body awareness", "5 min"],
    ["Make room", "Natural breath", "7 min"],
    ["Notice", "Thoughts as events", "6 min"],
    ["Choose", "A personal Sankalpa", "8 min"],
    ["Return", "Open awareness", "10 min"],
  ];
  return (
    <main className="journey-detail page">
      <header className="journey-detail-header section-shell">
        <p className="section-label">21-day foundation</p>
        <div>
          <h1>Vedic Reset</h1>
          <span>21</span>
        </div>
        <p>
          One short teaching, one practice, and one reflection each day. Progress follows
          completion—not consecutive attendance.
        </p>
        <button className="button primary" onClick={startPractice}>
          Continue day 4 <Icon name="arrow" />
        </button>
      </header>
      <section className="curriculum section-shell">
        <header>
          <p className="section-label">First movement · Days 1–5</p>
          <h2>Learning to return</h2>
        </header>
        <div>
          {days.map(([title, practice, duration], index) => (
            <button key={title} onClick={startPractice}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{title}</strong>
              <small>{practice}</small>
              <em>{duration}</em>
              <Icon name="arrow" />
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

function MePage({
  state,
  setState,
  startPractice,
}: {
  state: LocalState;
  setState: (s: LocalState) => void;
  startPractice: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(state.sankalpa);
  const time = getTimeContext();
  return (
    <main className="page me-page">
      <section className="dashboard section-shell">
        <p className="kicker">{time.label} · Your Dhyaana</p>
        <h1>{time.greeting}.</h1>
        <p className="dashboard-lead">Continue gently from where you are.</p>
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
              {state.minutes}
              <span>minutes</span>
            </strong>
            <p>{state.sessions} sessions completed on this device</p>
          </div>
          <div className="sankalpa-card">
            <small>Personal Sankalpa</small>
            {editing ? (
              <>
                <textarea value={draft} onChange={(e) => setDraft(e.target.value)} />
                <button
                  onClick={() => {
                    const next = { ...state, sankalpa: draft };
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
              </>
            )}
          </div>
          <div className="progress-card">
            <small>Current journey</small>
            <h2>21-Day Vedic Reset</h2>
            <div>
              <i style={{ width: "19%" }} />
            </div>
            <p>Day 4 of 21 · Continue when you are ready.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

function Footer({ navigate }: { navigate: (v: View) => void }) {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <span className="brand-mark">
          <i />
        </span>
        <h2>DHYAANA</h2>
        <p>Return to the stillness within.</p>
      </div>
      <div>
        <small>EXPLORE</small>
        {worlds.map((w) => (
          <button key={w.id} onClick={() => navigate(w.id)}>
            {w.name} <span>{w.devanagari}</span>
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
  const parseHash = (): View => {
    const v = location.hash.replace("#/", "") as View;
    return [
      "home",
      "explore",
      "practice",
      "journeys",
      "journey",
      "me",
      ...worlds.map((w) => w.id),
    ].includes(v)
      ? v
      : "home";
  };
  const [view, setView] = useState<View>(parseHash);
  const [player, setPlayer] = useState<{ duration: number; intention: string } | null>(null);
  const [localState, setLocalState] = useState(loadState);
  const completionRef = useRef(false);
  useEffect(() => {
    const handle = () => setView(parseHash());
    addEventListener("hashchange", handle);
    return () => removeEventListener("hashchange", handle);
  }, []);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    document.body.dataset.view = view;
  }, [view]);
  const navigate = (target: View) => {
    location.hash = `/${target}`;
    setView(target);
  };
  const startDefault = () => {
    completionRef.current = false;
    setPlayer({ duration: 3, intention: "return to calm" });
  };
  const complete = (minutes: number) => {
    if (completionRef.current) return;
    completionRef.current = true;
    setLocalState((prev) => {
      const next = { ...prev, minutes: prev.minutes + minutes, sessions: prev.sessions + 1 };
      saveState(next);
      return next;
    });
  };
  const world = worlds.find((w) => w.id === view);
  return (
    <div className="app">
      <Header view={view} navigate={navigate} />
      {view === "home" && <Home navigate={navigate} startPractice={startDefault} />}
      {view === "explore" && <Explore navigate={navigate} />}
      {view === "practice" && (
        <PracticeComposer
          start={(duration, intention) => {
            completionRef.current = false;
            setPlayer({ duration, intention });
          }}
        />
      )}
      {view === "journeys" && <JourneysPage navigate={navigate} />}
      {view === "journey" && <JourneyDetail startPractice={startDefault} />}
      {view === "me" && (
        <MePage state={localState} setState={setLocalState} startPractice={startDefault} />
      )}
      {world && (
        <WorldExperience
          world={world}
          navigate={(target) => navigate(target)}
          startPractice={(duration = 3, intention = "return to calm") => {
            completionRef.current = false;
            setPlayer({ duration, intention });
          }}
        />
      )}
      {player && <Player {...player} close={() => setPlayer(null)} complete={complete} />}
    </div>
  );
}
