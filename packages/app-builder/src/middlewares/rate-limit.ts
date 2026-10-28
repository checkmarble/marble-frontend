import { createRateLimiter, type RateLimitOptions } from '@app-builder/utils/rate-limiter.server';
import { createMiddleware } from '@tanstack/react-start';
import { getRequest, setResponseStatus } from '@tanstack/react-start/server';
import { authMiddleware } from './auth-middleware';

function getClientIp(request: Request): string {
  return request.headers.get('x-real-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
}

// Request middleware keyed by client IP, for server routes (`routes/ressources/*`):
//   server: { middleware: [rateLimitRequestMiddleware({ max: 5, windowMs: 60_000 })], handlers: { ... } }
// Each call creates its own store; reuse the returned middleware to share a budget across routes.
export function rateLimitRequestMiddleware(options: RateLimitOptions) {
  const check = createRateLimiter(options);

  return createMiddleware().server(async ({ next }) => {
    const result = check(getClientIp(getRequest()));
    if (!result.allowed) {
      return new Response('Too Many Requests', {
        status: 429,
        headers: { 'Retry-After': String(result.retryAfterSeconds) },
      });
    }
    return next();
  });
}

interface RateLimitFunctionOptions extends RateLimitOptions {
  /** Count hits per user (default) or share the budget across the whole organization. */
  scope?: 'user' | 'organization';
}

// Function middleware keyed by the authenticated user or organization, for server functions:
//   createServerFn({ method: 'POST' }).middleware([authMiddleware, rateLimitFunctionMiddleware({ max: 30, windowMs: 60_000 })])
// Pulls in `authMiddleware` itself; TanStack dedupes it when the server function lists it too.
export function rateLimitFunctionMiddleware({ scope = 'user', ...options }: RateLimitFunctionOptions) {
  const check = createRateLimiter(options);

  return createMiddleware({ type: 'function' })
    .middleware([authMiddleware])
    .server(async ({ next, context }) => {
      const { user } = context.authInfo;
      const key =
        scope === 'organization'
          ? user.organizationId
          : (user.actorIdentity.userId ?? user.actorIdentity.email ?? getClientIp(getRequest()));

      const result = check(key);
      if (!result.allowed) {
        setResponseStatus(429);
        throw new Error('Too many requests');
      }
      return next();
    });
}
