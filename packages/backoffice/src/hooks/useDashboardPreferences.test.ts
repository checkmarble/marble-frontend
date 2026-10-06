import type { StoredDashboardPreferences } from '@bo/utils/dashboard-preferences';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  stored: undefined as StoredDashboardPreferences | undefined,
  userId: 'alice',
  update: vi.fn(),
  router: { invalidate: vi.fn() },
}));

vi.mock('@bo/server-fns/core', () => ({
  updateUserPreferencesFn: { kind: 'theme' },
  updateDashboardPreferencesFn: { kind: 'dashboard' },
}));
vi.mock('@tanstack/react-start', () => ({
  useServerFn:
    ({ kind }: { kind: string }) =>
    (options: { data: unknown }) =>
      mocks.update({ kind, ...options }),
}));
vi.mock('@tanstack/react-router', () => ({
  useRouter: () => mocks.router,
  getRouteApi: (id: string) =>
    id === '__root__'
      ? {
          useRouteContext: () => ({ userPreferences: { dashboard: mocks.stored } }),
        }
      : {
          useLoaderData: () => ({ currentUser: { actor_identity: { user_id: mocks.userId } } }),
        },
}));

import { useDashboardPreferences } from './useDashboardPreferences';
import { useUserPreferencesUpdater } from './useUserPreferencesUpdater';

describe('dashboard preference controls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.userId = 'alice';
    mocks.stored = undefined;
    mocks.update.mockResolvedValue(undefined);
    mocks.router.invalidate.mockResolvedValue(undefined);
  });

  it('uses SSR selections immediately and defaults for a different account', () => {
    mocks.stored = {
      userId: 'alice',
      months: 12,
      indicator: 'users',
    };
    const { result, rerender } = renderHook(useDashboardPreferences);
    expect(result.current.preferences).toEqual({ months: 12, indicator: 'users' });
    mocks.userId = 'bob';
    rerender();
    expect(result.current.preferences).toEqual({ months: 6, indicator: 'organizations' });
  });

  it('responds immediately while serializing rapid independent selections and theme writes', async () => {
    let finishFirst: () => void = () => undefined;
    mocks.update.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finishFirst = resolve;
        }),
    );
    const { result } = renderHook(() => ({
      dashboard: useDashboardPreferences(),
      updater: useUserPreferencesUpdater(),
    }));
    let writes: Promise<unknown>[] = [];
    act(() => {
      writes = [
        result.current.dashboard.updatePreferences({ months: 3 }),
        result.current.dashboard.updatePreferences({ indicator: 'users' }),
        result.current.updater.updateTheme('dark'),
      ];
    });
    expect(result.current.dashboard.preferences).toEqual({ months: 3, indicator: 'users' });
    await waitFor(() => expect(mocks.update).toHaveBeenCalledTimes(1));
    await act(async () => {
      finishFirst();
      await Promise.all(writes);
    });
    expect(mocks.update.mock.calls.map(([request]) => [request.kind, request.data])).toEqual([
      ['dashboard', { months: 3 }],
      ['dashboard', { indicator: 'users' }],
      ['theme', { theme: 'dark' }],
    ]);
    expect(result.current.dashboard.preferences).toEqual({ months: 3, indicator: 'users' });
  });

  it('rolls back a failed selection while retaining a later independent successful change', async () => {
    mocks.update.mockRejectedValueOnce(new Error('Could not save'));
    const { result } = renderHook(useDashboardPreferences);
    let failure: Promise<unknown> = Promise.resolve();
    let success: Promise<unknown> = Promise.resolve();
    act(() => {
      failure = result.current.updatePreferences({ months: 12 }).catch((error: Error) => error.message);
      success = result.current.updatePreferences({ indicator: 'tenants' });
    });
    await act(async () => {
      expect(await failure).toBe('Could not save');
      await success;
    });
    expect(result.current.preferences).toEqual({ months: 6, indicator: 'tenants' });
    expect(mocks.update).toHaveBeenCalledTimes(2);
  });

  it('cancels a queued dashboard write after the signed-in account changes', async () => {
    let finishTheme: () => void = () => undefined;
    mocks.update.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finishTheme = resolve;
        }),
    );
    const { result, rerender } = renderHook(() => ({
      dashboard: useDashboardPreferences(),
      updater: useUserPreferencesUpdater(),
    }));
    const theme = result.current.updater.updateTheme('dark');
    await waitFor(() => expect(mocks.update).toHaveBeenCalledTimes(1));
    let setting: Promise<unknown> = Promise.resolve();
    act(() => {
      setting = result.current.dashboard.updatePreferences({ months: 12 }).catch((error: Error) => error.message);
    });
    mocks.userId = 'bob';
    rerender();
    expect(result.current.dashboard.preferences.months).toBe(6);
    await act(async () => {
      finishTheme();
      await theme;
      expect(await setting).toBe('The signed-in account changed');
    });
    expect(mocks.update).toHaveBeenCalledTimes(1);
    expect(result.current.dashboard.preferences.months).toBe(6);
  });
});
