import { useEffect, useId, useRef, useState } from "react";
import { searchTitles, type Hit } from "../api";

const EXAMPLES = [
  { title: "Frieren: Beyond Journey's End", q: "Which studio animated it?" },
  { title: "Cowboy Bebop", q: "How many episodes does it have?" },
  { title: "Spirited Away", q: "When did it come out?" },
];

type Props = { busy: boolean; onSubmit: (hit: Hit, question: string) => void; preset?: { hit: Hit; n: number } | null };

export function Ask({ busy, onSubmit, preset }: Props) {
  const uid = useId();
  const [text, setText] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [searching, setSearching] = useState(false);
  const [searchErr, setSearchErr] = useState<string | null>(null);
  const [picked, setPicked] = useState<Hit | null>(null);
  const [question, setQuestion] = useState("");
  const [missing, setMissing] = useState<"title" | "question" | null>(null);
  const qRef = useRef<HTMLInputElement>(null);
  const tRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (picked || text.trim().length < 2) { setHits([]); setSearching(false); return; }
    setSearching(true); setSearchErr(null);
    const ctl = new AbortController();
    const id = setTimeout(async () => {
      try {
        const r = await searchTitles(text.trim(), ctl.signal);
        setHits(r); setOpen(true); setActive(-1);
      } catch (e) {
        if ((e as Error).name !== "AbortError") setSearchErr((e as Error).message);
      } finally { if (!ctl.signal.aborted) setSearching(false); }
    }, 320);
    return () => { clearTimeout(id); ctl.abort(); };
  }, [text, picked]);

  const choose = (h: Hit) => { setPicked(h); setText(h.title); setOpen(false); setMissing(null); qRef.current?.focus(); };
  const clear = () => { setPicked(null); setText(""); setHits([]); tRef.current?.focus(); };

  useEffect(() => { if (preset) choose(preset.hit); }, [preset]); // eslint-disable-line react-hooks/exhaustive-deps

  function onKey(e: React.KeyboardEvent) {
    if (!open || !hits.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => (a + 1) % hits.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => (a <= 0 ? hits.length - 1 : a - 1)); }
    else if (e.key === "Enter" && active >= 0) { e.preventDefault(); choose(hits[active]); }
    else if (e.key === "Escape") { setOpen(false); }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!picked) { setMissing("title"); tRef.current?.focus(); return; }
    if (!question.trim()) { setMissing("question"); qRef.current?.focus(); return; }
    setMissing(null);
    onSubmit(picked, question.trim());
  }

  async function tryExample(ex: (typeof EXAMPLES)[number]) {
    setQuestion(ex.q); setText(ex.title); setPicked(null); setMissing(null);
    try {
      const r = await searchTitles(ex.title);
      if (r[0]) setPicked(r[0]);
      setOpen(false);
    } catch { /* the combobox shows the error on its own */ }
    qRef.current?.focus();
  }

  const listId = `${uid}-list`;
  return (
    <form className="ask" onSubmit={submit} noValidate aria-label="Ask about an anime">
      <label className="ask__label" htmlFor={`${uid}-title`}>Anime title</label>
      <div className="combo">
        <div className={`combo__field ${picked ? "is-picked" : ""}`}>
          {picked?.cover && <img src={picked.cover} alt="" width="34" height="48" className="combo__cover" />}
          <input
            ref={tRef} id={`${uid}-title`} role="combobox" aria-expanded={open && hits.length > 0} aria-controls={listId} aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `${uid}-o${active}` : undefined} aria-invalid={missing === "title"} aria-describedby={`${uid}-hint`}
            autoComplete="off" spellCheck={false} placeholder="Search AniList, e.g. Frieren" value={text}
            onChange={(e) => { setText(e.target.value); setPicked(null); }} onKeyDown={onKey} onFocus={() => hits.length && setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 120)}
          />
          {picked && <button type="button" className="combo__clear" onClick={clear} aria-label="Clear title">×</button>}
        </div>
        <ul id={listId} role="listbox" aria-label="Matching titles" className="combo__list" hidden={!(open && (hits.length || searching))}>
          {searching && !hits.length && [0, 1, 2].map((i) => <li key={i} className="combo__skel" aria-hidden="true" />)}
          {hits.map((h, i) => (
            <li key={h.id} id={`${uid}-o${i}`} role="option" aria-selected={i === active} className={i === active ? "is-active" : ""} onMouseDown={(e) => { e.preventDefault(); choose(h); }}>
              {h.cover ? <img src={h.cover} alt="" width="34" height="48" loading="lazy" /> : <span className="combo__nocover" />}
              <span><strong>{h.title}</strong><small>{[h.year, h.format].filter(Boolean).join(", ")}</small></span>
            </li>
          ))}
        </ul>
        <p id={`${uid}-hint`} className="ask__msg" role={missing === "title" || searchErr ? "alert" : undefined}>
          {missing === "title" ? "Pick a title from the list first." : searchErr ? searchErr
            : !picked && text.trim().length >= 2 && !searching && !hits.length ? "No match on AniList. Check the spelling or try the Japanese title."
            : picked ? "Title matched to its AniList record." : hits.length ? "Pick a title from the list." : "Type at least two letters."}
        </p>
      </div>

      <label className="ask__label" htmlFor={`${uid}-q`}>Your question</label>
      <input ref={qRef} id={`${uid}-q`} className="ask__q" aria-invalid={missing === "question"} placeholder="Which studio animated it?" value={question} onChange={(e) => setQuestion(e.target.value)} maxLength={200} />
      {missing === "question" && <p className="ask__msg" role="alert">Write a question first.</p>}

      <div className="ask__row">
        <button className="btn" type="submit" disabled={busy}>{busy ? "Checking" : "Check it"}</button>
        <div className="ask__examples" role="group" aria-label="Example questions">
          {EXAMPLES.map((ex) => <button key={ex.title} type="button" className="chip" onClick={() => tryExample(ex)}>{ex.q.replace(/\bit\b/, ex.title.split(":")[0])}</button>)}
        </div>
      </div>
    </form>
  );
}
