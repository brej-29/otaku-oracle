import { motion, useReducedMotion } from "motion/react";
import type { Answer } from "../api";
import { Seal } from "./Seal";

const STEP = 0.62; // seconds between stamps

export function Proof({ answer }: { answer: Answer }) {
  const reduce = useReducedMotion();
  const r = answer.record;
  return (
    <article className="proof panel" aria-labelledby="proof-h" aria-live="polite">
      <div className="proof__sheet">
        <header className="proof__head">
          <h2 id="proof-h">{answer.title}</h2>
          {answer.demo && <p className="tag tag--demo">Demo answer: facts are live from AniList, the explanation is a placeholder.</p>}
        </header>

        <ol className="proof__lines">
          {answer.facts.map((f, i) => (
            <li key={f.key} className="proof__line">
              <motion.span
                className="proof__claim"
                initial={reduce ? false : { color: "var(--pencil)" }}
                animate={{ color: "var(--ink)" }}
                transition={{ delay: 0.5 + i * STEP, duration: 0.25 }}
              >
                {f.sentence}
              </motion.span>
              <motion.span
                className="proof__stamp"
                initial={reduce ? false : { scale: 1.9, opacity: 0, rotate: -18 }}
                animate={{ scale: 1, opacity: 1, rotate: -5 }}
                transition={{ delay: 0.5 + i * STEP + 0.12, type: "spring", stiffness: 520, damping: 22, mass: 0.7 }}
              >
                <Seal size={52} label={`Verified: ${f.label} is ${f.value}`} />
              </motion.span>
              <a className="proof__src" href={f.url} target="_blank" rel="noreferrer" aria-label={`${f.label}: open the AniList record for ${answer.title}`}>AniList record</a>
            </li>
          ))}
        </ol>

        <motion.p
          className="proof__draft"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 + answer.facts.length * STEP, duration: 0.4 }}
        >
          <span className="proof__q" aria-hidden="true">?</span>
          <span><span className="tag tag--pencil">Not checked</span> {answer.explanation}</span>
        </motion.p>

        <p className="proof__legend">
          <span className="legend"><Seal size={22} label="Seal" /> matches the record</span>
          <span className="legend legend--pencil"><i aria-hidden="true" /> pencil means unchecked</span>
        </p>
      </div>

      <aside className="record" aria-label="AniList record used">
        {r.cover && <img src={r.cover} alt={`Cover art for ${r.title}`} width="200" height="283" style={{ backgroundColor: r.color ?? undefined }} />}
        <dl>
          <div><dt>Native title</dt><dd lang="ja">{r.native ?? "None listed"}</dd></div>
          <div><dt>Format</dt><dd>{r.format ?? "Unknown"}</dd></div>
          <div><dt>Episodes</dt><dd>{r.episodes ?? "Unknown"}</dd></div>
          <div><dt>Studio</dt><dd>{r.studios.join(", ") || "None listed"}</dd></div>
          <div><dt>Fetched</dt><dd><time dateTime={answer.fetchedAt}>{new Date(answer.fetchedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time></dd></div>
        </dl>
      </aside>
    </article>
  );
}
