const decodedImages = new WeakMap<MascotAsset, HTMLImageElement>();
export function cachedImage(asset: MascotAsset) {
  return decodedImages.get(asset);
}
export const ANIMATIONS = [
  "walk",
  "idle",
  "look",
  "think",
  "celebrate",
  "puzzled",
] as const;
export type AnimationName = (typeof ANIMATIONS)[number];
export type Animation = { frames: number[]; fps: number; loop: boolean };
export type MascotAsset = {
  version: 1;
  image: string;
  frame: { width: number; height: number };
  columns: number;
  rows: number;
  anchor: { x: number; y: number };
  facing: "right" | "left";
  walkStride: number;
  animations: Record<AnimationName, Animation>;
};
export function validateAsset(
  value: unknown,
  base = "http://localhost/mascot/",
): MascotAsset | null {
  const m = value as MascotAsset;
  if (!m || m.version !== 1 || ("enabled" in m && m.enabled === false))
    return null;
  const integer = (n: unknown, min: number, max: number) =>
    typeof n === "number" && Number.isInteger(n) && n >= min && n <= max;
  if (
    !integer(m.frame?.width, 16, 1024) ||
    !integer(m.frame?.height, 16, 1024) ||
    !integer(m.columns, 1, 32) ||
    !integer(m.rows, 1, 32) ||
    m.frame.width * m.columns > 4096 ||
    m.frame.height * m.rows > 4096 ||
    m.frame.width * m.columns * m.frame.height * m.rows > 8000000
  )
    return null;
  if (
    !m.anchor ||
    ![m.anchor.x, m.anchor.y].every(
      (n) => Number.isFinite(n) && n >= 0 && n <= 1,
    ) ||
    !["left", "right"].includes(m.facing) ||
    !Number.isFinite(m.walkStride) ||
    m.walkStride < 8 ||
    m.walkStride > 1024
  )
    return null;
  if (typeof m.image !== "string" || !m.animations) return null;
  try {
    const u = new URL(m.image, base),
      b = new URL(base);
    if (
      u.origin !== b.origin ||
      !u.pathname.startsWith(b.pathname) ||
      !/^.*\.(png|webp)$/i.test(u.pathname) ||
      u.search ||
      u.hash
    )
      return null;
    m.image = u.href;
  } catch {
    return null;
  }
  for (const key of ANIMATIONS) {
    const a = m.animations[key];
    if (
      !a ||
      !Array.isArray(a.frames) ||
      !a.frames.length ||
      a.frames.length > 128 ||
      !a.frames.every((n) => integer(n, 0, m.columns * m.rows - 1)) ||
      !Number.isFinite(a.fps) ||
      a.fps < 1 ||
      a.fps > 60 ||
      typeof a.loop !== "boolean"
    )
      return null;
  }
  return m;
}
let loaded: Promise<MascotAsset | null> | undefined;
export function loadMascotAsset(): Promise<MascotAsset | null> {
  if (loaded) return loaded;
  loaded = (async () => {
    try {
      const base = new URL(
        import.meta.env.BASE_URL + "mascot/",
        location.origin,
      ).href;
      const response = await fetch(new URL("manifest.json", base), {
        signal: AbortSignal.timeout(4000),
        cache: "no-cache",
      });
      if (!response.ok) return null;
      const text = await response.text();
      if (text.length > 65536) return null;
      const asset = validateAsset(JSON.parse(text), base);
      if (!asset) return null;
      const valid = await new Promise<boolean>((resolve) => {
        const img = new Image();
        const timer = setTimeout(() => resolve(false), 12000);
        img.onload = () => {
          clearTimeout(timer);
          if (
            img.naturalWidth === asset.columns * asset.frame.width &&
            img.naturalHeight === asset.rows * asset.frame.height
          )
            decodedImages.set(asset, img);
          resolve(
            img.naturalWidth === asset.columns * asset.frame.width &&
              img.naturalHeight === asset.rows * asset.frame.height,
          );
        };
        img.onerror = () => {
          clearTimeout(timer);
          resolve(false);
        };
        img.src = asset.image;
      });
      return valid ? asset : null;
    } catch {
      return null;
    }
  })();
  return loaded;
}
export function frameFor(
  asset: MascotAsset,
  name: AnimationName,
  elapsed: number,
  distance: number,
  displayScale: number,
  motion: boolean,
) {
  if (!motion) return asset.animations.idle.frames[0];
  const a = asset.animations[name];
  const n =
    name === "walk"
      ? Math.floor(
          ((distance / (asset.walkStride * Math.max(0.01, displayScale))) % 1) *
            a.frames.length,
        )
      : Math.floor((elapsed / 1000) * a.fps);
  return a.frames[
    a.loop
      ? ((n % a.frames.length) + a.frames.length) % a.frames.length
      : Math.min(a.frames.length - 1, Math.max(0, n))
  ];
}
