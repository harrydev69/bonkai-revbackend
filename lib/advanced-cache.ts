// Advanced caching system with intelligent TTL and invalidation
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  tags: string[];
}

interface CacheOptions {
  ttl?: number;
  tags?: string[];
  maxSize?: number;
  enableCompression?: boolean;
}

class AdvancedCache {
  private store = new Map<string, CacheEntry<any>>();
  private tagIndex = new Map<string, Set<string>>();
  private maxSize: number;
  private enableCompression: boolean;

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize || 1000;
    this.enableCompression = options.enableCompression || false;
  }

  // Set cache with intelligent TTL based on data type
  async set<T>(
    key: string, 
    data: T, 
    options: CacheOptions = {}
  ): Promise<void> {
    const ttl = this.calculateTTL(data, options.ttl);
    const tags = options.tags || [];
    
    // Cleanup if at capacity
    if (this.store.size >= this.maxSize) {
      this.evictLRU();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      accessCount: 0,
      lastAccessed: Date.now(),
      tags
    };

    this.store.set(key, entry);
    
    // Index by tags for bulk invalidation
    tags.forEach(tag => {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(key);
    });
  }

  // Get with automatic TTL check and access tracking
  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    
    if (!entry) return null;
    
    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.store.delete(key);
      this.removeFromTagIndex(key, entry.tags);
      return null;
    }

    // Update access stats
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    
    return entry.data;
  }

  // Intelligent TTL calculation based on data type
  private calculateTTL(data: any, customTTL?: number): number {
    if (customTTL) return customTTL;

    // Crypto price data: 30 seconds
    if (data?.price || data?.current_price) return 30 * 1000;
    
    // Market data: 1 minute
    if (data?.market_cap || data?.volume) return 60 * 1000;
    
    // Social sentiment: 5 minutes
    if (data?.sentiment || data?.score) return 5 * 60 * 1000;
    
    // News/feeds: 15 minutes
    if (data?.feeds || data?.news) return 15 * 60 * 1000;
    
    // Static data: 1 hour
    if (data?.tokenomics || data?.profile) return 60 * 60 * 1000;
    
    // Default: 5 minutes
    return 5 * 60 * 1000;
  }

  // Bulk invalidation by tags
  async invalidateByTags(tags: string[]): Promise<void> {
    const keysToDelete = new Set<string>();
    
    tags.forEach(tag => {
      const keys = this.tagIndex.get(tag);
      if (keys) {
        keys.forEach(key => keysToDelete.add(key));
        this.tagIndex.delete(tag);
      }
    });

    keysToDelete.forEach(key => {
      const entry = this.store.get(key);
      if (entry) {
        this.removeFromTagIndex(key, entry.tags);
        this.store.delete(key);
      }
    });
  }

  // LRU eviction
  private evictLRU(): void {
    let oldestKey = '';
    let oldestTime = Date.now();
    
    for (const [key, entry] of this.store.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      const entry = this.store.get(oldestKey);
      if (entry) {
        this.removeFromTagIndex(oldestKey, entry.tags);
        this.store.delete(oldestKey);
      }
    }
  }

  private removeFromTagIndex(key: string, tags: string[]): void {
    tags.forEach(tag => {
      const keys = this.tagIndex.get(tag);
      if (keys) {
        keys.delete(key);
        if (keys.size === 0) {
          this.tagIndex.delete(tag);
        }
      }
    });
  }

  // Cache statistics
  getStats() {
    return {
      size: this.store.size,
      maxSize: this.maxSize,
      tagCount: this.tagIndex.size,
      hitRate: this.calculateHitRate()
    };
  }

  private calculateHitRate(): number {
    // Implementation for hit rate calculation
    return 0.85; // Placeholder
  }

  // Clear all cache
  clear(): void {
    this.store.clear();
    this.tagIndex.clear();
  }
}

// Global cache instance
export const advancedCache = new AdvancedCache({
  maxSize: 2000,
  enableCompression: true
});

// Utility functions for common caching patterns
export async function cachedFetch<T>(
  url: string,
  options: CacheOptions = {}
): Promise<T> {
  const cacheKey = `fetch:${url}`;
  
  // Try cache first
  const cached = await advancedCache.get<T>(cacheKey);
  if (cached) return cached;
  
  // Fetch fresh data
  const response = await fetch(url, {
    cache: 'no-store',
    signal: AbortSignal.timeout(10000)
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Cache the result
  await advancedCache.set(cacheKey, data, options);
  
  return data;
}

// Stale-while-revalidate pattern
export async function staleWhileRevalidate<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  // Return stale data immediately if available
  const stale = await advancedCache.get<T>(key);
  
  // Fetch fresh data in background
  const freshPromise = fetcher().then(async (data) => {
    await advancedCache.set(key, data, options);
    return data;
  }).catch(() => stale); // Fallback to stale on error
  
  // Return stale data immediately, fresh data will update cache
  if (stale) {
    freshPromise.catch(() => {}); // Don't wait for background update
    return stale;
  }
  
  // Wait for fresh data if no stale data
  return freshPromise;
}
