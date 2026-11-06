import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { CSSProperties, ReactNode, RefObject } from "react";
import { gait } from "./gait";
import {
  frameFor,
  loadMascotAsset,
  type AnimationName,
  type MascotAsset,
} from "./assets";
import type { Pose, WalkDrive } from "./types";
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
function angle(a: { x: number; y: number }, b: { x: number; y: number }) {
  return (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI - 90;
}
function Leg({ side }: { side: "left" | "right" }) {
  const front = side === "left";
  return (
    <g className={"leg-rig leg-" + side} data-contact="true">
      <g className="limb-segment thigh">
        <path
          d="M-8-3Q-10 11-7 29Q0 34 7 29L8-3Z"
          fill={front ? "#354758" : "#293544"}
          stroke="#241b29"
          strokeWidth="4"
        />
        <path d="M3 3 4 25" stroke="#496476" strokeWidth="2" />
      </g>
      <g className="limb-segment shin">
        <path
          d="M-6-2Q-9 11-5 29H5Q8 10 6-2Z"
          fill={front ? "#354758" : "#293544"}
          stroke="#241b29"
          strokeWidth="4"
        />
      </g>
      <g className="shoe-segment">
        <path
          d="M-8-2Q-3-6 5-2L10 3Q20 3 18 12H-10Q-13 6-8-2Z"
          fill="#fff0cf"
          stroke="#241b29"
          strokeWidth="4"
        />
        <path d="M7 2q9 0 10 6H8Z" fill="#c63c37" />
        <path d="M-9 9H17" stroke="#241b29" strokeWidth="3" />
        <path d="m-2 0 5 1" stroke="#b98c6b" strokeWidth="2" />
      </g>
    </g>
  );
}
function Builtin({ pose = "idle", drive }: Props) {
  const ref = useRef<SVGSVGElement>(null),
    motion = useContext(Motion),
    blend = useRef(0);
  useLayoutEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const root = svg.closest<HTMLElement>(".traveller")!;
    const upper = svg.querySelector<SVGGElement>(".traveller-body")!,
      leftArm = svg.querySelector<SVGGElement>(".courier-arm-left")!,
      rightArm = svg.querySelector<SVGGElement>(".courier-arm-right")!;
    const limbs = (["left", "right"] as const).map((side) => ({
      side,
      group: svg.querySelector<SVGGElement>(".leg-" + side)!,
      thigh: svg.querySelector<SVGGElement>(".leg-" + side + " .thigh")!,
      shin: svg.querySelector<SVGGElement>(".leg-" + side + " .shin")!,
      shoe: svg.querySelector<SVGGElement>(".leg-" + side + " .shoe-segment")!,
    }));
    let frame = 0,
      last = 0,
      scale = Math.max(0.1, root.clientWidth / 260);
    const size = new ResizeObserver(() => {
      scale = Math.max(0.1, root.clientWidth / 260);
    });
    size.observe(root);
    function paint(time: number) {
      const delta = last ? Math.min(40, time - last) : 16;
      last = time;
      const target =
        motion && pose === "walking" && drive?.current.moving ? 1 : 0;
      blend.current = motion
        ? blend.current + (target - blend.current) * (1 - Math.exp(-delta / 75))
        : 0;
      if (Math.abs(target - blend.current) < 0.002) blend.current = target;
      const g = gait(
        (drive?.current.position ?? 0) / scale,
        blend.current,
        drive?.current.slope ?? 0,
      );
      root.dataset.gaitPhase = g.phase.toFixed(5);
      root.dataset.gaitDistance = String(drive?.current.position ?? 0);
      upper.style.setProperty("--gait-bob", g.bob + "px");
      leftArm.style.transform = "rotate(" + g.leftArm + "deg)";
      rightArm.style.transform = "rotate(" + g.rightArm + "deg)";
      for (const item of limbs) {
        const leg = g[item.side];
        item.thigh.style.transform =
          "translate(" +
          leg.hip.x +
          "px," +
          leg.hip.y +
          "px) rotate(" +
          angle(leg.hip, leg.knee) +
          "deg)";
        item.shin.style.transform =
          "translate(" +
          leg.knee.x +
          "px," +
          leg.knee.y +
          "px) rotate(" +
          angle(leg.knee, leg.ankle) +
          "deg)";
        item.shoe.style.transform =
          "translate(" +
          leg.ankle.x +
          "px," +
          leg.ankle.y +
          "px) rotate(" +
          leg.angle +
          "deg)";
        item.group.dataset.contact = String(leg.stance);
        item.group.dataset.footX = String(leg.ankle.x);
        item.group.dataset.footY = String(leg.ankle.y);
      }
      if (motion && (target || blend.current))
        frame = requestAnimationFrame(paint);
    }
    paint(performance.now());
    return () => {
      cancelAnimationFrame(frame);
      size.disconnect();
    };
  }, [pose, motion, drive]);
  return (
    <svg
      ref={ref}
      viewBox="0 0 260 310"
      fill="none"
      className="courier-drawing"
    >
      <ellipse cx="133" cy="294" rx="64" ry="6" fill="#11101e" opacity=".22" />
      <g
        className="courier-root"
        stroke="#241b29"
        strokeWidth="5"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        <Leg side="right" />
        <Leg side="left" />
        <g className="traveller-body">
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

          <g className="courier-arm courier-arm-right">
            <path d="m157 158 21 10 18 39-18 11-18-37Z" fill="#b63536" />
            <path d="m178 209 9 18c6 9-6 19-14 11l-9-18" fill="#fff0cf" />
          </g>
          <g className="fox-torso">
            <path
              d="m95 155-4 45-3 38c20 12 55 13 79-1l-4-39-3-43Z"
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
          </g>
          <g className="courier-arm courier-arm-left">
            <path d="m95 158-21 11-12 38 20 9 18-35Z" fill="#d9503c" />
            <path d="m75 209-8 20c-2 9 12 17 19 8l5-17" fill="#fff0cf" />
            <path d="m72 204 14 6" stroke="#8d2c37" strokeWidth="4" />
          </g>
          <path d="m90 155 67 80" stroke="#26222d" strokeWidth="13" />
          <path d="m90 155 67 80" stroke="#d1a06d" strokeWidth="7" />
          <path d="m148 213 34-8 8 34-34 8Z" fill="#314d57" />
          <path d="m150 215 29-6 1 14-26 5Z" fill="#4e7273" />
          <path d="m160 224 6-2 2 5-6 2Z" fill="#efc872" strokeWidth="2" />
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
      </g>
      <g className="pose-spark" fill="#efc872" stroke="#241b29" strokeWidth="3">
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
  );
}
function Sprite({
  asset,
  pose,
  drive,
}: {
  asset: MascotAsset;
  pose: Pose;
  drive?: RefObject<WalkDrive>;
}) {
  const ref = useRef<HTMLDivElement>(null),
    image = useRef<HTMLImageElement>(null),
    motion = useContext(Motion);
  useLayoutEffect(() => {
    const element = ref.current,
      img = image.current;
    if (!element || !img) return;
    const root = element.closest<HTMLElement>(".traveller")!;
    let frame = 0,
      visible = true,
      start = 0,
      last = -1,
      w = 0,
      h = 0;
    function size() {
      h = (root.clientWidth * 310) / 260;
      w = (h * asset.frame.width) / asset.frame.height;
      element!.style.width = w + "px";
      element!.style.height = h + "px";
      element!.style.left = root.clientWidth * 0.5 - w * asset.anchor.x + "px";
      element!.style.top = h * 0.94516129 - h * asset.anchor.y + "px";
      element!.style.transformOrigin =
        asset.anchor.x * 100 + "% " + asset.anchor.y * 100 + "%";
      img!.style.width = w * asset.columns + "px";
      img!.style.height = h * asset.rows + "px";
      if (last >= 0)
        img!.style.transform =
          "translate3d(" +
          -(last % asset.columns) * w +
          "px," +
          -Math.floor(last / asset.columns) * h +
          "px,0)";
    }
    size();
    const resize = new ResizeObserver(size);
    resize.observe(root);
    function paint(time: number) {
      frame = 0;
      if (!visible) return;
      if (!start) start = time;
      const walk = pose === "walking" && !!drive?.current.moving;
      const name = names[pose === "walking" && !walk ? "idle" : pose];
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
        img!.style.transform =
          "translate3d(" +
          -(n % asset.columns) * w +
          "px," +
          -Math.floor(n / asset.columns) * h +
          "px,0)";
        root.dataset.spriteFrame = String(n);
      }
      const reverse =
        walk &&
        (drive?.current.direction ?? 1) === (asset.facing === "right" ? -1 : 1);
      element!.style.scale = reverse ? "-1 1" : "1 1";
      if (motion) frame = requestAnimationFrame(paint);
    }
    const observer = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !frame) frame = requestAnimationFrame(paint);
    });
    observer.observe(root);
    paint(performance.now());
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      observer.disconnect();
    };
  }, [asset, pose, drive, motion]);
  return (
    <div className="sprite-viewport" ref={ref}>
      <img
        ref={image}
        className="sprite-atlas"
        src={asset.image}
        alt=""
        draggable={false}
      />
    </div>
  );
}
export function Traveller({
  pose = "idle",
  className = "",
  style,
  drive,
}: Props) {
  const [asset, setAsset] = useState<MascotAsset | null>(null);
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
      className={"traveller " + className}
      data-pose={pose}
      data-renderer={asset ? "sprite" : "builtin"}
      style={style}
      aria-hidden="true"
    >
      {asset ? (
        <Sprite asset={asset} pose={pose} drive={drive} />
      ) : (
        <Builtin pose={pose} drive={drive} />
      )}
    </div>
  );
}
