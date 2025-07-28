interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface PendingRequest<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error: any) => void;
}

class RequestCache {
  private cache = new Map<string, CacheEntry<any>>();
  private pendingRequests = new Map<string, PendingRequest<any>>();
  private defaultTTL = 5000; // 5 seconds default cache

  private getCacheKey(url: string, options?: any): string {
    return `${url}:${JSON.stringify(options || {})}`;
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() > entry.expiresAt;
  }

  async get<T>(key: string, fetcher: () => Promise<T>, ttl: number = this.defaultTTL): Promise<T> {
    const cacheKey = this.getCacheKey(key);

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && !this.isExpired(cached)) {
      return cached.data as T;
    }

    // Check if there's already a pending request for this key
    const pending = this.pendingRequests.get(cacheKey);
    if (pending) {
      return pending.promise as Promise<T>;
    }

    // Create new request
    let resolve: (value: T) => void;
    let reject: (error: any) => void;

    const promise = new Promise<T>((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
    });

    this.pendingRequests.set(cacheKey, {
      promise,
      resolve: resolve!,
      reject: reject!,
    });

    try {
      const result = await fetcher();

      // Cache the result
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttl,
      });

      resolve!(result);
      this.pendingRequests.delete(cacheKey);
      return result;
    } catch (error) {
      reject!(error);
      this.pendingRequests.delete(cacheKey);
      throw error;
    }
  }

  clear(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  invalidate(key: string): void {
    const cacheKey = this.getCacheKey(key);
    this.cache.delete(cacheKey);
  }
}

export const requestCache = new RequestCache();
