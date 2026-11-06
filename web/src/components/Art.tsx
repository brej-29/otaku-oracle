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
export type Pose =
  | "idle"
  | "walking"
  | "curious"
  | "thinking"
  | "happy"
  | "puzzled";
const legs = [
  [
    "M101 234 97 266 84 281 107 283 121 265 122 235",
    "M139 236 152 263 169 267 171 282 148 282 127 259",
  ],
  [
    "M102 235 110 261 103 280 125 280 131 261 124 235",
    "M141 236 142 258 154 278 173 278 165 258 152 232",
  ],
  [
    "M104 236 119 254 120 277 139 277 138 254 124 234",
    "M141 236 129 258 132 280 153 280 150 257 151 233",
  ],
  [
    "M103 235 123 257 142 269 135 283 117 275 105 255",
    "M141 234 118 261 107 283 128 283 142 264 154 238",
  ],
  [
    "M103 234 120 258 138 270 132 283 112 274 100 254",
    "M143 235 135 267 120 281 143 283 155 264 156 235",
  ],
  [
    "M103 234 108 258 119 280 139 280 132 258 123 235",
    "M143 235 151 260 143 280 165 280 172 260 160 235",
  ],
  [
    "M105 235 95 258 99 280 120 280 116 258 126 235",
    "M141 236 155 254 156 277 175 277 174 254 155 234",
  ],
  [
    "M103 234 88 263 75 278 97 283 115 265 124 236",
    "M142 235 148 258 165 272 159 284 140 274 128 254",
  ],
];
export function Traveller({
  pose = "idle",
  className = "",
  style,
}: {
  pose?: Pose;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={"traveller " + className}
      data-pose={pose}
      style={style}
      aria-hidden="true"
    >
      <svg viewBox="0 0 260 310" fill="none" className="courier-drawing">
        <ellipse
          cx="133"
          cy="294"
          rx="77"
          ry="9"
          fill="#11101e"
          opacity=".22"
        />
        <g
          className="traveller-body"
          stroke="#241b29"
          strokeWidth="5"
          strokeLinejoin="round"
          strokeLinecap="round"
        >
          <g className="fox-tail">
            <path
              d="M175 223c65 16 78-19 60-54-1 24-21 6-30 19-11-5-23 5-30 16Z"
              fill="#e25c35"
            />
            <path
              d="M222 202c10-3 13-15 13-33 11 18 11 36-2 48l-17-8Z"
              fill="#fff0cf"
            />
          </g>
          {legs.map((l, i) => (
            <g className={"walk-frame frame-" + i} key={i}>
              <path d={l[1]} fill="#2b3242" />
              <path d={l[0]} fill="#354758" />
              <path
                d={
                  i % 4 === 0
                    ? "m84 277 22-1 4 8-1 6H82l-4-6Z"
                    : i % 4 === 1
                      ? "m105 274 21-1 5 12-2 5h-28l-1-7Z"
                      : i % 4 === 2
                        ? "m121 272 19-1 8 13-3 6h-27l-1-7Z"
                        : "m117 272 18 3 7 10-5 6-27-6 1-8Z"
                }
                fill="#fff0cf"
              />
              <path
                d={
                  i % 4 === 0
                    ? "m148 277 21-3 7 9-1 7h-28l-3-7Z"
                    : i % 4 === 1
                      ? "m154 272 18 2 8 10-3 6h-28l-1-7Z"
                      : i % 4 === 2
                        ? "m133 276 21-1 5 10-2 6h-28l-1-8Z"
                        : "m108 278 20-3 6 10-3 6h-28l-1-7Z"
                }
                fill="#fff0cf"
              />
            </g>
          ))}
          <g className="fox-torso">
            <path
              d="m95 155-24 16-11 44 19 9 12-22-3 36c20 12 55 13 79-1l-4-36 13 21 21-9-20-47-26-12Z"
              fill="#c63c37"
            />
            <path
              d="m97 161-7 65 17 7 12-63m21-5 12 67 15-7-7-63"
              fill="#e66b48"
              stroke="none"
            />
            <path d="m112 153 14 24 19-25" fill="#fff0cf" />
            <path d="m125 177 1 64" stroke="#842a36" strokeWidth="4" />
            <path
              d="m92 210 20 1-2 15-20-4m50-10 19-4 2 15-19 4"
              fill="#9a2c38"
            />
            <path
              d="m76 211-9 18c-2 9 12 17 19 8l5-17m87-12 9 17c6 9-6 19-14 11l-9-18"
              fill="#fff0cf"
            />
            <path d="m90 155 67 80" stroke="#26222d" strokeWidth="13" />
            <path d="m90 155 67 80" stroke="#d1a06d" strokeWidth="7" />
            <path d="m148 213 34-8 8 34-34 8Z" fill="#314d57" />
            <path d="m150 215 29-6 1 14-26 5Z" fill="#4e7273" />
            <path d="m160 224 6-2 2 5-6 2Z" fill="#efc872" strokeWidth="2" />
          </g>
          <g className="fox-head">
            <path
              d="M85 86C53 73 49 32 62 12l47 47m40 2 46-43c16 31 8 61-18 73"
              fill="#df653f"
            />
            <path
              d="M77 65 64 29c-3 17 2 32 13 43m84-6 30-31c2 13-4 26-18 39"
              fill="#6d3948"
              strokeWidth="3"
            />
            <path
              d="M72 94c-3-34 26-57 59-55 36 2 59 26 60 58l16 16-21 8c-9 25-29 39-58 39-31 0-51-16-60-39l-18-10Z"
              fill="#e97548"
            />
            <path
              d="m79 96 26-2 22 18 20-18 34 2 10 24c-13 28-32 38-64 38-26 0-49-13-58-37Z"
              fill="#fff0cf"
            />
            <path d="m106 43 15-18 5 14 17-13 2 18" fill="#e97548" />
            <path
              d="M100 54q26-20 48 1l-14 10-7-10-12 10Z"
              fill="#354758"
              strokeWidth="3"
            />
            <path d="m77 133 13 3m80-3-13 3" stroke="#d77964" strokeWidth="2" />
            <path
              d="M82 143q46 26 91-1-20 21-46 18-30 1-45-17Z"
              fill="#efcea5"
              stroke="none"
            />
            <path
              d="m83 84 18-6m51 1 19 7"
              className="fox-brows"
              strokeWidth="5"
            />
            <g className="fox-eyes">
              <ellipse
                cx="100"
                cy="101"
                rx="11"
                ry="16"
                fill="#fffdf1"
                strokeWidth="3"
              />
              <ellipse
                cx="156"
                cy="101"
                rx="11"
                ry="16"
                fill="#fffdf1"
                strokeWidth="3"
              />
              <g className="fox-pupils" fill="#302532" strokeWidth="2">
                <ellipse cx="102" cy="103" rx="6" ry="10" />
                <ellipse cx="154" cy="103" rx="6" ry="10" />
                <circle cx="104" cy="99" r="2.5" fill="#fffdf1" stroke="none" />
                <circle cx="156" cy="99" r="2.5" fill="#fffdf1" stroke="none" />
              </g>
            </g>
            <path d="m120 119 8 5 8-5-8-3Z" fill="#302532" strokeWidth="3" />
            <path
              d={
                pose === "happy"
                  ? "M114 130q14 28 30 0Z"
                  : pose === "puzzled"
                    ? "M119 137q9-8 18 0"
                    : pose === "thinking"
                      ? "M122 135h12"
                      : "M115 133q13 15 27-1"
              }
              className="fox-mouth"
              strokeWidth="3"
              fill={pose === "happy" ? "#6d3948" : "none"}
            />
            <path d="m83 121 12 2m65 0 13-2" stroke="#d77964" strokeWidth="5" />
            <path d="m178 75 14 4-4 13-14-4Z" fill="#efc872" strokeWidth="3" />
            <path d="m181 78 6 2-2 7-6-2Z" fill="#c63c37" stroke="none" />
          </g>
          <g className="fox-scarf">
            <path d="m91 150 36 11 37-13-6 17-31 10-37-11Z" fill="#efc872" />
            <path d="m154 159 39-5 17 17-21-2-3 16-32-19Z" fill="#efc872" />
            <path d="m164 161 24 4" stroke="#bc793d" strokeWidth="3" />
          </g>
        </g>
        <g
          className="pose-spark"
          fill="#efc872"
          stroke="#241b29"
          strokeWidth="3"
        >
          <path d="m213 73 3-13 7 10 11 1-9 8 1 12-10-7-11 3Z" />
        </g>
        <g
          className="thinking-orbit"
          fill="#fff0cf"
          stroke="#241b29"
          strokeWidth="3"
        >
          <circle cx="210" cy="112" r="5" />
          <circle cx="223" cy="92" r="8" />
          <path d="m218 56 14-4 7 7-4 8-9 5m1 9h.1" strokeWidth="4" />
        </g>
      </svg>
      <span className="mascot-shadow" />
    </div>
  );
}
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
