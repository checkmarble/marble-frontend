import { isTracfinRequestError } from '@app-builder/models/tracfin';

const MAX_RETRIES = 2;

/**
 * Retry policy of the TRACFIN queries, in place of the application default (3 retries of anything).
 * A 4xx is an answer, not a glitch: a 422 "navigation unavailable", a 403 or a 400 would only be
 * repeated, and would take seconds to surface. Only a timeout, a server error or a network error is
 * retried, twice at most. Anything that is not a `TracfinRequestError` is a bug and is not retried.
 */
export function shouldRetryTracfinQuery(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_RETRIES) return false;
  if (!isTracfinRequestError(error)) return false;
  return error.error.kind === 'timeout' || error.error.kind === 'server' || error.error.kind === 'network';
}
