import type { Env } from "./types";
export function duration(
  value: string | number | undefined,
  fallback: number,
): number {
  const n = value === undefined ? fallback : Number(value);
  if (!Number.isSafeInteger(n) || n < 1 || n > 60000)
    throw new Error("invalid_timeout");
  return n;
}
export function requestDuration(env: Env) {
  return duration(env.REQUEST_DEADLINE_MS, 15000);
}
export class Deadline {
  readonly controller = new AbortController();
  private timer: ReturnType<typeof setTimeout>;
  constructor(readonly expiresAt: number) {
    this.timer = setTimeout(
      () => this.controller.abort(new Error("deadline")),
      Math.max(0, this.remaining),
    );
  }
  get remaining() {
    return Math.max(0, this.expiresAt - Date.now());
  }
  async run<T>(
    operation: (signal: AbortSignal) => Promise<T>,
    limit = this.remaining,
  ): Promise<T> {
    if (this.remaining <= 0 || this.controller.signal.aborted)
      throw new Error("deadline");
    const local = new AbortController();
    const timer = setTimeout(
      () => local.abort(new Error("provider_timeout")),
      Math.min(limit, this.remaining),
    );
    const signal = AbortSignal.any([this.controller.signal, local.signal]);
    let rejectAbort: (() => void) | undefined;
    const aborted = new Promise<never>((_resolve, reject) => {
      rejectAbort = () => reject(new Error("deadline"));
      signal.addEventListener("abort", rejectAbort, { once: true });
    });
    try {
      return await Promise.race([
        Promise.resolve().then(() => {
          signal.throwIfAborted();
          return operation(signal);
        }),
        aborted,
      ]);
    } finally {
      clearTimeout(timer);
      if (rejectAbort) signal.removeEventListener("abort", rejectAbort);
    }
  }
  close() {
    clearTimeout(this.timer);
  }
}
