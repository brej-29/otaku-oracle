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
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path
        d="M24 2 44 14v20L24 46 4 34V14Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M8 25c7-12 25-12 32 0-7 12-25 12-32 0Z" fill="currentColor" />
      <path d="M24 17v16m-8-8h16" stroke="var(--paper)" strokeWidth="1.6" />
      <circle cx="24" cy="25" r="5" fill="var(--paper)" />
      <circle cx="24" cy="25" r="2" fill="currentColor" />
      <path d="m24 5 2 6-2 3-2-3Z" fill="currentColor" />
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
      className={`traveller ${className}`}
      data-pose={pose}
      style={style}
      aria-hidden="true"
    >
      <svg viewBox="0 0 120 150" fill="none">
        <ellipse
          cx="59"
          cy="139"
          rx="32"
          ry="5"
          fill="currentColor"
          opacity=".12"
        />
        <g className="traveller-body">
          <g className="legs">
            <path
              className="leg leg-a"
              d="m48 107-8 25 12 2"
              stroke="#282b24"
              strokeWidth="9"
              strokeLinecap="round"
            />
            <path
              className="leg leg-b"
              d="m68 107 8 25 12-1"
              stroke="#282b24"
              strokeWidth="9"
              strokeLinecap="round"
            />
          </g>
          <path
            d="M34 65c-6 12-8 33-13 47 15 9 47 10 71-2-7-17-9-35-18-45Z"
            fill="#bfc8a8"
          />
          <path d="m45 69-9 45c16 5 35 3 45-2L66 72" fill="#d6ddbe" />
          <path d="M75 64c14-5 24 5 23 17L86 96l-12-7Z" fill="#6a7457" />
          <path
            className="arm arm-a"
            d="m35 77-13 17"
            stroke="#272b25"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path
            className="arm arm-b"
            d="m80 77 14 14"
            stroke="#272b25"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <g className="head">
            <path
              d="M22 49C22 22 40 8 60 7c20 1 40 17 38 43l-8 24c-21 11-45 7-59-3Z"
              fill="#e5e7cf"
            />
            <path
              d="M35 50c3-17 42-19 49 0l-1 16c-13 9-32 9-47-2Z"
              fill="#282b25"
            />
            <g className="eyes">
              <ellipse cx="49" cy="54" rx="3" ry="5" fill="#fff8df" />
              <ellipse cx="70" cy="54" rx="3" ry="5" fill="#fff8df" />
            </g>
            <path
              className="brows"
              d="m44 44 9 2m12-1 10-4"
              stroke="#fff8df"
              strokeWidth="2"
            />
            <path d="M59 12C43-7 31 1 31 1c2 17 14 23 28 11Z" fill="#6b7856" />
            <path
              d="M60 12c14-15 24-10 24-10-3 12-10 17-24 10Z"
              fill="#98aa77"
            />
          </g>
          <path
            d="M30 69c16 8 38 8 58 1l1 10c-21 7-43 5-60-1Z"
            fill="#bb3b2b"
          />
          <path className="scarf" d="m82 76 30 10-4 10-29-17" fill="#ce4b36" />
          <path d="m45 83 32 22" stroke="#6d7559" strokeWidth="3" />
          <rect
            x="58"
            y="99"
            width="25"
            height="19"
            rx="4"
            transform="rotate(12 58 99)"
            fill="#6d7559"
          />
          <path d="m63 104 13 3" stroke="#dce2c7" strokeWidth="2" />
        </g>
        <g className="reaction">
          <path
            d="m15 18 3-9m81 9 8-4m-4 17h9"
            stroke="#b93e2d"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
        <g className="thought">
          <circle cx="98" cy="32" r="4" fill="#9ba886" />
          <circle cx="106" cy="18" r="6" fill="#bfc8a8" />
        </g>
      </svg>
    </div>
  );
}
const Tree = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M0 0c-10-80-2-132 1-179 8 60 12 122 6 180Z" fill="#242b25" />
    <path
      d="M1-85C-84-118-62-184-54-194c36 13 61 57 55 109ZM4-117c75-35 65-88 54-104-37 18-65 59-54 104ZM0-141C-41-179-29-223-15-241c25 30 39 64 15 100Z"
      fill="#303b30"
    />
    <path d="m-5-87-38-74m47 42 36-58" stroke="#778367" strokeWidth="1.2" />
  </g>
);
export function Landscape({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`landscape ${className}`}
      viewBox="0 0 3600 900"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <g className="far">
        <circle cx="830" cy="185" r="94" fill="#d5b58a" />
        <circle cx="2570" cy="220" r="150" fill="#bfc5a5" />
        <path
          d="M0 480C300 220 600 500 900 365S1400 160 1800 420s700-200 1000-40 500-120 800-40V900H0Z"
          fill="#c4c8ad"
        />
        <path
          d="M0 585C250 380 500 640 850 480s600 60 900-70 650 180 1000 55 530 45 850-40V900H0Z"
          fill="#9aa787"
        />
      </g>
      <g className="middle">
        <path
          d="M0 670C260 515 530 550 830 628s450-125 700-78 350 140 610 17 450-80 680-4 570-20 780-25V900H0Z"
          fill="#65775e"
        />
        <path
          d="M0 780c350-170 600-45 950-25s490-170 830-82 550-100 800-40 520-75 1020 50V900H0Z"
          fill="#303d30"
        />
        <path
          id="source-path"
          d="M-30 900C200 730 450 850 670 765S950 645 1160 730s230 26 360-47 270-105 430-22 360 140 535-22 450-8 570-28 300-95 580-8"
          stroke="#ded9bd"
          strokeWidth="62"
          fill="none"
        />
        <path
          d="M-30 900C200 730 450 850 670 765S950 645 1160 730s230 26 360-47 270-105 430-22 360 140 535-22 450-8 570-28 300-95 580-8"
          stroke="#bcb79e"
          strokeWidth="1"
          strokeDasharray="4 14"
          fill="none"
        />
        {[
          [130, 760, 1.1],
          [330, 680, 0.8],
          [1040, 735, 1.1],
          [1420, 638, 0.8],
          [1860, 677, 0.9],
          [2310, 680, 1.25],
          [2780, 680, 0.8],
          [3280, 665, 1.2],
        ].map(([x, y, s]) => (
          <Tree key={x} x={x} y={y} s={s} />
        ))}
        <g transform="translate(775 570)">
          <path d="M-35 0h70l-8-18h-55Z" fill="#b44832" />
          <path
            d="M-25 0v85M25 0v85M-35 22h70"
            stroke="#dbd5b6"
            strokeWidth="6"
          />
          <path d="M-10 45h20v40h-20Z" fill="#d4be8b" />
        </g>
        <g transform="translate(1990 560)">
          <path
            d="M-90 80V-15Q0-85 90-15V80M-65 80V-5Q0-47 65-5V80"
            stroke="#c9c5a7"
            strokeWidth="12"
            fill="none"
          />
          <path d="M-74 18h148" stroke="#c9c5a7" strokeWidth="7" />
        </g>
        <g transform="translate(2920 570) rotate(-9)">
          <path d="M-50-65h100v120H-50Z" fill="#f5edd7" />
          <path
            d="M-30-40h60m-60 16h40m-40 35h60m-60 12h60m-60 12h40"
            stroke="#6f775d"
            strokeWidth="3"
          />
          <circle cy="-2" r="13" stroke="#b44832" strokeWidth="3" fill="none" />
          <path d="m-7-2 5 5 10-10" stroke="#b44832" strokeWidth="2" />
        </g>
      </g>
      <g className="near">
        <path
          d="M0 900V840c150-40 250 40 380-15s280 30 380 75Zm1500 0c180-70 250-30 390 0Zm1000 0c140-100 230-30 350-10s300-20 750-90v100Z"
          fill="#202b25"
        />
        {[
          [30, 990, 1.8],
          [1210, 1040, 2.1],
          [2530, 990, 1.5],
          [3480, 950, 1.3],
        ].map(([x, y, s]) => (
          <Tree key={x} x={x} y={y} s={s} />
        ))}
        {Array.from({ length: 22 }, (_, i) => (
          <path
            key={i}
            d={`M${100 + i * 161} ${780 + (i % 4) * 23}q-8-28-14-35m14 35q15-28 20-24`}
            stroke="#a2aa86"
            strokeWidth="2"
            fill="none"
          />
        ))}
      </g>
      <g fill="#e8ddba">
        {Array.from({ length: 14 }, (_, i) => (
          <path
            key={i}
            d={`m${200 + i * 240} ${300 + (i % 3) * 75} 9-3-5 9-9 3Z`}
          />
        ))}
      </g>
    </svg>
  );
}
