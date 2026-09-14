import { type DecisionFilters, decisionFiltersSchema, unboundedDateRange } from '@app-builder/schemas/decisions';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type PaginationButtonsState, usePaginationsButton } from '../PaginationButtons';
import { adaptFilterValues, getDecisionFilters, toSubmittedDecisionFilters } from './decision-filters';

vi.mock('@app-builder/utils/format', () => ({ useFormatDateTime: vi.fn() }));
vi.mock('ui-design-system', () => ({ Button: vi.fn() }));
vi.mock('ui-icons', () => ({ Icon: vi.fn() }));

describe('decision filter navigation', () => {
  beforeEach(() => vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true));
  afterEach(() => vi.unstubAllGlobals());
  it.each([{ pivotValue: 'customer-123' }, { scheduledExecutionId: ['00000000-0000-4000-8000-000000000001'] }])(
    'preserves Previous after paginating from a link with %j',
    async (filters) => {
      let pagination: PaginationButtonsState | undefined;
      function currentPagination() {
        if (!pagination) throw new Error('Pagination has not rendered');
        return pagination;
      }
      interface HarnessProps {
        search: DecisionFilters;
        itemIds: string[];
        offsetId?: string;
      }
      function Harness({ search, itemIds, offsetId }: HarnessProps) {
        pagination = usePaginationsButton({
          filterValues: getDecisionFilters(search),
          items: itemIds.map((id) => ({ id, createdAt: '2026-01-01T00:00:00.000Z' })),
          initialOffsetId: offsetId,
        });
        return null;
      }
      const root = createRoot(document.createElement('div'));
      try {
        await act(() => root.render(<Harness search={filters} itemIds={['first', 'second']} />));
        await act(() => {
          expect(currentPagination().goToNext()).toEqual({ next: true, offsetId: 'second' });
        });
        await act(() =>
          root.render(
            <Harness
              search={{ ...filters, dateRange: unboundedDateRange }}
              itemIds={['third', 'fourth']}
              offsetId="second"
            />,
          ),
        );
        expect(currentPagination().pageNb).toBe(2);
        expect(currentPagination().hasPreviousPage).toBe(true);
        await act(() => {
          expect(currentPagination().goToPrevious()).toEqual({ previous: true, offsetId: 'first' });
        });
      } finally {
        await act(() => root.unmount());
      }
    },
  );

  it.each([
    { type: 'static', startDate: '2026-01-01T00:00:00.000Z' },
    { type: 'static', endDate: '2026-02-01T00:00:00.000Z' },
  ] as const)('keeps an unchanged one-sided range valid on retry: %j', (dateRange) => {
    const currentFilters = getDecisionFilters({ dateRange });
    const submittedFilters = toSubmittedDecisionFilters(adaptFilterValues(currentFilters));

    expect(decisionFiltersSchema.safeParse(submittedFilters).success).toBe(true);
    expect(submittedFilters).toEqual(currentFilters);
  });
});
