import { useEffect, useState } from "react";
import { popular, type Hit } from "../api";

/** Real covers from AniList's most popular titles. Hidden quietly if AniList is unreachable. */
export function Starters({ onPick }: { onPick: (h: Hit) => void }) {
  const [items, setItems] = useState<Hit[] | null>(null);
  useEffect(() => {
    const c = new AbortController();
    popular(c.signal).then(setItems).catch((e) => { if (e.name !== "AbortError") setItems([]); });
    return () => c.abort();
  }, []);
  if (items && !items.length) return null;
  return (
    <section className="starters wrap" aria-labelledby="starters-h">
      <h2 id="starters-h">Pick a story</h2>
      <ul className="starters__row">
        {(items ?? Array.from({ length: 8 }, () => null)).map((h, i) => (
          <li key={h?.id ?? i}>
            {h ? (
              <button type="button" className="starter panel" onClick={() => onPick(h)} aria-label={`Ask about ${h.title}`}>
                {h.cover && <img src={h.cover} alt="" width="230" height="326" loading="lazy" style={{ backgroundColor: h.color ?? undefined }} />}
                <span>{h.title}</span>
              </button>
            ) : <div className="starter panel skel" aria-hidden="true" />}
          </li>
        ))}
      </ul>
    </section>
  );
}
