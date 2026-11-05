import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { Answer, Claim } from "../api";
import { Seal } from "./Seal";

const STEP = 0.62; // seconds between stamps

function Line({ c, i, title, reduce }: { c: Claim; i: number; title: string; reduce: boolean | null }) {
  const delay = 0.5 + i * STEP;
  if (c.status === "unchecked") {
    return (
      <li className="proof__line proof__line--unchecked">
        <span className="proof__claim proof__claim--pencil"><span className="tag tag--pencil">Not checked</span> {c.text}</span>
        <span className="proof__mark--q" aria-hidden="true">?</span>
      </li>
    );
  }
  const conflict = c.status === "conflict";
  return (
    <li className={`proof__line ${conflict ? "proof__line--conflict" : ""}`}>
      <motion.span
        className="proof__claim"
        initial={reduce ? false : { color: "var(--pencil)" }}
        animate={{ color: conflict ? "var(--ink-soft)" : "var(--ink)" }}
        transition={{ delay, duration: 0.25 }}
      >
        {c.text}
      </motion.span>
      {conflict ? (
        <motion.span
          className="proof__stamp--conflict"
          initial={reduce ? false : { scale: 1.6, opacity: 0, rotate: 10 }}
          animate={{ scale: 1, opacity: 1, rotate: 4 }}
          transition={{ delay: delay + 0.12, type: "spring", stiffness: 480, damping: 20 }}
        >
          <span className="cross" role="img" aria-label={`Does not match the record. AniList says ${c.recordValue}`}>✕</span>
        </motion.span>
      ) : (
        <motion.span
          className="proof__stamp"
          initial={reduce ? false : { scale: 1.9, opacity: 0, rotate: -18 }}
          animate={{ scale: 1, opacity: 1, rotate: -5 }}
          transition={{ delay: delay + 0.12, type: "spring", stiffness: 520, damping: 22, mass: 0.7 }}
        >
          <Seal size={52} label={`Verified: ${c.field ?? "fact"} is ${c.recordValue ?? c.value}`} />
        </motion.span>
      )}
      {conflict ? (
        <p className="proof__says">AniList says <b>{c.recordValue}</b>. The claim above doesn't match, so it was not stamped.</p>
      ) : (
        <a className="proof__src" href={c.sourceUrl} target="_blank" rel="noreferrer" aria-label={`Open the AniList record for ${title}`}>AniList record</a>
      )}
    </li>
  );
}

export function Proof({ answer }: { answer: Answer }) {
  const reduce = useReducedMotion();
  const [note, setNote] = useState<string | null>(null);
  const r = answer.record;
  const verified = answer.claims.filter((c) => c.status === "verified");
  const text = `${answer.title}\n${verified.map((c) => `- ${c.text}`).join("\n")}\nChecked against the AniList record: ${r.url}`;

  async function copy() {
    try { await navigator.clipboard.writeText(text); setNote("Copied the verified facts and the source link."); }
    catch { setNote("Couldn't copy. Select the text and copy it by hand."); }
  }
  async function share() {
    try {
      if (navigator.share) { await navigator.share({ title: answer.title, text }); setNote(null); }
      else await copy();
    } catch (e) { if ((e as Error).name !== "AbortError") setNote("Sharing isn't available here. Use Copy facts instead."); }
  }

  return (
    <article className="proof panel" aria-labelledby="proof-h">
      <div className="proof__sheet">
        <header className="proof__head">
          <h2 id="proof-h">{answer.title}</h2>
          {answer.notice && <p className="tag tag--demo">{answer.notice}</p>}
        </header>

        <ol className="proof__lines" aria-live="polite">
          {answer.claims.map((c, i) => <Line key={c.id} c={c} i={i} title={answer.title} reduce={reduce} />)}
        </ol>

        {answer.explanation && (
          <motion.p className="proof__draft" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + answer.claims.length * STEP, duration: 0.4 }}>
            <span className="proof__q" aria-hidden="true">?</span>
            <span><span className="tag tag--pencil">Not checked</span> {answer.explanation}</span>
          </motion.p>
        )}

        <div className="proof__actions">
          <button type="button" className="btn btn--ghost" onClick={copy}>Copy facts</button>
          <button type="button" className="btn btn--ghost" onClick={share}>Share</button>
          <span className="fine" role="status">{note}</span>
        </div>

        <p className="proof__legend">
          <span className="legend"><Seal size={22} label="Seal" /> matches the record</span>
          <span className="legend legend--cross"><b aria-hidden="true">✕</b> contradicts the record</span>
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
