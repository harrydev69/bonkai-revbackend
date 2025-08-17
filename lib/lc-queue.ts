// lib/lc-queue.ts
const rpm = Number(process.env.LC_RPM ?? 10);
const intervalMs = Math.max(1, Math.ceil(60_000 / rpm));

let lastRun = 0;
const q: Array<() => void> = [];
let running = false;

function runNext() {
  if (running || q.length === 0) return;
  running = true;

  const now = Date.now();
  const wait = Math.max(0, lastRun + intervalMs - now);

  setTimeout(() => {
    lastRun = Date.now();
    const resolve = q.shift();
    running = false;
    resolve?.();
    runNext(); // schedule the next item
  }, wait);
}

export async function withLcRateLimit<T>(fn: () => Promise<T>): Promise<T> {
  await new Promise<void>((r) => {
    q.push(r);
    runNext();
  });
  return fn();
}
