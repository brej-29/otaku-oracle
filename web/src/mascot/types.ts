export type Pose =
  | "idle"
  | "walking"
  | "curious"
  | "thinking"
  | "happy"
  | "puzzled";
export type WalkDrive = {
  position: number;
  travel: number;
  velocity: number;
  direction: 1 | -1;
  moving: boolean;
  slope: number;
};
export const emptyDrive = (): WalkDrive => ({
  position: 0,
  travel: 0,
  velocity: 0,
  direction: 1,
  moving: false,
  slope: 0,
});
export type Point = { x: number; y: number };
