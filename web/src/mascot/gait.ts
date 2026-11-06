import type { Point } from "./types";
export const STRIDE = 76;
const mod = (x: number) => ((x % 1) + 1) % 1;
const ease = (x: number) => x * x * (3 - 2 * x);
export function knee(hip: Point, ankle: Point, thigh = 28, shin = 29): Point {
  const dx = ankle.x - hip.x,
    dy = ankle.y - hip.y,
    d = Math.max(0.001, Math.min(thigh + shin - 0.001, Math.hypot(dx, dy)));
  const angle =
    Math.atan2(dy, dx) -
    Math.acos(
      Math.max(
        -1,
        Math.min(1, (thigh * thigh + d * d - shin * shin) / (2 * thigh * d)),
      ),
    );
  return {
    x: hip.x + Math.cos(angle) * thigh,
    y: hip.y + Math.sin(angle) * thigh,
  };
}
export function foot(phase: number, hipX: number, slope = 0) {
  const u = mod(phase),
    stance = 0.62,
    reach = (STRIDE * stance) / 2;
  const swing = u >= stance,
    t = swing ? (u - stance) / (1 - stance) : 0;
  const offset = swing ? -reach + ease(t) * reach * 2 : reach - u * STRIDE;
  const x = hipX + offset,
    y = 281 + slope * (x - 130) - (swing ? Math.sin(Math.PI * t) * 18 : 0);
  return {
    x,
    y,
    stance: !swing,
    angle:
      (Math.atan(slope) * 180) / Math.PI -
      (swing ? Math.sin(Math.PI * t) * 12 : 0),
  };
}
export function gait(distance: number, weight = 1, slope = 0) {
  const phase = mod(distance / STRIDE),
    bob = Math.sin(phase * Math.PI * 4) * 2 * weight;
  const leg = (hipX: number, offset: number, restX: number) => {
    const walking = foot(phase + offset, hipX, slope),
      hip = { x: hipX, y: 232 + bob };
    const ankle = {
      x: restX + (walking.x - restX) * weight,
      y: 281 + (walking.y - 281) * weight,
    };
    return {
      hip,
      knee: knee(hip, ankle),
      ankle,
      angle: walking.angle * weight,
      stance: walking.stance,
    };
  };
  return {
    phase,
    bob,
    left: leg(113, 0, 107),
    right: leg(145, 0.5, 150),
    leftArm: Math.cos(phase * Math.PI * 2) * 12 * weight,
    rightArm: -Math.cos(phase * Math.PI * 2) * 12 * weight,
  };
}
export function legLine(leg: ReturnType<typeof gait>["left"]) {
  return (
    "M" +
    leg.hip.x +
    " " +
    leg.hip.y +
    " Q" +
    (leg.hip.x + 2) +
    " " +
    (leg.hip.y + 12) +
    " " +
    leg.knee.x +
    " " +
    leg.knee.y +
    " Q" +
    (leg.knee.x - 1) +
    " " +
    (leg.knee.y + 12) +
    " " +
    leg.ankle.x +
    " " +
    leg.ankle.y
  );
}
export function shoePath(x: number, y: number) {
  return (
    "M" +
    (x - 8) +
    " " +
    (y - 2) +
    " Q" +
    (x - 3) +
    " " +
    (y - 6) +
    " " +
    (x + 5) +
    " " +
    (y - 2) +
    " L" +
    (x + 10) +
    " " +
    (y + 3) +
    " Q" +
    (x + 20) +
    " " +
    (y + 3) +
    " " +
    (x + 18) +
    " " +
    (y + 12) +
    " L" +
    (x - 10) +
    " " +
    (y + 12) +
    " Q" +
    (x - 13) +
    " " +
    (y + 6) +
    " " +
    (x - 8) +
    " " +
    (y - 2) +
    "Z"
  );
}
