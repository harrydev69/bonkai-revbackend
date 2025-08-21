"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, RefreshCw, Calendar, TrendingUp, Newspaper, Globe, Twitter } from "lucide-react";

type NewsItem = {
  id: string;
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
  sentiment?: "positive" | "negative" | "neutral";
};

type StatusUpdate = {
  id: string;
  title: string;
  description: string;
  category: string;
  user: string;
  userTitle: string;
  created_at: string;
};

type NewsUpdatesData = {
  news: NewsItem[];
  statusUpdates: StatusUpdate[];
  lastUpdated: string;
};

export function NewsUpdates() {
  const [newsData, setNewsData] = useState<NewsUpdatesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("news");

  useEffect(() => {
    fetchNewsData();
  }, []);

  const fetchNewsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch news from existing API
      const newsResponse = await fetch('/api/news');
      const newsData = newsResponse.ok ? await newsResponse.json() : { articles: [] };
      
      // Fetch status updates from CoinGecko (if available)
      const statusResponse = await fetch('/api/bonk/status');
      const statusData = statusResponse.ok ? await statusResponse.json() : { status_updates: [] };
      
      setNewsData({
        news: newsData.articles || [],
        statusUpdates: statusData.status_updates || [],
        lastUpdated: new Date().toISOString()
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch news data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";
    return date.toLocaleDateString();
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case "positive": return "bg-green-500";
      case "negative": return "bg-red-500";
      case "neutral": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const getSentimentLabel = (sentiment?: string) => {
    switch (sentiment) {
      case "positive": return "Positive";
      case "negative": return "Negative";
      case "neutral": return "Neutral";
      default: return "Unknown";
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "general": "bg-blue-500",
      "milestone": "bg-green-500",
      "announcement": "bg-purple-500",
      "update": "bg-orange-500",
      "partnership": "bg-pink-500",
      "default": "bg-gray-500"
    };
    return colors[category.toLowerCase()] || colors.default;
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-red-500">News Error</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchNewsData} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!newsData) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No news data available</p>
        </CardContent>
      </Card>
    );
  }

  const { news, statusUpdates } = newsData;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Newspaper className="w-5 h-5" />
              BONK News & Updates
            </CardTitle>
            <CardDescription>
              Latest news, announcements, and status updates • Last updated: {formatDate(newsData.lastUpdated)}
            </CardDescription>
          </div>
          
          <Button onClick={fetchNewsData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="news" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              News ({news.length})
            </TabsTrigger>
            <TabsTrigger value="updates" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Status Updates ({statusUpdates.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="news" className="mt-6">
            {news.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Newspaper className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No news articles available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {news.slice(0, 10).map((item, index) => (
                  <Card key={item.id || index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-muted-foreground">
                              {item.source}
                            </span>
                            {item.sentiment && (
                              <Badge className={`${getSentimentColor(item.sentiment)} text-white text-xs`}>
                                {getSentimentLabel(item.sentiment)}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatDate(item.publishedAt)}
                            </span>
                          </div>
                          <h3 className="font-semibold mb-2 line-clamp-2">{item.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                            {item.description}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(item.url, '_blank')}
                            className="flex items-center gap-2"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Read Full Article
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="updates" className="mt-6">
            {statusUpdates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No status updates available</p>
                <p className="text-sm">Check back later for official BONK announcements</p>
              </div>
            ) : (
              <div className="space-y-4">
                {statusUpdates.slice(0, 10).map((update, index) => (
                  <Card key={update.id || index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={`${getCategoryColor(update.category)} text-white`}>
                              {update.category}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(update.created_at)}
                            </span>
                          </div>
                          <h3 className="font-semibold mb-2">{update.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            {update.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Posted by:</span>
                            <span className="font-medium">{update.user}</span>
                            {update.userTitle && (
                              <>
                                <span>•</span>
                                <span>{update.userTitle}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* News Summary */}
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">News Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">{news.length}</div>
                  <div className="text-sm text-muted-foreground">Total Articles</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">
                    {news.filter(item => item.sentiment === "positive").length}
                  </div>
                  <div className="text-sm text-muted-foreground">Positive News</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-500">{statusUpdates.length}</div>
                  <div className="text-sm text-muted-foreground">Status Updates</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Social Media Links */}
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Follow BONK</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" className="flex items-center gap-2">
                  <Twitter className="w-4 h-4" />
                  Twitter
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Website
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Newspaper className="w-4 h-4" />
                  Blog
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
