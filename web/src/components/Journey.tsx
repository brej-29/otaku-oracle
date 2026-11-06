import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon, Landscape, Traveller, type Pose } from "./Art";
export function Journey({
  children,
  motion,
  onWalking,
  onProgress,
  onAsk,
  pose,
}: {
  children: ReactNode;
  pose: Pose;
  motion: boolean;
  onWalking: (walking: boolean) => void;
  onProgress: (p: number) => void;
  onAsk: () => void;
}) {
  const ref = useRef<HTMLElement>(null),
    [scene, setScene] = useState(0);
  useEffect(() => {
    if (!motion) {
      ref.current?.style.setProperty("--journey", "0");
      return;
    }
    let frame = 0;
    let timer: ReturnType<typeof setTimeout>;
    function update() {
      frame = 0;
      const el = ref.current;
      if (!el) return;
      const p = Math.max(
        0,
        Math.min(1, (scrollY - el.offsetTop) / (el.offsetHeight - innerHeight)),
      );
      el.style.setProperty("--journey", String(p));
      onProgress(p);
      setScene(Math.min(2, Math.floor(p * 2.7)));
    }
    function scroll() {
      if (!frame) frame = requestAnimationFrame(update);
      onWalking(true);
      clearTimeout(timer);
      timer = setTimeout(() => onWalking(false), 160);
    }
    addEventListener("scroll", scroll, { passive: true });
    addEventListener("resize", scroll);
    update();
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      removeEventListener("scroll", scroll);
      removeEventListener("resize", scroll);
    };
  }, [motion, onWalking, onProgress]);
  function go(index: number) {
    const el = ref.current;
    if (!el) return;
    if (motion)
      window.scrollTo({
        top: el.offsetTop + ((el.offsetHeight - innerHeight) * index) / 2,
        behavior: "smooth",
      });
    else
      document
        .getElementById(`stop-${index}`)
        ?.scrollIntoView({ behavior: "auto" });
  }
  return (
    <section
      className={`journey ${motion ? "journey-moving" : "journey-still"}`}
      ref={ref}
      aria-label="A journey from curiosity to a source"
    >
      <div className="journey-stage">
        <div className="world">
          <Landscape />
        </div>
        <Traveller pose={pose} className="screen-traveller" />
        <div className="journey-track">
          <section
            className="journey-scene scene-start"
            id="stop-0"
            aria-label="Ask a question"
            inert={motion && innerWidth > 700 && scene !== 0}
          >
            <div className="hero-copy">
              <h1>
                Stay curious.
                <br />
                Keep a<br /> <em>paper trail.</em>
              </h1>
              <p>
                Little questions. Big anime worlds.
                <br />
                Find the facts, and where they came from.
              </p>
              <a
                className="hero-footnote"
                href="https://anilist.co"
                target="_blank"
                rel="noreferrer"
              >
                Records from AniList <Icon size={14} />
              </a>
            </div>
            {children}
            <div className="scroll-note">
              <span className="scroll-line" />
              Scroll to follow the trail <Icon size={16} />
            </div>
          </section>
          <section
            className="journey-scene scene-claims"
            id="stop-1"
            aria-label="Three claim states"
            inert={motion && innerWidth > 700 && scene !== 1}
          >
            <div className="chapter-copy">
              <h2>
                A confident answer
                <br />
                is only <em>the beginning.</em>
              </h2>
              <p>
                The useful part is knowing what holds up.
                <br />
                Every claim gets a place in the journal.
              </p>
            </div>
            <div className="claim-passports">
              <article className="passport passport-verified">
                <span className="passport-symbol">
                  <Icon name="check" size={36} />
                </span>
                <h3>Verified</h3>
                <p>
                  Matches the record.
                  <br />
                  The source is one click away.
                </p>
                <span className="tiny">A fact with a paper trail.</span>
              </article>
              <article className="passport passport-conflict">
                <span className="passport-symbol">
                  <Icon name="close" size={36} />
                </span>
                <h3>Conflict</h3>
                <p>
                  <s>A detail that disagrees.</s>
                  <br />
                  We show what AniList says.
                </p>
                <span className="tiny">A correction, in plain sight.</span>
              </article>
              <article className="passport passport-unchecked">
                <span className="passport-symbol">?</span>
                <h3>Unchecked</h3>
                <p>
                  Outside the record.
                  <br />
                  An idea that stays unverified.
                </p>
                <span className="tiny">No borrowed certainty.</span>
              </article>
            </div>
          </section>
          <section
            className="journey-scene scene-source"
            id="stop-2"
            aria-label="Follow the source"
            inert={motion && innerWidth > 700 && scene !== 2}
          >
            <div className="chapter-copy">
              <h2>
                Good stories
                <br />
                deserve <em>good sources.</em>
              </h2>
              <p>
                A studio. A season. One more episode.
                <br />
                Take a small question somewhere interesting.
              </p>
              <button className="button primary" onClick={onAsk}>
                Open your field notes <Icon />
              </button>
              <p className="source-principle">
                AniList is the reference, not the truth.
              </p>
            </div>
            <div className="source-folio">
              <Icon name="book" size={44} />
              <span>The source, always attached.</span>
              <div className="folio-seal">
                <Icon name="check" size={32} />
              </div>
              <p>
                Look closer.
                <br />
                Stay curious.
              </p>
              <a href="https://anilist.co" target="_blank" rel="noreferrer">
                Explore AniList <Icon size={16} />
              </a>
            </div>
          </section>
        </div>
        <div className="journey-navigation" aria-label="Journey stops">
          {["The question", "The check", "The source"].map((label, i) => (
            <button
              key={label}
              className={scene === i ? "is-current" : ""}
              aria-pressed={scene === i}
              onClick={() => go(i)}
            >
              <span>{i + 1}</span>
              {label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
