import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { type Hit } from "../api";
import { useShowcase } from "./useShowcase";
import { COMPANION_NAME } from "../mascot/Mascot";
import { emptyDrive } from "../mascot/types";
import catalog from "../catalog.json" with { type: "json" };
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
  const drive = useRef(emptyDrive());
  const showcase = useShowcase(motion);
  const titles = showcase.starters;
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

  useLayoutEffect(() => {
    let frame = 0,
      timer: ReturnType<typeof setTimeout>,
      initialized = false,
      lastTime = performance.now(),
      lastPosition = 0;
    const stop = () => {
      drive.current.moving = false;
      drive.current.velocity = 0;
      onWalking(false);
    };
    const update = (time: number, scrolling = false) => {
      const e = trip.current;
      if (!e) return;
      const p = Math.max(
        0,
        Math.min(
          1,
          (scrollY - e.offsetTop) / Math.max(1, e.offsetHeight - innerHeight),
        ),
      );
      e.style.setProperty("--camera", String(p));
      setScene(Math.min(2, Math.floor(p * 2 + 0.3)));
      onProgress(p);
      const stage = e.querySelector<HTMLElement>(".journey-stage"),
        courier = e.querySelector<HTMLElement>(".journey-courier"),
        path = e.querySelector<SVGPathElement>(".world-ground"),
        matrix = path?.getScreenCTM();
      let position = innerWidth * 1.13 * p;
      if (stage && courier && path && matrix) {
        const actor = courier.getBoundingClientRect(),
          screenX = actor.left + actor.width * 0.5;
        position = screenX - matrix.e;
        const transform = new DOMMatrix([
            matrix.a,
            matrix.b,
            matrix.c,
            matrix.d,
            matrix.e,
            matrix.f,
          ]),
          target = new DOMPoint(screenX, 0).matrixTransform(
            transform.inverse(),
          ).x;
        let lo = 0,
          hi = path.getTotalLength();
        for (let i = 0; i < 12; i++) {
          const mid = (lo + hi) / 2;
          if (path.getPointAtLength(mid).x < target) lo = mid;
          else hi = mid;
        }
        const length = (lo + hi) / 2,
          point = path.getPointAtLength(length),
          screen = new DOMPoint(point.x, point.y).matrixTransform(transform);
        const before = path.getPointAtLength(Math.max(0, length - 10)),
          after = path.getPointAtLength(
            Math.min(path.getTotalLength(), length + 10),
          );
        drive.current.slope =
          ((after.y - before.y) * matrix.d) /
          Math.max(0.001, (after.x - before.x) * matrix.a);
        courier.style.setProperty(
          "--ground-top",
          screen.y -
            stage.getBoundingClientRect().top -
            courier.offsetHeight * 0.94516129 +
            "px",
        );
      }
      const delta = position - lastPosition;
      if (initialized && scrolling && motion && Math.abs(delta) > 0.05) {
        drive.current.travel += Math.abs(delta);
        drive.current.velocity =
          delta / Math.max(0.008, (time - lastTime) / 1000);
        drive.current.direction = delta >= 0 ? 1 : -1;
        drive.current.moving = true;
        onWalking(true);
        clearTimeout(timer);
        timer = setTimeout(stop, 180);
      }
      drive.current.position = position;
      lastPosition = position;
      lastTime = time;
      initialized = true;
    };
    const scroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame((t) => update(t, true));
    };
    const resize = () => update(performance.now());
    update(performance.now());
    addEventListener("scroll", scroll, { passive: true });
    addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      stop();
      removeEventListener("scroll", scroll);
      removeEventListener("resize", resize);
    };
  }, [motion, onProgress, onWalking, ready]);
  function pick(h: Hit) {
    onChoose?.(h);
    document.getElementById("ask")?.scrollIntoView({
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
  const hero = showcase.cards,
    source = hero[0];
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
          <div
            className="cover-stack"
            ref={showcase.stack}
            data-phase={showcase.phase}
            data-front-id={source.id}
            data-carousel-paused={showcase.paused}
            onPointerEnter={() => showcase.setHover(true)}
            onPointerLeave={() => showcase.setHover(false)}
            onFocusCapture={() => showcase.setFocused(true)}
            onBlurCapture={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget))
                showcase.setFocused(false);
            }}
          >
            {hero.map((h, i) => (
              <button
                className={"cover-poster poster-" + i}
                data-title-id={h.id}
                data-image-failed={!h.cover || undefined}
                data-slot={i}
                key={h.id}
                onClick={() => pick(h)}
                onPointerMove={tilt}
                onPointerLeave={unTilt}
                aria-label={"Ask about " + h.title}
                style={
                  {
                    "--order": i,
                    "--cover-color": h.color ?? "#e4c392",
                  } as CSSProperties
                }
              >
                <img
                  src={h.cover}
                  width="250"
                  height="355"
                  alt={h.title}
                  onError={(e) => {
                    e.currentTarget.style.visibility = "hidden";
                    e.currentTarget.parentElement?.setAttribute(
                      "data-image-failed",
                      "true",
                    );
                  }}
                  fetchPriority={i < 2 ? "high" : "low"}
                />
                <span className="cover-unavailable" aria-hidden="true">
                  {h.title}
                  <small>Cover unavailable</small>
                </span>
                <span className="cover-caption">
                  {h.title}
                  <Icon size={15} />
                </span>
              </button>
            ))}
          </div>
          <div
            className="source-note"
            key={source.id}
            data-front-id={source.id}
            data-phase={showcase.phase}
          >
            <div>
              <Icon name="book" size={15} />
              <span>Source notes</span>
            </div>
            <strong title={source.title}>{source.title}</strong>
            <dl>
              <div>
                <dt>Studio</dt>
                <dd title={source.studio || "Unlisted"}>
                  {source.studio || "Unlisted"}
                </dd>
              </div>
              <div>
                <dt>Episodes</dt>
                <dd>{source.episodes ?? "Unlisted"}</dd>
              </div>
            </dl>
            <a href={source.url} target="_blank" rel="noreferrer">
              From AniList <Icon size={13} />
            </a>
          </div>
          <Traveller pose={pose} className="hero-courier screen-traveller" />
          <span className="courier-caption">
            {COMPANION_NAME}. Your wandering companion.
          </span>
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
          {(ready || !motion) && (
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
                <Traveller pose={pose} drive={drive} />
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
