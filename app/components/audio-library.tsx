"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Pause, Search, Download, Heart, Share2, Clock, Headphones } from "lucide-react"

interface AudioTrack {
  id: string
  title: string
  artist: string
  duration: string
  category: "podcast" | "interview" | "analysis" | "news"
  date: string
  plays: number
  likes: number
  description: string
  tags: string[]
}

export function AudioLibrary() {
  const [searchQuery, setSearchQuery] = useState("")
  const [playingTrack, setPlayingTrack] = useState<string | null>(null)
  const [likedTracks, setLikedTracks] = useState<Set<string>>(new Set())

  const tracks: AudioTrack[] = [
    {
      id: "1",
      title: "BONK Market Analysis: Q4 2024 Review",
      artist: "Crypto Analytics Team",
      duration: "24:35",
      category: "analysis",
      date: "2024-01-10",
      plays: 15420,
      likes: 892,
      description:
        "Deep dive into BONK's performance in Q4 2024, covering price movements, trading volume, and ecosystem developments.",
      tags: ["market-analysis", "bonk", "q4-review"],
    },
    {
      id: "2",
      title: "Solana Ecosystem Podcast: DeFi Innovations",
      artist: "Solana Foundation",
      duration: "45:12",
      category: "podcast",
      date: "2024-01-08",
      plays: 23150,
      likes: 1247,
      description:
        "Exploring the latest DeFi innovations on Solana, featuring interviews with leading protocol developers.",
      tags: ["defi", "solana", "innovation"],
    },
    {
      id: "3",
      title: "Interview: BONK Community Leaders",
      artist: "Community Spotlight",
      duration: "32:18",
      category: "interview",
      date: "2024-01-05",
      plays: 8930,
      likes: 567,
      description: "Candid conversation with BONK community leaders about growth strategies and future plans.",
      tags: ["community", "leadership", "growth"],
    },
    {
      id: "4",
      title: "Daily Crypto News: Solana Updates",
      artist: "Crypto News Daily",
      duration: "12:45",
      category: "news",
      date: "2024-01-12",
      plays: 34200,
      likes: 1890,
      description: "Latest news and updates from the Solana ecosystem, including protocol upgrades and partnerships.",
      tags: ["news", "updates", "partnerships"],
    },
    {
      id: "5",
      title: "Technical Analysis: BONK Price Predictions",
      artist: "TA Masters",
      duration: "28:50",
      category: "analysis",
      date: "2024-01-07",
      plays: 19750,
      likes: 1123,
      description: "Technical analysis of BONK price patterns with predictions for the coming weeks.",
      tags: ["technical-analysis", "predictions", "trading"],
    },
  ]

  const filteredTracks = tracks.filter(
    (track) =>
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const togglePlay = (trackId: string) => {
    setPlayingTrack(playingTrack === trackId ? null : trackId)
  }

  const toggleLike = (trackId: string) => {
    const newLikedTracks = new Set(likedTracks)
    if (newLikedTracks.has(trackId)) {
      newLikedTracks.delete(trackId)
    } else {
      newLikedTracks.add(trackId)
    }
    setLikedTracks(newLikedTracks)
  }

  const getCategoryColor = (category: AudioTrack["category"]) => {
    switch (category) {
      case "podcast":
        return "bg-blue-500"
      case "interview":
        return "bg-green-500"
      case "analysis":
        return "bg-purple-500"
      case "news":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  const getCategoryBadge = (category: AudioTrack["category"]) => {
    switch (category) {
      case "podcast":
        return "default"
      case "interview":
        return "secondary"
      case "analysis":
        return "outline"
      case "news":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audio Library</h1>
        <p className="text-muted-foreground">
          Listen to podcasts, interviews, and analysis about BONK and the Solana ecosystem
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search tracks, artists, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tracks</CardTitle>
            <Headphones className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tracks.length}</div>
            <p className="text-xs text-muted-foreground">Available episodes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plays</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tracks.reduce((sum, track) => sum + track.plays, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tracks.reduce((sum, track) => sum + track.likes, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Community engagement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2h 23m</div>
            <p className="text-xs text-muted-foreground">Content library</p>
          </CardContent>
        </Card>
      </div>

      {/* Audio Tracks */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Tracks</TabsTrigger>
          <TabsTrigger value="podcast">Podcasts</TabsTrigger>
          <TabsTrigger value="interview">Interviews</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="news">News</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="space-y-4">
            {filteredTracks.map((track) => (
              <Card key={track.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`w-3 h-3 rounded-full ${getCategoryColor(track.category)} mt-2`} />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{track.title}</h3>
                          <p className="text-muted-foreground">{track.artist}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {track.duration}
                            </div>
                            <div className="flex items-center gap-1">
                              <Play className="w-4 h-4" />
                              {track.plays.toLocaleString()} plays
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="w-4 h-4" />
                              {track.likes.toLocaleString()} likes
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getCategoryBadge(track.category)}>{track.category}</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{track.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {track.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          variant={playingTrack === track.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => togglePlay(track.id)}
                        >
                          {playingTrack === track.id ? (
                            <Pause className="w-4 h-4 mr-2" />
                          ) : (
                            <Play className="w-4 h-4 mr-2" />
                          )}
                          {playingTrack === track.id ? "Pause" : "Play"}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => toggleLike(track.id)}>
                          <Heart
                            className={`w-4 h-4 mr-2 ${likedTracks.has(track.id) ? "fill-red-500 text-red-500" : ""}`}
                          />
                          Like
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {["podcast", "interview", "analysis", "news"].map((category) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="space-y-4">
              {filteredTracks
                .filter((track) => track.category === category)
                .map((track) => (
                  <Card key={track.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className={`w-3 h-3 rounded-full ${getCategoryColor(track.category)} mt-2`} />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{track.title}</h3>
                              <p className="text-muted-foreground">{track.artist}</p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {track.duration}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Play className="w-4 h-4" />
                                  {track.plays.toLocaleString()} plays
                                </div>
                                <div className="flex items-center gap-1">
                                  <Heart className="w-4 h-4" />
                                  {track.likes.toLocaleString()} likes
                                </div>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{track.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {track.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center gap-2 pt-2">
                            <Button
                              variant={playingTrack === track.id ? "default" : "outline"}
                              size="sm"
                              onClick={() => togglePlay(track.id)}
                            >
                              {playingTrack === track.id ? (
                                <Pause className="w-4 h-4 mr-2" />
                              ) : (
                                <Play className="w-4 h-4 mr-2" />
                              )}
                              {playingTrack === track.id ? "Pause" : "Play"}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => toggleLike(track.id)}>
                              <Heart
                                className={`w-4 h-4 mr-2 ${likedTracks.has(track.id) ? "fill-red-500 text-red-500" : ""}`}
                              />
                              Like
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Share2 className="w-4 h-4 mr-2" />
                              Share
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

