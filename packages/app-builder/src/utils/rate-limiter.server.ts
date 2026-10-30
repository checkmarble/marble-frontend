export interface RateLimitOptions {
  max: number; // Maximum number of hits allowed per key within the window
  windowMs: number; // Window length in milliseconds
}

export type RateLimitResult = { allowed: true } | { allowed: false; retryAfterSeconds: number };

export type RateLimiter = (key: string) => RateLimitResult;

// User id, otherwise email. Undefined when both are absent.
export function perUserRateLimitKey(actorIdentity: { userId?: string; email?: string }): string | undefined {
  return actorIdentity.userId ?? actorIdentity.email;
}

// Fixed-window, in-memory limiter. Each limiter owns its own store, so two routes with
// separate limiters never share a budget. Counts are per process: with N instances the
// effective limit is N * max. The default clock is monotonic (`performance.now`, called
// with its receiver) so a wall-clock step backward cannot stretch resetAt or Retry-After.
export function createRateLimiter(
  { max, windowMs }: RateLimitOptions,
  now: () => number = () => performance.now(),
): RateLimiter {
  if (!(windowMs > 0)) throw new RangeError(`windowMs must be a positive number, got ${windowMs}`);
  if (!(max >= 1)) throw new RangeError(`max must be at least 1, got ${max}`);
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
