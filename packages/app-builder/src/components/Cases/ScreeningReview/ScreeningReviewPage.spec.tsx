import { FormatContext } from '@app-builder/contexts/FormatContext';
import { adaptContinuousScreening } from '@app-builder/models/continuous-screening';
import {
  buildScreeningReviewItems,
  SCREENING_REVIEW_HIDE_DELAY_MS,
  SCREENING_REVIEW_UNDO_DELAY_MS,
} from '@app-builder/models/screening-review';
import stagingObjectAddedDto from '@app-builder/models/screening-review.staging-object-added.json';
import {
  datasetReviewScreening,
  objectReviewScreening,
  reviewCase,
} from '@app-builder/models/screening-review.test-helpers';
import { loadMoreContinuousScreeningMatchesFn } from '@app-builder/server-fns/continuous-screening';
import { listScreeningReviewPageFn, reviewScreeningReviewMatchFn } from '@app-builder/server-fns/screening-review';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { mockResizeObserver } from 'jsdom-testing-mocks';
import { type ContinuousScreeningDto } from 'marble-api';
import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ScreeningReviewPage, type ScreeningReviewSearch } from './ScreeningReviewPage';

vi.mock('@app-builder/server-fns/screening-review', () => ({
  listScreeningReviewPageFn: vi.fn(),
  reviewScreeningReviewMatchFn: vi.fn(),
}));
vi.mock('@app-builder/server-fns/continuous-screening', () => ({ loadMoreContinuousScreeningMatchesFn: vi.fn() }));
vi.mock('@app-builder/services/organization/organization-users', () => ({
  useOrganizationUsers: () => ({ getOrgUserById: () => undefined }),
}));
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
vi.mock('@tanstack/react-router', () => {
  const href = (to: string, params?: { inboxId?: string; caseId?: string }) =>
    to.replace('$inboxId', params?.inboxId ?? '').replace('$caseId', params?.caseId ?? '');
  return {
    Link: ({
      children,
      to,
      params,
      target,
      onClick,
    }: {
      children: React.ReactNode;
      to: string;
      params?: { inboxId?: string; caseId?: string };
      target?: string;
      onClick?: React.MouseEventHandler<HTMLAnchorElement>;
    }) => (
      <a href={href(to, params)} target={target} onClick={onClick}>
        {children}
      </a>
    ),
    useRouter: () => ({
      buildLocation: ({ to, params }: { to: string; params?: { caseId?: string } }) => ({ href: href(to, params) }),
    }),
  };
});
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
  toast.remove();
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
        <Toaster />
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

  it('renders a real customer-triggered payload with its Motiva name states', async () => {
    const screening = adaptContinuousScreening(stagingObjectAddedDto as unknown as ContinuousScreeningDto);
    vi.mocked(listScreeningReviewPageFn).mockResolvedValue({
      items: buildScreeningReviewItems([reviewCase('staging', [screening])]),
      nextCursor: null,
      failed: false,
    });
    renderPage();
    await screen.findByRole('table');
    // The hit with a literal name match comes first: hits are ordered by topic, then score.
    expect(rowStates()[0]).toEqual(['screenings:entity.property.name', 'cases:screening_review.state.same']);
    expect(screen.getByText('cases:screening_review.all_hit_information')).not.toBeNull();
  });
});

describe('screening review decisions', () => {
  const caseId = '33333333-3333-4333-8333-333333333333';
  const caseHref = `/cases/m/${fromUUIDtoSUUID(caseId)}`;
  const decisionItems = buildScreeningReviewItems([
    reviewCase(caseId, [objectReviewScreening(), datasetReviewScreening()]),
  ]);
  const hitId = (matchId: string) => decisionItems.find((item) => item.matchId === matchId)!.id;
  const written = (matchId: string, status: string, extra: Record<string, string> = {}) => ({
    data: {
      caseId,
      screeningId: decisionItems.find((item) => item.matchId === matchId)!.screeningId,
      matchId,
      status,
      ...extra,
    },
  });
  const inReview = { ok: true, screeningStatus: 'in_review', caseClosed: false } as const;
  // Hit cards show decision tags too, so look in the dock.
  const decisionButton = (decision: string) =>
    within(screen.getByRole('group', { name: 'cases:screening_review.dock.title' })).getByRole('button', {
      name: new RegExp(`screening_review\\.decision\\.${decision}`),
    });
  const validateButton = () => screen.getByRole('button', { name: /screening_review\.dock\.validate/ });
  const commentBox = () =>
    screen.getByRole<HTMLTextAreaElement>('textbox', { name: /screening_review\.(dock|batch)\.comment/ });
  const undoButton = () => screen.findByRole('button', { name: /screening_review\.undo\.action/ });
  const card = (name: string) =>
    screen
      .getAllByRole('button')
      .find((button) => button.hasAttribute('data-review-hit-card') && button.textContent?.includes(name));
  const checkbox = (name: string) => card(name)!.parentElement!.querySelector<HTMLElement>('[role="checkbox"]')!;
  const checked = () =>
    screen.queryAllByRole('checkbox').filter((box) => box.getAttribute('aria-checked') === 'true').length;
  const elapse = (ms: number) =>
    act(async () => {
      await vi.advanceTimersByTimeAsync(ms);
    });

  function renderDecisionPage(items = decisionItems) {
    vi.mocked(listScreeningReviewPageFn).mockResolvedValue({ items, nextCursor: null, failed: false });
    return renderPage();
  }

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    // The undo toast reads the motion preference.
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({ matches: false, media: query })),
    );
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('decides by keyboard, updates the screen at once, and writes after the undo delay', async () => {
    vi.mocked(reviewScreeningReviewMatchFn).mockResolvedValue(inReview);
    renderDecisionPage();
    await waitFor(() => expect(activeCard()?.textContent).toContain('List record A'));
    expect(screen.getByText('cases:screening_review.step.to_review')).toBeTruthy();
    expect(validateButton().hasAttribute('disabled')).toBe(true);
    press('n', 'KeyN');
    expect(decisionButton('no_hit').getAttribute('aria-pressed')).toBe('true');
    press('Enter', 'Enter');
    await waitFor(() => expect(activeCard()?.textContent).toContain('Shared list record'));
    expect(card('List record A')?.textContent).toContain('cases:screening_review.decision.no_hit');
    expect(await undoButton()).toBeTruthy();
    const countdown = () => document.querySelector('[data-undo-countdown]')?.textContent;
    expect(countdown()).toBe('5s');
    await elapse(2_000);
    expect(countdown()).toBe('3s');
    await elapse(SCREENING_REVIEW_UNDO_DELAY_MS - 2_100);
    expect(countdown()).toBe('1s');
    expect(reviewScreeningReviewMatchFn).not.toHaveBeenCalled();
    await elapse(100);
    await waitFor(() =>
      expect(reviewScreeningReviewMatchFn).toHaveBeenCalledWith(written('screening-1-high', 'no_hit')),
    );
    // The refetch still returns the hit as pending; the decision stays on screen.
    await waitFor(() => expect(listScreeningReviewPageFn).toHaveBeenCalledTimes(2));
    expect(card('List record A')?.textContent).toContain('cases:screening_review.decision.no_hit');

    press('k', 'KeyK');
    await screen.findByText('cases:screening_review.dock.validated');
    expect(screen.getByText('cases:screening_review.step.validated')).toBeTruthy();
    expect(screen.queryByRole('textbox', { name: 'cases:screening_review.dock.comment' })).toBeNull();
    press('n', 'KeyN');
    press('Enter', 'Enter');
    await elapse(SCREENING_REVIEW_UNDO_DELAY_MS);
    expect(reviewScreeningReviewMatchFn).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: /screening_review\.dock\.next_hit/ }));
    await waitFor(() => expect(activeCard()?.textContent).toContain('Shared list record'));
  });

  it('focuses the comment with C, keeps Shift+Enter for line breaks, leaves with Esc and submits with Enter', async () => {
    vi.mocked(reviewScreeningReviewMatchFn).mockResolvedValue(inReview);
    renderDecisionPage();
    await waitFor(() => expect(activeCard()?.textContent).toContain('List record A'));
    press('n', 'KeyN');
    press('c', 'KeyC');
    const box = commentBox();
    expect(document.activeElement).toBe(box);
    expect(box.getAttribute('placeholder')).toBe('cases:screening_review.dock.comment');
    fireEvent.change(box, { target: { value: 'Different birth date' } });
    press('m', 'KeyM', false, box);
    fireEvent.keyDown(box, { key: 'Enter', code: 'Enter', shiftKey: true });
    expect(decisionButton('no_hit').getAttribute('aria-pressed')).toBe('true');
    fireEvent.keyDown(box, { key: 'Escape', code: 'Escape' });
    expect(document.activeElement).not.toBe(box);
    box.focus();
    fireEvent.keyDown(box, { key: 'Enter', code: 'Enter' });
    await waitFor(() => expect(activeCard()?.textContent).toContain('Shared list record'));
    await elapse(SCREENING_REVIEW_UNDO_DELAY_MS);
    await waitFor(() =>
      expect(reviewScreeningReviewMatchFn).toHaveBeenCalledWith(
        written('screening-1-high', 'no_hit', { comment: 'Different birth date' }),
      ),
    );
  });

  it('clears the decision with Esc, and the decision and comment with Cancel', async () => {
    renderDecisionPage();
    await waitFor(() => expect(activeCard()?.textContent).toContain('List record A'));
    press('m', 'KeyM');
    expect(validateButton().hasAttribute('disabled')).toBe(false);
    press('Escape', 'Escape');
    expect(decisionButton('confirmed_hit').getAttribute('aria-pressed')).toBe('false');
    expect(validateButton().hasAttribute('disabled')).toBe(true);
    fireEvent.click(decisionButton('no_hit'));
    fireEvent.change(commentBox(), { target: { value: 'note' } });
    fireEvent.click(screen.getByRole('button', { name: 'cases:screening_review.dock.cancel' }));
    expect(commentBox().value).toBe('');
    expect(validateButton().hasAttribute('disabled')).toBe(true);
  });

  it('warns that a Hit skips the screening’s other hits, then points to the case page', async () => {
    vi.mocked(reviewScreeningReviewMatchFn).mockResolvedValue({
      ok: true,
      screeningStatus: 'confirmed_hit',
      caseClosed: false,
    });
    renderDecisionPage();
    await waitFor(() => expect(activeCard()?.textContent).toContain('List record A'));
    press('m', 'KeyM');
    expect(screen.getByRole('note').textContent).toBe('cases:screening_review.dock.skip_warning');
    fireEvent.click(validateButton());
    // The skip and the screening's result show during the undo delay.
    await waitFor(() => expect(activeCard()?.textContent).toContain('Shared list record'));
    expect(card('List record B')?.textContent).toContain('cases:screening_review.decision.skipped');
    expect(screen.getByText('cases:screening_review.group_state.confirmed_hit')).toBeTruthy();
    await elapse(SCREENING_REVIEW_UNDO_DELAY_MS);
    await waitFor(() =>
      expect(reviewScreeningReviewMatchFn).toHaveBeenCalledWith(written('screening-1-high', 'confirmed_hit')),
    );
    expect(card('List record B')?.textContent).toContain('cases:screening_review.decision.skipped');
    const link = screen.getAllByRole('link', { name: 'cases:screening_review.open_case' })[0]!;
    expect(link.getAttribute('href')).toBe(caseHref);
    expect(link.getAttribute('target')).toBe('_blank');

    // A list-update Hit doesn't warn: the other customers' hits stay independent.
    press('m', 'KeyM');
    expect(screen.queryByRole('note')).toBeNull();
    press('k', 'KeyK');
    await screen.findByText('cases:screening_review.screening_state.confirmed_hit');
  });

  it('shows the closure during the undo delay, closes the case on write, then removes its hits', async () => {
    const items = buildScreeningReviewItems([reviewCase(caseId, [objectReviewScreening()])]);
    vi.mocked(reviewScreeningReviewMatchFn)
      .mockResolvedValueOnce(inReview)
      .mockResolvedValueOnce({ ok: true, screeningStatus: 'no_hit', caseClosed: true });
    renderDecisionPage(items);
    await waitFor(() => expect(activeCard()?.textContent).toContain('List record A'));
    press('n', 'KeyN');
    press('Enter', 'Enter');
    await waitFor(() => expect(activeCard()?.textContent).toContain('List record B'));
    // The closed case leaves the server data.
    vi.mocked(listScreeningReviewPageFn).mockResolvedValue({ items: [], nextCursor: null, failed: false });
    press('n', 'KeyN');
    press('Enter', 'Enter');
    // The second decision writes the first one at once.
    await waitFor(() => expect(reviewScreeningReviewMatchFn).toHaveBeenCalledTimes(1));
    await screen.findByText('cases:screening_review.group_state.case_closed');
    expect(screen.getByText('cases:screening_review.screening_state.case_closed')).toBeTruthy();
    await elapse(SCREENING_REVIEW_UNDO_DELAY_MS);
    await waitFor(() => expect(reviewScreeningReviewMatchFn).toHaveBeenCalledTimes(2));
    expect(card('List record A')?.textContent).toContain('cases:screening_review.decision.no_hit');
    expect(screen.getByText('cases:screening_review.screening_state.case_closed')).toBeTruthy();
    expect(screen.queryByText('cases:screening_review.empty_title')).toBeNull();
    await elapse(SCREENING_REVIEW_HIDE_DELAY_MS);
    await screen.findByText('cases:screening_review.empty_title');
    expect(screen.queryByText('cases:screening_review.unavailable')).toBeNull();
  });

  it('writes the pending decision before loading more matches on its partial screening', async () => {
    const screening = objectReviewScreening();
    screening.partial = true;
    screening.matches = screening.matches.slice(0, 1);
    const items = buildScreeningReviewItems([reviewCase(caseId, [screening])]);
    vi.mocked(reviewScreeningReviewMatchFn).mockResolvedValue(inReview);
    vi.mocked(loadMoreContinuousScreeningMatchesFn).mockResolvedValue(undefined);
    renderDecisionPage(items);
    await waitFor(() => expect(activeCard()?.textContent).toContain('List record A'));
    press('n', 'KeyN');
    press('Enter', 'Enter');
    await screen.findByText('cases:screening_review.screening_state.load_more');
    expect(screen.getByText('cases:screening_review.group_state.load_more')).toBeTruthy();
    const calls = vi.mocked(listScreeningReviewPageFn).mock.calls.length;
    fireEvent.click(screen.getByRole('button', { name: 'cases:screening_review.load_more' }));
    await waitFor(() =>
      expect(loadMoreContinuousScreeningMatchesFn).toHaveBeenCalledWith({ data: { screeningId: 'screening-1' } }),
    );
    expect(vi.mocked(reviewScreeningReviewMatchFn).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(loadMoreContinuousScreeningMatchesFn).mock.invocationCallOrder[0]!,
    );
    await waitFor(() => expect(vi.mocked(listScreeningReviewPageFn).mock.calls.length).toBeGreaterThan(calls));
  });

  it.each(['already_reviewed', 'reassigned', 'not_in_review', 'forbidden', 'unavailable'] as const)(
    'explains a rejected write (%s), refetches and returns to the server state',
    async (reason) => {
      vi.mocked(reviewScreeningReviewMatchFn).mockResolvedValue({ ok: false, reason });
      renderDecisionPage();
      await waitFor(() => expect(activeCard()?.textContent).toContain('List record A'));
      const reviewed = objectReviewScreening();
      reviewed.matches[0]!.status = 'no_hit';
      vi.mocked(listScreeningReviewPageFn).mockResolvedValue({
        items: buildScreeningReviewItems([reviewCase(caseId, [reviewed, datasetReviewScreening()])]),
        nextCursor: null,
        failed: false,
      });
      press('m', 'KeyM');
      press('Enter', 'Enter');
      await elapse(SCREENING_REVIEW_UNDO_DELAY_MS);
      expect((await screen.findByRole('alert')).textContent).toBe(`cases:screening_review.rejection.${reason}`);
      await waitFor(() => expect(card('List record A')).toBeUndefined());
      await waitFor(() => expect(onSearchChange.mock.lastCall?.[0].hit).toBe(hitId('dataset-1-alice')));
      expect(screen.queryByText('cases:screening_review.unavailable')).toBeNull();
    },
  );

  it('rolls back a failed write, returns to its hit with the decision, and lets the analyst retry', async () => {
    vi.mocked(reviewScreeningReviewMatchFn).mockRejectedValueOnce(new Error('network')).mockResolvedValue(inReview);
    renderDecisionPage();
    await waitFor(() => expect(activeCard()?.textContent).toContain('List record A'));
    press('n', 'KeyN');
    press('Enter', 'Enter');
    await waitFor(() => expect(activeCard()?.textContent).toContain('Shared list record'));
    await elapse(SCREENING_REVIEW_UNDO_DELAY_MS);
    expect((await screen.findByRole('alert')).textContent).toBe('cases:screening_review.decision_failed');
    await waitFor(() => expect(activeCard()?.textContent).toContain('List record A'));
    expect(card('List record A')?.textContent).not.toContain('cases:screening_review.decision.no_hit');
    expect(decisionButton('no_hit').getAttribute('aria-pressed')).toBe('true');
    press('Enter', 'Enter');
    await waitFor(() => expect(activeCard()?.textContent).toContain('Shared list record'));
    expect(screen.queryByRole('alert')).toBeNull();
    await elapse(SCREENING_REVIEW_UNDO_DELAY_MS);
    await waitFor(() => expect(reviewScreeningReviewMatchFn).toHaveBeenCalledTimes(2));
  });

  describe('undo', () => {
    it('undoes with the toast or U, restoring the hit, its decision and its comment without a write', async () => {
      renderDecisionPage();
      await waitFor(() => expect(activeCard()?.textContent).toContain('List record A'));
      fireEvent.click(decisionButton('no_hit'));
      fireEvent.change(commentBox(), { target: { value: 'Same name only' } });
      press('Enter', 'Enter');
      await waitFor(() => expect(activeCard()?.textContent).toContain('Shared list record'));
      expect(screen.getByText('cases:screening_review.undo.decided')).toBeTruthy();
      fireEvent.click(await undoButton());
      await waitFor(() => expect(activeCard()?.textContent).toContain('List record A'));
      expect(card('List record A')?.textContent).not.toContain('cases:screening_review.decision.no_hit');
      expect(decisionButton('no_hit').getAttribute('aria-pressed')).toBe('true');
      expect(commentBox().value).toBe('Same name only');

      press('Enter', 'Enter');
      await waitFor(() => expect(activeCard()?.textContent).toContain('Shared list record'));
      press('u', 'KeyU');
      await waitFor(() => expect(activeCard()?.textContent).toContain('List record A'));
      expect(commentBox().value).toBe('Same name only');
      await elapse(SCREENING_REVIEW_UNDO_DELAY_MS * 2);
      expect(reviewScreeningReviewMatchFn).not.toHaveBeenCalled();
      // Nothing is left to undo.
      press('u', 'KeyU');
      expect(activeCard()?.textContent).toContain('List record A');
    });

    it('writes the previous decision at once when another is made, and undoes only the latest', async () => {
      vi.mocked(reviewScreeningReviewMatchFn).mockResolvedValue(inReview);
      renderDecisionPage();
      await waitFor(() => expect(activeCard()?.textContent).toContain('List record A'));
      press('n', 'KeyN');
      press('Enter', 'Enter');
      await waitFor(() => expect(activeCard()?.textContent).toContain('Shared list record'));
      // Moving doesn't write.
      press('k', 'KeyK');
      press('j', 'KeyJ');
      expect(reviewScreeningReviewMatchFn).not.toHaveBeenCalled();
      press('n', 'KeyN');
      press('Enter', 'Enter');
      await waitFor(() =>
        expect(reviewScreeningReviewMatchFn).toHaveBeenCalledWith(written('screening-1-high', 'no_hit')),
      );
      press('u', 'KeyU');
      await waitFor(() => expect(activeCard()?.textContent).toContain('Shared list record'));
      expect(decisionButton('no_hit').getAttribute('aria-pressed')).toBe('true');
      expect(card('List record A')?.textContent).toContain('cases:screening_review.decision.no_hit');
      await elapse(SCREENING_REVIEW_UNDO_DELAY_MS);
      expect(reviewScreeningReviewMatchFn).toHaveBeenCalledTimes(1);
    });

    it('writes the pending decision when the page changes or unmounts', async () => {
      vi.mocked(reviewScreeningReviewMatchFn).mockResolvedValue(inReview);
      const { unmount } = renderDecisionPage();
      await waitFor(() => expect(activeCard()?.textContent).toContain('List record A'));
      press('n', 'KeyN');
      press('Enter', 'Enter');
      fireEvent.click(screen.getByRole('button', { name: '25' }));
      await waitFor(() =>
        expect(reviewScreeningReviewMatchFn).toHaveBeenCalledWith(written('screening-1-high', 'no_hit')),
      );
      await waitFor(() => expect(activeCard()?.textContent).toContain('List record A'));
      press('n', 'KeyN');
      press('Enter', 'Enter');
      unmount();
      await waitFor(() => expect(reviewScreeningReviewMatchFn).toHaveBeenCalledTimes(2));
    });

    it('writes with keepalive on pagehide, through a fetch that keeps the request alive', async () => {
      vi.mocked(reviewScreeningReviewMatchFn).mockResolvedValue(inReview);
      renderDecisionPage();
      await waitFor(() => expect(activeCard()?.textContent).toContain('List record A'));
      press('n', 'KeyN');
      press('Enter', 'Enter');
      // Switching tabs keeps the undo window open.
      document.dispatchEvent(new Event('visibilitychange'));
      expect(reviewScreeningReviewMatchFn).not.toHaveBeenCalled();
      window.dispatchEvent(new Event('pagehide'));
      await waitFor(() =>
        expect(reviewScreeningReviewMatchFn).toHaveBeenCalledWith({
          ...written('screening-1-high', 'no_hit'),
          fetch: expect.any(Function),
        }),
      );
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response());
      const { fetch: keepaliveFetch } = vi.mocked(reviewScreeningReviewMatchFn).mock.calls[0]![0] as {
        fetch: typeof fetch;
      };
      await keepaliveFetch('/_serverFn/review', { method: 'POST' });
      expect(fetchSpy).toHaveBeenCalledWith('/_serverFn/review', { method: 'POST', keepalive: true });
      fetchSpy.mockRestore();
    });

    it('writes the pending decision before opening its case with O or the link', async () => {
      const tab = { opener: {} as unknown, location: { href: '' } };
      const open = vi.spyOn(window, 'open').mockReturnValue(tab as unknown as Window);
      const write = Promise.withResolvers<typeof inReview>();
      vi.mocked(reviewScreeningReviewMatchFn).mockImplementation(() => write.promise as never);
      renderDecisionPage();
      await waitFor(() => expect(activeCard()?.textContent).toContain('List record A'));
      press('n', 'KeyN');
      press('Enter', 'Enter');
      await waitFor(() => expect(activeCard()?.textContent).toContain('Shared list record'));
      press('o', 'KeyO');
      expect(open).toHaveBeenCalledWith('', '_blank');
      await waitFor(() => expect(reviewScreeningReviewMatchFn).toHaveBeenCalledTimes(1));
      // The tab waits for the write.
      expect(tab.location.href).toBe('');
      write.resolve(inReview);
      await waitFor(() => expect(tab.location.href).toBe(caseHref));
      expect(tab.opener).toBeNull();

      // Nothing pending: O opens the case directly.
      press('o', 'KeyO');
      expect(open).toHaveBeenLastCalledWith(caseHref, '_blank', 'noopener');

      vi.mocked(reviewScreeningReviewMatchFn).mockResolvedValue({
        ok: true,
        screeningStatus: 'confirmed_hit',
        caseClosed: false,
      });
      tab.location.href = '';
      // A Hit on the customer-triggered screening links to its case.
      press('j', 'KeyJ');
      await waitFor(() => expect(activeCard()?.textContent).toContain('List record B'));
      press('m', 'KeyM');
      press('Enter', 'Enter');
      fireEvent.click(screen.getAllByRole('link', { name: 'cases:screening_review.open_case' })[0]!);
      expect(open).toHaveBeenLastCalledWith('', '_blank');
      await waitFor(() => expect(reviewScreeningReviewMatchFn).toHaveBeenCalledTimes(2));
      await waitFor(() => expect(tab.location.href).toBe(new URL(caseHref, window.location.href).href));
      open.mockRestore();
    });
  });

  describe('batch No hit', () => {
    it('selects with X, A and the mouse, shows a summary, and clears the selection with Esc', async () => {
      renderDecisionPage();
      await waitFor(() => expect(activeCard()?.textContent).toContain('List record A'));
      press('x', 'KeyX');
      expect(checked()).toBe(1);
      expect(screen.getByRole('heading', { name: 'cases:screening_review.batch.title' })).toBeTruthy();
      // The dock offers No hit only.
      expect(screen.queryByRole('button', { name: /screening_review\.decision\.confirmed_hit/ })).toBeNull();
      expect(screen.getByRole('button', { name: /screening_review\.batch\.no_hit/ })).toBeTruthy();
      press('x', 'KeyX');
      expect(checked()).toBe(0);
      expect(decisionButton('confirmed_hit')).toBeTruthy();

      press('a', 'KeyA');
      expect(checked()).toBe(3);
      press('Escape', 'Escape');
      expect(checked()).toBe(0);

      fireEvent.click(checkbox('List record B'));
      expect(checked()).toBe(1);
      fireEvent.click(checkbox('List record B'));
      expect(checked()).toBe(0);
      fireEvent.click(screen.getAllByRole('button', { name: /screening_review\.batch\.select_customer_hits/ })[1]!);
      expect(checked()).toBe(1);
      fireEvent.click(screen.getByRole('button', { name: 'cases:screening_review.batch.deselect' }));
      expect(checked()).toBe(0);
    });

    // Keys go to the focused element, as in a browser.
    const pressFocused = (key: string, code: string) => press(key, code, false, document.activeElement ?? document);
    const clickWithPointer = (element: HTMLElement) => {
      element.focus();
      fireEvent.click(element, { detail: 1 });
    };
    const isChecked = (name: string) => checkbox(name).getAttribute('aria-checked') === 'true';

    it('toggles the hit under the cursor with Space, even after clicking a card or a checkbox', async () => {
      renderDecisionPage();
      await waitFor(() => expect(activeCard()?.textContent).toContain('List record A'));
      clickWithPointer(card('List record A')!);
      pressFocused('j', 'KeyJ');
      pressFocused('j', 'KeyJ');
      await waitFor(() => expect(activeCard()?.textContent).toContain('List record B'));
      pressFocused(' ', 'Space');
      expect(isChecked('List record B')).toBe(true);
      expect(isChecked('List record A')).toBe(false);

      clickWithPointer(checkbox('List record A'));
      expect(isChecked('List record A')).toBe(true);
      pressFocused('k', 'KeyK');
      await waitFor(() => expect(activeCard()?.textContent).toContain('Shared list record'));
      pressFocused(' ', 'Space');
      expect(isChecked('Shared list record')).toBe(true);
      expect(isChecked('List record A')).toBe(true);
      pressFocused(' ', 'Space');
      expect(isChecked('Shared list record')).toBe(false);
      expect(checked()).toBe(2);
    });

    it('toggles the hit under the cursor with Space after A selected the customer’s hits', async () => {
      renderDecisionPage();
      await waitFor(() => expect(activeCard()?.textContent).toContain('List record A'));
      pressFocused('a', 'KeyA');
      expect(checked()).toBe(3);
      pressFocused('j', 'KeyJ');
      await waitFor(() => expect(activeCard()?.textContent).toContain('Shared list record'));
      pressFocused(' ', 'Space');
      expect(isChecked('Shared list record')).toBe(false);
      expect(checked()).toBe(2);
      pressFocused(' ', 'Space');
      expect(checked()).toBe(3);
    });

    it('toggles the cursor hit from a keyboard-focused card, and leaves Space to other focused buttons', async () => {
      renderDecisionPage();
      await waitFor(() => expect(activeCard()?.textContent).toContain('List record A'));
      card('List record A')!.focus();
      pressFocused(' ', 'Space');
      expect(isChecked('List record A')).toBe(true);
      const clear = screen.getByRole('button', { name: /screening_review\.batch\.clear/ });
      clear.focus();
      pressFocused(' ', 'Space');
      expect(checked()).toBe(1);
    });

    it('records No hit with one shared comment on each selected hit, as one decision with one undo', async () => {
      vi.mocked(reviewScreeningReviewMatchFn).mockResolvedValue(inReview);
      renderDecisionPage();
      await waitFor(() => expect(activeCard()?.textContent).toContain('List record A'));
      press('a', 'KeyA');
      fireEvent.change(commentBox(), { target: { value: 'Different person' } });
      press('Enter', 'Enter');
      for (const name of ['List record A', 'List record B']) {
        await waitFor(() => expect(card(name)?.textContent).toContain('cases:screening_review.decision.no_hit'));
      }
      expect(checked()).toBe(0);
      expect(screen.getByText('cases:screening_review.undo.batch_decided')).toBeTruthy();

      press('u', 'KeyU');
      await waitFor(() => expect(checked()).toBe(3));
      expect(commentBox().value).toBe('Different person');
      expect(card('List record A')?.textContent).not.toContain('cases:screening_review.decision.no_hit');

      press('Enter', 'Enter');
      await elapse(SCREENING_REVIEW_UNDO_DELAY_MS);
      await waitFor(() => expect(reviewScreeningReviewMatchFn).toHaveBeenCalledTimes(3));
      for (const matchId of ['screening-1-high', 'screening-1-low', 'dataset-1-alice']) {
        expect(reviewScreeningReviewMatchFn).toHaveBeenCalledWith(
          written(matchId, 'no_hit', { comment: 'Different person' }),
        );
      }
    });

    it('keeps the decided hits and leaves the failed ones selected after a partial failure', async () => {
      vi.mocked(reviewScreeningReviewMatchFn).mockImplementation((async ({ data }: { data: { matchId: string } }) => {
        if (data.matchId === 'screening-1-low') throw new Error('network');
        return inReview;
      }) as never);
      renderDecisionPage();
      await waitFor(() => expect(activeCard()?.textContent).toContain('List record A'));
      press('a', 'KeyA');
      press('Enter', 'Enter');
      await elapse(SCREENING_REVIEW_UNDO_DELAY_MS);
      expect((await screen.findByRole('alert')).textContent).toBe('cases:screening_review.batch.failed');
      expect(checked()).toBe(1);
      expect(checkbox('List record B').getAttribute('aria-checked')).toBe('true');
      expect(card('List record A')?.textContent).toContain('cases:screening_review.decision.no_hit');
      expect(card('List record B')?.textContent).not.toContain('cases:screening_review.decision.no_hit');
      expect(reviewScreeningReviewMatchFn).toHaveBeenCalledTimes(3);
    });
  });
});
