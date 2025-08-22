import { NextResponse } from 'next/server';

// Force dynamic rendering since this route fetches live data
export const dynamic = 'force-dynamic';

export type CoinGeckoStatusResponse = {
  status_updates: Array<{
    description: string;
    category: string;
    created_at: string;
    user: string;
    user_title: string;
    pin: boolean;
    project: {
      type: string;
      id: string;
      name: string;
      symbol: string;
      image: {
        thumb: string;
        small: string;
        large: string;
      };
    };
  }>;
};

export type StatusUpdatePayload = {
  status_updates: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    user: string;
    userTitle: string;
    created_at: string;
    isPinned: boolean;
    projectInfo: {
      name: string;
      symbol: string;
      image: string;
    };
  }>;
  metadata: {
    totalUpdates: number;
    pinnedUpdates: number;
    lastUpdated: string;
  };
};

export const revalidate = 1800; // 30 minutes - status updates change slowly

async function fetchBONKStatusUpdates(): Promise<StatusUpdatePayload | null> {
  try {
    const API_BASE = process.env.COINGECKO_API_BASE || 'https://api.coingecko.com/api/v3';
    const API_KEY = process.env.COINGECKO_API_KEY;
    
    const url = `${API_BASE}/coins/bonk/status_updates?per_page=50&page=1`;
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'User-Agent': 'BONKai-Analytics/1.0'
    };
    
    if (API_KEY) {
      headers['x-cg-pro-api-key'] = API_KEY;
    }

    const res = await fetch(url, { 
      headers,
      next: { revalidate: 1800 }
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error');
      throw new Error(`CoinGecko API error: ${res.status} - ${errorText}`);
    }

    const data = await res.json() as CoinGeckoStatusResponse;
    
    if (!data.status_updates || data.status_updates.length === 0) {
      // Return empty payload instead of throwing error
      return {
        status_updates: [],
        metadata: {
          totalUpdates: 0,
          pinnedUpdates: 0,
          lastUpdated: new Date().toISOString()
        }
      };
    }

    // Process status updates
    const processedUpdates = data.status_updates.map((update, index) => ({
      id: `status-${index}-${Date.now()}`,
      title: update.description.length > 100 
        ? `${update.description.substring(0, 100)}...` 
        : update.description,
      description: update.description,
      category: update.category || 'general',
      user: update.user || 'Unknown',
      userTitle: update.user_title || 'Community Member',
      created_at: update.created_at,
      isPinned: update.pin || false,
      projectInfo: {
        name: update.project?.name || 'BONK',
        symbol: update.project?.symbol || 'BONK',
        image: update.project?.image?.thumb || ''
      }
    }));

    // Sort by pinned first, then by creation date
    processedUpdates.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    const pinnedUpdates = processedUpdates.filter(update => update.isPinned).length;

    return {
      status_updates: processedUpdates,
      metadata: {
        totalUpdates: processedUpdates.length,
        pinnedUpdates,
        lastUpdated: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('BONK status updates API error:', error);
    // Return empty payload on error instead of null
    return {
      status_updates: [],
      metadata: {
        totalUpdates: 0,
        pinnedUpdates: 0,
        lastUpdated: new Date().toISOString()
      }
    };
  }
}

export async function GET() {
  try {
    const statusData = await fetchBONKStatusUpdates();
    
    if (!statusData) {
      return NextResponse.json(
        { error: 'Failed to fetch status updates' },
        { status: 502 }
      );
    }

    return NextResponse.json(statusData, {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=1800, stale-while-revalidate=1800'
      }
    });

  } catch (error: any) {
    console.error('Status API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
