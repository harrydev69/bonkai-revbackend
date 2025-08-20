// app/services/fast-data-service.ts
// Fast data fetching service with progressive loading and smart caching

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class FastDataService {
  private cache = new Map<string, CacheEntry<any>>();
  private pendingRequests = new Map<string, Promise<any>>();

  // Get data with progressive loading (show cached, update in background)
  async getData<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: {
      ttl?: number; // Cache time to live in milliseconds
      staleWhileRevalidate?: number; // How long to show stale data while updating
      background?: boolean; // Whether to update in background
    } = {}
  ): Promise<T> {
    const {
      ttl = 30000, // 30 seconds default
      staleWhileRevalidate = 60000, // 1 minute default
      background = true
    } = options;

    // Check cache first
    const cached = this.cache.get(key);
    const now = Date.now();

    if (cached && now - cached.timestamp < ttl) {
      // Fresh data, return immediately
      return cached.data;
    }

    if (cached && now - cached.timestamp < staleWhileRevalidate) {
      // Stale but acceptable data, return immediately and update in background
      if (background) {
        this.updateInBackground(key, fetcher, ttl);
      }
      return cached.data;
    }

    // No valid cache, fetch fresh data
    return this.fetchFreshData(key, fetcher, ttl);
  }

  // Fetch fresh data with deduplication
  private async fetchFreshData<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number
  ): Promise<T> {
    // Check if there's already a pending request
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    // Create new request
    const request = fetcher().then(
      (data) => {
        // Cache successful response
        this.cache.set(key, {
          data,
          timestamp: Date.now(),
          ttl
        });
        
        // Remove from pending requests
        this.pendingRequests.delete(key);
        
        return data;
      },
      (error) => {
        // Remove from pending requests on error
        this.pendingRequests.delete(key);
        throw error;
      }
    );

    // Store pending request
    this.pendingRequests.set(key, request);
    
    return request;
  }

  // Update data in background without blocking UI
  private async updateInBackground<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number
  ): Promise<void> {
    try {
      const data = await fetcher();
      this.cache.set(key, {
        data,
        timestamp: Date.now(),
        ttl
      });
    } catch (error) {
      // Silently fail background updates
      console.warn(`Background update failed for ${key}:`, error);
    }
  }

  // Prefetch data for better perceived performance
  async prefetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 30000
  ): Promise<void> {
    // Don't wait for the result
    this.fetchFreshData(key, fetcher, ttl).catch(() => {
      // Silently handle prefetch errors
    });
  }

  // Clear cache for specific key or all
  clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  // Get cache statistics
  getCacheStats(): {
    size: number;
    keys: string[];
    hitRate: number;
  } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      hitRate: 0 // TODO: Implement hit rate tracking
    };
  }
}

// Singleton instance
export const fastDataService = new FastDataService();

// Specialized BONK data fetcher with progressive loading
export class BonkDataService {
  private static instance: BonkDataService;
  private dataService = fastDataService;

  static getInstance(): BonkDataService {
    if (!BonkDataService.instance) {
      BonkDataService.instance = new BonkDataService();
    }
    return BonkDataService.instance;
  }

  // Get BONK price with progressive loading
  async getPrice(): Promise<any> {
    return this.dataService.getData(
      'bonk-price',
      async () => {
        const response = await fetch('/api/bonk/price', {
          cache: 'no-store',
          keepalive: true
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch price: ${response.status}`);
        }
        
        return response.json();
      },
      {
        ttl: 30000, // 30 seconds
        staleWhileRevalidate: 60000, // 1 minute
        background: true
      }
    );
  }

  // Get BONK sentiment with progressive loading
  async getSentiment(): Promise<any> {
    return this.dataService.getData(
      'bonk-sentiment',
      async () => {
        const response = await fetch('/api/bonk/sentiment', {
          cache: 'no-store',
          keepalive: true
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch sentiment: ${response.status}`);
        }
        
        return response.json();
      },
      {
        ttl: 60000, // 1 minute
        staleWhileRevalidate: 120000, // 2 minutes
        background: true
      }
    );
  }

  // Prefetch all BONK data for instant loading
  async prefetchAll(): Promise<void> {
    await Promise.all([
      this.dataService.prefetch('bonk-price', async () => {
        const response = await fetch('/api/bonk/price', { cache: 'no-store' });
        return response.json();
      }),
      this.dataService.prefetch('bonk-sentiment', async () => {
        const response = await fetch('/api/bonk/sentiment', { cache: 'no-store' });
        return response.json();
      })
    ]);
  }

  // Clear BONK cache
  clearCache(): void {
    this.dataService.clearCache('bonk-price');
    this.dataService.clearCache('bonk-sentiment');
  }
}

// Export singleton instance
export const bonkDataService = BonkDataService.getInstance();
