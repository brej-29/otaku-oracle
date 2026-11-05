import { Seal } from "./Seal";

const STEPS = [
  { n: 1, h: "Pick the title", p: "You choose one AniList record, so there is no guessing which show you mean." },
  { n: 2, h: "Fetch the record", p: "Studio, episodes, year, format and source come straight from AniList." },
  { n: 3, h: "Draft in pencil", p: "A model writes the answer. Everything it says starts out unchecked." },
  { n: 4, h: "Ink and stamp", p: "Facts that match the record are inked and stamped. The rest stays pencil." },
];

function Art({ n }: { n: number }) {
  const c = { fill: "none", stroke: "currentColor", strokeWidth: 3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 120 80" className="howart" aria-hidden="true" focusable="false">
      {n === 1 && (<><rect x="14" y="14" width="64" height="16" {...c} /><path d="M20 22h30" {...c} stroke="var(--pencil)" /><path d="M20 40h58M20 52h46" {...c} opacity=".35" /><path d="M84 40l18 20-8 2 4 9-5 2-4-9-7 5z" fill="currentColor" /></>)}
      {n === 2 && (<><ellipse cx="60" cy="18" rx="30" ry="9" {...c} /><path d="M30 18v36c0 5 13 9 30 9s30-4 30-9V18M30 36c0 5 13 9 30 9s30-4 30-9" {...c} /></>)}
      {n === 3 && (<><path d="M18 62l10-4 44-44 6 6-44 44z" {...c} stroke="var(--pencil)" /><path d="M20 70h80" {...c} stroke="var(--pencil)" strokeDasharray="2 7" /><path d="M82 24h22M82 36h14" {...c} stroke="var(--pencil)" strokeDasharray="5 5" /></>)}
      {n === 4 && (<><path d="M16 26h56M16 42h40" {...c} /><path d="M16 58h50" {...c} stroke="var(--pencil)" strokeDasharray="5 5" /></>)}
    </svg>
  );
}

export function How() {
  return (
    <section id="how" className="how" aria-labelledby="how-h">
      <div className="wrap">
        <h2 id="how-h">How it works</h2>
        <ol className="how__panels">
          {STEPS.map((s) => (
            <li key={s.n} className={`how__panel panel how__panel--${s.n}`}>
              <span className="how__n" aria-hidden="true">{s.n}</span>
              <Art n={s.n} />
              {s.n === 4 && <span className="how__seal" aria-hidden="true"><Seal size={46} label="" /></span>}
              <h3>{s.h}</h3>
              <p>{s.p}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
