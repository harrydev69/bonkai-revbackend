"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, Search, Filter, RefreshCw, AlertCircle, ExternalLink, Sparkles, Headphones, Clock, Coins } from "lucide-react"

interface AudioTrack {
  id: string
  title: string
  artist: string
  duration: string
  category: 'podcast' | 'interview' | 'analysis' | 'news' | 'blog' | 'official' | 'community'
  tags: string[]
  relevanceScore: number
  verified: boolean
  plays: number
  likes: number
  description: string
  platformUrl: string
  source: string
  createdAt: string
  updatedAt: string
}

// Enhanced Platform-specific component with BONK theming
function PlatformPlayer({ track }: { track: AudioTrack }) {
  const getPlatformInfo = (source: string) => {
    switch (source) {
      case 'spotify':
        return {
          name: 'Spotify',
          color: 'from-green-500 to-green-600',
          icon: '🎵',
          description: 'Listen on Spotify',
          accent: 'bg-green-500'
        }
      case 'apple-podcasts':
        return {
          name: 'Apple Podcasts',
          color: 'from-purple-500 to-purple-600',
          icon: '🎧',
          description: 'Listen on Apple Podcasts',
          accent: 'bg-purple-500'
        }
      case 'solana-compass':
        return {
          name: 'Solana Compass',
          color: 'from-blue-500 to-blue-600',
          icon: '🔍',
          description: 'Read on Solana Compass',
          accent: 'bg-blue-500'
        }
      case 'binance-blog':
        return {
          name: 'Binance Square',
          color: 'from-yellow-500 to-yellow-600',
          icon: '📊',
          description: 'Read on Binance Square',
          accent: 'bg-yellow-500'
        }
      case 'solana-foundation':
        return {
          name: 'Solana Foundation',
          color: 'from-indigo-500 to-indigo-600',
          icon: '🏛️',
          description: 'Official Solana Content',
          accent: 'bg-indigo-500'
        }
      case 'bonk-community':
        return {
          name: 'BONK Community',
          color: 'from-orange-500 to-orange-600',
          icon: '🎵',
          description: 'BONK Community Content',
          accent: 'bg-orange-500'
        }
      case 'animoca-podcast':
        return {
          name: 'Animoca Podcasts',
          color: 'from-teal-500 to-teal-600',
          icon: '🎙️',
          description: 'Listen on Animoca Podcasts',
          accent: 'bg-teal-500'
        }
      default:
        return {
          name: 'External Platform',
          color: 'from-gray-500 to-gray-600',
          icon: '🔗',
          description: 'Visit Platform',
          accent: 'bg-gray-500'
        }
    }
  }

  const platform = getPlatformInfo(track.source)

  return (
    <div className="w-full space-y-4">
      {/* Enhanced Platform Thumbnail with BONK theme */}
      <div className="relative group">
        <div className={`w-full h-32 bg-gradient-to-br ${platform.color} rounded-lg flex items-center justify-center transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl`}>
          <div className="text-5xl filter drop-shadow-lg">{platform.icon}</div>
          
          {/* BONK-themed overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg" />
          
          {/* Platform badge */}
          <div className="absolute bottom-2 left-2">
            <Badge variant="secondary" className="text-white bg-black/60 backdrop-blur-sm border-0">
              {platform.name}
            </Badge>
          </div>
          
          {/* BONK sparkle effect */}
          <div className="absolute top-2 right-2">
            <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Enhanced Platform Info */}
      <div className="text-center space-y-3">
        <h4 className="font-medium text-sm text-muted-foreground">{platform.description}</h4>
        <Button asChild className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 shadow-lg transform transition-all duration-200 hover:scale-105" size="lg">
          <a 
            href={track.platformUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Listen Now
          </a>
        </Button>
      </div>

      {/* Enhanced Source Info with BONK theme */}
      <div className="text-xs text-muted-foreground text-center space-y-1">
        <div className="flex items-center justify-center gap-1">
          <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50 dark:bg-green-950/20">
            ✓ Verified
          </Badge>
          <span>BONK Verified Content</span>
        </div>
        <p>Source: {track.source.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
        <p>Platform: {platform.name}</p>
      </div>
    </div>
  )
}

export function AudioLibrary() {
  const [tracks, setTracks] = useState<AudioTrack[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    verifiedOnly: false,
    category: '',
    tag: ''
  })
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  const fetchTracks = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        verifiedOnly: filters.verifiedOnly.toString(),
        ...(filters.category && { category: filters.category }),
        ...(filters.tag && { tag: filters.tag })
      })
      
      const response = await fetch(`/api/audio?${params}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch audio tracks: ${response.status}`)
      }
      
      const data = await response.json()
      setTracks(data.tracks || [])
      setLastUpdated(data.updatedAt)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch audio tracks')
      console.error('Audio tracks fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTracks()
    
    // Refresh every 10 minutes
    const interval = setInterval(fetchTracks, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [filters])

  const handleLike = async (trackId: string) => {
    try {
      const response = await fetch(`/api/audio/${trackId}/like`, {
        method: 'POST'
      })
      if (response.ok) {
        // Update local state
        setTracks(prev => prev.map(track => 
          track.id === trackId 
            ? { ...track, likes: track.likes + 1 }
            : track
        ))
      }
    } catch (error) {
      console.error('Failed to like track:', error)
    }
  }

  const filteredTracks = tracks.filter(track => {
    const matchesSearch = track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         track.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         track.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         track.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesSearch
  })

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
      case "blog":
        return "bg-indigo-500"
      case "official":
        return "bg-red-500"
      case "community":
        return "bg-teal-500"
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
        return "destructive"
      case "news":
        return "outline"
      case "blog":
        return "secondary"
      case "official":
        return "destructive"
      case "community":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getRelevanceColor = (score: number) => {
    if (score >= 70) return "text-green-600 dark:text-green-400"
    if (score >= 50) return "text-yellow-600 dark:text-yellow-400"
    return "text-orange-600 dark:text-orange-400"
  }

  const getRelevanceBadge = (score: number) => {
    if (score >= 70) return "High"
    if (score >= 50) return "Medium"
    return "Low"
  }

  const getRelevanceVariant = (score: number) => {
    if (score >= 70) return "default"
    if (score >= 50) return "secondary"
    return "outline"
  }

  const formatDuration = (duration: string) => {
    return duration
  }

  const formatPlays = (plays: number) => {
    if (plays >= 1000000) return `${(plays / 1000000).toFixed(1)}M`
    if (plays >= 1000) return `${(plays / 1000).toFixed(1)}K`
    return plays.toString()
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">BONK Audio Library</h1>
          <p className="text-muted-foreground">Loading BONK ecosystem content...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-5 bg-muted rounded w-32 mb-2" />
                <div className="h-4 bg-muted rounded w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-32 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
  return (
    <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">BONK Audio Library</h1>
          <p className="text-muted-foreground">Error loading audio tracks</p>
        </div>
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
      <div>
                <p className="font-medium">Failed to load audio tracks</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
            <button
              onClick={fetchTracks}
              className="mt-3 flex items-center gap-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            >
              <RefreshCw className="h-4 h-4" />
              Try again
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Uniform Header */}
      <div>
        <h1 className="text-3xl font-bold">BONK Audio Library</h1>
        <p className="text-muted-foreground">Discover BONK ecosystem podcasts, interviews, and analysis from trusted platforms. Let the dog run!</p>
      </div>

      {/* Enhanced Search and Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-500" />
              Search BONK Content
            </CardTitle>
            <CardDescription>Find specific audio content in the BONK ecosystem</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search by title, artist, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border-orange-200 focus:border-orange-500"
            />
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-orange-500" />
              Filter & Sort
            </CardTitle>
            <CardDescription>Customize your BONK audio experience</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Verification</label>
                <select
                  value={filters.verifiedOnly ? 'true' : 'false'}
                  onChange={(e) => setFilters(prev => ({ ...prev, verifiedOnly: e.target.value === 'true' }))}
                  className="w-full mt-1 p-2 border border-orange-200 rounded-md focus:border-orange-500"
                >
                  <option value="false">All Tracks</option>
                  <option value="true">Verified Only</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full mt-1 p-2 border border-orange-200 rounded-md focus:border-orange-500"
                >
                  <option value="">All Categories</option>
                  <option value="podcast">Podcast</option>
                  <option value="interview">Interview</option>
                  <option value="analysis">Analysis</option>
                  <option value="news">News</option>
                  <option value="blog">Blog</option>
                  <option value="official">Official</option>
                  <option value="community">Community</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Tag</label>
                <select
                  value={filters.tag}
                  onChange={(e) => setFilters(prev => ({ ...prev, tag: e.target.value }))}
                  className="w-full mt-1 p-2 border border-orange-200 rounded-md focus:border-orange-500"
                >
                  <option value="">All Tags</option>
                  <option value="bonk">BONK</option>
                  <option value="solana">Solana</option>
                  <option value="defi">DeFi</option>
                  <option value="meme coins">Meme Coins</option>
                  <option value="vision">Vision</option>
                  <option value="analysis">Analysis</option>
                  <option value="community">Community</option>
                </select>
              </div>
          </div>
        </CardContent>
      </Card>
      </div>

      {/* Enhanced Stats with BONK theme */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tracks</CardTitle>
            <Headphones className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{tracks.length}</div>
            <p className="text-xs text-muted-foreground">Available tracks</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Relevance</CardTitle>
            <Sparkles className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {tracks.filter((t) => t.relevanceScore >= 70).length}
            </div>
            <p className="text-xs text-muted-foreground">70%+ relevance</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Tracks</CardTitle>
            <Sparkles className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{tracks.filter((t) => t.verified).length}</div>
            <p className="text-xs text-muted-foreground">Quality assured</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Relevance</CardTitle>
            <Sparkles className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {tracks.length > 0 
                ? Math.round(tracks.reduce((sum, t) => sum + t.relevanceScore, 0) / tracks.length)
                : 0
              }%
            </div>
            <p className="text-xs text-muted-foreground">Overall quality</p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Audio Tracks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTracks.map((track) => (
          <Card key={track.id} className="hover:shadow-xl transition-all duration-300 border-orange-200 hover:border-orange-400 group">
            <CardHeader>
                      <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2 group-hover:text-orange-600 transition-colors">{track.title}</CardTitle>
                  <CardDescription className="text-sm mt-1">{track.artist}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                  <Badge variant={getCategoryBadge(track.category)} className="shadow-sm">
                    {track.category}
                  </Badge>
                  {track.verified && (
                    <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50 dark:bg-green-950/20">
                      ✓ Verified
                    </Badge>
                  )}
                        </div>
                      </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {track.description}
              </p>
              
              {/* Enhanced Tags */}
                      <div className="flex flex-wrap gap-2">
                {track.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs border-orange-200 text-orange-700 hover:bg-orange-50">
                            #{tag}
                          </Badge>
                        ))}
                {track.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs border-orange-200 text-orange-700">
                    +{track.tags.length - 3} more
                  </Badge>
                )}
                      </div>

              {/* Enhanced Platform Player */}
              <div className="border-t border-orange-200 pt-4">
                <PlatformPlayer track={track} />
          </div>

              {/* Enhanced Stats and Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-orange-500" />
                    {formatDuration(track.duration)}
                                  </div>
                                  <div className="flex items-center gap-1">
                    <Headphones className="w-4 h-4 text-orange-500" />
                    {formatPlays(track.plays)}
                                  </div>
                              </div>
                <div className="flex items-center gap-2">
                            <Button
                    variant="outline"
                              size="sm"
                    onClick={() => handleLike(track.id)}
                    className="flex items-center gap-1 border-orange-200 hover:bg-orange-50 hover:border-orange-400"
                  >
                    <Heart className="w-4 h-4" />
                    {track.likes}
                            </Button>
                          </div>
                        </div>

              {/* Enhanced Relevance Score */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Relevance:</span>
                <Badge variant={getRelevanceVariant(track.relevanceScore)} className="shadow-sm">
                  {getRelevanceBadge(track.relevanceScore)} ({track.relevanceScore}%)
                </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>

      {/* Enhanced Last Updated Info */}
      {lastUpdated && (
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span>Last updated: {new Date(lastUpdated).toLocaleString()}</span>
            <Coins className="w-4 h-4 text-yellow-500" />
          </div>
          <p className="text-xs text-muted-foreground">
            BONK ecosystem content is constantly updated with fresh insights and analysis
          </p>
        </div>
      )}
    </div>
  )
}

