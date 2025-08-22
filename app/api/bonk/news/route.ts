import { NextResponse } from 'next/server';

// BONK-specific news using RapidAPI Crypto News API
export async function GET(req: Request) {
  const url = new URL(req.url);
  const page = url.searchParams.get('page') || '1';
  const limit = url.searchParams.get('limit') || '15';
  const timeFrame = url.searchParams.get('time_frame') || '24h';

  try {
    // RapidAPI Crypto News API endpoint for BONK
    const rapidApiUrl = `https://crypto-news51.p.rapidapi.com/api/v1/crypto/articles/search?title_keywords=bonk&page=${page}&limit=${limit}&time_frame=${timeFrame}&format=json`;
    
    const response = await fetch(rapidApiUrl, {
      headers: {
        'x-rapidapi-host': 'crypto-news51.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPIDAPI_KEY || '93788551bcmsh2422458411e626bp1f163cjsn327dca269732',
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Always get fresh news
    });

    if (!response.ok) {
      throw new Error(`RapidAPI responded with ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the data to match our needs
    const articles = (data || []).map((article: any) => ({
      id: article.link || Math.random().toString(36).substr(2, 9),
      title: article.title || 'BONK News Update',
      summary: article.summary || 'Latest BONK ecosystem update',
      link: article.link || '#',
      source: article.authors?.['0']?.name || 'Crypto News',
      published: article.published || new Date().toISOString(),
      category: article.category || 'BONK',
      subCategory: article.subCategory || 'News',
      language: article.language || 'en',
      timeZone: article.timeZone || 'UTC',
      media: article.media || null,
      // Calculate relative time
      relativeTime: getRelativeTime(article.published),
    }));

    return NextResponse.json({ 
      articles,
      total: articles.length,
      page: parseInt(page),
      limit: parseInt(limit),
      timeFrame,
      lastUpdated: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('BONK News API Error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch BONK news',
      articles: [],
      total: 0,
      page: parseInt(page),
      limit: parseInt(limit),
      timeFrame,
      lastUpdated: new Date().toISOString()
    }, { status: 500 });
  }
}

// Helper function to calculate relative time
function getRelativeTime(published: string): string {
  if (!published) return 'Just now';
  
  try {
    const publishedDate = new Date(published);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return 'Yesterday';
    if (diffInHours < 72) return '2 days ago';
    if (diffInHours < 96) return '3 days ago';
    if (diffInHours < 120) return '4 days ago';
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  } catch {
    return 'Recently';
  }
}
