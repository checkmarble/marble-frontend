import { DashboardPage } from '@bo/components/pages/dashboard';
import type { DashboardPreferencesPatch } from '@bo/schemas/dashboard';
import { type DashboardPreferences, patchDashboardPreferences } from '@bo/utils/dashboard-preferences';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { DashboardIndicator, DashboardMetrics } from 'marble-api';
import { type ReactNode, useState } from 'react';
import { Tooltip } from 'ui-design-system';
import { afterEach, describe, expect, it, vi } from 'vitest';

const { fetchMetrics } = vi.hoisted(() => ({ fetchMetrics: vi.fn() }));

vi.mock('@bo/data/dashboard', () => ({
  dashboardQueryOptions: (months: number) => ({ queryKey: ['dashboard', months], queryFn: () => fetchMetrics(months) }),
}));

vi.mock('@bo/hooks/useDashboardPreferences', () => ({
  useDashboardPreferences: () => {
    const [preferences, setPreferences] = useState<DashboardPreferences>({ months: 6, indicator: 'organizations' });
    return {
      preferences,
      updatePreferences: async (patch: DashboardPreferencesPatch) => {
        setPreferences((current) => patchDashboardPreferences(current, patch));
      },
    };
  },
}));

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, children, ...props }: { to: string; children: ReactNode }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

const indicator: DashboardIndicator = {
  total: 4,
  coverage: { all_since: '2026-10-06T12:00:00Z', new_since: '2026-10-06T12:00:00Z' },
  weeks: [
    { start: '2026-09-28T00:00:00Z', end: '2026-10-05T00:00:00Z', all: null, new: null, partial: false },
    { start: '2026-10-05T00:00:00Z', end: '2026-10-07T12:00:00Z', all: 4, new: 0, partial: true },
  ],
  recent: [{ id: 'org-1', name: 'Current name', created_at: '2026-10-06T12:00:00Z' }],
  recent_has_unknown: true,
};
const metrics: DashboardMetrics = {
  generated_at: '2026-10-07T12:00:00Z',
  months: 6,
  range_start: '2026-04-07T12:00:00Z',
  indicators: { organizations: indicator, tenants: indicator, users: indicator, licenses: indicator },
};

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

function renderDashboard() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <Tooltip.Provider>
        <DashboardPage />
      </Tooltip.Provider>
    </QueryClientProvider>,
  );
}

describe('dashboard indicators and history', () => {
  it('selects an indicator and refetches every indicator for the shared period', async () => {
    fetchMetrics.mockResolvedValue(metrics);
    renderDashboard();
    expect(await screen.findByRole('tabpanel', { name: 'Organizations' })).toBeTruthy();
    fireEvent.click(screen.getByRole('tab', { name: /Tenants/ }));
    expect(screen.getByRole('tab', { name: /Tenants/ }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('tabpanel', { name: 'Tenants' })).toBeTruthy();
    expect(fetchMetrics).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('radio', { name: '12 months' }));
    await waitFor(() => expect(fetchMetrics).toHaveBeenLastCalledWith(12));
    expect(await screen.findByRole('tabpanel', { name: 'Tenants' })).toBeTruthy();
  });

  it('moves between indicators with the arrow keys', async () => {
    fetchMetrics.mockResolvedValue(metrics);
    renderDashboard();
    const organizations = await screen.findByRole('tab', { name: /Organizations/ });
    fireEvent.keyDown(organizations, { key: 'ArrowDown' });
    expect(screen.getByRole('tab', { name: /Tenants/ }).getAttribute('aria-selected')).toBe('true');
    fireEvent.keyDown(screen.getByRole('tab', { name: /Tenants/ }), { key: 'End' });
    expect(screen.getByRole('tabpanel', { name: 'Licences' })).toBeTruthy();
  });

  it('distinguishes missing history from zero and exposes partial intervals and known recency', async () => {
    fetchMetrics.mockResolvedValue(metrics);
    renderDashboard();
    const panel = await screen.findByRole('tabpanel', { name: 'Organizations' });
    fireEvent.click(within(panel).getByText('Weekly data'));
    const table = within(panel).getByRole('table');
    expect(within(table).getAllByRole('cell', { name: 'Unavailable' })).toHaveLength(2);
    expect(within(table).getByRole('cell', { name: '0' })).toBeTruthy();
    expect(within(table).getByRole('cell', { name: '4' })).toBeTruthy();
    expect(within(table).getByRole('cell', { name: 'Partial week' })).toBeTruthy();
    expect(within(panel).getByText('Current name')).toBeTruthy();
    expect(within(panel).getByText(/Some dates are unknown/)).toBeTruthy();
    expect(within(panel).getByRole('link', { name: 'View all organizations' }).getAttribute('href')).toBe(
      '/organizations',
    );
  });

  it('only explains unknown creation dates when fewer than three recent records are shown', async () => {
    const recent = [1, 2, 3].map((i) => ({ id: `org-${i}`, name: `Org ${i}`, created_at: '2026-10-06T12:00:00Z' }));
    const full = { ...indicator, recent };
    fetchMetrics.mockResolvedValue({
      ...metrics,
      indicators: { organizations: full, tenants: full, users: full, licenses: full },
    });
    renderDashboard();
    const panel = await screen.findByRole('tabpanel', { name: 'Organizations' });
    expect(within(panel).getByText('Org 3')).toBeTruthy();
    expect(within(panel).queryByText(/Some dates are unknown/)).toBeNull();
  });

  it('shows a licences indicator linking to licence management', async () => {
    fetchMetrics.mockResolvedValue(metrics);
    renderDashboard();
    fireEvent.click(await screen.findByRole('tab', { name: /Licences/ }));
    const panel = screen.getByRole('tabpanel', { name: 'Licences' });
    expect(within(panel).getByRole('link', { name: 'View all licences' }).getAttribute('href')).toBe('/licenses');
  });

  it('offers a retry after a failed initial request', async () => {
    fetchMetrics.mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce(metrics);
    renderDashboard();
    fireEvent.click(await screen.findByRole('button', { name: 'Retry' }));
    expect(await screen.findByRole('tabpanel', { name: 'Organizations' })).toBeTruthy();
    expect(fetchMetrics).toHaveBeenCalledTimes(2);
  });
});
