import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryHistory, createRootRoute, createRouter, RouterContextProvider } from '@tanstack/react-router';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useScreeningReviewDecisionMutation } from './screening-review-decision';

vi.mock('@app-builder/server-fns/screening-review', async () => {
  const { createServerFn } = await import('@tanstack/react-start');
  const { createClientRpc } = await import('@tanstack/react-start/client-rpc');
  return {
    reviewScreeningReviewMatchFn: createServerFn({ method: 'POST' }).handler(
      createClientRpc('review-screening-review-match') as never,
    ),
  };
});
const input = {
  caseId: '33333333-3333-4333-8333-333333333333',
  screeningId: '44444444-4444-4444-8444-444444444444',
  matchId: '55555555-5555-4555-8555-555555555555',
  status: 'no_hit',
  comment: 'Different person',
} as const;
// Plain JSON rather than the server's seroval encoding, which the same client path decodes: the
// request is what these tests check.
const json = (body: unknown) => new Response(JSON.stringify(body), { headers: { 'content-type': 'application/json' } });

/**
 * Without the Start compiler, `getStartOptions` takes its server branch and reads the request's Start
 * context. In the browser it reads `window.__TSS_START_OPTIONS__`, unset here: no custom fetch, so
 * the transport falls back to the global `fetch`, as it does in the app.
 */
function withStartOptions<T>(fn: () => Promise<T>) {
  const storage = (globalThis as unknown as Record<symbol, { run: <R>(store: unknown, fn: () => R) => R }>)[
    Symbol.for('tanstack-start:start-storage-context')
  ]!;
  return storage.run({ startOptions: {} }, fn);
}

function renderMutation() {
  const queryClient = new QueryClient();
  // `useServerFn` follows redirects with the router.
  const router = createRouter({
    routeTree: createRootRoute(),
    history: createMemoryHistory({ initialEntries: ['/cases/screening-review'] }),
  });
  const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(undefined);
  const hook = renderHook(() => useScreeningReviewDecisionMutation(), {
    wrapper: ({ children }) => (
      <RouterContextProvider router={router}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </RouterContextProvider>
    ),
  });
  return { ...hook, navigate };
}

describe('useScreeningReviewDecisionMutation over the server function transport', () => {
  const fetchSpy = vi.fn<typeof fetch>();
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchSpy);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetAllMocks();
  });

  it.each([true, false])('sends the decision with keepalive=%s', async (keepalive) => {
    fetchSpy.mockResolvedValue(json({ result: { ok: true, screeningStatus: 'in_review', caseClosed: false } }));
    const { result } = renderMutation();
    let response: unknown;
    await act(async () => {
      response = await withStartOptions(() => result.current.mutateAsync({ input, keepalive }));
    });

    expect(response).toEqual({ ok: true, screeningStatus: 'in_review', caseClosed: false });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0]!;
    expect(String(url)).toContain('review-screening-review-match');
    expect(init?.method).toBe('POST');
    expect(init?.keepalive).toBe(keepalive || undefined);
    expect(new Headers(init?.headers).get('x-tsr-serverFn')).toBe('true');
    expect(String(init?.body)).toContain('Different person');
  });

  it('resolves undefined after following a redirect, such as an expired session', async () => {
    fetchSpy.mockResolvedValue(json({ isSerializedRedirect: true, to: '/sign-in', statusCode: 307 }));
    const { result, navigate } = renderMutation();
    let response: unknown = 'not set';
    await act(async () => {
      response = await withStartOptions(() => result.current.mutateAsync({ input, keepalive: true }));
    });

    expect(navigate).toHaveBeenCalledWith(expect.objectContaining({ to: '/sign-in' }));
    expect(response).toBeUndefined();
  });
});
