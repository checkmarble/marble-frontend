import { FormatContext } from '@app-builder/contexts/FormatContext';
import { buildScreeningReviewItems } from '@app-builder/models/screening-review';
import {
  datasetReviewScreening,
  objectReviewScreening,
  reviewCase,
} from '@app-builder/models/screening-review.test-helpers';
import { listScreeningReviewPageFn } from '@app-builder/server-fns/screening-review';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { mockResizeObserver } from 'jsdom-testing-mocks';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ScreeningReviewPage, type ScreeningReviewSearch } from './ScreeningReviewPage';

vi.mock('@app-builder/server-fns/screening-review', () => ({ listScreeningReviewPageFn: vi.fn() }));
vi.mock('@app-builder/queries/data/get-data-model', () => ({ useDataModelQuery: () => ({ data: undefined }) }));
vi.mock('@app-builder/queries/data/get-object-details', () => ({ useObjectDetailsQuery: () => ({ data: undefined }) }));
vi.mock('@app-builder/queries/screening/lists-config', () => ({ useListConfigQuery: () => ({ data: undefined }) }));
vi.mock('@app-builder/queries/scoring/get-scoring-settings', () => ({
  useGetScoringSettingsQuery: () => ({ data: { settings: { maxRiskLevel: 3 } } }),
}));
vi.mock('@app-builder/queries/scoring/get-risk-level-latest', () => ({
  useRiskLevelLatestQuery: () => ({ data: { riskLevel: 2 } }),
}));
vi.mock('@tanstack/react-start', () => ({ useServerFn: (fn: unknown) => fn }));
vi.mock('../Navigation/Tabs', () => ({ CasesNavigationTabs: () => <div>Case Manager navigation</div> }));
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, params }: { children: React.ReactNode; to: string; params?: { inboxId: string } }) => (
    <a href={to.replace('$inboxId', params?.inboxId ?? '')}>{children}</a>
  ),
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}));
mockResizeObserver();

const initialItems = buildScreeningReviewItems([
  reviewCase('case', [objectReviewScreening(), datasetReviewScreening()]),
]);
const firstId = 'case:screening-1:screening-1-high';
const pageTwoCursor = '11111111-1111-4111-8111-111111111111';
const selectedInboxId = '22222222-2222-4222-8222-222222222222';
const inboxes = [{ id: selectedInboxId, name: 'Screening alerts' }];
const secondPageItems = buildScreeningReviewItems([
  reviewCase('second-case', [objectReviewScreening('second-screening', 'bob')]),
]);
const onSearchChange = vi.fn<(search: ScreeningReviewSearch) => void>();

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
  vi.mocked(listScreeningReviewPageFn).mockResolvedValue({ items: initialItems, nextCursor: null, failed: false });
});
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

function renderPage(initial: ScreeningReviewSearch = { limit: 50, cursors: [] }, canViewRiskLevel = false) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });
  function Harness() {
    const [search, setSearch] = useState(initial);
    return (
      <>
        <ScreeningReviewPage
          canViewAdminSections={false}
          canViewRiskLevel={canViewRiskLevel}
          inboxes={inboxes}
          search={search}
          onSearchChange={(next) => {
            onSearchChange(next);
            setSearch(next);
          }}
        />
        <input aria-label="Outside text input" />
        <textarea aria-label="Outside comment" />
        <select aria-label="Outside select">
          <option>J</option>
          <option>K</option>
        </select>
        <div role="textbox" contentEditable aria-label="Outside editor" />
      </>
    );
  }
  const result = render(
    <QueryClientProvider client={queryClient}>
      <FormatContext.Provider value={{ locale: 'en', timezone: 'UTC' }}>
        <Harness />
      </FormatContext.Provider>
    </QueryClientProvider>,
  );
  return { ...result, queryClient };
}

function activeCard() {
  return document.querySelector('button[aria-current="true"]');
}
function press(key: string, code: string, shiftKey = false, target: Element | Document = document) {
  fireEvent.keyDown(target, { key, code, shiftKey });
  fireEvent.keyUp(target, { key, code, shiftKey });
}

describe('screening review keyboard navigation', () => {
  it('navigates hits and customers with keys, records selection in search, and stops at boundaries', async () => {
    renderPage();
    await waitFor(() => expect(onSearchChange).toHaveBeenLastCalledWith({ limit: 50, cursors: [], hit: firstId }));
    expect(activeCard()?.textContent).toContain('List record A');
    press('k', 'KeyK');
    expect(activeCard()?.textContent).toContain('List record A');
    press('j', 'KeyJ');
    await waitFor(() => expect(activeCard()?.textContent).toContain('Shared list record'));
    press('ArrowDown', 'ArrowDown');
    await waitFor(() => expect(activeCard()?.textContent).toContain('List record B'));
    press('ArrowUp', 'ArrowUp');
    await waitFor(() => expect(activeCard()?.textContent).toContain('Shared list record'));
    press('J', 'KeyJ', true);
    await waitFor(() => expect(onSearchChange.mock.lastCall?.[0].hit).toBe('case:dataset-1:dataset-1-bob'));
    press('j', 'KeyJ');
    expect(onSearchChange.mock.lastCall?.[0].hit).toBe('case:dataset-1:dataset-1-bob');
    press('K', 'KeyK', true);
    await waitFor(() => expect(onSearchChange.mock.lastCall?.[0].hit).toBe(firstId));
  });

  it.each([
    ['textbox', 'Outside text input'],
    ['textbox', 'Outside comment'],
    ['combobox', 'Outside select'],
    ['textbox', 'Outside editor'],
  ])('leaves typing and navigation keys to the focused %s (%s)', async (role, name) => {
    renderPage();
    await waitFor(() => expect(activeCard()).not.toBeNull());
    const field = screen.getByRole(role, { name });
    field.focus();
    const calls = onSearchChange.mock.calls.length;
    press('j', 'KeyJ', false, field);
    press('J', 'KeyJ', true, field);
    press('ArrowDown', 'ArrowDown', false, field);
    press('?', 'Slash', true, field);
    expect(onSearchChange).toHaveBeenCalledTimes(calls);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('supports non-Latin layouts through the library physical-key fallback', async () => {
    renderPage();
    await waitFor(() => expect(onSearchChange.mock.lastCall?.[0].hit).toBe(firstId));
    press('ت', 'KeyJ');
    await waitFor(() => expect(onSearchChange.mock.lastCall?.[0].hit).toBe('case:dataset-1:dataset-1-alice'));
    press('ن', 'KeyK');
    await waitFor(() => expect(onSearchChange.mock.lastCall?.[0].hit).toBe(firstId));
    press('ت', 'KeyJ', true);
    await waitFor(() => expect(onSearchChange.mock.lastCall?.[0].hit).toBe('case:dataset-1:dataset-1-bob'));
  });

  it.each(['?', '؟'])(
    'lists every key in its group with %s, suspends navigation while open, and closes with Escape',
    async (questionMark) => {
      renderPage();
      await waitFor(() => expect(activeCard()).not.toBeNull());
      press(questionMark, 'Slash', true);
      const dialog = await screen.findByRole('dialog');
      expect(
        within(dialog).getByRole('heading', { name: 'cases:screening_review.shortcuts.groups.move' }),
      ).toBeTruthy();
      const hitRow = within(dialog).getByText('cases:screening_review.shortcuts.next_previous_hit').parentElement;
      expect(within(hitRow as HTMLElement).getAllByText(/^(J|K|↓|↑)$/)).toHaveLength(4);
      expect(within(dialog).getByText('cases:screening_review.shortcuts.toggle_list')).toBeTruthy();
      expect(within(dialog).getByText('[')).toBeTruthy();
      expect(within(dialog).queryByText('T')).toBeNull();
      const selected = onSearchChange.mock.lastCall?.[0].hit;
      press('j', 'KeyJ');
      expect(onSearchChange.mock.lastCall?.[0].hit).toBe(selected);
      press('Escape', 'Escape');
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      press('Escape', 'Escape');
      expect(onSearchChange.mock.lastCall?.[0].hit).toBe(selected);
    },
  );

  it('opens the shortcut help from the hint for mouse users and closes it with its button', async () => {
    renderPage();
    await waitFor(() => expect(activeCard()).not.toBeNull());
    fireEvent.click(screen.getByRole('button', { name: /cases:screening_review\.hint\.all_keys/ }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: /cases:screening_review\.shortcuts\.back_to_review/ }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('shows matching data as chips, the entity type, and only navigation that exists', async () => {
    const screening = objectReviewScreening();
    screening.request.searchInput.queries['customer']!.properties = {
      name: ['Alice'],
      birthDate: ['1970-01-01'],
      nationality: ['Egypt'],
    };
    screening.matches[0]!.payload.properties['nationality'] = ['eg'];
    screening.matches[1]!.payload.properties = { birthDate: ['1980-02-02'] };
    vi.mocked(listScreeningReviewPageFn).mockResolvedValue({
      items: buildScreeningReviewItems([reviewCase('case', [screening])]),
      nextCursor: null,
      failed: false,
    });
    renderPage();
    await waitFor(() => expect(activeCard()).not.toBeNull());
    expect(screen.queryByRole('button', { name: /next_hit|previous_hit|next_customer|previous_customer/ })).toBeNull();
    expect(screen.getAllByText('screenings:entity.schema.person').length).toBeGreaterThan(0);
    expect(
      within(activeCard() as HTMLElement).getByText('cases:screening_review.matched_field.birthDate'),
    ).toBeTruthy();
    expect(
      within(activeCard() as HTMLElement).getByText('cases:screening_review.matched_field.nationality'),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /List record B/ }));
    await waitFor(() => expect(activeCard()?.textContent).toContain('List record B'));
    expect(within(activeCard() as HTMLElement).queryByText(/matched_field/)).toBeNull();
  });

  it('suspends shortcuts for other open modals, composition, and handled events', async () => {
    renderPage();
    await waitFor(() => expect(onSearchChange.mock.lastCall?.[0].hit).toBe(firstId));
    const dialog = document.createElement('div');
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    document.body.append(dialog);
    press('j', 'KeyJ');
    expect(onSearchChange.mock.lastCall?.[0].hit).toBe(firstId);
    dialog.remove();
    fireEvent.keyDown(document, { key: 'j', code: 'KeyJ', isComposing: true });
    const handled = new KeyboardEvent('keydown', { key: 'j', code: 'KeyJ', bubbles: true, cancelable: true });
    handled.preventDefault();
    document.dispatchEvent(handled);
    expect(onSearchChange.mock.lastCall?.[0].hit).toBe(firstId);
    press('j', 'KeyJ');
    await waitFor(() => expect(onSearchChange.mock.lastCall?.[0].hit).not.toBe(firstId));
  });

  it('scrolls the hit list smoothly until the selected hit is fully visible', async () => {
    renderPage();
    await waitFor(() => expect(activeCard()).not.toBeNull());
    const list = screen.getByRole('navigation', { name: 'cases:screening_review.hit_list' });
    expect(list.className).toContain('absolute');
    expect(list.className).toContain('overflow-y-auto');
    vi.mocked(Element.prototype.scrollIntoView).mockClear();

    press('j', 'KeyJ');

    await waitFor(() =>
      expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ block: 'nearest', behavior: 'smooth' }),
    );
  });

  it('scrolls the hit list instantly when reduced motion is requested', async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
    renderPage();
    await waitFor(() => expect(activeCard()).not.toBeNull());
    vi.mocked(Element.prototype.scrollIntoView).mockClear();

    press('j', 'KeyJ');

    await waitFor(() =>
      expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ block: 'nearest', behavior: 'auto' }),
    );
    vi.unstubAllGlobals();
  });

  it('unregisters all page shortcuts on unmount', async () => {
    const { unmount } = renderPage();
    await waitFor(() => expect(activeCard()).not.toBeNull());
    unmount();
    const calls = onSearchChange.mock.calls.length;
    press('j', 'KeyJ');
    press('?', 'Slash', true);
    expect(onSearchChange).toHaveBeenCalledTimes(calls);
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

describe('screening review pages and restoration', () => {
  it('restores the selected inbox with its bookmarked page and hit', async () => {
    vi.mocked(listScreeningReviewPageFn).mockResolvedValue({ items: secondPageItems, nextCursor: null, failed: false });
    const hit = secondPageItems[1]!.id;
    renderPage({ limit: 25, cursors: [pageTwoCursor], inboxId: selectedInboxId, hit });
    await waitFor(() => expect(activeCard()?.textContent).toContain('List record B'));
    expect(screen.getByRole('button', { name: 'cases:case.inbox: Screening alerts' })).not.toBeNull();
    expect(listScreeningReviewPageFn).toHaveBeenCalledWith({
      data: { limit: 25, cursor: pageTwoCursor, inboxId: selectedInboxId },
    });
    expect(onSearchChange).not.toHaveBeenCalled();
  });

  it('switches inboxes from an empty queue and resets the cursor and selected hit', async () => {
    vi.mocked(listScreeningReviewPageFn)
      .mockResolvedValueOnce({ items: [], nextCursor: null, failed: false })
      .mockResolvedValue({ items: secondPageItems, nextCursor: null, failed: false });
    renderPage({ limit: 50, cursors: [pageTwoCursor] });
    await screen.findByText('cases:screening_review.empty_title');
    fireEvent.click(screen.getByRole('button', { name: 'cases:case.inbox: cases:inbox.my-inbox.link' }));
    fireEvent.click(await screen.findByRole('option', { name: 'Screening alerts' }));
    await waitFor(() =>
      expect(listScreeningReviewPageFn).toHaveBeenLastCalledWith({
        data: { limit: 50, cursor: null, inboxId: selectedInboxId },
      }),
    );
    expect(onSearchChange).toHaveBeenCalledWith({ limit: 50, inboxId: selectedInboxId, cursors: [], hit: undefined });
    await waitFor(() => expect(onSearchChange.mock.lastCall?.[0].hit).toBe(secondPageItems[0]!.id));
    expect(screen.queryByText('cases:screening_review.unavailable')).toBeNull();
  });

  it('keeps the selected inbox through pagination and page-size changes', async () => {
    vi.mocked(listScreeningReviewPageFn)
      .mockResolvedValueOnce({ items: initialItems, nextCursor: pageTwoCursor, failed: false })
      .mockResolvedValue({ items: secondPageItems, nextCursor: null, failed: false });
    renderPage({ limit: 50, cursors: [], inboxId: selectedInboxId });
    await waitFor(() => expect(activeCard()).not.toBeNull());
    fireEvent.click(screen.getByRole('button', { name: 'cases:screening_review.next_page' }));
    await waitFor(() =>
      expect(listScreeningReviewPageFn).toHaveBeenLastCalledWith({
        data: { limit: 50, cursor: pageTwoCursor, inboxId: selectedInboxId },
      }),
    );
    await waitFor(() => expect(onSearchChange.mock.lastCall?.[0].hit).toBe(secondPageItems[0]!.id));
    fireEvent.click(screen.getByRole('button', { name: '25' }));
    await waitFor(() =>
      expect(listScreeningReviewPageFn).toHaveBeenLastCalledWith({
        data: { limit: 25, cursor: null, inboxId: selectedInboxId },
      }),
    );
    expect(onSearchChange.mock.lastCall?.[0].inboxId).toBe(selectedInboxId);
  });

  it('hides the previous inbox’s hits while the newly selected inbox loads', async () => {
    const nextPage = Promise.withResolvers<{ items: typeof initialItems; nextCursor: null; failed: boolean }>();
    vi.mocked(listScreeningReviewPageFn)
      .mockResolvedValueOnce({ items: initialItems, nextCursor: null, failed: false })
      .mockReturnValueOnce(nextPage.promise);
    renderPage();
    await waitFor(() => expect(activeCard()).not.toBeNull());
    fireEvent.click(screen.getByRole('button', { name: 'cases:case.inbox: cases:inbox.my-inbox.link' }));
    fireEvent.click(await screen.findByRole('option', { name: 'Screening alerts' }));
    await waitFor(() =>
      expect(listScreeningReviewPageFn).toHaveBeenLastCalledWith({
        data: { limit: 50, cursor: null, inboxId: selectedInboxId },
      }),
    );
    expect(activeCard()).toBeNull();
    expect(screen.queryByText('Alice')).toBeNull();
    nextPage.resolve({ items: secondPageItems, nextCursor: null, failed: false });
    await waitFor(() => expect(onSearchChange.mock.lastCall?.[0].hit).toBe(secondPageItems[0]!.id));
  });

  it('leaves keys to the open inbox selector without changing the active hit', async () => {
    renderPage();
    await waitFor(() => expect(onSearchChange.mock.lastCall?.[0].hit).toBe(firstId));
    fireEvent.click(screen.getByRole('button', { name: 'cases:case.inbox: cases:inbox.my-inbox.link' }));
    await screen.findByRole('option', { name: 'Screening alerts' });
    const field = document.activeElement;
    expect(field?.tagName).toBe('INPUT');
    if (!field) throw new Error('Inbox selector must hold keyboard focus');
    press('j', 'KeyJ', false, field);
    press('ArrowDown', 'ArrowDown', false, field);
    expect(onSearchChange.mock.lastCall?.[0].hit).toBe(firstId);
  });

  it('restores a bookmarked hit and cursor after reload', async () => {
    vi.mocked(listScreeningReviewPageFn).mockResolvedValue({ items: secondPageItems, nextCursor: null, failed: false });
    const hit = secondPageItems[1]!.id;
    renderPage({ limit: 25, cursors: [pageTwoCursor], hit });
    await waitFor(() => expect(activeCard()?.textContent).toContain('List record B'));
    expect(listScreeningReviewPageFn).toHaveBeenCalledWith({
      data: { limit: 25, cursor: pageTwoCursor, inboxId: 'my-inbox' },
    });
    expect(onSearchChange).not.toHaveBeenCalled();
  });

  it('explains stale selection and falls back to the first pending hit', async () => {
    renderPage({ limit: 50, cursors: [], hit: 'no-longer-eligible' });
    await screen.findByText('cases:screening_review.unavailable');
    expect(onSearchChange.mock.lastCall?.[0].hit).toBe(firstId);
  });

  it('uses Next/Previous with cached backward pages and resets the cursor on page-size change', async () => {
    vi.mocked(listScreeningReviewPageFn)
      .mockResolvedValueOnce({ items: initialItems, nextCursor: pageTwoCursor, failed: false })
      .mockResolvedValue({ items: secondPageItems, nextCursor: null, failed: false });
    renderPage();
    await waitFor(() => expect(onSearchChange.mock.lastCall?.[0].hit).toBe(firstId));
    fireEvent.click(screen.getByRole('button', { name: 'cases:screening_review.next_page' }));
    await waitFor(() => expect(onSearchChange.mock.lastCall?.[0].hit).toBe(secondPageItems[0]!.id));
    expect(listScreeningReviewPageFn).toHaveBeenLastCalledWith({
      data: { limit: 50, cursor: pageTwoCursor, inboxId: 'my-inbox' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'cases:screening_review.previous_page' }));
    await waitFor(() => expect(onSearchChange.mock.lastCall?.[0].hit).toBe(firstId));
    expect(listScreeningReviewPageFn).toHaveBeenCalledTimes(2);
    fireEvent.click(screen.getByRole('button', { name: '25' }));
    await waitFor(() =>
      expect(listScreeningReviewPageFn).toHaveBeenLastCalledWith({
        data: { limit: 25, cursor: null, inboxId: 'my-inbox' },
      }),
    );
  });

  it('keeps successful hits visible and retries incomplete pages without enabling Next', async () => {
    vi.mocked(listScreeningReviewPageFn)
      .mockResolvedValueOnce({ items: initialItems, nextCursor: null, failed: true })
      .mockResolvedValue({ items: initialItems, nextCursor: null, failed: false });
    renderPage();
    await screen.findByRole('alert');
    expect(activeCard()).not.toBeNull();
    expect(screen.getByRole('button', { name: 'cases:screening_review.next_page' }).hasAttribute('disabled')).toBe(
      true,
    );
    fireEvent.click(screen.getByRole('button', { name: 'cases:screening_review.retry' }));
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
    expect(listScreeningReviewPageFn).toHaveBeenCalledTimes(2);
  });

  it('provides a Cases link for an empty queue', async () => {
    vi.mocked(listScreeningReviewPageFn).mockResolvedValue({ items: [], nextCursor: null, failed: false });
    renderPage();
    expect((await screen.findByRole('link', { name: 'cases:screening_review.go_to_cases' })).getAttribute('href')).toBe(
      '/cases/inboxes/my-inbox',
    );
  });
});

describe('screening review comparison view', () => {
  function rowStates() {
    const table = screen.getByRole('table');
    return within(table)
      .getAllByRole('row')
      .slice(1)
      .map((row) => [within(row).getByRole('rowheader').textContent, row.lastElementChild?.textContent]);
  }

  it('shows the customer before the list record and marks each compared field', async () => {
    renderPage();
    await waitFor(() => expect(onSearchChange).toHaveBeenLastCalledWith({ limit: 50, cursors: [], hit: firstId }));
    const columns = within(screen.getByRole('table'))
      .getAllByRole('columnheader')
      .map((header) => header.textContent);
    expect(columns).toEqual([
      'cases:screening_review.column.field',
      'cases:screening_review.customer',
      'cases:screening_review.list_record',
      'cases:screening_review.column.match',
    ]);
    // Alice has no birth date; the list record has one.
    expect(rowStates()).toEqual([
      ['screenings:entity.property.name', 'cases:screening_review.state.different'],
      ['screenings:entity.property.birthDate', 'cases:screening_review.state.missing'],
    ]);
    expect(screen.getByText('cases:screening_review.all_hit_information')).not.toBeNull();
  });

  it.each([
    { canViewRiskLevel: true, shown: true },
    { canViewRiskLevel: false, shown: false },
  ])(
    'shows the customer risk level only with scoring access ($canViewRiskLevel)',
    async ({ canViewRiskLevel, shown }) => {
      renderPage(undefined, canViewRiskLevel);
      await screen.findByRole('table');
      expect(screen.queryByText('cases:manager.client.risk_label') !== null).toBe(shown);
    },
  );
});
