import { NextResponse } from 'next/server';

// Force dynamic rendering since this route uses request.url and fetches live data
export const dynamic = 'force-dynamic';

// BONK-specific news using RapidAPI Crypto News API
export async function GET(req: Request) {
  const url = new URL(req.url);
  const page = url.searchParams.get('page') || '1';
  const limit = url.searchParams.get('limit') || '15';
  const timeFrame = url.searchParams.get('time_frame') || '24h';

  try {
    // RapidAPI Crypto News API endpoint for BONK
    const rapidApiUrl = `https://crypto-news51.p.rapidapi.com/api/v1/crypto/articles/search?title_keywords=bonk&page=${page}&limit=${limit}&time_frame=${timeFrame}&format=json`;
    
    // Add retry logic for rate limiting
    let response;
    let retryCount = 0;
    const maxRetries = 2;
    
    while (retryCount <= maxRetries) {
      response = await fetch(rapidApiUrl, {
        headers: {
          'x-rapidapi-host': 'crypto-news51.p.rapidapi.com',
          'x-rapidapi-key': process.env.RAPIDAPI_KEY || '93788551bcmsh2422458411e626bp1f163cjsn327dca269732',
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Always get fresh news
      });

      if (response.status === 429 && retryCount < maxRetries) {
        // Rate limited - wait longer and retry
        retryCount++;
        const waitTime = Math.pow(2, retryCount) * 5000; // Exponential backoff: 10s, 20s
        console.log(`Rate limited, waiting ${waitTime}ms before retry ${retryCount}`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      break; // Success or non-retryable error
    }

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error(`Rate limit exceeded. Please try again in a few minutes.`);
      }
      throw new Error(`RapidAPI responded with ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the data to match our needs with enhanced fields
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
      // Enhanced sentiment analysis
      sentiment: {
        label: article.sentiment?.label || 'neutral',
        score: article.sentiment?.score || 0.5
      },
      // Calculate relative time
      relativeTime: getRelativeTime(article.published),
      // Add source count for credibility
      sourceCount: 1,
      // Add reading time estimate
      readingTime: estimateReadingTime(article.summary || ''),
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
    
    // Provide comprehensive fallback news data when API fails
    const fallbackArticles = [
      {
        id: 'fallback-1',
        title: 'BONK Ecosystem Continues to Grow',
        summary: 'The BONK community remains strong with ongoing developments and integrations across the Solana ecosystem. Recent partnerships and community initiatives continue to expand BONK\'s reach in the DeFi space.',
        link: '#',
        source: 'BONKai Analytics',
        published: new Date().toISOString(),
        category: 'BONK',
        subCategory: 'Ecosystem',
        language: 'en',
        timeZone: 'UTC',
        media: null,
        sentiment: { label: 'neutral', score: 0.5 },
        relativeTime: 'Just now',
        sourceCount: 1,
        readingTime: '2 min read'
      },
      {
        id: 'fallback-2',
        title: 'Solana Network Performance Update',
        summary: 'Recent network upgrades continue to improve transaction speeds and reduce fees for BONK and other Solana tokens. The network\'s performance metrics show significant improvements in throughput and reliability.',
        link: '#',
        source: 'BONKai Analytics',
        published: new Date().toISOString(),
        category: 'BONK',
        subCategory: 'Network',
        language: 'en',
        timeZone: 'UTC',
        media: null,
        sentiment: { label: 'bullish', score: 0.7 },
        relativeTime: 'Just now',
        sourceCount: 1,
        readingTime: '2 min read'
      },
      {
        id: 'fallback-3',
        title: 'Memecoin Market Trends Analysis',
        summary: 'The memecoin sector continues to evolve with BONK leading innovation in the Solana ecosystem. Community-driven projects and viral marketing strategies are reshaping the landscape.',
        link: '#',
        source: 'BONKai Analytics',
        published: new Date().toISOString(),
        category: 'BONK',
        subCategory: 'Market',
        language: 'en',
        timeZone: 'UTC',
        media: null,
        sentiment: { label: 'bullish', score: 0.6 },
        relativeTime: 'Just now',
        sourceCount: 1,
        readingTime: '2 min read'
      },
      {
        id: 'fallback-4',
        title: 'DeFi Integration Opportunities',
        summary: 'BONK\'s integration with various DeFi protocols opens new opportunities for yield farming and liquidity provision. The ecosystem is becoming more interconnected.',
        link: '#',
        source: 'BONKai Analytics',
        published: new Date().toISOString(),
        category: 'BONK',
        subCategory: 'DeFi',
        language: 'en',
        timeZone: 'UTC',
        media: null,
        sentiment: { label: 'neutral', score: 0.5 },
        relativeTime: 'Just now',
        sourceCount: 1,
        readingTime: '1 min read'
      },
      {
        id: 'fallback-5',
        title: 'Community Governance Update',
        summary: 'BONK community governance continues to evolve with new proposals and voting mechanisms. Community members are actively participating in shaping the future direction.',
        link: '#',
        source: 'BONKai Analytics',
        published: new Date().toISOString(),
        category: 'BONK',
        subCategory: 'Governance',
        language: 'en',
        timeZone: 'UTC',
        media: null,
        sentiment: { label: 'neutral', score: 0.5 },
        relativeTime: 'Just now',
        sourceCount: 1,
        readingTime: '1 min read'
      }
    ];
    
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch BONK news',
      articles: fallbackArticles,
      total: fallbackArticles.length,
      page: parseInt(page),
      limit: parseInt(limit),
      timeFrame,
      lastUpdated: new Date().toISOString(),
      isFallback: true
    }, { status: 200 }); // Return 200 with fallback data instead of 500
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

// Helper function to estimate reading time
function estimateReadingTime(text: string): string {
  const wordsPerMinute = 200;
  const wordCount = text.split(' ').length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  
  if (minutes < 1) return '< 1 min read';
  if (minutes === 1) return '1 min read';
  return `${minutes} min read`;
}
