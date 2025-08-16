"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ExternalLink, MessageCircle, ThumbsUp, Repeat2 } from "lucide-react"

type Post = {
  id?: string | number
  platform?: string
  text?: string
  title?: string
  url?: string
  handle?: string
  username?: string
  display_name?: string
  creator_name?: string
  creator_id?: string | number
  sentiment?: number
  likes?: number
  retweets?: number
  shares?: number
  comments?: number
  engagement?: number
  timestamp?: number | string
  image?: string
}

function sentimentBadge(v?: number) {
  if (typeof v !== "number") return <Badge variant="secondary">neutral</Badge>
  if (v > 0.1) return <Badge>positive</Badge>
  if (v < -0.1) return <Badge variant="destructive">negative</Badge>
  return <Badge variant="secondary">neutral</Badge>
}

function humanTime(ts?: number | string) {
  if (!ts) return ""
  let ms: number
  if (typeof ts === "number") ms = ts < 1e12 ? ts * 1000 : ts
  else {
    const n = Number(ts)
    ms = !Number.isNaN(n) ? (n < 1e12 ? n * 1000 : n) : Date.parse(ts)
  }
  const d = new Date(ms)
  return isNaN(d.getTime()) ? "" : d.toLocaleString()
}

function toArray(input: any): Post[] {
  if (Array.isArray(input)) return input as Post[]
  if (input && Array.isArray(input.feeds)) return input.feeds as Post[]
  if (input && Array.isArray(input.data)) return input.data as Post[]
  if (input && Array.isArray(input.items)) return input.items as Post[]
  return []
}

function dedupeById(arr: Post[]): Post[] {
  const seen = new Set<string>()
  const out: Post[] = []
  for (const p of arr) {
    const id = String(p.id ?? p.creator_id ?? Math.random())
    if (!seen.has(id)) {
      seen.add(id)
      out.push(p)
    }
  }
  return out
}

export default function SocialFeed({
  limit = 30,
  refreshMs = 45_000,
  initialDelayMs,
}: {
  limit?: number
  refreshMs?: number
  initialDelayMs?: number
}) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const timerRef = useRef<number | null>(null)
  const startedRef = useRef(false)

  // small jitter to avoid multiple widgets fetching at the exact same moment
  const jitter = initialDelayMs ?? 200 + Math.floor(Math.random() * 500)

  const load = async (signal?: AbortSignal) => {
    try {
      setError(null)
      const res = await fetch(`/api/feeds/bonk?limit=${limit}`, {
        cache: "no-store",
        signal,
      })
      if (!res.ok) {
        const body = await res.text().catch(() => "")
        throw new Error(`feeds ${res.status}: ${body || res.statusText}`)
      }
      const json = await res.json().catch(() => ({}))
      const arr = dedupeById(toArray(json)).slice(0, limit)
      setPosts(arr)
    } catch (e: any) {
      setError(String(e?.message ?? e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const ac = new AbortController()

    const kickOff = () => {
      // stagger first call
      window.setTimeout(() => load(ac.signal), jitter)
      // periodic refresh (visibility-aware)
      const tick = async () => {
        if (document.visibilityState === "visible") await load()
        timerRef.current = window.setTimeout(tick, refreshMs) as unknown as number
      }
      timerRef.current = window.setTimeout(tick, refreshMs) as unknown as number
    }

    if (!startedRef.current) {
      startedRef.current = true
      kickOff()
    }

    const onVis = () => {
      if (document.visibilityState === "visible") void load()
    }
    document.addEventListener("visibilitychange", onVis)

    return () => {
      ac.abort()
      if (timerRef.current) window.clearTimeout(timerRef.current)
      document.removeEventListener("visibilitychange", onVis)
    }
  }, [limit, refreshMs, jitter])

  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle>Live BONK Social Feed</CardTitle></CardHeader>
        <CardContent><div className="h-24 animate-pulse rounded-md bg-muted" /></CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Live BONK Social Feed</CardTitle>
          <Badge variant="destructive">error</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-red-600">Feed unavailable: {error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Live BONK Social Feed</CardTitle>
        <Badge variant="outline">{posts.length} posts</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {posts.map((p, i) => {
          const name =
            p.display_name || p.creator_name || p.username || p.handle || "Creator"
          const handle =
            p.handle
              ? (p.handle.startsWith("@") ? p.handle : `@${p.handle}`)
              : (p.username ? `@${p.username}` : "")
          const platform = (p.platform || "Social").toString()
          const likeCount = Number(p.likes ?? 0)
          const rtCount = Number(p.retweets ?? p.shares ?? 0)
          const replyCount = Number(p.comments ?? 0)
          const text = p.text || p.title || ""
          const id = String(p.id ?? `p${i}`)

          return (
            <div key={id} className="p-4 border rounded-lg">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={p.image || ""} />
                  <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{name}</span>
                      {handle && <span className="text-sm text-muted-foreground">{handle}</span>}
                      <Badge variant="secondary">{platform}</Badge>
                      {sentimentBadge(p.sentiment)}
                    </div>
                    <span className="text-xs text-muted-foreground">{humanTime(p.timestamp)}</span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{text}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" />{likeCount}</span>
                    <span className="flex items-center gap-1"><Repeat2 className="h-3 w-3" />{rtCount}</span>
                    <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{replyCount}</span>
                    {p.url && (
                      <a href={p.url} target="_blank" rel="noreferrer">
                        <Button size="sm" variant="ghost" className="h-7 px-2">
                          <ExternalLink className="h-3 w-3 mr-1" /> Open
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        {!posts.length && <div className="text-sm text-muted-foreground">No recent posts found.</div>}
      </CardContent>
    </Card>
  )
}
