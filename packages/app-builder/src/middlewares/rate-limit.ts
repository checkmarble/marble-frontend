import { TOO_MANY_REQUESTS_ERROR_MESSAGE } from '@app-builder/models/http-errors';
import { createRateLimiter, perUserRateLimitKey, type RateLimitOptions } from '@app-builder/utils/rate-limiter.server';
import { createMiddleware } from '@tanstack/react-start';
import { getRequest, setResponseStatus } from '@tanstack/react-start/server';
import { authMiddleware } from './auth-middleware';

function getClientIp(request: Request): string {
  return request.headers.get('x-real-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
}

// The status and the message are the contract with the browser: see TOO_MANY_REQUESTS_ERROR_MESSAGE.
function rejectTooManyRequests(): never {
  setResponseStatus(429);
  throw new Error(TOO_MANY_REQUESTS_ERROR_MESSAGE);
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
// Per-user keys are the user id, otherwise the email. A request with neither is rejected and not counted.
export function rateLimitFunctionMiddleware({ scope = 'user', ...options }: RateLimitFunctionOptions) {
  const check = createRateLimiter(options);

  return createMiddleware({ type: 'function' })
    .middleware([authMiddleware])
    .server(async ({ next, context }) => {
      const { user } = context.authInfo;
      const key = scope === 'organization' ? user.organizationId : perUserRateLimitKey(user.actorIdentity);
      if (key === undefined) {
        setResponseStatus(401);
        throw new Error('Missing user identity');
      }

      if (!check(key).allowed) rejectTooManyRequests();
      return next();
    });
}

// Function middleware keyed by client IP, for server functions called before sign-in:
//   createServerFn({ method: 'POST' }).middleware([rateLimitIpFunctionMiddleware({ max: 1, windowMs: 1000 }), servicesMiddleware])
// List it first: a refused call then skips the next middlewares and their backend calls.
// ponytail: X-Real-IP / X-Forwarded-For are spoofable unless the proxy in front overwrites them, and
// requests without either share the 'unknown' budget. Key on a proxy-set header if abuse shows up.
export function rateLimitIpFunctionMiddleware(options: RateLimitOptions) {
  const check = createRateLimiter(options);

  return createMiddleware({ type: 'function' }).server(async ({ next }) => {
    if (!check(getClientIp(getRequest())).allowed) rejectTooManyRequests();
    return next();
  });
}
