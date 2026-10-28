import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRateLimiter, perUserRateLimitKey } from './rate-limiter.server';

describe('createRateLimiter', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const setup = (max: number, windowMs: number) => {
    let time = 0;
    const check = createRateLimiter({ max, windowMs }, () => time);
    return {
      check,
      advance: (ms: number) => {
        time += ms;
      },
    };
  };

  it('allows up to max hits within the window', () => {
    const { check } = setup(3, 1000);

    expect(check('a')).toEqual({ allowed: true });
    expect(check('a')).toEqual({ allowed: true });
    expect(check('a')).toEqual({ allowed: true });
    expect(check('a')).toEqual({ allowed: false, retryAfterSeconds: 1 });
  });

  it('reports the remaining window in seconds, rounded up', () => {
    const { check, advance } = setup(1, 10_000);

    check('a');
    advance(2500);
    expect(check('a')).toEqual({ allowed: false, retryAfterSeconds: 8 });
  });

  it('resets once the window has elapsed', () => {
    const { check, advance } = setup(1, 1000);

    check('a');
    expect(check('a').allowed).toBe(false);
    advance(1000);
    expect(check('a')).toEqual({ allowed: true });
  });

  it('counts keys independently', () => {
    const { check } = setup(1, 1000);

    expect(check('a').allowed).toBe(true);
    expect(check('b').allowed).toBe(true);
    expect(check('a').allowed).toBe(false);
  });

  it('keeps separate stores per limiter', () => {
    const first = createRateLimiter({ max: 1, windowMs: 1000 });
    const second = createRateLimiter({ max: 1, windowMs: 1000 });

    expect(first('a').allowed).toBe(true);
    expect(second('a').allowed).toBe(true);
  });

  it('rejects a max below one', () => {
    expect(() => createRateLimiter({ max: 0, windowMs: 1_000 }, () => 0)).toThrow(
      new RangeError('max must be at least 1, got 0'),
    );
  });

  it('defaults to a monotonic clock', () => {
    const monotonicNow = vi.spyOn(performance, 'now').mockReturnValue(5_000);
    const check = createRateLimiter({ max: 1, windowMs: 1_000 });

    expect(check('a')).toEqual({ allowed: true });
    expect(check('a')).toEqual({ allowed: false, retryAfterSeconds: 1 });
    expect(monotonicNow).toHaveBeenCalled();
  });
});

describe('perUserRateLimitKey', () => {
  it('uses the user id when both id and email are present', () => {
    expect(perUserRateLimitKey({ userId: 'user-1', email: 'a@example.com' })).toBe('user-1');
  });

  it('uses the email when the user id is absent', () => {
    expect(perUserRateLimitKey({ email: 'a@example.com' })).toBe('a@example.com');
  });

  it('returns undefined when both id and email are absent', () => {
    expect(perUserRateLimitKey({})).toBeUndefined();
  });
});
