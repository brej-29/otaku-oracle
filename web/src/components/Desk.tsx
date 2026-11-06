import { useEffect, useRef, useState } from "react";
import { API_BASE, ApiError, searchTitles, type Hit } from "../api";
import { Icon } from "./Art";
export function Desk({
  busy,
  onAsk,
  onTyping,
  seed,
  initialQuestion = "",
}: {
  busy: boolean;
  onAsk: (hit: Hit, q: string) => void;
  onTyping: (active: boolean) => void;
  seed: Hit | null;
  initialQuestion?: string;
}) {
  const [query, setQuery] = useState(seed?.title ?? ""),
    [selected, setSelected] = useState<Hit | null>(seed),
    [question, setQuestion] = useState(initialQuestion),
    [hits, setHits] = useState<Hit[]>([]),
    [open, setOpen] = useState(false),
    [index, setIndex] = useState(-1),
    [searching, setSearching] = useState(false),
    [error, setError] = useState("");
  const box = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (seed) {
      setSelected(seed);
      setQuery(seed.title);
    }
  }, [seed]);
  useEffect(() => {
    if (query.length < 2 || (selected && query === selected.title)) {
      setHits([]);
      setSearching(false);
      return;
    }
    const c = new AbortController();
    const timer = setTimeout(() => {
      setSearching(true);
      setError("");
      searchTitles(query, c.signal)
        .then((h) => {
          if (c.signal.aborted) return;
          setHits(h);
          setOpen(true);
          setIndex(-1);
        })
        .catch((e) => {
          if (!c.signal.aborted && e.name !== "AbortError") {
            setError((e as ApiError).message);
            setHits([]);
          }
        })
        .finally(() => {
          if (!c.signal.aborted) setSearching(false);
        });
    }, 420);
    return () => {
      clearTimeout(timer);
      c.abort();
    };
  }, [query, selected]);
  function pick(hit: Hit) {
    setSelected(hit);
    setIndex(-1);
    setQuery(hit.title);
    setHits([]);
    setOpen(false);
    setSearching(false);
    onTyping(false);
  }
  return (
    <form
      className="desk"
      id="ask"
      onSubmit={(e) => {
        e.preventDefault();
        if (selected && question.trim()) onAsk(selected, question.trim());
        else {
          setError(
            !selected
              ? "Choose a title from the search results first."
              : "What would you like to know?",
          );
          box.current?.focus();
        }
      }}
    >
      <div className="desk-heading">
        <Icon name="book" />
        <span>A good question starts here.</span>
        <span className="desk-mode">
          {API_BASE ? "Live check" : "Record-only demo"}
        </span>
      </div>
      <div className="title-field">
        <label htmlFor="anime-title">Anime title</label>
        <div className="search-wrap">
          <Icon name="search" />
          <input
            id="anime-title"
            ref={box}
            role="combobox"
            aria-label="Anime title"
            aria-expanded={open}
            aria-controls="title-results"
            aria-autocomplete="list"
            aria-activedescendant={
              open && index >= 0 && hits[index]
                ? `hit-${hits[index]?.id}`
                : undefined
            }
            value={query}
            placeholder="Search any anime title…"
            autoComplete="off"
            disabled={busy}
            onFocus={() => {
              onTyping(true);
              if (hits.length) setOpen(true);
            }}
            onBlur={() => {
              onTyping(false);
              setTimeout(() => setOpen(false), 120);
            }}
            onChange={(e) => {
              setSelected(null);
              setQuery(e.target.value);
              setHits([]);
              setOpen(false);
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setOpen(false);
                return;
              }
              if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                e.preventDefault();
                setOpen(true);
                setIndex((p) =>
                  e.key === "ArrowDown"
                    ? Math.min(hits.length - 1, p + 1)
                    : Math.max(0, p - 1),
                );
              }
              if (e.key === "Enter" && open && index >= 0) {
                e.preventDefault();
                pick(hits[index]);
              }
            }}
          />
          {selected && (
            <span className="selection-check">
              <Icon name="check" size={16} />
            </span>
          )}
        </div>
        {open && (
          <ul
            className="search-results"
            id="title-results"
            role="listbox"
            aria-label="Matching anime titles"
          >
            {hits.length ? (
              hits.map((h, i) => (
                <li
                  key={h.id}
                  role="option"
                  aria-selected={index === i}
                  id={`hit-${h.id}`}
                  onPointerDown={(e) => e.preventDefault()}
                  onClick={() => pick(h)}
                >
                  <span>{h.title}</span>
                  <small>
                    {h.year ?? "Year unknown"} ? {h.format ?? "Anime"}
                  </small>
                </li>
              ))
            ) : (
              <li
                role="option"
                aria-selected={false}
                aria-disabled="true"
                className="no-results"
              >
                No titles found. Try another spelling.
              </li>
            )}
          </ul>
        )}
        <div className="search-status" role="status">
          {searching
            ? "Searching AniList…"
            : selected
              ? `${selected.year ?? "Year unknown"} · ${selected.format ?? "Anime"} · Title selected`
              : "Choose the exact title. Sequels have their own records."}
        </div>
      </div>
      <div className="question-field">
        <label htmlFor="question">Your question</label>
        <textarea
          id="question"
          aria-label="Your question"
          value={question}
          maxLength={200}
          disabled={busy}
          placeholder="Which studio made it? How many episodes? Anything you’re curious about."
          rows={3}
          onFocus={() => onTyping(true)}
          onBlur={() => onTyping(false)}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <div className="question-tools">
          <button
            type="button"
            className="text-button"
            disabled={busy}
            onClick={() =>
              setQuestion(
                "Which studio animated it and how many episodes does it have?",
              )
            }
          >
            Try a question <Icon size={14} />
          </button>
          <span>{question.length}/200</span>
        </div>
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button className="button primary" type="submit" disabled={busy}>
        {busy ? "Finding your answer…" : "Find my answer"}
        <Icon />
      </button>
      <p className="desk-note">
        {API_BASE
          ? "Seven fields can be checked: studio, episodes, start year, format, source, season and main characters. Other text stays unchecked."
          : "Demo: reads seven AniList fact fields only. No drafted answers; unmatched questions are not answered."}
      </p>
    </form>
  );
}
