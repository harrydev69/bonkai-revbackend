"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ExternalLink, MessageCircle, ThumbsUp, Repeat2 } from "lucide-react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export type Post = {
  id: string
  post_type: string
  post_title: string
  post_link: string
  post_image: string | null
  post_created: number
  post_sentiment: number
  creator_id: string
  creator_name: string
  creator_display_name: string
  creator_followers: number
  creator_avatar: string
  interactions_24h: number
  interactions_total: number
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

// Keyword type for extracted keywords
export type KeywordData = {
  word: string
  count: number
  sentiment: "positive" | "negative" | "neutral"
}

// Function to extract keywords from text
function extractKeywords(text: string): string[] {
  console.log("extractKeywords called with text:", text)
  
  // Extract hashtags
  const hashtags = text.match(/#\w+/g) || []
  console.log("Extracted hashtags:", hashtags)
  
  // Extract common words (simple approach - in a real app you might use NLP)
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !['this', 'that', 'with', 'have', 'from', 'they', 'been', 'were', 'what', 'when', 'where', 'will', 'would', 'could', 'should'].includes(word))
  
  console.log("Extracted words:", words)
  
  // Combine hashtags and common words, remove duplicates
  const result = [...new Set([...hashtags, ...words])]
  console.log("Final extracted keywords:", result)
  
  return result
}

// Function to aggregate keywords from posts and calculate sentiment
export function aggregateKeywords(posts: Post[]): KeywordData[] {
  console.log("aggregateKeywords called with posts:", posts)
  
  const keywordMap: Record<string, { count: number; positive: number; negative: number }> = {}
  
  posts.forEach(post => {
    console.log("Processing post:", post)
    const keywords = extractKeywords(post.post_title || "")
    console.log("Extracted keywords from post:", keywords)
    
    const sentiment = post.post_sentiment || 0
    
    keywords.forEach(keyword => {
      if (!keywordMap[keyword]) {
        keywordMap[keyword] = { count: 0, positive: 0, negative: 0 }
      }
      
      keywordMap[keyword].count++
      
      if (sentiment > 0.1) {
        keywordMap[keyword].positive++
      } else if (sentiment < -0.1) {
        keywordMap[keyword].negative++
      }
    })
  })
  
  console.log("Keyword map before processing:", keywordMap)
  
  // Convert to KeywordData array and determine sentiment
  const result = Object.entries(keywordMap)
    .map(([word, data]) => {
      let sentiment: "positive" | "negative" | "neutral" = "neutral"
      
      if (data.positive > data.negative) {
        sentiment = "positive"
      } else if (data.negative > data.positive) {
        sentiment = "negative"
      }
      
      return {
        word: word.replace(/^#/, ""), // Remove # from hashtags
        count: data.count,
        sentiment
      }
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 20) // Top 20 keywords
  
  console.log("Final aggregated keywords:", result)
  
  return result
}

export default function SocialFeed({
  limit = 30,
}: {
  limit?: number
}) {
  const [currentPage, setCurrentPage] = useState(1)
  const postsPerPage = 7

  const { data: rawData, isLoading, error } = useQuery({
    queryKey: ["feeds", "bonk", limit],
    queryFn: async () => {
      const res = await fetch(`/api/feeds/bonk?limit=${limit}`, {
        cache: "no-store",
      })
      if (!res.ok) {
        const body = await res.text().catch(() => "")
        throw new Error(`feeds ${res.status}: ${body || res.statusText}`)
      }
      const json = await res.json().catch(() => ({}))
      
      // Extract posts from the response
      let posts: Post[] = []
      if (json.feeds && Array.isArray(json.feeds)) {
        posts = json.feeds
      } else if (json.data && Array.isArray(json.data)) {
        posts = json.data
      }
      
      return posts
    },
    staleTime: Infinity,
  })

  // Process the data
  const posts = rawData || []
  
  // Calculate pagination
  const totalPages = Math.ceil(posts.length / postsPerPage)
  const indexOfLastPost = currentPage * postsPerPage
  const indexOfFirstPost = indexOfLastPost - postsPerPage
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (isLoading) {
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
          <div className="text-sm text-red-600">Feed unavailable: {String(error)}</div>
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
        {currentPosts.map((p) => {
          const name = p.creator_display_name || p.creator_name || "Creator"
          const handle = p.creator_name ? `@${p.creator_name}` : ""
          const platform = p.post_type || "Social"
          const likeCount = 0 // Not provided in the API response
          const rtCount = 0 // Not provided in the API response
          const replyCount = 0 // Not provided in the API response
          const text = p.post_title || ""
          const id = String(p.id)

          return (
            <div key={id} className="p-4 border rounded-lg">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={p.creator_avatar || ""} />
                  <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{name}</span>
                      {handle && <span className="text-sm text-muted-foreground">{handle}</span>}
                      <Badge variant="secondary">{platform}</Badge>
                      {sentimentBadge(p.post_sentiment)}
                    </div>
                    <span className="text-xs text-muted-foreground">{humanTime(p.post_created)}</span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{text}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" />{likeCount}</span>
                    <span className="flex items-center gap-1"><Repeat2 className="h-3 w-3" />{rtCount}</span>
                    <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{replyCount}</span>
                    <span className="flex items-center gap-1">Followers: {p.creator_followers}</span>
                    <span className="flex items-center gap-1">Interactions: {p.interactions_24h}</span>
                    {p.post_link && (
                      <a href={p.post_link} target="_blank" rel="noreferrer">
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
        
        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      isActive={currentPage === page}
                      onClick={() => handlePageChange(page)}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
