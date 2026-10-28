export interface RateLimitOptions {
  max: number; // Maximum number of hits allowed per key within the window
  windowMs: number; // Window length in milliseconds
}

export type RateLimitResult = { allowed: true } | { allowed: false; retryAfterSeconds: number };

export type RateLimiter = (key: string) => RateLimitResult;

// Fixed-window, in-memory limiter. Each limiter owns its own store, so two routes with
// separate limiters never share a budget. Counts are per process: with N instances the
// effective limit is N * max.
export function createRateLimiter({ max, windowMs }: RateLimitOptions, now: () => number = Date.now): RateLimiter {
  const hits = new Map<string, { count: number; resetAt: number }>();
  let nextSweepAt = now() + windowMs;

  return (key) => {
    const current = now();

    // Lazily drop expired windows so the store doesn't grow with every key ever seen.
    if (current >= nextSweepAt) {
      for (const [k, entry] of hits) {
        if (entry.resetAt <= current) hits.delete(k);
      }
      nextSweepAt = current + windowMs;
    }

    const entry = hits.get(key);
    if (!entry || entry.resetAt <= current) {
      hits.set(key, { count: 1, resetAt: current + windowMs });
      return { allowed: true };
    }

    entry.count += 1;
    if (entry.count > max) {
      return { allowed: false, retryAfterSeconds: Math.ceil((entry.resetAt - current) / 1000) };
    }
    return { allowed: true };
  };
}
