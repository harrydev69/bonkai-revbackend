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
      
    } catch (err: any) {
      setError(err.message || 'Failed to fetch BONK news');
      console.error('BONK News Fetch Error:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Auto-refresh every 60 minutes to avoid rate limits
  useEffect(() => {
    fetchBONKNews();
    
    if (autoRefreshEnabled) {
      const interval = setInterval(() => {
        console.log('Auto-refreshing BONK news...');
        fetchBONKNews();
      }, 60 * 60 * 1000); // 60 minutes (reduced from 30 to avoid rate limits)
      
      return () => clearInterval(interval);
    }
  }, [autoRefreshEnabled]);

  const loadMore = () => {
    if (hasMore && !loadingMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchBONKNews(nextPage, true);
    }
  };

  const toggleAutoRefresh = () => {
    setAutoRefreshEnabled(!autoRefreshEnabled);
  };

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

  // Group news by relative time
  const groupedNews = news.reduce((groups: { [key: string]: BONKNewsArticle[] }, article) => {
    const timeGroup = article.relativeTime;
    if (!groups[timeGroup]) {
      groups[timeGroup] = [];
    }
    groups[timeGroup].push(article);
    return groups;
  }, {});

  // Sort time groups in chronological order
  const sortedTimeGroups = Object.keys(groupedNews).sort((a, b) => {
    const timeOrder = ['Just now', '1 hours ago', '2 hours ago', '3 hours ago', '4 hours ago', '5 hours ago', '6 hours ago', '7 hours ago', '8 hours ago', '9 hours ago', '10 hours ago', '11 hours ago', '12 hours ago', '13 hours ago', '14 hours ago', '15 hours ago', '16 hours ago', '17 hours ago', '18 hours ago', '19 hours ago', '20 hours ago', '21 hours ago', '22 hours ago', '23 hours ago', 'Yesterday', '2 days ago', '3 days ago', '4 days ago'];
    return timeOrder.indexOf(a) - timeOrder.indexOf(b);
  });

  // Get sentiment icon and color based on score and label
  const getSentimentDisplay = (sentiment: BONKNewsArticle['sentiment']): SentimentDisplay => {
    const { label, score } = sentiment;
    
    // Use score-based thresholds for more accurate sentiment
    if (score >= 0.65) {
      return {
        icon: <TrendingUp className="h-3 w-3" />,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-100 dark:bg-green-900',
        text: 'Bullish'
      };
    } else if (score <= 0.35) {
      return {
        icon: <TrendingDown className="h-3 w-3" />,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-100 dark:bg-red-900',
        text: 'Bearish'
      };
    } else {
      return {
        icon: <Minus className="h-3 w-3" />,
        color: 'text-gray-600 dark:text-gray-400',
        bgColor: 'bg-gray-100 dark:bg-gray-900',
        text: 'Neutral'
      };
    }
  };

  if (loading) {
    return (
      <Card className="border-orange-200 hover:shadow-orange-100 dark:border-orange-700 dark:hover:shadow-orange-900">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-orange-600 dark:text-orange-400 flex items-center justify-between">
            <span>Recently Happened to Bonk</span>
            <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
              Alpha
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-orange-500" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading BONK news...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-orange-200 hover:shadow-orange-100 dark:border-orange-700 dark:hover:shadow-orange-900">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-orange-600 dark:text-orange-400 flex items-center justify-between">
            <span>Recently Happened to Bonk</span>
            <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
              Alpha
            </Badge>
          </CardTitle>
        </CardHeader>
              <CardContent>
        <div className="text-center py-8">
          {error && (
            <div className="mb-4">
              {error.includes('fallback') ? (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
                  <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                    ⚠️ {error}
                  </p>
                </div>
              ) : (
                <p className="text-red-600 dark:text-red-400">{error}</p>
              )}
            </div>
          )}
          <div className="space-y-2">
            <Button onClick={() => fetchBONKNews()} variant="outline" size="sm" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Real API
            </Button>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Rate limit resets every hour. You can try again or wait for auto-refresh.
            </p>
          </div>
        </div>
      </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200 hover:shadow-orange-100 dark:border-orange-700 dark:hover:shadow-orange-900">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-orange-600 dark:text-orange-400 flex items-center justify-between">
          <span>Recently Happened to Bonk</span>
                     <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
             Alpha
           </Badge>
        </CardTitle>
        
      </CardHeader>
      
      <CardContent className="space-y-4">
        {news.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Newspaper className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No BONK news available at the moment</p>
            <p className="text-sm">Check back later for updates</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedTimeGroups.slice(0, displayCount).map((timeGroup) => (
              <div key={timeGroup} className="space-y-3">
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-1">
                  {timeGroup}
                </div>
                {groupedNews[timeGroup].map((article) => {
                  const sentimentDisplay = getSentimentDisplay(article.sentiment);
                  const isExpanded = expandedArticles.has(article.id);
                  return (
                    <div key={article.id} className="pl-4 border-l-2 border-orange-200 dark:border-orange-700">
                                             <div className="space-y-2">
                         <div className="flex items-start justify-between">
                           <h4 className="text-sm font-medium text-gray-900 dark:text-white leading-tight flex-1 pr-2">
                             {article.title}
                           </h4>
                           <div className="flex items-center space-x-2">
                             <Badge 
                               variant="outline" 
                               className={`text-xs px-2 py-1 ${sentimentDisplay.bgColor} ${sentimentDisplay.color} border-current`}
                             >
                               <span className="flex items-center">
                                 {sentimentDisplay.icon}
                                 <span className="ml-1">{sentimentDisplay.text}</span>
                               </span>
                             </Badge>
                             <Button 
                               onClick={() => toggleArticleExpansion(article.id)}
                               variant="ghost" 
                               size="sm"
                               className="h-6 w-6 p-0 hover:bg-orange-100 dark:hover:bg-orange-900"
                             >
                               {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                             </Button>
                           </div>
                         </div>
                        
                                                 {/* Show summary only when expanded */}
                         {isExpanded && (
                           <div className="space-y-2">
                             <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                               {article.summary}
                             </p>
                             
                             {/* Sentiment Insights */}
                             <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                               <div className="flex items-center">
                                 <span className="mr-1">Sentiment Score:</span>
                                 <span className={`font-medium ${sentimentDisplay.color}`}>
                                   {(article.sentiment.score * 100).toFixed(0)}%
                                 </span>
                               </div>
                               <Badge variant="outline" className="text-xs px-2 py-0.5">
                                 {article.category}
                               </Badge>
                               {article.readingTime && (
                                 <div className="flex items-center">
                                   <Eye className="h-3 w-3 mr-1" />
                                   {article.readingTime}
                                 </div>
                               )}
                             </div>
                           </div>
                         )}
                        
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-500 dark:text-gray-400">
                              {article.source}
                            </span>
                            <Badge variant="outline" className="text-xs px-2 py-0.5">
                              {article.sourceCount} source
                            </Badge>
                          </div>
                          <a 
                            href={article.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 flex items-center"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Read more
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            
            {/* Show More/Less Toggle */}
            {news.length > 6 && (
              <div className="text-center pt-2">
                <Button 
                  onClick={() => setDisplayCount(displayCount === 6 ? news.length : 6)}
                  variant="ghost"
                  size="sm"
                  className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300"
                >
                  {displayCount === 6 ? `Show All (${news.length})` : 'Show Less'}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
