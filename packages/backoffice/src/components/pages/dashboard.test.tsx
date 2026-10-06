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
    const [preferences, setPreferences] = useState<DashboardPreferences>({
      months: 6,
      modes: { organizations: 'all', tenants: 'all', users: 'all', licenses: 'all' },
    });
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

describe('dashboard controls and history', () => {
  it('switches each card independently and refetches all cards for the shared period', async () => {
    fetchMetrics.mockResolvedValue(metrics);
    renderDashboard();
    const organizations = await screen.findByRole('region', { name: 'Organizations' });
    const tenants = screen.getByRole('region', { name: 'Tenants' });
    fireEvent.click(within(tenants).getByRole('radio', { name: 'New' }));
    expect(within(tenants).getByRole('radio', { name: 'New' }).getAttribute('aria-checked')).toBe('true');
    expect(within(organizations).getByRole('radio', { name: 'All' }).getAttribute('aria-checked')).toBe('true');
    expect(fetchMetrics).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('radio', { name: '12 months' }));
    await waitFor(() => expect(fetchMetrics).toHaveBeenLastCalledWith(12));
    expect(
      within(await screen.findByRole('region', { name: 'Tenants' }))
        .getByRole('radio', { name: 'New' })
        .getAttribute('aria-checked'),
    ).toBe('true');
  });

  it('distinguishes missing history from zero and exposes partial intervals and known recency', async () => {
    fetchMetrics.mockResolvedValue(metrics);
    renderDashboard();
    const card = await screen.findByRole('region', { name: 'Organizations' });
    fireEvent.click(within(card).getByRole('radio', { name: 'New' }));
    fireEvent.click(within(card).getByText('Weekly data'));
    const table = within(card).getByRole('table');
    expect(within(table).getByRole('cell', { name: 'Unavailable' })).toBeTruthy();
    expect(within(table).getByRole('cell', { name: '0' })).toBeTruthy();
    expect(within(table).getByRole('cell', { name: 'Partial week' })).toBeTruthy();
    expect(within(card).getByRole('img', { name: /weekly new records/ })).toBeTruthy();
    expect(within(card).getByText('Current name')).toBeTruthy();
    expect(within(card).getByText(/Some dates are unknown/)).toBeTruthy();
    expect(within(card).getByRole('link', { name: 'View all organizations' }).getAttribute('href')).toBe(
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
    const card = await screen.findByRole('region', { name: 'Organizations' });
    expect(within(card).getByText('Org 3')).toBeTruthy();
    expect(within(card).queryByText(/Some dates are unknown/)).toBeNull();
  });

  it('shows a licences card linking to licence management', async () => {
    fetchMetrics.mockResolvedValue(metrics);
    renderDashboard();
    const card = await screen.findByRole('region', { name: 'Licences' });
    expect(within(card).getByRole('link', { name: 'View all licences' }).getAttribute('href')).toBe('/licenses');
    expect(within(card).getByRole('radio', { name: 'All' }).getAttribute('aria-checked')).toBe('true');
  });

  it('offers a retry after a failed initial request', async () => {
    fetchMetrics.mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce(metrics);
    renderDashboard();
    fireEvent.click(await screen.findByRole('button', { name: 'Retry' }));
    expect(await screen.findByRole('region', { name: 'Organizations' })).toBeTruthy();
    expect(fetchMetrics).toHaveBeenCalledTimes(2);
  });
});
