import { TOO_MANY_REQUESTS_ERROR_MESSAGE } from '@app-builder/models/http-errors';
import { createRateLimiter, type RateLimitOptions } from '@app-builder/utils/rate-limiter.server';
import { createMiddleware } from '@tanstack/react-start';
import { getRequest, setResponseStatus } from '@tanstack/react-start/server';

function getClientIp(request: Request): string {
  // ignore X-Forwarded-For header which is not secured
  return request.headers.get('x-real-ip') ?? 'unknown';
}

// The status and the message are the contract with the browser: see TOO_MANY_REQUESTS_ERROR_MESSAGE.
function rejectTooManyRequests(): never {
  setResponseStatus(429);
  throw new Error(TOO_MANY_REQUESTS_ERROR_MESSAGE);
}

// Function middleware keyed by client IP, for server functions called before sign-in:
//   createServerFn({ method: 'POST' }).middleware([rateLimitIpFunctionMiddleware({ max: 1, windowMs: 1000 })])
// List it first: a refused call then skips the next middlewares and their backend calls.
export function rateLimitIpFunctionMiddleware(options: RateLimitOptions) {
  const check = createRateLimiter(options);

  return createMiddleware({ type: 'function' }).server(async ({ next }) => {
    if (!check(getClientIp(getRequest())).allowed) rejectTooManyRequests();
    return next();
  });
}
