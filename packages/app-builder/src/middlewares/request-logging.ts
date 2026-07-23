import {
  getRequestOrgId,
  getRequestServerFn,
  getRequestUserEmail,
  logger,
  runWithLogger,
} from '@app-builder/utils/logger.server';
import { createMiddleware } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';

const EXCLUDE_PREFIXES = ['/healthcheck'];

// Resolve a correlation id for the request, preferring an upstream-provided one so
// logs stitch together across the proxy/gateway boundary:
//   1. `x-cloud-trace-context` (GCP) — `TRACE_ID/SPAN_ID;o=1`, keep the trace id.
//   2. `x-request-id`
//   3. `traceparent` (W3C) — `00-TRACE_ID-SPAN_ID-FLAGS`, keep the trace id.
//   4. a freshly generated UUID.
function resolveRequestId(request: Request): string {
  const cloudTrace = request.headers.get('x-cloud-trace-context');

  if (cloudTrace) {
    const requestId = cloudTrace.split('/')[0]?.trim();
    if (requestId) return requestId;
  }

  const requestIdHeader = request.headers.get('x-request-id');
  if (requestIdHeader) return requestIdHeader;

  const traceparent = request.headers.get('traceparent');
  if (traceparent) {
    const traceId = traceparent.split('-')[1]?.trim();
    if (traceId) return traceId;
  }

  return crypto.randomUUID();
}

export const requestLoggingMiddleware = createMiddleware().server(async ({ next }) => {
  const request = getRequest();
  const url = new URL(request.url);

  if (EXCLUDE_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) {
    return await next();
  }

  const requestId = resolveRequestId(request);
  const ip = request.headers.get('x-real-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();

  const child = logger.child({ request_id: requestId });
  const start = performance.now();

  const fields = {
    method: request.method,
    path: url.pathname,
    user_agent: request.headers.get('user-agent') ?? undefined,
    ip,
  };
  const message = `${request.method} ${url.pathname}`;

  return runWithLogger(child, async () => {
    try {
      const result = await next();

      child.info(
        {
          ...fields,
          serverfn: getRequestServerFn(),
          org_id: getRequestOrgId(),
          user: getRequestUserEmail(),
          status: result.response.status,
          latency: Math.round(performance.now() - start),
        },
        message,
      );

      return result;
    } catch (err) {
      child.error(
        {
          ...fields,
          err,
          serverfn: getRequestServerFn(),
          org_id: getRequestOrgId(),
          user: getRequestUserEmail(),
          status: 500,
          latency: Math.round(performance.now() - start),
        },
        message,
      );

      throw err;
    }
  });
});
