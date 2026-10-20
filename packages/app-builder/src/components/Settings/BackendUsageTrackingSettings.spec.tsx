import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import toast from 'react-hot-toast';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BackendUsageTrackingSettings } from './BackendUsageTrackingSettings';

const mocks = vi.hoisted(() => ({
  isManagedMarble: false,
  roles: ['ADMIN'],
  getUsageTracking: vi.fn<() => Promise<{ enabled: boolean }>>(),
  updateUsageTracking: vi.fn<(args: { data: { enabled: boolean } }) => Promise<{ enabled: boolean }>>(),
}));

vi.mock('@app-builder/contexts/AppConfigContext', () => ({
  AppConfigContext: { useValue: () => ({ isManagedMarble: mocks.isManagedMarble }) },
}));
vi.mock('@app-builder/services/organization/organization-detail', () => ({
  useOrganizationDetails: () => ({ currentUser: { roles: mocks.roles } }),
}));
vi.mock('@app-builder/server-fns/usage-tracking', () => ({
  getUsageTrackingFn: mocks.getUsageTracking,
  updateUsageTrackingFn: mocks.updateUsageTracking,
}));
vi.mock('@tanstack/react-start', () => ({ useServerFn: (fn: unknown) => fn }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.isManagedMarble = false;
  mocks.roles = ['ADMIN'];
  mocks.getUsageTracking.mockResolvedValue({ enabled: true });
  mocks.updateUsageTracking.mockResolvedValue({ enabled: false });
});
afterEach(cleanup);

function renderSettings() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <BackendUsageTrackingSettings />
    </QueryClientProvider>,
  );
}

async function openSettings() {
  await userEvent.click(screen.getByRole('button', { name: 'account:usage_tracking.title' }));
  return screen.findByRole('switch', { name: 'account:usage_tracking.enabled' });
}

describe('backend usage tracking settings', () => {
  it('is hidden on hosted Marble without fetching the setting', () => {
    mocks.isManagedMarble = true;
    renderSettings();

    expect(screen.queryByRole('button')).toBeNull();
    expect(mocks.getUsageTracking).not.toHaveBeenCalled();
  });

  it.each(['VIEWER', 'ANALYST', 'BUILDER', 'PUBLISHER', 'TENANT_ADMIN'])(
    'is hidden for a self-hosted %s without fetching the setting',
    (role) => {
      mocks.roles = [role];
      renderSettings();

      expect(screen.queryByRole('button')).toBeNull();
      expect(mocks.getUsageTracking).not.toHaveBeenCalled();
    },
  );

  it.each(['ADMIN', 'MARBLE_ADMIN'])('shows the backend setting to a self-hosted %s', async (role) => {
    mocks.roles = [role];
    renderSettings();

    const toggle = await openSettings();

    expect(toggle.getAttribute('aria-checked')).toBe('true');
    expect(screen.getByText('account:usage_tracking.description')).toBeDefined();
  });

  it('opts out only after the backend confirms and prevents duplicate updates', async () => {
    let resolveUpdate!: (value: { enabled: boolean }) => void;
    mocks.updateUsageTracking.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveUpdate = resolve;
        }),
    );
    renderSettings();
    const toggle = await openSettings();

    await userEvent.click(toggle);

    expect(mocks.updateUsageTracking).toHaveBeenCalledWith({ data: { enabled: false } });
    expect(toggle.getAttribute('aria-checked')).toBe('true');
    expect((toggle as HTMLButtonElement).disabled).toBe(true);

    await act(async () => resolveUpdate({ enabled: false }));

    await waitFor(() => expect(toggle.getAttribute('aria-checked')).toBe('false'));
    expect((toggle as HTMLButtonElement).disabled).toBe(false);
  });

  it('can opt back in', async () => {
    mocks.getUsageTracking.mockResolvedValueOnce({ enabled: false });
    mocks.updateUsageTracking.mockResolvedValueOnce({ enabled: true });
    renderSettings();
    const toggle = await openSettings();

    await userEvent.click(toggle);

    expect(mocks.updateUsageTracking).toHaveBeenCalledWith({ data: { enabled: true } });
    await waitFor(() => expect(toggle.getAttribute('aria-checked')).toBe('true'));
  });

  it('preserves the existing preference and shows feedback if the update fails', async () => {
    mocks.updateUsageTracking.mockRejectedValueOnce(new Error('Backend unavailable'));
    renderSettings();
    const toggle = await openSettings();

    await userEvent.click(toggle);

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('common:errors.unknown'));
    expect(toggle.getAttribute('aria-checked')).toBe('true');
    expect((toggle as HTMLButtonElement).disabled).toBe(false);
  });

  it('offers retry when the current tracking preference cannot be loaded', async () => {
    mocks.getUsageTracking.mockRejectedValueOnce(new Error('Backend unavailable'));
    renderSettings();
    await userEvent.click(screen.getByRole('button', { name: 'account:usage_tracking.title' }));

    expect(await screen.findByRole('alert')).toBeDefined();
    expect(screen.queryByRole('switch')).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: 'common:retry' }));

    expect(await screen.findByRole('switch')).toBeDefined();
    expect(mocks.getUsageTracking).toHaveBeenCalledTimes(2);
  });
});
