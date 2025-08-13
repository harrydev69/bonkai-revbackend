"use client"

import { useEffect, useState } from "react"
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

export default function SocialFeed({ limit = 30 }: { limit?: number }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const res = await fetch(`/api/feeds/bonk?limit=${limit}`, { cache: "no-store" })
        const j = await res.json().catch(() => ({}))
        if (!active) return
        const arr: Post[] = Array.isArray(j?.feeds) ? j.feeds : Array.isArray(j?.data) ? j.data : []
        setPosts(arr)
      } catch (e) {
        console.error("feed load error", e)
        setPosts([])
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [limit])

  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle>Live BONK Social Feed</CardTitle></CardHeader>
        <CardContent><div className="h-24 animate-pulse rounded-md bg-muted" /></CardContent>
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
            (p.handle && p.handle.startsWith("@")) ? p.handle : p.handle ? `@${p.handle}` : p.username ? `@${p.username}` : ""
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
                    <div className="flex items-center gap-2">
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
