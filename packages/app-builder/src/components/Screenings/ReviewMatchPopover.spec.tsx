import { LoaderRevalidatorContext } from '@app-builder/contexts/LoaderRevalidatorContext';
import type { Screening } from '@app-builder/models/screening';
import { reviewScreeningMatchFn, setAllMatchesToNoHitFn } from '@app-builder/server-fns/cases';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { mockResizeObserver } from 'jsdom-testing-mocks';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ReviewMatchPopover } from './ReviewMatchPopover';

vi.mock('@app-builder/server-fns/cases', () => ({
  setAllMatchesToNoHitFn: vi.fn().mockResolvedValue(undefined),
  reviewScreeningMatchFn: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('@tanstack/react-start', () => ({ useServerFn: (fn: unknown) => fn }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

mockResizeObserver();

const screening: Screening = {
  id: 'screening',
  decisionId: 'decision',
  config: { name: 'Screening' },
  uniqueCounterpartyIdentifier: 'customer-123',
  status: 'no_hit',
  request: null,
  partial: false,
  isManual: false,
  matches: [],
  initialQuery: [],
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function renderReview(identifier: string | undefined = 'customer-123', bulk = true) {
  const onOpenChange = vi.fn();
  const revalidate = vi.fn();
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}>
      <LoaderRevalidatorContext.Provider value={revalidate}>
        <ReviewMatchPopover
          screening={{ ...screening, uniqueCounterpartyIdentifier: identifier }}
          matchIds={bulk ? ['match-1', 'match-2'] : ['match-1']}
          bulk={bulk}
          open
          onOpenChange={onOpenChange}
        />
      </LoaderRevalidatorContext.Provider>
    </QueryClientProvider>,
  );
  return { onOpenChange, revalidate };
}

describe('batch false-positive review', () => {
  it.each([true, false])(
    'submits the selected matches with whitelist=%s only after confirmation',
    async (whitelist) => {
      const { onOpenChange, revalidate } = renderReview();
      const toggle = screen.getByRole('switch');
      expect(toggle.getAttribute('aria-checked')).toBe('true');
      expect(setAllMatchesToNoHitFn).not.toHaveBeenCalled();
      if (!whitelist) fireEvent.click(toggle);
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Different person' } });
      fireEvent.click(screen.getByRole('button', { name: 'common:save' }));
      await waitFor(() =>
        expect(setAllMatchesToNoHitFn).toHaveBeenCalledWith({
          data: { matchIds: ['match-1', 'match-2'], whitelist, comment: 'Different person' },
        }),
      );
      await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
      expect(revalidate).toHaveBeenCalled();
    },
  );

  it('cancels without reviewing any matches', () => {
    const { onOpenChange } = renderReview();
    fireEvent.click(screen.getByRole('button', { name: 'common:cancel' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(setAllMatchesToNoHitFn).not.toHaveBeenCalled();
  });

  it('hides whitelisting when no counterparty identifier is available', () => {
    renderReview('');
    expect(screen.queryByRole('switch')).toBeNull();
  });
});

describe('single match review', () => {
  it.each(['no_hit', 'confirmed_hit'])('preserves reviewing a single match as %s', async (status) => {
    renderReview('customer-123', false);
    if (status === 'confirmed_hit') {
      fireEvent.click(screen.getByRole('radio', { name: 'screenings:match.status.confirmed_hit' }));
      expect(screen.queryByRole('switch')).toBeNull();
    }
    fireEvent.click(screen.getByRole('button', { name: 'common:save' }));
    await waitFor(() =>
      expect(reviewScreeningMatchFn).toHaveBeenCalledWith({
        data: { matchId: 'match-1', status, comment: '', whitelist: true },
      }),
    );
    expect(setAllMatchesToNoHitFn).not.toHaveBeenCalled();
  });
});
