import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { popular, type Hit } from "../api";
import catalog from "../catalog.json";
import { Icon, Traveller, World, type Pose } from "./Art";

export function Journey({
  children,
  pose,
  motion,
  onWalking,
  onProgress,
  onAsk,
  onChoose,
}: {
  children: ReactNode;
  pose: Pose;
  motion: boolean;
  onWalking: (v: boolean) => void;
  onProgress: (p: number) => void;
  onAsk: () => void;
  onChoose?: (h: Hit) => void;
}) {
  const trip = useRef<HTMLElement>(null),
    [scene, setScene] = useState(0),
    [ready, setReady] = useState(false);
  const [titles, setTitles] = useState<Hit[]>(catalog);
  useEffect(() => {
    const e = trip.current;
    if (!e) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setReady(true);
          observer.disconnect();
        }
      },
      { rootMargin: "350px" },
    );
    observer.observe(e);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const c = new AbortController();
    popular(c.signal)
      .then((h) => {
        if (h.length) setTitles(h);
      })
      .catch(() => {});
    return () => c.abort();
  }, []);
  useEffect(() => {
    let frame = 0,
      timer: ReturnType<typeof setTimeout>;
    const update = () => {
      const e = trip.current;
      if (!e) return;
      const p = Math.max(
        0,
        Math.min(1, (scrollY - e.offsetTop) / (e.offsetHeight - innerHeight)),
      );
      e.style.setProperty("--camera", String(p));
      setScene(Math.min(2, Math.floor(p * 2 + 0.3)));
      onProgress(p);
    };
    const scroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
      onWalking(motion);
      clearTimeout(timer);
      timer = setTimeout(() => onWalking(false), 180);
    };
    update();
    addEventListener("scroll", scroll, { passive: true });
    addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      removeEventListener("scroll", scroll);
      removeEventListener("resize", update);
    };
  }, [motion, onProgress, onWalking]);
  function pick(h: Hit) {
    onChoose?.(h);
    document
      .getElementById("ask")
      ?.scrollIntoView({
        behavior: motion ? "smooth" : "instant",
        block: "center",
      });
    setTimeout(
      () => document.getElementById("question")?.focus({ preventScroll: true }),
      motion ? 450 : 0,
    );
  }
  function tilt(e: React.PointerEvent<HTMLElement>) {
    if (!motion || e.pointerType === "touch") return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty(
      "--rx",
      ((e.clientY - r.top) / r.height - 0.5) * -12 + "deg",
    );
    e.currentTarget.style.setProperty(
      "--ry",
      ((e.clientX - r.left) / r.width - 0.5) * 14 + "deg",
    );
  }
  function unTilt(e: React.PointerEvent<HTMLElement>) {
    e.currentTarget.style.setProperty("--rx", "0deg");
    e.currentTarget.style.setProperty("--ry", "0deg");
  }
  const hero = catalog.slice(0, 3),
    source = catalog[0];
  return (
    <>
      <section className="opening" aria-labelledby="opening-title">
        <div className="hero-world">
          <World motion={motion} />
        </div>
        <div className="opening-copy">
          <h1 id="opening-title">
            For the love
            <br />
            of <em>anime.</em>
          </h1>
          <p>
            The stories stay with you.
            <br />
            The little questions do, too.
          </p>
          <p className="invitation">
            Ask anything about any anime.
            <br />
            We bring an answer. And its sources.
          </p>
          <a className="hero-link" href="#ask">
            Ask the oracle <Icon />
          </a>
        </div>
        <div className="hero-art">
          <div className="cover-stack">
            {hero.map((h, i) => (
              <button
                className={"cover-poster poster-" + i}
                key={h.id}
                onClick={() => pick(h)}
                onPointerMove={tilt}
                onPointerLeave={unTilt}
                aria-label={"Ask about " + h.title}
                style={{ "--order": i } as CSSProperties}
              >
                <img
                  src={h.cover}
                  width="250"
                  height="355"
                  alt={h.title}
                  fetchPriority={i < 2 ? "high" : "low"}
                />
                <span>
                  {h.title}
                  <Icon size={15} />
                </span>
              </button>
            ))}
          </div>
          <div className="source-note">
            <div>
              <Icon name="book" size={15} />
              <span>Source notes</span>
            </div>
            <strong>{source.title}</strong>
            <dl>
              <div>
                <dt>Studio</dt>
                <dd>{source.studio}</dd>
              </div>
              <div>
                <dt>Episodes</dt>
                <dd>{source.episodes}</dd>
              </div>
            </dl>
            <a href={source.url} target="_blank" rel="noreferrer">
              From AniList <Icon size={13} />
            </a>
          </div>
          <Traveller pose={pose} className="hero-courier screen-traveller" />
          <span className="courier-caption">Nori. Your curious companion.</span>
          <span className="art-credit">Cover art via AniList</span>
        </div>
      </section>
      <div className="question-desk">{children}</div>
      <section className="starter-section" aria-labelledby="starter-title">
        <div className="section-line">
          <h2 id="starter-title">
            Pick a story. <em>Pull a thread.</em>
          </h2>
          <a href="#night-journey" className="scenic-link">
            Take the scenic route <Icon size={16} />
          </a>
        </div>
        <div className="starter-row">
          {titles.slice(0, 6).map((h) => (
            <button key={h.id} onClick={() => pick(h)}>
              <img
                src={h.smallCover ?? h.cover ?? ""}
                alt=""
                width="52"
                height="72"
                loading="lazy"
              />
              <span>
                <strong>{h.title}</strong>
                <small>
                  {h.year ?? "Year not listed"}{" "}
                  {h.format ? " / " + h.format : ""}
                </small>
              </span>
              <Icon size={16} />
            </button>
          ))}
        </div>
      </section>
      <section
        id="night-journey"
        className="night-journey"
        ref={trip}
        data-scene={scene}
        aria-label="A journey through anime"
      >
        <div className="journey-stage">
          {ready && (
            <>
              <World motion={motion} />
              <div className="journey-film">
                <span>OTAKU ORACLE</span>
                <span>A little curiosity takes you places.</span>
                <span>
                  Scroll to explore <Icon size={14} />
                </span>
              </div>
              <div className="scene-track">
                <section className="travel-scene cinema-scene">
                  <div className="scene-copy">
                    <h2>
                      One title.
                      <br />
                      <em>
                        A thousand
                        <br />
                        rabbit holes.
                      </em>
                    </h2>
                    <p>
                      A favourite frame. A name in the credits.
                      <br />
                      That question you meant to look up.
                    </p>
                    <button
                      className="button cream-button"
                      onClick={onAsk}
                      tabIndex={scene === 0 ? 0 : -1}
                    >
                      Follow your curiosity <Icon />
                    </button>
                  </div>
                  <div className="cinema-gallery">
                    {catalog.slice(1, 6).map((h, i) => (
                      <button
                        className={"floating-title float-" + i}
                        key={h.id}
                        onClick={() => pick(h)}
                        tabIndex={scene === 0 ? 0 : -1}
                        onPointerMove={tilt}
                        onPointerLeave={unTilt}
                        aria-label={"Explore " + h.title}
                        style={{ "--order": i } as CSSProperties}
                      >
                        <img
                          src={h.cover}
                          alt={h.title}
                          width="215"
                          height="305"
                          loading="lazy"
                        />
                        <span>{h.title}</span>
                      </button>
                    ))}
                  </div>
                </section>
                <section className="travel-scene detail-scene">
                  <div className="banner-window">
                    <img
                      src={catalog[2].banner ?? catalog[2].cover}
                      alt={catalog[2].title + " artwork via AniList"}
                      width="1000"
                      height="400"
                      loading="lazy"
                    />
                  </div>
                  <div className="scene-copy">
                    <h2>
                      Behind the frame,
                      <br />
                      <em>there is a story.</em>
                    </h2>
                    <p>
                      Who made it? What inspired it?
                      <br />
                      Keep the wonder. Find the details.
                    </p>
                    <div className="scene-legend">
                      <span>
                        <Icon name="check" size={17} />
                        Verified
                      </span>
                      <span>
                        <Icon name="close" size={17} />
                        Conflict
                      </span>
                      <span>
                        <Icon name="info" size={17} />
                        Unchecked
                      </span>
                    </div>
                    <p className="scene-fine">
                      A match, a correction, or a question still open.
                      <br />
                      Every answer keeps the distinction.
                    </p>
                  </div>
                  <div className="festival-ticket">
                    <span>YOUR NEXT QUESTION</span>
                    <p>
                      Who made
                      <br />
                      <em>that world?</em>
                    </p>
                    <Icon name="book" size={28} />
                    <small>
                      Start with the credits.
                      <br />
                      Keep the source close.
                    </small>
                  </div>
                </section>
                <section className="travel-scene closing-scene">
                  <div className="closing-disc" />
                  <div className="scene-copy">
                    <h2>
                      The credits roll.
                      <br />
                      <em>Curiosity stays.</em>
                    </h2>
                    <p>
                      For the stories you love.
                      <br />
                      And the details you have yet to find.
                    </p>
                    <button
                      className="button cream-button"
                      onClick={onAsk}
                      tabIndex={scene === 2 ? 0 : -1}
                    >
                      Bring your question <Icon />
                    </button>
                    <p className="scene-fine">
                      Independent. Curious. Sources attached.
                      <br />
                      AniList is the reference, not the truth.
                    </p>
                  </div>
                  <div className="closing-covers">
                    {catalog.slice(0, 4).map((h, i) => (
                      <img
                        key={h.id}
                        src={h.cover}
                        width="180"
                        height="255"
                        alt=""
                        loading="lazy"
                        style={{ "--order": i } as CSSProperties}
                      />
                    ))}
                  </div>
                </section>
              </div>
              <div className="journey-courier">
                <Traveller pose={pose} />
                <span className="speech-bubble">
                  {scene === 0
                    ? "Where to next?"
                    : scene === 1
                      ? "There is always more to a story."
                      : "Got a question? I am all ears."}
                </span>
              </div>
              <div
                className="journey-controls"
                role="group"
                aria-label="Journey scenes"
              >
                {["The worlds", "The details", "The next story"].map((s, i) => (
                  <button
                    key={s}
                    aria-pressed={scene === i}
                    onClick={() => {
                      const e = trip.current;
                      if (e)
                        scrollTo({
                          top:
                            e.offsetTop +
                            ((e.offsetHeight - innerHeight) * i) / 2,
                          behavior: motion ? "smooth" : "instant",
                        });
                    }}
                  >
                    <span />
                    {s}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
