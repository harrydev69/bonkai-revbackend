// lib/swr-queue.ts
let last = 0;
const GAP_MS = Number(process.env.NEXT_PUBLIC_SWR_GAP_MS ?? 300);
const q: Array<() => void> = [];
let running = false;

function run() {
  if (running || !q.length) return;
  running = true;
  const now = Date.now();
  const wait = Math.max(0, last + GAP_MS - now);
  setTimeout(() => {
    last = Date.now();
    const fn = q.shift()!;
    running = false;
    fn();
    run();
  }, wait);
}

export function queuedJsonFetch(input: RequestInfo, init?: RequestInit) {
  return new Promise<any>((resolve, reject) => {
    q.push(async () => {
      try {
        const res = await fetch(input, init);
        const text = await res.text();
        if (!res.ok) throw new Error(text || res.statusText);
        resolve(text ? JSON.parse(text) : null);
      } catch (e) {
        reject(e);
      }
    });
    run();
  });
}
