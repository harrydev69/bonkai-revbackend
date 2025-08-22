"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, ExternalLink, Newspaper, TrendingUp, TrendingDown, Minus, Eye, ChevronDown, ChevronUp } from "lucide-react";
import type { BONKNewsArticle, BONKNewsResponse, SentimentDisplay } from "@/app/types/news";

export function BONKNewsFeed() {
  const [news, setNews] = useState<BONKNewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [expandedArticles, setExpandedArticles] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [displayCount, setDisplayCount] = useState(6); // Show 6 items initially
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  const fetchBONKNews = async (page: number = 1, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const response = await fetch(`/api/bonk/news?limit=20&time_frame=24h&page=${page}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch BONK news: ${response.status}`);
      }
      
      const data: BONKNewsResponse = await response.json();
      
      if (append) {
        setNews(prev => [...prev, ...data.articles]);
      } else {
        setNews(data.articles || []);
        setCurrentPage(1);
        // Reset expanded articles when fetching new news
        setExpandedArticles(new Set());
      }
      
      setLastUpdated(data.lastUpdated);
      setHasMore(data.articles.length >= 20); // If we get less than 20, we've reached the end
      
      // Show fallback message if using fallback data
      if (data.isFallback) {
        setError('Using fallback news data due to API rate limit. Real-time news will resume shortly.');
      }
    } catch (err) {
      console.error('Error fetching BONK news:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch news');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (!autoRefreshEnabled) return;
    
    const interval = setInterval(() => {
      fetchBONKNews();
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(interval);
  }, [autoRefreshEnabled]);

  // Initial fetch
  useEffect(() => {
    fetchBONKNews();
  }, []);

  const toggleArticleExpansion = (articleId: string) => {
    setExpandedArticles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(articleId)) {
        newSet.delete(articleId);
      } else {
        newSet.add(articleId);
      }
      return newSet;
    });
  };

  const loadMoreNews = () => {
    if (hasMore && !loadingMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchBONKNews(nextPage, true);
    }
  };

  const toggleAutoRefresh = () => {
    setAutoRefreshEnabled(!autoRefreshEnabled);
  };

  const getSentimentDisplay = (sentiment: { label: 'positive' | 'negative' | 'neutral'; score: number }) => {
    const { label, score } = sentiment;
    
    if (label === 'positive' || score > 0.6) {
      return { icon: TrendingUp, color: 'text-green-600', bgColor: 'bg-green-100', text: 'Positive' };
    } else if (label === 'negative' || score < 0.4) {
      return { icon: TrendingDown, color: 'text-red-600', bgColor: 'bg-red-100', text: 'Negative' };
    } else {
      return { icon: Minus, color: 'text-gray-600', bgColor: 'bg-gray-100', text: 'Neutral' };
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Unknown date';
    }
  };

  if (loading && news.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5" />
            BONK News Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading BONK news...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5" />
            BONK News Feed
            <Badge variant="secondary" className="ml-2">
              {news.length} articles
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAutoRefresh}
              className={autoRefreshEnabled ? 'bg-green-50 text-green-700 border-green-200' : ''}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${autoRefreshEnabled ? 'animate-spin' : ''}`} />
              {autoRefreshEnabled ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchBONKNews()}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
        {lastUpdated && (
          <p className="text-sm text-gray-600">
            Last updated: {new Date(lastUpdated).toLocaleString()}
          </p>
        )}
        {error && (
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">{error}</p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {news.slice(0, displayCount).map((article, index) => {
            const sentimentDisplay = getSentimentDisplay(article.sentiment);
            const isExpanded = expandedArticles.has(article.id);
            
            return (
              <div key={article.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {article.category}
                      </Badge>
                      {article.subCategory && (
                        <Badge variant="secondary" className="text-xs">
                          {article.subCategory}
                        </Badge>
                      )}
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${sentimentDisplay.bgColor} ${sentimentDisplay.color} border-current`}
                      >
                        <sentimentDisplay.icon className="h-3 w-3 mr-1" />
                        {sentimentDisplay.text}
                      </Badge>
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                      {article.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-3 line-clamp-3">
                      {article.summary}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {article.source}
                      </span>
                      <span>{formatDate(article.published)}</span>
                      <span>{article.relativeTime}</span>
                      {article.readingTime && (
                        <span>{article.readingTime}</span>
                      )}
                    </div>
                    
                    {isExpanded && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700 mb-2">
                          <strong>Full Summary:</strong>
                        </p>
                        <p className="text-sm text-gray-600 mb-3">
                          {article.summary}
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(article.link, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Read Full Article
                          </Button>
                          {article.sourceCount > 1 && (
                            <Badge variant="outline" className="text-xs">
                              {article.sourceCount} sources
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleArticleExpansion(article.id)}
                    className="ml-2"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        
        {news.length > displayCount && (
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={() => setDisplayCount(prev => prev + 6)}
              disabled={displayCount >= news.length}
            >
              Show More Articles ({displayCount}/{news.length})
            </Button>
          </div>
        )}
        
        {hasMore && (
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={loadMoreNews}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load More News'
              )}
            </Button>
          </div>
        )}
        
        {news.length === 0 && !loading && (
          <div className="text-center py-8">
            <Newspaper className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No BONK news available at the moment.</p>
            <Button
              variant="outline"
              onClick={() => fetchBONKNews()}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
