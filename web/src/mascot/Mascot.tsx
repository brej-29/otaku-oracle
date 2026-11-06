import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { CSSProperties, ReactNode, RefObject } from "react";
import {
  cachedImage,
  frameFor,
  loadMascotAsset,
  type AnimationName,
  type MascotAsset,
} from "./assets";
import type { Pose, WalkDrive } from "./types";
export const COMPANION_NAME = "Musashi";
const Motion = createContext(true);
export function MascotMotion({
  enabled,
  children,
}: {
  enabled: boolean;
  children: ReactNode;
}) {
  return <Motion.Provider value={enabled}>{children}</Motion.Provider>;
}
type Props = {
  pose?: Pose;
  className?: string;
  style?: CSSProperties;
  drive?: RefObject<WalkDrive>;
};
const names: Record<Pose, AnimationName> = {
  idle: "idle",
  walking: "walk",
  curious: "look",
  thinking: "think",
  happy: "celebrate",
  puzzled: "puzzled",
};
function Builtin() {
  return (
    <svg viewBox="0 0 260 310" fill="none" className="wanderer-silhouette">
      <g fill="#354758" stroke="#241b29" strokeWidth="5" strokeLinejoin="round">
        <path d="M117 59q-20-15-7-25 10-6 19 4 10-15 23-7 12 12-8 29" />
        <circle cx="131" cy="83" r="25" />
        <path d="m114 106-29 29-14 65 26 9-5 79h34l7-70 10 70h35l-12-81 23-12-22-66-23-22Z" />
        <path d="m116 110 16 30 15-30" fill="#e9dfc6" />
        <path d="m88 183 77-3 4 15-80 7Z" fill="#d5ac5c" />
        <path d="m73 209 115-37 4 10-115 36Z" />
        <path d="M90 288h39v12H83Zm51 0h36l12 12h-46Z" fill="#e9dfc6" />
      </g>
    </svg>
  );
}
function useHeroAction(
  ref: RefObject<HTMLDivElement | null>,
  hero: boolean,
  motion: boolean,
) {
  const [action, setAction] = useState<AnimationName>("idle"),
    [direction, setDirection] = useState<1 | -1>(1);
  useEffect(() => {
    const e = ref.current;
    if (!hero || !motion || !e) {
      setAction("idle");
      return;
    }
    let visible = false,
      elapsed = 0,
      last = performance.now(),
      lastPointer = 0;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      e.dataset.idleActive = String(visible && !document.hidden);
      last = performance.now();
      if (!visible) setAction("idle");
    });
    observer.observe(e);
    const interval = setInterval(() => {
      const now = performance.now();
      if (document.hidden || !visible) {
        e.dataset.idleActive = "false";
        last = now;
        return;
      }
      e.dataset.idleActive = "true";
      elapsed += Math.min(500, now - last);
      last = now;
      const seconds = (elapsed / 1000) % 26;
      setAction(
        seconds > 23 && seconds < 24.1
          ? "celebrate"
          : seconds > 14 && seconds < 15.5
            ? "think"
            : seconds > 7 && seconds < 8.5
              ? "look"
              : "idle",
      );
    }, 400);
    const pointer = (event: PointerEvent) => {
      if (
        !visible ||
        document.hidden ||
        event.pointerType !== "mouse" ||
        performance.now() - lastPointer < 350
      )
        return;
      lastPointer = performance.now();
      setDirection(
        event.clientX < e.getBoundingClientRect().left + e.clientWidth / 2
          ? -1
          : 1,
      );
    };
    const tabVisibility = () => {
      e.dataset.idleActive = String(visible && !document.hidden);
      last = performance.now();
      if (document.hidden) setAction("idle");
    };
    document.addEventListener("visibilitychange", tabVisibility);
    addEventListener("pointermove", pointer, { passive: true });
    return () => {
      clearInterval(interval);
      observer.disconnect();
      removeEventListener("pointermove", pointer);
      document.removeEventListener("visibilitychange", tabVisibility);
    };
  }, [hero, motion, ref]);
  return { action, direction };
}
function Sprite({
  asset,
  pose,
  drive,
  animation,
  direction,
  onFailure,
}: {
  asset: MascotAsset;
  pose: Pose;
  drive?: RefObject<WalkDrive>;
  animation?: AnimationName;
  direction?: 1 | -1;
  onFailure: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null),
    canvas = useRef<HTMLCanvasElement>(null),
    motion = useContext(Motion);
  useLayoutEffect(() => {
    const element = ref.current,
      c = canvas.current;
    if (!element || !c) return;
    const context = c.getContext("2d");
    if (!context) {
      onFailure();
      return;
    }
    const root = element.closest<HTMLElement>(".traveller")!;
    const existing = cachedImage(asset),
      atlas = existing ?? new Image();
    let frame = 0,
      visible = true,
      ready = !!existing,
      disposed = false,
      start = 0,
      last = -1,
      w = 0,
      h = 0;
    function draw(n: number) {
      if (!ready || disposed) return;
      context!.clearRect(0, 0, c!.width, c!.height);
      context!.drawImage(
        atlas,
        (n % asset.columns) * asset.frame.width,
        Math.floor(n / asset.columns) * asset.frame.height,
        asset.frame.width,
        asset.frame.height,
        0,
        0,
        c!.width,
        c!.height,
      );
    }
    function size() {
      h = (root.clientWidth * 310) / 260;
      w = (h * asset.frame.width) / asset.frame.height;
      element!.style.width = w + "px";
      element!.style.height = h + "px";
      element!.style.left = root.clientWidth * 0.5 - w * asset.anchor.x + "px";
      element!.style.top = h * 0.94516129 - h * asset.anchor.y + "px";
      element!.style.transformOrigin =
        asset.anchor.x * 100 + "% " + asset.anchor.y * 100 + "%";
      c!.width = Math.max(1, Math.round(w * Math.min(devicePixelRatio, 2)));
      c!.height = Math.max(1, Math.round(h * Math.min(devicePixelRatio, 2)));
      if (last >= 0) draw(last);
    }
    function paint(time: number) {
      frame = 0;
      if (!visible || !ready || disposed) return;
      if (!start) start = time;
      const walk = pose === "walking" && !!drive?.current.moving;
      const name =
        animation ?? names[pose === "walking" && !walk ? "idle" : pose];
      const n = frameFor(
        asset,
        name,
        time - start,
        drive?.current.travel ?? 0,
        h / asset.frame.height,
        motion,
      );
      if (n !== last) {
        last = n;
        draw(n);
        root.dataset.spriteFrame = String(n);
      }
      const reverse =
        (walk ? (drive?.current.direction ?? 1) : (direction ?? 1)) ===
        (asset.facing === "right" ? -1 : 1);
      element!.style.scale = reverse ? "-1 1" : "1 1";
      const a = asset.animations[name];
      if (
        motion &&
        !document.hidden &&
        (walk ||
          (a.frames.length > 1 &&
            (a.loop || time - start < (a.frames.length / a.fps) * 1000)))
      )
        frame = requestAnimationFrame(paint);
    }
    size();
    const resize = new ResizeObserver(size);
    resize.observe(root);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !frame) frame = requestAnimationFrame(paint);
    });
    observer.observe(root);
    const visibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else if (visible && !frame) frame = requestAnimationFrame(paint);
    };
    document.addEventListener("visibilitychange", visibility);
    if (existing) paint(performance.now());
    else {
      atlas.onload = () => {
        if (disposed) return;
        ready = true;
        paint(performance.now());
      };
      atlas.onerror = () => {
        if (!disposed) onFailure();
      };
      atlas.src = asset.image;
    }
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [asset, pose, drive, motion, animation, direction, onFailure]);
  return (
    <div className="sprite-viewport" ref={ref}>
      <canvas ref={canvas} className="sprite-atlas sprite-frame" />
    </div>
  );
}
export function Traveller({
  pose = "idle",
  className = "",
  style,
  drive,
}: Props) {
  const [asset, setAsset] = useState<MascotAsset | null>(null),
    ref = useRef<HTMLDivElement>(null),
    motion = useContext(Motion);
  const fallback = useCallback(() => setAsset(null), []);
  const hero = className.split(" ").includes("hero-courier");
  const activity = useHeroAction(ref, hero, motion);
  const animation = !motion
    ? "idle"
    : hero && pose === "idle"
      ? activity.action
      : hero && pose === "curious"
        ? "puzzled"
        : undefined;
  useEffect(() => {
    let live = true;
    loadMascotAsset().then((a) => {
      if (live) setAsset(a);
    });
    return () => {
      live = false;
    };
  }, []);
  return (
    <div
      ref={ref}
      className={"traveller " + className}
      data-pose={pose}
      data-action={animation ?? names[pose]}
      data-renderer={asset ? "sprite" : "builtin"}
      style={style}
      aria-hidden="true"
    >
      {asset ? (
        <Sprite
          asset={asset}
          pose={pose}
          drive={drive}
          animation={animation}
          direction={activity.direction}
          onFailure={fallback}
        />
      ) : (
        <Builtin />
      )}
    </div>
  );
}
