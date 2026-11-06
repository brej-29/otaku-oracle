import { useCallback, useEffect, useRef, useState } from "react";
import {
  API_BASE,
  ApiError,
  ask,
  getRecord,
  type Answer,
  type Hit,
} from "./api";
import { sentence, recordSays } from "./sentence";
import { Desk } from "./components/Desk";
import { Journey } from "./components/Journey";
import { How, Why } from "./components/Pages";
import { Icon, Logo, Traveller, type Pose } from "./components/Art";
type Page = "ask" | "answer" | "why" | "how";
type Stage = "idle" | "record" | "draft" | "done" | "error";
const readStorage = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const saveStorage = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* Private storage is optional. */
  }
};
function initialPage(): Page {
  const p = new URLSearchParams(location.search).get("page");
  return p === "why" || p === "how" ? p : "ask";
}
export default function App() {
  const [page, setPage] = useState<Page>(initialPage),
    [stage, setStage] = useState<Stage>("idle"),
    [answer, setAnswer] = useState<Answer | null>(null),
    [error, setError] = useState<{ kind: string; message: string } | null>(
      null,
    ),
    [chosen, setChosen] = useState<Hit | null>(null),
    [question, setQuestion] = useState(
      new URLSearchParams(location.search).get("q") ?? "",
    ),
    [typing, setTyping] = useState(false),
    [walking, setWalking] = useState(false),
    [copied, setCopied] = useState(false),
    [online, setOnline] = useState(navigator.onLine);
  const [reduced, setReduced] = useState(
      () => matchMedia("(prefers-reduced-motion: reduce)").matches,
    ),
    [paused, setPaused] = useState(() => readStorage("journal-pause") === "1"),
    [dark, setDark] = useState(
      () =>
        readStorage("journal-theme") === "dark" ||
        (!readStorage("journal-theme") &&
          matchMedia("(prefers-color-scheme: dark)").matches),
    );
  const controller = useRef<AbortController | null>(null),
    runId = useRef(0);
  const motion = !reduced && !paused;
  useEffect(() => {
    const m = matchMedia("(prefers-reduced-motion: reduce)"),
      fn = () => setReduced(m.matches);
    m.addEventListener("change", fn);
    return () => m.removeEventListener("change", fn);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    saveStorage("journal-theme", dark ? "dark" : "light");
  }, [dark]);
  useEffect(() => {
    document.documentElement.dataset.motion = motion ? "on" : "off";
    saveStorage("journal-pause", paused ? "1" : "0");
  }, [motion, paused]);
  useEffect(() => {
    const on = () => setOnline(navigator.onLine);
    addEventListener("online", on);
    addEventListener("offline", on);
    return () => {
      removeEventListener("online", on);
      removeEventListener("offline", on);
    };
  }, []);
  useEffect(() => {
    const on = () => {
      setPage(initialPage());
      window.scrollTo(0, 0);
    };
    addEventListener("popstate", on);
    return () => removeEventListener("popstate", on);
  }, []);
  useEffect(() => {
    const id = Number(new URLSearchParams(location.search).get("title"));
    if (id > 0) {
      const c = new AbortController();
      getRecord(id, c.signal)
        .then((r) => setChosen(r))
        .catch(() => {});
      return () => c.abort();
    }
  }, []);
  const progress = useCallback((p: number) => {
    document.documentElement.style.setProperty("--walk", String(p));
    document.documentElement.style.setProperty(
      "--walk-y",
      `${Math.sin(p * Math.PI * 3) * 22}px`,
    );
    document.documentElement.dataset.walkStart = String(p < 0.035);
    const path = document.querySelector<SVGPathElement>("#source-path");
    const matrix = path?.getScreenCTM();
    if (path && matrix) {
      const transform = new DOMMatrix([
        matrix.a,
        matrix.b,
        matrix.c,
        matrix.d,
        matrix.e,
        matrix.f,
      ]);
      const target = new DOMPoint(
        innerWidth * (0.18 + 0.64 * p),
        0,
      ).matrixTransform(transform.inverse()).x;
      let lo = 0,
        hi = path.getTotalLength();
      for (let i = 0; i < 12; i++) {
        const mid = (lo + hi) / 2;
        if (path.getPointAtLength(mid).x < target) lo = mid;
        else hi = mid;
      }
      const local = path.getPointAtLength((lo + hi) / 2);
      const point = new DOMPoint(local.x, local.y).matrixTransform(transform);
      document.documentElement.style.setProperty(
        "--walker-x",
        `${point.x - 44}px`,
      );
      document.documentElement.style.setProperty(
        "--walker-bottom",
        `${Math.max(65, innerHeight - point.y - 7)}px`,
      );
    }
  }, []);
  useEffect(() => {
    if (page === "ask") return;
    let frame = 0;
    const scroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() =>
        progress(
          scrollY /
            Math.max(1, document.documentElement.scrollHeight - innerHeight),
        ),
      );
    };
    addEventListener("scroll", scroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", scroll);
    };
  }, [page, progress]);
  function navigate(p: Page) {
    controller.current?.abort();
    runId.current++;
    if (stage === "record" || stage === "draft") setStage("idle");
    setPage(p);
    history.pushState({}, "", `?page=${p}`);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function returnToDesk() {
    navigate("ask");
    setTimeout(
      () =>
        document.getElementById("anime-title")?.focus({ preventScroll: true }),
      50,
    );
  }
  async function run(hit: Hit, q: string) {
    controller.current?.abort();
    const id = ++runId.current,
      c = new AbortController();
    controller.current = c;
    setQuestion(q);
    setChosen(hit);
    setError(null);
    setStage("record");
    setPage("answer");
    window.scrollTo({ top: 0, behavior: "instant" });
    try {
      await getRecord(hit.id, c.signal);
      if (id !== runId.current) return;
      setStage("draft");
      const a = await ask(hit.id, q, c.signal);
      if (id !== runId.current) return;
      setAnswer(a);
      setStage("done");
    } catch (e) {
      if (id !== runId.current || (e as Error).name === "AbortError") return;
      const err = e as ApiError;
      setError({ kind: err.kind ?? "upstream", message: err.message });
      setStage("error");
    }
  }
  const busy = stage === "record" || stage === "draft";
  const pose: Pose = !motion
    ? "idle"
    : busy
      ? "thinking"
      : stage === "error"
        ? "puzzled"
        : typing
          ? "curious"
          : walking
            ? "walking"
            : stage === "done"
              ? "happy"
              : "idle";
  async function copy() {
    if (!answer) return;
    try {
      await navigator.clipboard.writeText(
        `${question}\n${answer.claims.map((c) => `${c.status.toUpperCase()}: ${sentence(c, answer.record)}${c.status === "conflict" ? ` AniList says ${recordSays(c)}.` : ""}`).join("\n")}\n${answer.record.url}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }
  async function share() {
    const u = new URL(location.href);
    u.search = `title=${chosen?.id ?? answer?.record.id}&q=${encodeURIComponent(question)}`;
    try {
      if (navigator.share)
        await navigator.share({
          title: "A question with a paper trail",
          url: u.href,
        });
      else {
        await navigator.clipboard.writeText(u.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* The native share sheet may be dismissed. */
    }
  }
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <a
          className="brand"
          href="?page=ask"
          onClick={(e) => {
            e.preventDefault();
            navigate("ask");
          }}
          aria-label="Otaku Oracle home"
        >
          <Logo />
          <span>
            otaku <em>oracle.</em>
          </span>
        </a>
        <nav aria-label="Main navigation">
          {(["ask", "why", "how"] as const).map((p) => (
            <a
              key={p}
              className={page === p ? "active" : ""}
              href={`?page=${p}`}
              onClick={(e) => {
                e.preventDefault();
                navigate(p);
              }}
            >
              {p === "ask"
                ? "Field notes"
                : p === "why"
                  ? "Why we’re here"
                  : "The paper trail"}
            </a>
          ))}
        </nav>
        <div className="header-controls">
          <button
            className="icon-button motion-control"
            type="button"
            disabled={reduced}
            aria-label={
              reduced
                ? "Motion off for system preference"
                : motion
                  ? "Pause motion"
                  : "Resume motion"
            }
            aria-pressed={!motion}
            onClick={() => {
              if (!reduced) setPaused((p) => !p);
            }}
            title={
              reduced
                ? "Motion is off for your system preference"
                : motion
                  ? "Pause motion"
                  : "Resume motion"
            }
          >
            <Icon name={motion ? "pause" : "play"} size={16} />
            <span>{motion ? "Pause motion" : "Motion off"}</span>
          </button>
          <button
            className="icon-button theme-control"
            type="button"
            aria-label={dark ? "Use light theme" : "Use dark theme"}
            aria-pressed={dark}
            onClick={() => setDark((d) => !d)}
          >
            <Icon name="sun" size={18} />
          </button>
        </div>
      </header>
      {!online && (
        <div className="connection-banner" role="status">
          You’re offline. Your question stays here; new records need a
          connection.
        </div>
      )}
      {new URLSearchParams(location.search).has("review") && (
        <div className="review-banner">
          Design review · responses may use labelled fixtures
        </div>
      )}
      <main id="main" tabIndex={-1} key={page} className={`page page-${page}`}>
        {page === "ask" && (
          <Journey
            pose={pose}
            motion={motion}
            onWalking={setWalking}
            onProgress={progress}
            onAsk={returnToDesk}
          >
            <Desk
              busy={busy}
              seed={chosen}
              initialQuestion={question}
              onAsk={run}
              onTyping={setTyping}
            />
          </Journey>
        )}
        {page === "why" && <Why />}
        {page === "how" && <How />}
        {page === "answer" && (
          <div className="answer-page">
            <div className="answer-top">
              <button className="text-button" onClick={returnToDesk}>
                <span className="back-arrow">
                  <Icon size={16} />
                </span>
                Back to your field notes
              </button>
              <span>{API_BASE ? "Source trail" : "Record-only demo"}</span>
            </div>
            <div className="question-heading">
              <span>Your question</span>
              <h1>{question}</h1>
              <p>{chosen?.title}</p>
            </div>
            {busy && (
              <section className="waiting" role="status" aria-live="polite">
                <div className="waiting-mark">
                  <Logo />
                </div>
                <h2>
                  {stage === "record"
                    ? "Finding the right page…"
                    : API_BASE
                      ? "Giving your question a paper trail…"
                      : "Reading what the record says…"}
                </h2>
                <p>
                  {stage === "record"
                    ? "Retrieving this title’s AniList record."
                    : API_BASE
                      ? "Waiting for a drafted and checked answer. This can take up to 15 seconds."
                      : "The demo reads source fields; it doesn’t draft an answer."}
                </p>
                <ol className="honest-progress">
                  <li data-status={stage === "record" ? "active" : "done"}>
                    <span>
                      {stage === "record" ? (
                        "1"
                      ) : (
                        <Icon name="check" size={14} />
                      )}
                    </span>
                    Retrieve record
                  </li>
                  <li data-status={stage === "draft" ? "active" : "pending"}>
                    <span>2</span>
                    {API_BASE ? "Request answer" : "Read facts"}
                  </li>
                  <li data-status="pending">
                    <span>3</span>Receive claim checks
                  </li>
                </ol>
                <button
                  className="text-button"
                  onClick={() => {
                    controller.current?.abort();
                    runId.current++;
                    returnToDesk();
                  }}
                >
                  Stop waiting <Icon name="close" size={14} />
                </button>
              </section>
            )}
            {stage === "error" && error && (
              <section
                className={`error-page error-${error.kind}`}
                role="alert"
              >
                <div className="error-mark">
                  <Icon
                    name={error.kind === "empty" ? "search" : "info"}
                    size={40}
                  />
                </div>
                <h2>
                  {error.kind === "rate"
                    ? "A little pause on the trail."
                    : error.kind === "offline"
                      ? "The trail’s out of reach."
                      : error.kind === "empty"
                        ? "That question needs more than a record."
                        : "A page didn’t arrive."}
                </h2>
                <p>{error.message}</p>
                <span className="tiny">
                  No answer was substituted. Your question is still here.
                </span>
                <div className="error-actions">
                  <button
                    className="button primary"
                    onClick={() => chosen && run(chosen, question)}
                  >
                    Try again <Icon />
                  </button>
                  <button className="text-button" onClick={returnToDesk}>
                    Change the question
                  </button>
                </div>
              </section>
            )}
            {stage === "done" && answer && (
              <>
                <div className="answer-context">
                  <span className="status-label">
                    {answer.demo
                      ? "Demo · record facts only"
                      : answer.mode === "record-only"
                        ? "Record-only fallback"
                        : "Answer received · claims checked"}
                  </span>
                  <p>
                    {answer.demo
                      ? "These facts come directly from AniList. No drafted answer is being shown."
                      : (answer.notice ??
                        "Each claim below is compared to the retrieved record.")}
                  </p>
                </div>
                <div className="answer-layout">
                  <div className="answer-claims">
                    {answer.claims.length === 0 && (
                      <div className="empty-claims">
                        <h2>No matching factual claim.</h2>
                        <p>
                          The answer contained no claim this check could retain.
                          The source is still here to explore.
                        </p>
                      </div>
                    )}
                    {answer.claims.map((c, i) => (
                      <article
                        className={`checked-claim claim-${c.status}`}
                        key={c.id}
                        style={{ animationDelay: `${i * 120}ms` }}
                      >
                        <div className="claim-label">
                          <span className="claim-symbol">
                            <Icon
                              name={
                                c.status === "verified"
                                  ? "check"
                                  : c.status === "conflict"
                                    ? "close"
                                    : "info"
                              }
                              size={18}
                            />
                          </span>
                          <span>
                            {c.status === "verified"
                              ? "Verified"
                              : c.status === "conflict"
                                ? "Conflict"
                                : "Unchecked"}
                          </span>
                          <span className="claim-field">
                            {c.field?.replace(/_/g, " ") ?? "Beyond the record"}
                          </span>
                        </div>
                        <h2>
                          {c.status === "conflict" ? (
                            <s>{sentence(c, answer.record)}</s>
                          ) : (
                            sentence(c, answer.record)
                          )}
                        </h2>
                        {c.status === "conflict" && (
                          <p className="correction">
                            AniList says <strong>{recordSays(c)}</strong>
                          </p>
                        )}
                        <a href={c.sourceUrl} target="_blank" rel="noreferrer">
                          {c.status === "unchecked"
                            ? "No matching field · explore the record"
                            : "View the AniList record"}
                          <Icon size={15} />
                        </a>
                      </article>
                    ))}
                    {answer.explanation && (
                      <aside className="unchecked-prose">
                        <span className="status-label">
                          Unchecked explanation
                        </span>
                        <p>{answer.explanation}</p>
                        <small>
                          Context beyond the record. No verified stamp.
                        </small>
                      </aside>
                    )}
                    <div className="answer-actions">
                      <button className="button" onClick={copy}>
                        <Icon name="copy" size={16} />
                        {copied ? "Copied with source" : "Copy with source"}
                      </button>
                      <button className="text-button" onClick={share}>
                        Share the question <Icon size={16} />
                      </button>
                      <span role="status" className="sr-only">
                        {copied ? "Copied to clipboard" : ""}
                      </span>
                    </div>
                  </div>
                  <aside className="source-record">
                    <div className="source-record-heading">
                      <Icon name="book" />
                      <span>The original page</span>
                    </div>
                    {answer.record.cover && (
                      <img
                        src={answer.record.cover}
                        alt=""
                        width="160"
                        height="220"
                        loading="lazy"
                      />
                    )}
                    <h2>{answer.record.title}</h2>
                    <p className="native-title">{answer.record.native}</p>
                    <dl>
                      {[
                        ["Studio", answer.record.studios.join(", ")],
                        ["Episodes", answer.record.episodes],
                        ["Start year", answer.record.year],
                        ["Format", answer.record.format],
                        ["Source", answer.record.source],
                      ].map(([label, value]) => (
                        <div key={String(label)}>
                          <dt>{label}</dt>
                          <dd>{value ?? "Not listed"}</dd>
                        </div>
                      ))}
                    </dl>
                    <a
                      className="source-link"
                      href={answer.record.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open AniList <Icon size={16} />
                    </a>
                    <p className="tiny">
                      Retrieved{" "}
                      {new Date(answer.fetchedAt).toLocaleDateString("en", {
                        dateStyle: "medium",
                      })}
                      .<br />
                      AniList is the reference, not the truth.
                    </p>
                  </aside>
                </div>
              </>
            )}
          </div>
        )}
      </main>
      {page === "answer" && (
        <Traveller pose={pose} className="screen-traveller" />
      )}
      <footer className="site-footer">
        <a className="brand" href="?page=ask">
          <Logo />
          <span>
            otaku <em>oracle.</em>
          </span>
        </a>
        <p>Stay curious. Check the source.</p>
        <a href="https://anilist.co" target="_blank" rel="noreferrer">
          Records from AniList <Icon size={14} />
        </a>
        <small>AniList is the reference, not the truth.</small>
      </footer>
    </>
  );
}
