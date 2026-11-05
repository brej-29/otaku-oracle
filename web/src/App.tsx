import { useEffect, useRef, useState } from "react";
import { ask, ApiError, type Answer, type Hit } from "./api";
import { Ask } from "./components/Ask";
import { Proof } from "./components/Proof";
import { Why } from "./components/Why";
import { How } from "./components/How";
import { Seal, SealDefs } from "./components/Seal";
import { HeroStamp } from "./components/HeroStamp";
import { Starters } from "./components/Starters";

type State = { s: "idle" } | { s: "loading"; slow: boolean } | { s: "done"; a: Answer } | { s: "error"; kind: string; msg: string };

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark" | null>(() => {
    try { const t = localStorage.getItem("oo-theme"); return t === "light" || t === "dark" ? t : null; } catch { return null; }
  });
  useEffect(() => {
    if (theme) document.documentElement.dataset.theme = theme; else delete document.documentElement.dataset.theme;
    try { theme ? localStorage.setItem("oo-theme", theme) : localStorage.removeItem("oo-theme"); } catch { /* storage may be blocked */ }
  }, [theme]);
  const dark = theme ? theme === "dark" : typeof matchMedia !== "undefined" && matchMedia("(prefers-color-scheme: dark)").matches;
  return { dark, toggle: () => setTheme(dark ? "light" : "dark") };
}

export default function App() {
  const [state, setState] = useState<State>({ s: "idle" });
  const [online, setOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);
  const { dark, toggle } = useTheme();
  const result = useRef<HTMLDivElement>(null);
  const ctl = useRef<AbortController | null>(null);
  const [preset, setPreset] = useState<{ hit: Hit; n: number } | null>(null);

  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false);
    addEventListener("online", on); addEventListener("offline", off);
    return () => { removeEventListener("online", on); removeEventListener("offline", off); };
  }, []);

  async function run(hit: Hit, question: string) {
    ctl.current?.abort();
    const c = (ctl.current = new AbortController());
    setState({ s: "loading", slow: false });
    const slow = setTimeout(() => setState((p) => (p.s === "loading" ? { s: "loading", slow: true } : p)), 4000);
    requestAnimationFrame(() => result.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    try {
      const a = await ask(hit.id, question, c.signal);
      setState({ s: "done", a });
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      const err = e as ApiError;
      setState({ s: "error", kind: err.kind ?? "upstream", msg: err.message });
    } finally { clearTimeout(slow); }
  }

  return (
    <>
      <SealDefs />
      <a className="skip" href="#ask">Skip to the question form</a>
      {!online && <p className="offline" role="status">You're offline. Nothing new loads until the connection returns.</p>}

      <header className="top wrap">
        <a className="brand" href="#top"><span className="brand__mark" aria-hidden="true"><Seal size={34} label="" /></span><span>Otaku Oracle</span></a>
        <nav aria-label="Sections">
          <a href="#ask">Ask</a><a href="#why">Why</a><a href="#how">How</a>
          <button type="button" className="theme" onClick={toggle} aria-pressed={dark}>{dark ? "Light paper" : "Dark paper"}</button>
        </nav>
      </header>

      <main id="top">
        <section className="hero wrap" aria-labelledby="hero-h">
          <div className="hero__title panel panel--tone">
            <HeroStamp />
            <h1 id="hero-h">Checked, then stamped.</h1>
            <p>Ask about any anime. Every fact in the answer is matched to its AniList record and stamped. Anything we couldn't match stays in pencil.</p>
          </div>
          <div className="hero__ask panel" id="ask">
            <Ask busy={state.s === "loading"} onSubmit={run} preset={preset} />
          </div>
        </section>

        <div className="wrap result" ref={result} tabIndex={-1}>
          {state.s === "loading" && (
            <div className="panel loading" role="status" aria-label="Checking the answer">
              <div className="skel skel--line" /><div className="skel skel--line" style={{ width: "78%" }} /><div className="skel skel--line" style={{ width: "62%" }} />
              <p className="fine">{state.slow ? "AniList is slow right now. Still trying." : "Fetching the record."}</p>
            </div>
          )}
          {state.s === "error" && (
            <div className="panel err" role="alert">
              <h2>{state.kind === "offline" ? "No connection" : state.kind === "rate" ? "Quota used up for now" : state.kind === "empty" ? "Nothing to check" : "That didn't work"}</h2>
              <p>{state.msg}</p>
              <p className="fine">{state.kind === "rate" ? "Nothing was stamped. Try again in about a minute." : "Nothing was stamped."}</p>
            </div>
          )}
          {state.s === "done" && <Proof answer={state.a} />}
          {state.s === "idle" && (
            <div className="panel idle"><p>Your checked answer appears here. Pick a title above, or tap an example question.</p></div>
          )}
        </div>

        <Starters onPick={(h) => { setPreset({ hit: h, n: Date.now() }); document.getElementById("ask")?.scrollIntoView({ behavior: "smooth", block: "center" }); }} />
        <Why />
        <How />
      </main>

      <footer className="foot wrap">
        <p>Facts come from <a href="https://anilist.co">AniList</a> and are checked at the moment you ask. Explanations are unchecked unless stamped.</p>
        <p><a href="https://github.com/brej-29/otaku-oracle">Source and evaluation on GitHub</a></p>
      </footer>
    </>
  );
}
