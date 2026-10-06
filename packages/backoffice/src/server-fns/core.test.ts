import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  cookie: {
    data: {} as Record<string, unknown>,
    update: vi.fn(),
  },
  getCredentials: vi.fn(),
  authFetch: vi.fn(),
}));

vi.mock('@bo/env', () => ({ env: { API_BASE_URL: 'https://api.example', SESSION_SECRET: 'secret' } }));
vi.mock('@bo/middlewares/auth', () => ({ needAuth: {} }));
vi.mock('@tanstack/react-start/server', () => ({ useSession: async () => mocks.cookie }));
vi.mock('marble-api', () => ({ marblecoreApi: { getCredentials: mocks.getCredentials } }));
vi.mock('@tanstack/react-start', () => ({
  createServerFn: () => {
    let validator: { parse: (data: unknown) => unknown } | undefined;
    const builder = {
      middleware: () => builder,
      validator: (schema: typeof validator) => {
        validator = schema;
        return builder;
      },
      handler: (handler: (options: unknown) => unknown) => async (options?: { data: unknown }) =>
        handler({
          data: validator?.parse(options?.data),
          context: { authFetch: mocks.authFetch },
        }),
    };
    return builder;
  },
}));

import { getUserPreferencesFn, updateDashboardPreferencesFn, updateUserPreferencesFn } from './core';

describe('user preference cookie boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.cookie.data = { theme: 'dark', unrelated: 'preserved' };
    mocks.cookie.update.mockImplementation(async (patch) => {
      Object.assign(mocks.cookie.data, patch);
    });
    mocks.getCredentials.mockResolvedValue({ credentials: { actor_identity: { user_id: 'alice' } } });
  });

  it('uses the authenticated account and preserves theme and unrelated cookie data', async () => {
    await updateDashboardPreferencesFn({ data: { months: 3, modes: { users: 'new' } } });
    await updateDashboardPreferencesFn({ data: { modes: { tenants: 'new' } } });
    expect(mocks.getCredentials).toHaveBeenCalledWith({ baseUrl: 'https://api.example', fetch: mocks.authFetch });
    expect(mocks.cookie.data).toEqual({
      theme: 'dark',
      unrelated: 'preserved',
      dashboard: {
        userId: 'alice',
        months: 3,
        modes: { organizations: 'all', tenants: 'new', users: 'new', licenses: 'all' },
      },
    });
  });

  it('writes the theme without an account lookup and keeps dashboard selections', async () => {
    mocks.cookie.data['dashboard'] = {
      userId: 'alice',
      months: 3,
      modes: { organizations: 'all', tenants: 'new', users: 'new', licenses: 'all' },
    };
    await updateUserPreferencesFn({ data: { theme: 'light' } });
    expect(mocks.getCredentials).not.toHaveBeenCalled();
    expect(mocks.cookie.data).toEqual({
      theme: 'light',
      unrelated: 'preserved',
      dashboard: {
        userId: 'alice',
        months: 3,
        modes: { organizations: 'all', tenants: 'new', users: 'new', licenses: 'all' },
      },
    });
  });

  it('replaces the single stored account when another authenticated account updates preferences', async () => {
    mocks.cookie.data['dashboard'] = {
      userId: 'bob',
      months: 12,
      modes: { organizations: 'new', tenants: 'new', users: 'new', licenses: 'all' },
    };
    await updateDashboardPreferencesFn({ data: { modes: { tenants: 'new' } } });
    expect(mocks.cookie.data['dashboard']).toEqual({
      userId: 'alice',
      months: 6,
      modes: { organizations: 'all', tenants: 'new', users: 'all', licenses: 'all' },
    });
  });

  it('rejects a client supplied identity and avoids writes without an authenticated user identity', async () => {
    await expect(
      Reflect.apply(updateDashboardPreferencesFn, undefined, [{ data: { userId: 'bob' } }]),
    ).rejects.toThrow();
    mocks.getCredentials.mockResolvedValue({ credentials: { actor_identity: {} } });
    await expect(updateDashboardPreferencesFn({ data: { months: 12 } })).rejects.toThrow('authenticated user');
    expect(mocks.cookie.update).not.toHaveBeenCalled();
  });

  it('normalizes malformed stored selections before exposing them to SSR', async () => {
    mocks.cookie.data['theme'] = 'invalid';
    mocks.cookie.data['dashboard'] = { userId: 'alice', months: 2, modes: { users: 'new' }, extra: 'ignored' };
    await expect(getUserPreferencesFn()).resolves.toEqual({
      theme: 'light',
      unrelated: 'preserved',
      dashboard: {
        userId: 'alice',
        months: 6,
        modes: { organizations: 'all', tenants: 'all', users: 'new', licenses: 'all' },
      },
    });
  });
});
