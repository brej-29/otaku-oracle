import catalog from "../catalog.json" with { type: "json" };
import { useEffect, useState } from "react";
import { getEval, type EvalSummary } from "../api";
import { Icon, Logo, Traveller } from "./Art";
export function Why() {
  const [data, setData] = useState<EvalSummary | null>(null),
    [error, setError] = useState(false);
  useEffect(() => {
    let live = true;
    getEval(new URLSearchParams(location.search).has("sample"))
      .then((d) => {
        if (live) setData(d);
      })
      .catch(() => {
        if (live) setError(true);
      });
    return () => {
      live = false;
    };
  }, []);
  const arms = data?.models.flatMap((m) => [m.arms.A, m.arms.B]) ?? [],
    responses = arms.reduce((s, a) => s + a.responses, 0),
    expected = arms.reduce((s, a) => s + a.expected, 0);
  return (
    <div className="reading-page why-page">
      <div className="page-intro">
        <h1>
          Wonder freely.
          <br />
          <em>Trust carefully.</em>
        </h1>
        <p>
          Anime worlds are full of details.
          <br />A confident sentence doesn’t make one true.
        </p>
        <div className="orbit-print" aria-hidden="true">
          <img
            className="orbit-art"
            src={catalog[1].cover}
            alt=""
            width="110"
            height="160"
          />
          <img
            className="orbit-art orbit-art-two"
            src={catalog[2].cover}
            alt=""
            width="110"
            height="160"
          />
          <Traveller className="orbit-guide" />
        </div>
      </div>
      <section className="essay">
        <span className="margin-note">The reason for the journey</span>
        <div>
          <h2>
            We love the story.
            <br />
            We check the details.
          </h2>
          <p>
            Questions about studios, episodes and adaptations deserve more than
            a plausible guess. We match the exact title across available
            catalogs and keep the retrieved values attached to each claim.
          </p>
          <p>
            Agreement carries evidence. Differences stay side by side. News and
            conversation links remain separate from factual verification.
          </p>
        </div>
      </section>
      <section className="measurement" aria-labelledby="measurement-heading">
        <div>
          <h2 id="measurement-heading">
            Proof is a work
            <br />
            <em>in progress.</em>
          </h2>
          <p>
            We’re measuring whether answers with a source outperform answers
            without one. The journal shows what the data says, including what it
            cannot say yet.
          </p>
        </div>
        <div className="measurement-sheet" aria-live="polite">
          {error ? (
            <>
              <span className="status-label">Unavailable</span>
              <h3>
                The measurement file
                <br />
                didn’t arrive.
              </h3>
              <p>No score is shown. Please try again later.</p>
            </>
          ) : !data ? (
            <p>Loading the measurement…</p>
          ) : (
            <>
              <span className="status-label">{data.status}</span>
              {(data.sample ||
                new URLSearchParams(location.search).has("sample")) && (
                <strong className="sample-label">
                  Illustrative sample · not results
                </strong>
              )}
              <h3>
                {data.status === "COMPLETE"
                  ? "Measured, with limits."
                  : "A finding takes time."}
              </h3>
              <p>{data.note}</p>
              <dl>
                <div>
                  <dt>Recorded responses</dt>
                  <dd>
                    {responses.toLocaleString()}
                    {expected > 0 && (
                      <small> / {expected.toLocaleString()}</small>
                    )}
                  </dd>
                </div>
                <div>
                  <dt>Published runs</dt>
                  <dd>{data.models.length}</dd>
                </div>
              </dl>
              {data.models.map((m, i) => (
                <div className="measurement-run" key={m.id}>
                  <h4>
                    Run {i + 1}
                    {m.primary ? " · primary" : " · replication"}
                  </h4>
                  {(["A", "B"] as const).map((arm) => {
                    const a = m.arms[arm];
                    return (
                      <div className="accuracy-row" key={arm}>
                        <span>
                          {arm === "A" ? "Without source" : "With source"}
                        </span>
                        <strong>
                          {a.accuracy === null
                            ? "Pending"
                            : `${(a.accuracy * 100).toFixed(1)}%`}
                        </strong>
                        <small>
                          {a.lo !== null && a.hi !== null
                            ? `95% interval ${(a.lo * 100).toFixed(1)}–${(a.hi * 100).toFixed(1)}%`
                            : "Interval pending"}
                        </small>
                      </div>
                    );
                  })}
                </div>
              ))}
              <p className="tiny">
                {data.updated_at
                  ? `Updated ${new Date(data.updated_at).toLocaleDateString("en", { dateStyle: "medium" })}`
                  : "No completed result is claimed."}
              </p>
            </>
          )}
        </div>
      </section>
      <p className="honesty-line">
        <Icon name="info" />
        AniList is the reference, not the truth. The original evaluation
        measures AniList grounding only. Multi-source checks and discussion
        links are an unmeasured extension.
      </p>
    </div>
  );
}
const steps = [
  {
    name: "Find the title",
    title: "Every journey starts with the right story.",
    text: "A film, a sequel and a TV series can share a name. Choose the exact title so the record belongs to the anime you mean.",
  },
  {
    name: "Read the record",
    title: "Bring the source into the conversation.",
    text: "We start with AniList, match other catalogs by exact identifiers and keep their links. Missing or unavailable values stay visible.",
  },
  {
    name: "Check the claims",
    title: "Give every statement its own check.",
    text: "Typed facts are compared across available catalogs. Two sources must agree, or a catalog-specific single source must be explicit. Differences are shown side by side; missing evidence stays unchecked.",
  },
  {
    name: "Keep the source",
    title: "Leave with a trail you can follow.",
    text: "The original source stays attached to every claim. If the answer service is unavailable, the record can still speak for itself.",
  },
];
export function How() {
  const [step, setStep] = useState(0);
  return (
    <div className="reading-page how-page">
      <div className="page-intro">
        <h1>
          A small question.
          <br />
          <em>A proper paper trail.</em>
        </h1>
        <p>
          Less mystery. More ways to check.
          <br />
          Here’s what happens in your field notes.
        </p>
      </div>
      <div className="process-stage" data-step={step}>
        <Traveller pose="curious" className="process-guide" />
        <svg
          className="process-route"
          viewBox="0 0 1000 380"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M100 270C200 0 380 380 500 140S750 50 900 280"
            pathLength="100"
          />
          <path
            className="route-active"
            d="M100 270C200 0 380 380 500 140S750 50 900 280"
            pathLength="100"
            style={{ strokeDasharray: `${(step + 1) * 25} 100` }}
          />
        </svg>
        <div className="process-paper paper-title">
          <span>The title</span>
          <div className="paper-window">
            <img
              src={catalog[0].cover}
              alt="Illustrative title artwork via AniList"
              width="100"
              height="140"
              loading="lazy"
            />
          </div>
          <h2>Your anime</h2>
          <p>The exact story.</p>
        </div>
        <div className="process-paper paper-record">
          <Icon name="book" size={28} />
          <h2>Sources</h2>
          <div className="record-rule">
            AniList <span>Record</span>
          </div>
          <div className="record-rule">
            Other catalogs <span>When available</span>
          </div>
          <div className="record-rule">
            Edition <span>Matched exactly</span>
          </div>
        </div>
        <div className="process-paper paper-answer">
          <span>The check</span>
          <div className="large-stamp">
            <Icon name="check" size={40} />
          </div>
          <h2>
            A fact with
            <br />
            <em>a place to land.</em>
          </h2>
          <p>Verified · source linked</p>
        </div>
        <div className="route-marker" aria-hidden="true">
          <Logo />
        </div>
      </div>
      <div className="process-tabs" aria-label="Source trail steps">
        {steps.map((s, i) => (
          <button
            key={s.name}
            aria-pressed={step === i}
            onClick={() => setStep(i)}
          >
            <span>{i + 1}</span>
            {s.name}
            <Icon size={16} />
          </button>
        ))}
      </div>
      <section className="process-explainer" aria-live="polite">
        <span>
          {step + 1}
          <small> / 4</small>
        </span>
        <div>
          <h2>{steps[step].title}</h2>
          <p>{steps[step].text}</p>
        </div>
        <button className="button" onClick={() => setStep((s) => (s + 1) % 4)}>
          {step === 3 ? "Start again" : "Next stop"}
          <Icon />
        </button>
      </section>
      <p className="honesty-line">
        <Icon name="info" />
        In the source extension, verified means corroborated or explicitly
        single-source catalog data. It doesn’t mean every source is perfect.
      </p>
    </div>
  );
}
