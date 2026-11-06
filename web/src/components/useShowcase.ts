import { useEffect, useRef, useState } from "react";
import {
  fallbackTitles,
  initialShowcase,
  loadShowcase,
  shuffled,
  TitleDeck,
  type ShowcaseTitle,
} from "../showcase";
export function useShowcase(motion: boolean) {
  const initial = useRef<ShowcaseTitle[] | null>(null);
  if (!initial.current) initial.current = initialShowcase();
  const [cards, setCards] = useState(() =>
    shuffled(initial.current ?? fallbackTitles).slice(0, 3),
  );
  const [pool, setPool] = useState(initial.current),
    [phase, setPhase] = useState("rest"),
    [hover, setHover] = useState(false),
    [focused, setFocused] = useState(false),
    [visible, setVisible] = useState(true);
  const stack = useRef<HTMLDivElement>(null),
    current = useRef(cards),
    deck = useRef<TitleDeck | null>(null),
    busy = useRef(false),
    enabled = useRef(motion),
    paused = useRef(false),
    timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  if (!deck.current) deck.current = new TitleDeck(initial.current, cards);
  current.current = cards;
  enabled.current = motion;
  paused.current = hover || focused || !visible;
  useEffect(() => {
    let live = true;
    loadShowcase().then((items) => {
      if (live) {
        setPool(items);
        deck.current?.update(items, current.current);
      }
    });
    return () => {
      live = false;
    };
  }, []);
  useEffect(() => {
    const e = stack.current;
    if (!e) return;
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting),
    );
    observer.observe(e);
    const visibility = () =>
      setVisible(
        document.visibilityState === "visible" &&
          e.getBoundingClientRect().bottom > 0,
      );
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  useEffect(() => {
    if (!motion || hover || focused || !visible) return;
    const rotate = () => {
      if (busy.current || paused.current || !enabled.current) return;
      const next = deck.current?.next(current.current);
      if (!next) return;
      busy.current = true;
      // Preload the arriving cover, with a finite wait and a readable image-error state.
      const preload = next.cover
        ? new Promise<void>((resolve) => {
            const image = new Image();
            let done = false;
            const finish = () => {
              if (!done) {
                done = true;
                resolve();
              }
            };
            image.onload = finish;
            image.onerror = finish;
            image.src = next.cover!;
            setTimeout(finish, 1800);
          })
        : Promise.resolve();
      preload.then(() => {
        if (!enabled.current || paused.current) {
          busy.current = false;
          return;
        }
        setPhase("leaving");
        timeout.current = setTimeout(() => {
          if (!enabled.current) {
            setPhase("rest");
            busy.current = false;
            return;
          }
          setCards((previous) => [previous[1], previous[2], next]);
          setPhase("arriving");
          timeout.current = setTimeout(() => {
            setPhase("rest");
            busy.current = false;
          }, 850);
        }, 420);
      });
    };
    const interval = setInterval(rotate, 4800);
    return () => clearInterval(interval);
  }, [motion, hover, focused, visible]);
  useEffect(() => {
    if (!motion) {
      clearTimeout(timeout.current);
      setPhase("rest");
      busy.current = false;
    }
  }, [motion]);
  useEffect(() => {
    enabled.current = motion;
    return () => {
      enabled.current = false;
      clearTimeout(timeout.current);
    };
  }, [motion]);
  return {
    cards,
    pool,
    phase,
    stack,
    setHover,
    setFocused,
    paused: hover || focused || !motion,
  };
}
