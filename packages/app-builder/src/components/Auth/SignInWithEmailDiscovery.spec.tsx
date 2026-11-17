import { TOO_MANY_REQUESTS_ERROR_MESSAGE } from '@app-builder/models/http-errors';
import type { DiscoverSignInResult } from '@app-builder/server-fns/auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SignInWithEmailDiscovery } from './SignInWithEmailDiscovery';

const mocks = vi.hoisted(() => ({
  discoverSignIn: vi.fn<() => Promise<DiscoverSignInResult>>(),
}));

vi.mock('@app-builder/server-fns/auth', () => ({ discoverSignInFn: mocks.discoverSignIn }));
vi.mock('@tanstack/react-start', () => ({ useServerFn: (fn: unknown) => fn }));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  Trans: ({ i18nKey }: { i18nKey: string }) => i18nKey,
}));

const tooManyRequests = new Error(TOO_MANY_REQUESTS_ERROR_MESSAGE);

beforeEach(() => {
  mocks.discoverSignIn.mockReset();
  window.location.hash = '';
});
afterEach(cleanup);

async function submitEmail() {
  // No retry delay: the delays themselves are React Query defaults.
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retryDelay: 0 } } });
  render(
    <QueryClientProvider client={queryClient}>
      <SignInWithEmailDiscovery prefilledEmail="" redirectTo={null} signedOut={false} />
    </QueryClientProvider>,
  );
  await userEvent.type(screen.getByRole('textbox'), 'jane@example.com');
  await userEvent.click(screen.getByRole('button', { name: 'auth:sign_in.discovery.continue' }));
}

describe('SignInWithEmailDiscovery', () => {
  it('retries a rate-limited discovery and redirects once it goes through', async () => {
    mocks.discoverSignIn
      .mockRejectedValueOnce(tooManyRequests)
      .mockRejectedValueOnce(tooManyRequests)
      // A hash change is the only navigation jsdom performs.
      .mockResolvedValueOnce({ type: 'redirect', href: '#idp' });

    await submitEmail();

    await waitFor(() => expect(window.location.hash).toBe('#idp'));
    expect(mocks.discoverSignIn).toHaveBeenCalledTimes(3);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('shows the too many requests message once the retries run out', async () => {
    mocks.discoverSignIn.mockRejectedValue(tooManyRequests);

    await submitEmail();

    expect((await screen.findByRole('alert')).textContent).toBe('common:errors.too_many_requests');
    expect(mocks.discoverSignIn).toHaveBeenCalledTimes(4);
  });

  it('does not retry other failures', async () => {
    mocks.discoverSignIn.mockRejectedValue(new Error('boom'));

    await submitEmail();

    expect((await screen.findByRole('alert')).textContent).toBe('auth:sign_in.discovery.errors.discovery_failed');
    expect(mocks.discoverSignIn).toHaveBeenCalledTimes(1);
  });
});
