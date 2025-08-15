// lib/server-cache.ts
const store = new Map<string, { at: number; data: any }>()

export async function cached<T>(
  key: string,
  ttlMs: number,
  loader: () => Promise<T>
): Promise<T> {
  const hit = store.get(key)
  if (hit && Date.now() - hit.at < ttlMs) return hit.data as T
  const data = await loader()
  store.set(key, { at: Date.now(), data })
  return data
}
    