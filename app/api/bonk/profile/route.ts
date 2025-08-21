import { NextResponse } from 'next/server';

export const revalidate = 600; // 10 minutes - profile data changes slowly

type CoinGeckoProfileResponse = {
  id: string;
  symbol: string;
  name: string;
  description: {
    en: string;
  };
  links: {
    homepage: string[];
    blockchain_site: string[];
    official_forum_url: string[];
    chat_url: string[];
    announcement_url: string[];
    twitter_screen_name: string;
    telegram_channel_identifier: string;
    subreddit_url: string;
    repos_url: {
      github: string[];
      bitbucket: string[];
    };
  };
  image: {
    thumb: string;
    small: string;
    large: string;
  };
  market_data: {
    ath: {
      usd: number;
    };
    ath_change_percentage: {
      usd: number;
    };
    ath_date: {
      usd: string;
    };
    atl: {
      usd: number;
    };
    atl_change_percentage: {
      usd: number;
    };
    atl_date: {
      usd: string;
    };
    circulating_supply: number;
    total_supply: number;
    max_supply: number | null;
    fully_diluted_valuation: {
      usd: number | null;
    };
  };
  categories: string[];
  sentiment_votes_up_percentage: number;
  sentiment_votes_down_percentage: number;
  community_data: {
    twitter_followers: number;
    reddit_subscribers: number;
    reddit_accounts_active_48h: number;
    telegram_channel_user_count: number;
  };
  developer_data: {
    forks: number;
    stars: number;
    subscribers: number;
    total_issues: number;
    closed_issues: number;
    pull_requests_merged: number;
    pull_request_contributors: number;
    commit_count_4_weeks: number;
  };
  last_updated: string;
};

type ProfilePayload = {
  ath: {
    price: number;
    date: string;
    changePct: number;
  };
  atl: {
    price: number;
    date: string;
    changePct: number;
  };
  supply: {
    circulating: number;
    total: number | null;
    max: number | null;
  };
  links: {
    website?: string;
    twitter?: string;
    github?: string[];
    subreddit?: string;
    telegram?: string;
  };
  categories: string[];
  sentiment: {
    upPct: number;
    downPct: number;
  };
  community: {
    twitterFollowers?: number;
    redditSubs?: number;
    telegramUsers?: number;
  };
  developer: {
    stars?: number;
    forks?: number;
    commits4w?: number;
    totalIssues?: number;
    closedIssues?: number;
    pullRequests?: number;
  };
  description: string;
  lastUpdated: string;
};

async function fetchBONKProfile(): Promise<ProfilePayload | null> {
  try {
    const API_BASE = process.env.COINGECKO_API_BASE || 'https://api.coingecko.com/api/v3';
    const API_KEY = process.env.COINGECKO_API_KEY;
    
    const url = `${API_BASE}/coins/bonk?localization=false&tickers=false&market_data=true&community_data=true&developer_data=true&sparkline=false`;
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'User-Agent': 'BONKai-Analytics/1.0'
    };
    
    if (API_KEY) {
      headers['x-cg-pro-api-key'] = API_KEY;
    }
    
    const res = await fetch(url, {
      headers,
      next: { revalidate: 600 }
    });
    
    if (!res.ok) {
      if (res.status === 429) {
        console.warn('CoinGecko rate limit hit for profile');
        return null;
      }
      throw new Error(`CoinGecko profile ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json() as CoinGeckoProfileResponse;
    
    return {
      ath: {
        price: data.market_data.ath.usd,
        date: data.market_data.ath_date.usd,
        changePct: data.market_data.ath_change_percentage.usd,
      },
      atl: {
        price: data.market_data.atl.usd,
        date: data.market_data.atl_date.usd,
        changePct: data.market_data.atl_change_percentage.usd,
      },
      supply: {
        circulating: data.market_data.circulating_supply,
        total: data.market_data.total_supply,
        max: data.market_data.max_supply,
      },
      links: {
        website: data.links.homepage?.[0],
        twitter: data.links.twitter_screen_name,
        github: data.links.repos_url.github,
        subreddit: data.links.subreddit_url,
        telegram: data.links.telegram_channel_identifier,
      },
      categories: data.categories,
      sentiment: {
        upPct: data.sentiment_votes_up_percentage,
        downPct: data.sentiment_votes_down_percentage,
      },
      community: {
        twitterFollowers: data.community_data.twitter_followers,
        redditSubs: data.community_data.reddit_subscribers,
        telegramUsers: data.community_data.telegram_channel_user_count,
      },
      developer: {
        stars: data.developer_data.stars,
        forks: data.developer_data.forks,
        commits4w: data.developer_data.commit_count_4_weeks,
        totalIssues: data.developer_data.total_issues,
        closedIssues: data.developer_data.closed_issues,
        pullRequests: data.developer_data.pull_requests_merged,
      },
      description: data.description.en,
      lastUpdated: data.last_updated,
    };
    
  } catch (error) {
    console.error('BONK profile fetch error:', error);
    return null;
  }
}

export async function GET() {
  try {
    const profile = await fetchBONKProfile();
    
    if (profile) {
      return NextResponse.json(profile, {
        headers: {
          'Cache-Control': 'public, max-age=600, s-maxage=600, stale-while-revalidate=1200',
          'X-Source': 'coingecko',
          'X-Endpoint': 'profile'
        }
      });
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch BONK profile data' },
      { status: 502 }
    );
    
  } catch (error) {
    console.error('BONK profile API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
