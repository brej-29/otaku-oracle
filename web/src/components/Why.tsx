import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { getEval, type EvalArm, type EvalSummary } from "../api";

const pct = (x: number | null) => (x == null ? "none" : `${Math.round(x * 100)}%`);

function Bar({ arm, kind, reduce }: { arm: EvalArm; kind: "A" | "B"; reduce: boolean | null }) {
  const has = arm.accuracy != null && arm.responses > 0;
  return (
    <div className={`bar bar--${kind}`}>
      <span className="bar__who">{kind === "A" ? "Model alone" : "With AniList record"}</span>
      <div className="bar__track" role="img" aria-label={has ? `${kind === "A" ? "Model alone" : "With record"}: ${pct(arm.accuracy)} correct, interval ${pct(arm.lo)} to ${pct(arm.hi)}, ${arm.responses} of ${arm.expected} answered` : `${kind === "A" ? "Model alone" : "With record"}: no answers yet`}>
        {has && (
          <>
            <motion.i className="bar__fill" initial={reduce ? false : { scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true, margin: "-10%" }} transition={{ duration: 0.8, ease: [0.2, 0.7, 0.1, 1] }} style={{ width: `${arm.accuracy! * 100}%` }} />
            <i className="bar__ci" style={{ left: `${arm.lo! * 100}%`, width: `${(arm.hi! - arm.lo!) * 100}%` }} />
          </>
        )}
      </div>
      <span className="bar__n">{has ? `${pct(arm.accuracy)} correct` : "No answers yet"}<small>{arm.responses} of {arm.expected} answered</small></span>
    </div>
  );
}

export function Why() {
  const reduce = useReducedMotion();
  const [data, setData] = useState<EvalSummary | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    const sample = new URLSearchParams(location.search).has("sample");
    getEval(sample).then(setData).catch((e) => setErr(e.message));
  }, []);

  return (
    <section id="why" className="why" aria-labelledby="why-h">
      <div className="wrap why__grid">
        <div className="why__lead">
          <h2 id="why-h">Why this exists</h2>
          <p>Chat models answer anime questions fluently. Fluent is not the same as correct, and nobody stops to check the studio or the episode count.</p>
        </div>

        <div className="why__chapters">
          <section className="chapter">
            <h3>The claim we are testing</h3>
            <p>Giving a model the AniList record before it answers makes small facts more accurate. That is a hypothesis. We wrote the test and its pass mark down before running it, in <a href="https://github.com/brej-29/otaku-oracle/blob/feat/eval-baseline/docs/PREREGISTRATION.md">the preregistration</a>.</p>
          </section>

          <section className="chapter">
            <h3>How we test it</h3>
            <p>124 questions about 18 titles, split into well known, middle and obscure. Each question is asked twice: to the model alone, and to the model with the record. An answer counts only on an exact match with AniList.</p>
          </section>

          <section className="chapter chapter--chart" aria-live="polite">
            <h3>What the numbers say so far</h3>
            {err && <p className="tag tag--err" role="alert">{err}</p>}
            {!data && !err && <div className="skel skel--chart" aria-label="Loading evaluation" />}
            {data && (
              <>
                <p className={`status status--${data.status.toLowerCase()}`}><b>{data.status === "PENDING" ? "Not run yet" : data.status === "COMPLETE" ? "Complete" : "Partial"}</b> {data.note}</p>
                {data.sample && <p className="tag tag--demo">Sample shape only. Not results.</p>}
                {data.models.length === 0 && <p className="empty">No model has finished enough answers to chart. This page will show the real numbers, with their uncertainty, when a run completes.</p>}
                {data.models.map((m) => (
                  <figure key={m.id} className="model">
                    <figcaption>{m.label}<small>{m.primary ? "registered primary" : "extra check"}</small></figcaption>
                    <Bar arm={m.arms.A} kind="A" reduce={reduce} />
                    <Bar arm={m.arms.B} kind="B" reduce={reduce} />
                  </figure>
                ))}
                {data.models.length > 0 && <p className="fine">The red outline is the 95% interval. A wide outline means few titles, not a fuzzy chart.</p>}
              </>
            )}
          </section>

          <section className="chapter">
            <h3>What this cannot show</h3>
            <p>The record we hand over is already the right one, so this measures grounding, not title search. Eighteen titles is a small sample. AniList is our reference, not the truth about anime.</p>
          </section>
        </div>
      </div>
    </section>
  );
}
