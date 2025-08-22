"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, ExternalLink, Clock, Newspaper, ChevronDown, ChevronUp } from "lucide-react";

interface BONKNewsArticle {
  id: string;
  title: string;
  summary: string;
  link: string;
  source: string;
  published: string;
  category: string;
  subCategory: string;
  relativeTime: string;
  media?: any;
}

interface BONKNewsResponse {
  articles: BONKNewsArticle[];
  total: number;
  page: number;
  limit: number;
  timeFrame: string;
  lastUpdated: string;
}

export function BONKNewsFeed() {
  const [news, setNews] = useState<BONKNewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchBONKNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/bonk/news?limit=20&time_frame=24h', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch BONK news: ${response.status}`);
      }
      
      const data: BONKNewsResponse = await response.json();
      setNews(data.articles || []);
      setLastUpdated(data.lastUpdated);
      
    } catch (err: any) {
      setError(err.message || 'Failed to fetch BONK news');
      console.error('BONK News Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBONKNews();
  }, []);

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
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button onClick={fetchBONKNews} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
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
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
              Alpha
            </Badge>
            <Button 
              onClick={() => setIsExpanded(!isExpanded)}
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0 hover:bg-orange-100 dark:hover:bg-orange-900"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            <Button 
              onClick={fetchBONKNews} 
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0 hover:bg-orange-100 dark:hover:bg-orange-900"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleString() : 'Just now'}
        </div>
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
            {sortedTimeGroups.map((timeGroup) => (
              <div key={timeGroup} className="space-y-3">
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-1">
                  {timeGroup}
                </div>
                {groupedNews[timeGroup].map((article) => (
                  <div key={article.id} className="pl-4 border-l-2 border-orange-200 dark:border-orange-700">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white leading-tight">
                        {article.title}
                      </h4>
                      
                      {/* Show summary only when expanded */}
                      {isExpanded && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                          {article.summary}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500 dark:text-gray-400">
                            {article.source}
                          </span>
                          <Badge variant="outline" className="text-xs px-2 py-0.5">
                            1 source
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
                ))}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
