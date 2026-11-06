import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
export function Icon({
  name = "arrow",
  size = 20,
}: {
  name?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {name === "check" ? (
        <path d="m5 12 4 4L19 6" />
      ) : name === "close" ? (
        <path d="m6 6 12 12M18 6 6 18" />
      ) : name === "pause" ? (
        <path d="M8 5v14M16 5v14" />
      ) : name === "play" ? (
        <path d="m8 5 11 7-11 7Z" />
      ) : name === "search" ? (
        <>
          <circle cx="10" cy="10" r="6" />
          <path d="m15 15 5 5" />
        </>
      ) : name === "sun" ? (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1" />
        </>
      ) : name === "book" ? (
        <>
          <path d="M12 5C8 2 3 4 3 4v15s5-2 9 1c4-3 9-1 9-1V4s-5-2-9 1ZM12 5v15" />
        </>
      ) : name === "copy" ? (
        <>
          <rect x="8" y="8" width="12" height="12" rx="2" />
          <path d="M15 8V4H4v11h4" />
        </>
      ) : name === "info" ? (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v6m0-10v.2" />
        </>
      ) : (
        <path d="M4 12h15m-6-6 6 6-6 6" />
      )}
    </svg>
  );
}

export function Logo() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" fill="none">
      <path d="M8 9 25 19 39 19 56 9 52 40 32 56 12 40Z" fill="currentColor" />
      <path
        d="m15 21 13 9-7 9 11 9 11-9-7-9 13-9-3 16-14 13-14-13Z"
        fill="var(--paper)"
      />
      <path
        d="m21 30 7 3m8 0 7-3"
        stroke="var(--paper)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="m28 40 4 3 4-3" stroke="currentColor" strokeWidth="3" />
      <path d="m31 4 2 8 6 3-7 3-6-3 5-3Z" fill="var(--red)" />
    </svg>
  );
}
export { Traveller, MascotMotion } from "../mascot/Mascot";
export type { Pose } from "../mascot/types";
export function World({ motion = true }: { motion?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;
    let frame = 0,
      visible = true;
    const dots = Array.from({ length: 40 }, (_, i) => ({
      x: ((i * 73) % 997) / 997,
      y: ((i * 97) % 881) / 881,
      r: 1 + (i % 3),
      speed: 0.000015 + (i % 5) * 0.000005,
    }));
    function size() {
      el!.width = Math.round(innerWidth * Math.min(devicePixelRatio, 1.5));
      el!.height = Math.round(innerHeight * Math.min(devicePixelRatio, 1.5));
    }
    size();
    addEventListener("resize", size);
    let last = 0;
    function paint(t: number) {
      frame = 0;
      if (!visible) return;
      if (t - last < 32) {
        frame = requestAnimationFrame(paint);
        return;
      }
      last = t;
      ctx!.clearRect(0, 0, el!.width, el!.height);
      for (const d of dots) {
        const x = (((d.x + t * d.speed) % 1.2) - 0.1) * el!.width,
          y = ((((d.y - t * d.speed * 0.4) % 1) + 1) % 1) * el!.height;
        ctx!.save();
        ctx!.translate(x, y);
        ctx!.rotate(t * 0.0002 + d.x);
        ctx!.fillStyle = d.r === 1 ? "#f6c16c99" : "#ed735fbb";
        ctx!.beginPath();
        ctx!.ellipse(0, 0, d.r * 2, d.r, 0.4, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.restore();
      }
      if (motion) frame = requestAnimationFrame(paint);
    }
    const observer = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && motion && !frame) frame = requestAnimationFrame(paint);
    });
    observer.observe(el);
    paint(0);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      removeEventListener("resize", size);
    };
  }, [motion]);
  return (
    <div className="world" aria-hidden="true">
      <div className="dusk-sky" />
      <div className="moon">
        <span />
      </div>
      <svg className="cloud-layer cloud-back" viewBox="0 0 1600 300">
        <path
          d="M-100 130c190-150 310-10 450-50s260-100 450-30 260-20 450 10 190 40 340 0v70H-100Z"
          fill="#bc6e7570"
        />
        <path
          d="M-100 230c190-150 310-10 450-50s260-100 450-30 260-20 450 10 190 40 340 0v70H-100Z"
          fill="#e5aa8a40"
        />
      </svg>
      <svg
        className="far-scenery"
        viewBox="0 0 2400 800"
        preserveAspectRatio="none"
      >
        <path
          d="M0 540 210 340 350 450 650 150 830 330 1060 240 1360 520 1570 270 1710 400 1930 120 2200 450 2400 300V800H0Z"
          fill="#66405b"
        />
        <path
          d="m650 150-100 190 100-57 75 65 105-18Zm1280-30-87 192 96-60 74 79 84-8Z"
          fill="#c98b9170"
        />
        <path
          d="M0 690 300 520 500 600 780 440 1120 650 1430 480 1800 620 2150 420 2400 600V800H0Z"
          fill="#352b49"
        />
      </svg>
      <svg
        className="city-layer"
        viewBox="0 0 2400 700"
        preserveAspectRatio="none"
      >
        <g fill="#211e32">
          <path d="M0 400h100V250h100v160h80V300h120v100h140V270h70V80h160v210h90v180h130v-90h100V250h100v160h80V300h120v100h140V270h70V80h160v210h90v180h130v-90h100V250h100v160h80V300h120v400H0Z" />
          <path d="m570 93 120-60 120 60-30 19H600Zm-35 215 155-65 154 65-28 20H563Zm830-215 120-60 120 60-30 19h-180Zm-35 215 155-65 154 65-28 20h-253Z" />
        </g>
        <g fill="#efb86c">
          {Array.from({ length: 32 }, (_, i) => (
            <rect
              key={i}
              x={70 + i * 73}
              y={360 + (i % 3) * 50}
              width={9}
              height={17}
              opacity={0.35 + (i % 3) * 0.2}
            />
          ))}
        </g>
        <path d="M0 630q600-140 1200-30t1200-50v150H0Z" fill="#171c2b" />
        <path
          className="world-ground"
          d="M0 650q600-140 1200-30t1200-50"
          stroke="#b66c65"
          strokeWidth="8"
        />
      </svg>
      <div className="cloud-front" />
      <div className="lantern-string">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <div
            className="hanging-lantern"
            key={i}
            style={{ "--i": i } as CSSProperties}
          >
            <span />
            <b />
            <i />
          </div>
        ))}
      </div>
      <svg className="festival-gate" viewBox="0 0 400 430">
        <path
          d="M58 80 43 430h36L99 88m204 0 18 342h36L342 80"
          fill="#963942"
          stroke="#241b32"
          strokeWidth="9"
        />
        <path
          d="M10 50q190 44 380 0l-9 35q-181 33-362 0Z"
          fill="#c95e50"
          stroke="#241b32"
          strokeWidth="9"
        />
        <path
          d="M38 135h324v26H38Z"
          fill="#c95e50"
          stroke="#241b32"
          strokeWidth="9"
        />
        <path
          d="M189 87h22v49h-22Z"
          fill="#efbd78"
          stroke="#241b32"
          strokeWidth="7"
        />
        <path d="M75 101h18m214 0h20" stroke="#eb9d72" strokeWidth="5" />
        <path
          d="M95 188q105 60 210 0"
          stroke="#e7b985"
          strokeWidth="5"
          fill="none"
        />
        <path
          d="m135 213-6 15 11 11-11 13m72-28-6 15 11 11-11 13m65-47-6 15 11 11-11 13"
          stroke="#f4e0c1"
          strokeWidth="9"
          fill="none"
        />
      </svg>
      <canvas ref={canvas} className="embers" />
      <div className="speed-lines" />
    </div>
  );
}
