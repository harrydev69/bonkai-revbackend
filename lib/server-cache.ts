// lib/server-cache.ts
const mem = new Map<string, { ts: number; data: any }>();
export async function cached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const hit = mem.get(key);
  const now = Date.now();
  if (hit && now - hit.ts < ttlMs) return hit.data;
  const data = await fn();
  mem.set(key, { ts: now, data });
  return data;
}
