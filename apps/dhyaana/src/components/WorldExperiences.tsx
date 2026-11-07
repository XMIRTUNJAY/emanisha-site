import { useEffect, useState } from "react";
import type { World, WorldId } from "../data";
import { knowledge, practices, worlds } from "../data";
import { loadState, saveState } from "../storage";
import { Icon, SectionLabel } from "./Primitives";

type Props = {
  world: World;
  navigate: (view: WorldId | "practice") => void;
  startPractice: (duration?: number, intention?: string) => void;
};

function WorldTrail({ world, navigate }: Pick<Props, "world" | "navigate">) {
  const next = worlds[(worlds.indexOf(world) + 1) % worlds.length];
  return (
    <nav className="world-trail section-shell" aria-label="Continue through the worlds">
      <span>Next world</span>
      <button onClick={() => navigate(next.id)}>
        {next.name} <small>{next.devanagari}</small> <Icon name="arrow" />
      </button>
    </nav>
  );
}

function Dhyana({ startPractice }: Pick<Props, "startPractice">) {
  return (
    <>
      <section className="dhyana-opening">
        <div className="dhyana-architecture" aria-hidden="true">
          <span className="arch arch-one" />
          <span className="arch arch-two" />
          <span className="still-point" />
        </div>
        <div className="dhyana-title">
          <SectionLabel>Awareness · ध्यान</SectionLabel>
          <h1>
            Less to hold.
            <br />
            <em>More to notice.</em>
          </h1>
          <p>
            Guided meditation for meeting breath, body, and thought without forcing them to change.
          </p>
        </div>
        <button className="quiet-start" onClick={() => startPractice(5, "settle into awareness")}>
          <span>
            <Icon name="play" />
          </span>
          <strong>Begin in silence</strong>
          <small>5 minutes · guided</small>
        </button>
      </section>
      <section className="dhyana-sequence section-shell">
        <p className="sequence-intro">Begin with the length of practice that feels honest today.</p>
        {[3, 5, 10].map((minutes, index) => (
          <button
            key={minutes}
            onClick={() => startPractice(minutes, "rest with the natural breath")}
          >
            <span>0{index + 1}</span>
            <strong>
              {index === 0 ? "Arrive" : index === 1 ? "Natural breath" : "Open awareness"}
            </strong>
            <small>{minutes} minutes</small>
            <Icon name="arrow" />
          </button>
        ))}
      </section>
    </>
  );
}

function KnowledgeLibrary({ navigate }: Pick<Props, "navigate">) {
  const [active, setActive] = useState(0);
  const item = knowledge[active];
  return (
    <section className="knowledge-editorial section-shell">
      <aside className="knowledge-index">
        <SectionLabel>Reading table</SectionLabel>
        {knowledge.map((entry, index) => (
          <button
            className={index === active ? "active" : ""}
            onClick={() => setActive(index)}
            key={entry.term}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{entry.term}</strong>
            <small>{entry.devanagari}</small>
          </button>
        ))}
      </aside>
      <article className="reading-leaf">
        <div className="reading-folio">Folio {String(active + 1).padStart(2, "0")}</div>
        <SectionLabel>Concept note</SectionLabel>
        <h2>
          {item.term}
          <small>{item.devanagari}</small>
        </h2>
        <h3>{item.meaning}</h3>
        <p>{item.body}</p>
        <blockquote>Where does this idea touch ordinary experience today?</blockquote>
        <div className="editor-note">
          <Icon name="book" />
          <p>
            <strong>Editorial note</strong>This is an accessible orientation, not a translation or
            quotation from scripture.
          </p>
        </div>
        <button className="text-action" onClick={() => navigate("prajna")}>
          Take this question to Prajna <Icon name="arrow" />
        </button>
      </article>
      <div className="concept-map" aria-label="Related concept map">
        <span>Sakshi</span>
        <i />
        <span>Attention</span>
        <i />
        <span>Practice</span>
      </div>
    </section>
  );
}

function Gyaan({ navigate }: Pick<Props, "navigate">) {
  return (
    <>
      <header className="gyaan-masthead section-shell">
        <div>
          <SectionLabel>Gyaan · ज्ञान</SectionLabel>
          <h1>
            A library of
            <br />
            ideas in practice.
          </h1>
        </div>
        <p>
          Read one concept at a time. Follow its context, then carry one precise question into your
          day.
        </p>
        <div className="gyaan-count">
          <strong>03</strong>
          <span>
            foundational
            <br />
            concepts
          </span>
        </div>
      </header>
      <KnowledgeLibrary navigate={navigate} />
    </>
  );
}

function Nidra({ startPractice }: Pick<Props, "startPractice">) {
  return (
    <section className="nidra-night">
      <div className="nidra-horizon" />
      <div className="nidra-copy">
        <span className="night-label">Nidra · निद्रा</span>
        <h1>
          Nothing more
          <br />
          is required tonight.
        </h1>
        <p>
          Choose a voice-led practice, lower the screen, and let attention move slowly through the
          body.
        </p>
      </div>
      <div className="sleep-dock">
        <button onClick={() => startPractice(12, "release the day")}>
          <Icon name="play" size={24} />
          <span>
            <strong>Moonlit body scan</strong>
            <small>12 min · gentle guidance</small>
          </span>
        </button>
        <button onClick={() => startPractice(21, "prepare for sleep")}>
          <span>
            <strong>Sleep descent</strong>
            <small>21 min · minimal voice</small>
          </span>
          <Icon name="arrow" />
        </button>
        <button onClick={() => startPractice(5, "evening release")}>
          <span>
            <strong>Release the day</strong>
            <small>5 min · no music</small>
          </span>
          <Icon name="arrow" />
        </button>
      </div>
    </section>
  );
}

function Prajna() {
  const prompts = [
    "What are you carrying that no longer needs your attention?",
    "What changes when you name the feeling without explaining it?",
    "What would a sufficient response look like—not a perfect one?",
  ];
  const [step, setStep] = useState(0);
  const [reflection, setReflection] = useState("");
  const [saved, setSaved] = useState(false);
  const save = () => {
    if (!reflection.trim()) return;
    const state = loadState();
    saveState({
      ...state,
      reflections: [...state.reflections, { text: reflection, date: new Date().toISOString() }],
    });
    setSaved(true);
  };
  return (
    <section className="prajna-room section-shell">
      <header>
        <SectionLabel>Prajna · प्रज्ञा</SectionLabel>
        <span>{step + 1} / 3</span>
      </header>
      <div className="inquiry-line" aria-hidden="true">
        <i style={{ width: `${((step + 1) / 3) * 100}%` }} />
      </div>
      <div className="question-stage">
        <p>{step === 0 ? "Notice" : step === 1 ? "Name" : "Choose"}</p>
        <h1>{prompts[step]}</h1>
        {step < 2 ? (
          <button className="text-action" onClick={() => setStep(step + 1)}>
            Sit with this, then continue <Icon name="arrow" />
          </button>
        ) : (
          <div className="reflection-field">
            <textarea
              value={reflection}
              onChange={(event) => setReflection(event.target.value)}
              placeholder="Write what is useful. Leave the rest."
              aria-label="Private reflection"
            />
            <button onClick={save}>
              {saved ? "Saved on this device" : "Keep this reflection"}
            </button>
          </div>
        )}
      </div>
      <p className="private-note">Private by default · stored only on this device</p>
    </section>
  );
}

function Pranayama() {
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState<"Inhale" | "Exhale">("Inhale");
  const [cycles, setCycles] = useState(0);
  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => {
      setPhase((current) => {
        if (current === "Exhale") setCycles((value) => value + 1);
        return current === "Inhale" ? "Exhale" : "Inhale";
      });
    }, 4000);
    return () => window.clearInterval(timer);
  }, [active]);
  return (
    <section className={`breath-console ${active ? "is-breathing" : ""}`}>
      <div className="breath-instruction">
        <SectionLabel>Pranayama · प्राणायाम</SectionLabel>
        <h1>{active ? phase : "Equal breath"}</h1>
        <p>
          {active
            ? "Keep the breath quiet and unforced."
            : "Follow a gentle four-count rhythm. No holding. Stop if you feel light-headed or uncomfortable."}
        </p>
        <button onClick={() => setActive(!active)}>
          <Icon name={active ? "pause" : "play"} />
          {active ? "Pause" : "Begin 4-minute practice"}
        </button>
      </div>
      <div className="breath-instrument" aria-live="polite">
        <div className="breath-axis axis-x" />
        <div className="breath-axis axis-y" />
        <div className="breath-shape">
          <span>{active ? "4" : "Ready"}</span>
          <small>{active ? "seconds" : "inhale · exhale"}</small>
        </div>
        <div className="cycle-count">
          <strong>{String(cycles).padStart(2, "0")}</strong>
          <span>cycles</span>
        </div>
      </div>
      <footer>
        <span>Beginner · Sama Vritti-inspired equal rhythm</span>
        <span>No breath retention</span>
      </footer>
    </section>
  );
}

function Therapy({ startPractice }: Pick<Props, "startPractice">) {
  return (
    <>
      <section className="therapy-landscape">
        <div className="therapy-image" role="img" aria-label="A quiet tree in a misty forest" />
        <div className="therapy-caption">
          <SectionLabel>Restoration · विश्राम</SectionLabel>
          <h1>
            Listen until the
            <br />
            edges soften.
          </h1>
          <p>
            Natural sound and gentle guidance for lowering sensory load. Not clinical treatment.
          </p>
          <button onClick={() => startPractice(10, "listen to the forest")}>
            <Icon name="sound" /> Play forest listening <span>10:00</span>
          </button>
        </div>
        <small className="image-credit">Forest study · sound-led practice</small>
      </section>
      <section className="sound-index section-shell">
        <header>
          <h2>Restorative environments</h2>
          <p>Choose by sensory quality, not by promised outcome.</p>
        </header>
        {[
          ["01", "Rain on stone", "Steady · low voice", 12],
          ["02", "Forest at first light", "Layered · no voice", 10],
          ["03", "Distant water", "Sparse · gentle guidance", 7],
        ].map(([number, title, description, minutes]) => (
          <button
            key={title}
            onClick={() => startPractice(Number(minutes), String(title).toLowerCase())}
          >
            <span>{number}</span>
            <strong>{title}</strong>
            <small>{description}</small>
            <em>{minutes} min</em>
            <Icon name="play" />
          </button>
        ))}
      </section>
    </>
  );
}

export function WorldExperience(props: Props) {
  let content;
  switch (props.world.id) {
    case "dhyana":
      content = <Dhyana startPractice={props.startPractice} />;
      break;
    case "gyaan":
      content = <Gyaan navigate={props.navigate} />;
      break;
    case "nidra":
      content = <Nidra startPractice={props.startPractice} />;
      break;
    case "prajna":
      content = <Prajna />;
      break;
    case "pranayama":
      content = <Pranayama />;
      break;
    case "therapy":
      content = <Therapy startPractice={props.startPractice} />;
      break;
  }
  return (
    <main className={`world-experience experience-${props.world.id}`}>
      {content}
      <WorldTrail world={props.world} navigate={props.navigate} />
    </main>
  );
}
