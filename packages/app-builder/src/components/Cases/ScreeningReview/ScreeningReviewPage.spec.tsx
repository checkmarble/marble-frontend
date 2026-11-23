import { FormatContext } from '@app-builder/contexts/FormatContext';
import { adaptContinuousScreening, type ContinuousScreening } from '@app-builder/models/continuous-screening';
import {
  buildScreeningReviewItems,
  SCREENING_REVIEW_HIDE_DELAY_MS,
  SCREENING_REVIEW_SEARCH_MAX,
  SCREENING_REVIEW_UNDO_DELAY_MS,
} from '@app-builder/models/screening-review';
import stagingObjectAddedDto from '@app-builder/models/screening-review.staging-object-added.json';
import {
  datasetReviewScreening,
  objectReviewScreening,
  reviewCase,
} from '@app-builder/models/screening-review.test-helpers';
import { loadMoreContinuousScreeningMatchesFn } from '@app-builder/server-fns/continuous-screening';
import {
  closeScreeningReviewCaseFn,
  listScreeningReviewPageFn,
  reviewScreeningReviewMatchesFn,
  reviewScreeningReviewMatchFn,
} from '@app-builder/server-fns/screening-review';
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
  reviewScreeningReviewMatchesFn: vi.fn(),
  closeScreeningReviewCaseFn: vi.fn(),
}));
vi.mock('@app-builder/server-fns/continuous-screening', () => ({ loadMoreContinuousScreeningMatchesFn: vi.fn() }));
vi.mock('@app-builder/services/organization/organization-detail', () => ({
  useOrganizationDetails: () => ({ currentUser: { actorIdentity: { userId: 'user-1' } } }),
}));
vi.mock('@app-builder/services/organization/organization-users', () => ({
  useOrganizationUsers: () => ({ getOrgUserById: () => undefined }),
}));
vi.mock('@app-builder/queries/data/get-data-model', () => ({
  useDataModelQuery: () => ({ data: undefined, isPending: true }),
}));
vi.mock('@app-builder/queries/data/get-object-details', () => ({
  useObjectDetailsQuery: () => ({ data: undefined, isPending: true }),
}));
vi.mock('@app-builder/queries/cases/related-cases-by-object', () => ({
  useRelatedCasesByObjectQuery: () => ({ data: undefined, isPending: true }),
}));
vi.mock('@app-builder/queries/continuous-screening/configuration', () => ({
  useContinuousScreeningConfigurationQuery: () => ({ data: undefined, isPending: true }),
}));
vi.mock('@app-builder/queries/cases/get-inboxes', () => ({ useGetInboxesQuery: () => ({ data: undefined }) }));
vi.mock('@app-builder/queries/cases/get-detail', () => ({
  useGetCaseDetailQuery: (caseId: string) => ({
    isPending: false,
    isError: false,
    data: { caseDetail: reviewCase(caseId, [objectReviewScreening(), datasetReviewScreening()]) },
  }),
}));
vi.mock('@app-builder/queries/screening/lists-config', () => ({ useListConfigQuery: () => ({ data: undefined }) }));
vi.mock('@app-builder/queries/scoring/get-scoring-settings', () => ({
  useGetScoringSettingsQuery: () => ({ data: { settings: { maxRiskLevel: 3 } } }),
}));
vi.mock('@app-builder/queries/scoring/get-risk-level-latest', () => ({
  useRiskLevelLatestQuery: () => ({ data: { riskLevel: 2 } }),
}));
vi.mock('@tanstack/react-start', () => ({ useServerFn: (fn: unknown) => fn }));
vi.mock('../Navigation/Tabs', () => ({ CasesNavigationTabs: () => <div>Case Manager navigation</div> }));
// The case timeline reaches server functions through its event details; it has its own tests.
vi.mock('@app-builder/components/CaseManager/CaseEvents', () => ({ CaseEvents: () => <div>Case events</div> }));
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
      onAuxClick,
    }: {
      children: React.ReactNode;
      to: string;
      params?: { inboxId?: string; caseId?: string };
      target?: string;
      onClick?: React.MouseEventHandler<HTMLAnchorElement>;
      onAuxClick?: React.MouseEventHandler<HTMLAnchorElement>;
    }) => (
      <a href={href(to, params)} target={target} onClick={onClick} onAuxClick={onAuxClick}>
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
  Trans: ({ i18nKey }: { i18nKey: string }) => i18nKey,
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
  // The batch write reviews each match on its own, like the backend: through the single write's mock.
  vi.mocked(reviewScreeningReviewMatchesFn).mockImplementation(async ({ data: { caseId, decisions }, ...options }) => {
    const results = [];
    for (const decision of decisions) {
      try {
        const result = await reviewScreeningReviewMatchFn({ data: { caseId, ...decision }, ...options });
        // A redirect ends the whole request: `useServerFn` resolves with nothing.
        if (!result) return undefined as never;
        results.push(result);
      } catch {
        results.push(null);
      }
    }
    return results;
  });
});
afterEach(() => {
  cleanup();
  toast.remove();
  vi.resetAllMocks();
});

function renderPage(
  initial: ScreeningReviewSearch = { filter: 'to_review' },
  canViewRiskLevel = false,
  canValidate = true,
  canDismissScreenings = false,
) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });
  function Harness() {
    const [search, setSearch] = useState(initial);
    return (
      <>
        <ScreeningReviewPage
          canViewAdminSections={false}
          canViewRiskLevel={canViewRiskLevel}
          canValidate={canValidate}
          canDismissScreenings={canDismissScreenings}
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
/** The small card of a No hit stack, which names none of its hits. */
function noHitStack() {
  return screen.queryByRole('button', { name: 'cases:screening_review.stack.label' });
}
function press(key: string, code: string, shiftKey = false, target: Element | Document = document) {
  fireEvent.keyDown(target, { key, code, shiftKey });
  fireEvent.keyUp(target, { key, code, shiftKey });
}

describe('screening review keyboard navigation', () => {
  it('navigates hits and customers with keys, records selection in search, and stops at boundaries', async () => {
    renderPage();
    await waitFor(() => expect(onSearchChange).toHaveBeenLastCalledWith({ filter: 'to_review', hit: firstId }));
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
      // A combination takes one key cap, so Shift+J and Shift+K read as two keys, not four.
      const customerRow = within(dialog).getByText(
        'cases:screening_review.shortcuts.next_previous_object',
      ).parentElement;
      expect((customerRow as HTMLElement).querySelectorAll('kbd')).toHaveLength(2);
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

  /**
   * Lays out the hit list: a 400px list scrolled to `scrollTop`, and boxes at content offsets. jsdom
   * has no layout, so each box is given as [top, height] from the top of the list's content.
   */
  function layOut(scrollTop: number, boxes: [HTMLElement, number, number][], headerHeight = 0) {
    const nav = screen.getByRole('navigation', { name: 'cases:screening_review.hit_list' });
    const spies = [
      vi.spyOn(nav, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 200, 400)),
      vi.spyOn(nav, 'clientHeight', 'get').mockReturnValue(400),
      vi.spyOn(nav, 'scrollTop', 'get').mockReturnValue(scrollTop),
      ...boxes.map(([element, top, height]) =>
        vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, top - scrollTop, 200, height)),
      ),
      ...[...nav.querySelectorAll<HTMLElement>('[data-review-group-header]')].map((header) =>
        vi.spyOn(header, 'offsetHeight', 'get').mockReturnValue(headerHeight),
      ),
    ];
    const scrollTo = vi.fn();
    nav.scrollTo = scrollTo;
    return { scrollTo, restore: () => spies.forEach((spy) => spy.mockRestore()) };
  }
  const groups = () => [...document.querySelectorAll<HTMLElement>('[data-review-group]')];
  const hitBox = (group: HTMLElement, index: number) =>
    group.querySelectorAll<HTMLElement>('[data-review-hit]')[index]!;

  it('scrolls the hit list smoothly until the selected hit is fully visible', async () => {
    renderPage();
    await waitFor(() => expect(activeCard()).not.toBeNull());
    const nav = screen.getByRole('navigation', { name: 'cases:screening_review.hit_list' });
    expect(nav.className).toContain('absolute');
    expect(nav.className).toContain('overflow-y-auto');
    const [alice] = groups();
    const { scrollTo, restore } = layOut(0, [
      [alice!, 0, 800],
      [hitBox(alice!, 1), 700, 40],
    ]);
    try {
      press('j', 'KeyJ');
      // 8px below the hit.
      await waitFor(() => expect(scrollTo).toHaveBeenCalledWith({ top: 348, behavior: 'smooth' }));
    } finally {
      restore();
    }
  });

  it('shows the whole group when its first hit is selected', async () => {
    renderPage();
    await waitFor(() => expect(activeCard()).not.toBeNull());
    press('j', 'KeyJ');
    await waitFor(() => expect(activeCard()?.textContent).toContain('Shared list record'));
    const [alice] = groups();
    const { scrollTo, restore } = layOut(0, [
      [alice!, 600, 180],
      [hitBox(alice!, 0), 660, 40],
    ]);
    try {
      press('k', 'KeyK');
      await waitFor(() => expect(activeCard()?.textContent).toContain('List record A'));
      expect(scrollTo).toHaveBeenCalledWith({ top: 380, behavior: 'smooth' });
    } finally {
      restore();
    }
  });

  it('keeps a long group’s header stuck and shows each hit below it', async () => {
    renderPage();
    await waitFor(() => expect(activeCard()).not.toBeNull());
    const [alice] = groups();
    expect(alice!.querySelector('[data-review-group-header]')?.className).toContain('sticky');
    press('j', 'KeyJ');
    press('j', 'KeyJ');
    await waitFor(() => expect(activeCard()?.textContent).toContain('List record B'));
    // Scrolled into the group: its header covers the top 60px of the list.
    const { scrollTo, restore } = layOut(
      300,
      [
        [alice!, 0, 900],
        [hitBox(alice!, 1), 330, 40],
      ],
      60,
    );
    try {
      press('k', 'KeyK');
      await waitFor(() => expect(activeCard()?.textContent).toContain('Shared list record'));
      expect(scrollTo).toHaveBeenCalledWith({ top: 262, behavior: 'smooth' });
    } finally {
      restore();
    }
  });

  it('brings an off-screen group taller than the list in from its top', async () => {
    renderPage();
    await waitFor(() => expect(activeCard()).not.toBeNull());
    const bob = groups()[1]!;
    const { scrollTo, restore } = layOut(0, [
      [bob, 900, 500],
      [hitBox(bob, 0), 960, 48],
    ]);
    try {
      press('J', 'KeyJ', true);
      await waitFor(() => expect(onSearchChange.mock.lastCall?.[0].hit).toBe('case:dataset-1:dataset-1-bob'));
      expect(scrollTo).toHaveBeenCalledWith({ top: 900, behavior: 'smooth' });
    } finally {
      restore();
    }
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
    const [alice] = groups();
    const { scrollTo, restore } = layOut(0, [
      [alice!, 0, 800],
      [hitBox(alice!, 1), 700, 40],
    ]);
    try {
      press('j', 'KeyJ');
      await waitFor(() => expect(scrollTo).toHaveBeenCalledWith({ top: 348, behavior: 'auto' }));
    } finally {
      restore();
      vi.unstubAllGlobals();
    }
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

describe('screening review stream and restoration', () => {
  it('restores the selected inbox with its bookmarked hit', async () => {
    vi.mocked(listScreeningReviewPageFn).mockResolvedValue({ items: secondPageItems, nextCursor: null, failed: false });
    const hit = secondPageItems[1]!.id;
    renderPage({ filter: 'to_review', inboxId: selectedInboxId, hit });
    await waitFor(() => expect(activeCard()?.textContent).toContain('List record B'));
    expect(screen.getByRole('button', { name: 'Screening alerts' })).not.toBeNull();
    expect(listScreeningReviewPageFn).toHaveBeenCalledWith({
      data: { filter: 'to_review', limit: 50, cursor: null, inboxId: selectedInboxId },
    });
    expect(onSearchChange).not.toHaveBeenCalled();
  });

  it('switches inboxes from an empty queue and resets the selected hit', async () => {
    vi.mocked(listScreeningReviewPageFn)
      .mockResolvedValueOnce({ items: [], nextCursor: null, failed: false })
      .mockResolvedValue({ items: secondPageItems, nextCursor: null, failed: false });
    renderPage({ filter: 'to_review' });
    await screen.findByText('cases:screening_review.empty.empty.title');
    fireEvent.click(screen.getByRole('button', { name: 'cases:inbox.my-inbox.link' }));
    fireEvent.click(await screen.findByRole('option', { name: 'Screening alerts' }));
    await waitFor(() =>
      expect(listScreeningReviewPageFn).toHaveBeenLastCalledWith({
        data: { filter: 'to_review', limit: 50, cursor: null, inboxId: selectedInboxId },
      }),
    );
    expect(onSearchChange).toHaveBeenCalledWith({ filter: 'to_review', inboxId: selectedInboxId, hit: undefined });
    await waitFor(() => expect(onSearchChange.mock.lastCall?.[0].hit).toBe(secondPageItems[0]!.id));
    expect(screen.queryByText('cases:screening_review.unavailable')).toBeNull();
  });

  it('appends the next cases on Load more, keeping the selected inbox and the active hit', async () => {
    vi.mocked(listScreeningReviewPageFn)
      .mockResolvedValueOnce({ items: initialItems, nextCursor: pageTwoCursor, failed: false })
      .mockResolvedValue({ items: secondPageItems, nextCursor: null, failed: false });
    renderPage({ filter: 'to_review', inboxId: selectedInboxId });
    await waitFor(() => expect(onSearchChange.mock.lastCall?.[0].hit).toBe(firstId));
    const customers = () =>
      within(screen.getByRole('navigation', { name: 'cases:screening_review.hit_list' }))
        .getAllByRole('heading', { level: 2 })
        .map((heading) => heading.textContent);
    const loaded = customers();
    fireEvent.click(screen.getByRole('button', { name: 'cases:screening_review.load_more_cases' }));
    await waitFor(() =>
      expect(listScreeningReviewPageFn).toHaveBeenLastCalledWith({
        data: { filter: 'to_review', limit: 50, cursor: pageTwoCursor, inboxId: selectedInboxId },
      }),
    );
    // The next case comes after the loaded ones, and the cursor moves to its first hit.
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'cases:screening_review.load_more_cases' })).toBeNull(),
    );
    expect(customers()).toEqual([...loaded, 'Bob']);
    await waitFor(() => expect(onSearchChange.mock.lastCall?.[0].hit).toMatch(/^second-case:/));
    expect(onSearchChange.mock.lastCall?.[0].inboxId).toBe(selectedInboxId);
    expect(onSearchChange.mock.calls.some(([search]) => 'cursors' in search || 'limit' in search)).toBe(false);
  });

  it('keeps the cursor when Load more completes after the inbox changed', async () => {
    const nextPage = Promise.withResolvers<{ items: typeof initialItems; nextCursor: null; failed: boolean }>();
    vi.mocked(listScreeningReviewPageFn)
      .mockResolvedValueOnce({ items: initialItems, nextCursor: pageTwoCursor, failed: false })
      .mockReturnValueOnce(nextPage.promise)
      .mockResolvedValue({ items: secondPageItems, nextCursor: null, failed: false });
    renderPage();
    await waitFor(() => expect(onSearchChange.mock.lastCall?.[0].hit).toBe(firstId));
    fireEvent.click(screen.getByRole('button', { name: 'cases:screening_review.load_more_cases' }));
    fireEvent.click(screen.getByRole('button', { name: 'cases:inbox.my-inbox.link' }));
    fireEvent.click(await screen.findByRole('option', { name: 'Screening alerts' }));
    await waitFor(() => expect(onSearchChange.mock.lastCall?.[0].hit).toBe(secondPageItems[0]!.id));
    press('j', 'KeyJ');
    await waitFor(() => expect(onSearchChange.mock.lastCall?.[0].hit).toBe(secondPageItems[1]!.id));
    nextPage.resolve({ items: secondPageItems, nextCursor: null, failed: false });
    await act(() => new Promise((resolve) => setTimeout(resolve, 50)));
    expect(onSearchChange.mock.lastCall?.[0].hit).toBe(secondPageItems[1]!.id);
  });

  it('hides the previous inbox’s hits while the newly selected inbox loads', async () => {
    const nextPage = Promise.withResolvers<{ items: typeof initialItems; nextCursor: null; failed: boolean }>();
    vi.mocked(listScreeningReviewPageFn)
      .mockResolvedValueOnce({ items: initialItems, nextCursor: null, failed: false })
      .mockReturnValueOnce(nextPage.promise);
    renderPage();
    await waitFor(() => expect(activeCard()).not.toBeNull());
    fireEvent.click(screen.getByRole('button', { name: 'cases:inbox.my-inbox.link' }));
    fireEvent.click(await screen.findByRole('option', { name: 'Screening alerts' }));
    await waitFor(() =>
      expect(listScreeningReviewPageFn).toHaveBeenLastCalledWith({
        data: { filter: 'to_review', limit: 50, cursor: null, inboxId: selectedInboxId },
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
    fireEvent.click(screen.getByRole('button', { name: 'cases:inbox.my-inbox.link' }));
    await screen.findByRole('option', { name: 'Screening alerts' });
    const field = document.activeElement;
    expect(field?.tagName).toBe('INPUT');
    if (!field) throw new Error('Inbox selector must hold keyboard focus');
    press('j', 'KeyJ', false, field);
    press('ArrowDown', 'ArrowDown', false, field);
    expect(onSearchChange.mock.lastCall?.[0].hit).toBe(firstId);
  });

  it('restores a bookmarked hit after reload', async () => {
    vi.mocked(listScreeningReviewPageFn).mockResolvedValue({ items: secondPageItems, nextCursor: null, failed: false });
    const hit = secondPageItems[1]!.id;
    renderPage({ filter: 'to_review', hit });
    await waitFor(() => expect(activeCard()?.textContent).toContain('List record B'));
    expect(listScreeningReviewPageFn).toHaveBeenCalledWith({
      data: { filter: 'to_review', limit: 50, cursor: null, inboxId: 'my-inbox' },
    });
    expect(onSearchChange).not.toHaveBeenCalled();
  });

  it('falls back to the first pending hit when a bookmarked hit was beyond the first page', async () => {
    // The URL names no page, so a reload reads the first one only, and a later hit is not looked for.
    vi.mocked(listScreeningReviewPageFn).mockResolvedValue({
      items: initialItems,
      nextCursor: pageTwoCursor,
      failed: false,
    });
    renderPage({ filter: 'to_review', hit: secondPageItems[1]!.id });
    await screen.findByText('cases:screening_review.unavailable');
    expect(onSearchChange.mock.lastCall?.[0].hit).toBe(firstId);
    expect(listScreeningReviewPageFn).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'cases:screening_review.load_more_cases' })).not.toBeNull();
  });

  it('explains stale selection and falls back to the first pending hit', async () => {
    renderPage({ filter: 'to_review', hit: 'no-longer-eligible' });
    await screen.findByText('cases:screening_review.unavailable');
    expect(onSearchChange.mock.lastCall?.[0].hit).toBe(firstId);
  });

  it('offers no page size nor Previous and Next, and no Load more once every case is read', async () => {
    renderPage();
    await waitFor(() => expect(onSearchChange.mock.lastCall?.[0].hit).toBe(firstId));
    for (const name of ['25', '50', '100', 'cases:screening_review.load_more_cases']) {
      expect(screen.queryByRole('button', { name })).toBeNull();
    }
  });

  it('keeps successful hits visible and retries incomplete pages without offering Load more', async () => {
    vi.mocked(listScreeningReviewPageFn)
      .mockResolvedValueOnce({ items: initialItems, nextCursor: null, failed: true })
      .mockResolvedValue({ items: initialItems, nextCursor: null, failed: false });
    renderPage();
    await screen.findByRole('alert');
    expect(activeCard()).not.toBeNull();
    expect(screen.queryByRole('button', { name: 'cases:screening_review.load_more_cases' })).toBeNull();
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
    await waitFor(() => expect(onSearchChange).toHaveBeenLastCalledWith({ filter: 'to_review', hit: firstId }));
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
  // Hit cards only: the batch summary repeats each selected hit with its own checkbox.
  const checked = () =>
    document.querySelectorAll('[data-review-hit-card] ~ [role="checkbox"][aria-checked="true"]').length;
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
    await elapse(SCREENING_REVIEW_UNDO_DELAY_MS - 100);
    expect(reviewScreeningReviewMatchFn).not.toHaveBeenCalled();
    await elapse(100);
    await waitFor(() =>
      expect(reviewScreeningReviewMatchFn).toHaveBeenCalledWith(written('screening-1-high', 'no_hit')),
    );
    // The refetch still returns the hit as pending; the decision stays on screen.
    await waitFor(() => expect(listScreeningReviewPageFn).toHaveBeenCalledTimes(2));
    expect(card('List record A')?.textContent).toContain('cases:screening_review.decision.no_hit');

    // The No hit hit moved to the end of its group.
    press('j', 'KeyJ');
    await waitFor(() => expect(activeCard()?.textContent).toContain('List record B'));
    press('j', 'KeyJ');
    await screen.findByText('cases:screening_review.dock.validated');
    expect(activeCard()?.textContent).toContain('List record A');
    expect(screen.getByText('cases:screening_review.step.validated')).toBeTruthy();
    expect(screen.queryByRole('textbox', { name: 'cases:screening_review.dock.comment' })).toBeNull();
    press('n', 'KeyN');
    press('Enter', 'Enter');
    await elapse(SCREENING_REVIEW_UNDO_DELAY_MS);
    expect(reviewScreeningReviewMatchFn).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: /screening_review\.dock\.next_hit/ }));
    await waitFor(() => expect(activeCard()?.textContent).toContain('Shared list record'));
  });

  it('keeps a decided hit decided when a window-focus refetch returns the data from before the write', async () => {
    vi.mocked(reviewScreeningReviewMatchFn).mockResolvedValue(inReview);
    const { queryClient } = renderDecisionPage();
    await waitFor(() => expect(activeCard()?.textContent).toContain('List record A'));
    press('n', 'KeyN');
    press('Enter', 'Enter');
    await elapse(SCREENING_REVIEW_UNDO_DELAY_MS);
    await waitFor(() => expect(reviewScreeningReviewMatchFn).toHaveBeenCalledOnce());
    // The server still lists the hit as pending, as a read racing the write would.
    await act(() => queryClient.refetchQueries({ queryKey: ['cases', 'screening-review'] }));
    expect(card('List record A')?.textContent).toContain('cases:screening_review.decision.no_hit');
    expect(activeCard()?.textContent).not.toContain('List record A');
  });

  it('keeps the comment, and C, for once Hit or No hit is chosen', async () => {
    renderDecisionPage();
    await waitFor(() => expect(activeCard()?.textContent).toContain('List record A'));
    expect(commentBox().hasAttribute('disabled')).toBe(true);
    expect(commentBox().getAttribute('placeholder')).toBe('cases:screening_review.dock.comment_disabled');
    press('c', 'KeyC');
    expect(document.activeElement).not.toBe(commentBox());
    press('n', 'KeyN');
    expect(commentBox().hasAttribute('disabled')).toBe(false);
    press('c', 'KeyC');
    expect(document.activeElement).toBe(commentBox());
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
    fireEvent.click(screen.getByRole('button', { name: /screening_review\.dock\.cancel/ }));
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
    // The skipped hit leaves the list during the undo delay, counted beside the Hit.
    await waitFor(() => expect(activeCard()?.textContent).toContain('Shared list record'));
    expect(card('List record B')).toBeUndefined();
    expect(screen.getByText('cases:screening_review.set_aside')).toBeTruthy();
    await elapse(SCREENING_REVIEW_UNDO_DELAY_MS);
    await waitFor(() =>
      expect(reviewScreeningReviewMatchFn).toHaveBeenCalledWith(written('screening-1-high', 'confirmed_hit')),
    );
    expect(card('List record B')).toBeUndefined();
    expect(card('List record A')?.textContent).toContain('cases:screening_review.decision.confirmed_hit');

    // A list-update Hit doesn't warn: the other customers' hits stay independent.
    press('m', 'KeyM');
    expect(screen.queryByRole('note')).toBeNull();
    press('k', 'KeyK');
    await screen.findByText('cases:screening_review.screening_state.confirmed_hit');
    const link = screen.getByRole('link', { name: 'cases:screening_review.open_case' });
    expect(link.getAttribute('href')).toBe(caseHref);
    expect(link.getAttribute('target')).toBe('_blank');
  });

  it('shows the closure during the undo delay, then drops the group once its decisions are written', async () => {
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
    await screen.findByText('cases:screening_review.screening_state.case_closed');
    // During the undo delay, both No hit hits stack, under the cursor and with no name.
    expect(noHitStack()?.getAttribute('aria-current')).toBe('true');
    expect(noHitStack()?.textContent).not.toContain('List record');
    expect(screen.getByRole('button', { name: 'cases:screening_review.stack.unstack' }).textContent).toBe('×2');
    expect(screen.getByText('cases:screening_review.empty.all_reviewed.title')).toBeTruthy();
    expect(screen.queryByText('cases:screening_review.empty.all_reviewed.description')).toBeNull();
    await elapse(SCREENING_REVIEW_UNDO_DELAY_MS);
    await waitFor(() => expect(reviewScreeningReviewMatchFn).toHaveBeenCalledTimes(2));
    // Written, the group leaves at once. The visit ends on the all-reviewed state, not the empty queue.
    await screen.findByText('cases:screening_review.empty.all_reviewed.description');
    expect(noHitStack()).toBeNull();
    expect(screen.queryByText('cases:screening_review.unavailable')).toBeNull();
  });

  it('treats a case the page read closed as closed', async () => {
    // To review drops the group once its decisions are written, so the closure shows in All.
    const items = buildScreeningReviewItems([reviewCase(caseId, [objectReviewScreening()])]);
    vi.mocked(reviewScreeningReviewMatchFn)
      .mockResolvedValueOnce(inReview)
      // The write couldn't close the case; the next page read retries the closure.
      .mockResolvedValueOnce({ ok: true, screeningStatus: 'no_hit', caseClosed: false });
    vi.mocked(listScreeningReviewPageFn).mockResolvedValue({ items, nextCursor: null, failed: false });
    const { queryClient } = renderPage({ filter: 'all' });
    await waitFor(() => expect(activeCard()?.textContent).toContain('List record A'));
    press('n', 'KeyN');
    press('Enter', 'Enter');
    await waitFor(() => expect(activeCard()?.textContent).toContain('List record B'));
    press('n', 'KeyN');
    press('Enter', 'Enter');
    await waitFor(() => expect(reviewScreeningReviewMatchFn).toHaveBeenCalledTimes(1));
    await elapse(SCREENING_REVIEW_UNDO_DELAY_MS);
    await waitFor(() => expect(reviewScreeningReviewMatchFn).toHaveBeenCalledTimes(2));
    await screen.findByText('cases:screening_review.screening_state.closure_pending');
    vi.mocked(listScreeningReviewPageFn).mockResolvedValue({
      items,
      nextCursor: null,
      failed: false,
      closedCaseIds: [caseId],
    });
    await act(async () => {
      await queryClient.invalidateQueries({ queryKey: ['cases', 'screening-review'] });
    });
    await screen.findByText('cases:screening_review.screening_state.case_closed');
    expect(screen.queryByText('cases:screening_review.screening_state.closure_pending')).toBeNull();
  });

  it('keeps a closed case in All after its last hit is decided', async () => {
    const items = buildScreeningReviewItems([reviewCase(caseId, [objectReviewScreening()])]);
    vi.mocked(reviewScreeningReviewMatchFn)
      .mockResolvedValueOnce(inReview)
      .mockResolvedValueOnce({ ok: true, screeningStatus: 'no_hit', caseClosed: true });
    vi.mocked(listScreeningReviewPageFn).mockResolvedValue({ items, nextCursor: null, failed: false });
    renderPage({ filter: 'all' });
    await waitFor(() => expect(activeCard()?.textContent).toContain('List record A'));
    press('n', 'KeyN');
    press('Enter', 'Enter');
    await waitFor(() => expect(activeCard()?.textContent).toContain('List record B'));
    press('n', 'KeyN');
    press('Enter', 'Enter');
    await elapse(SCREENING_REVIEW_UNDO_DELAY_MS);
    await waitFor(() => expect(reviewScreeningReviewMatchFn).toHaveBeenCalledTimes(2));
    await screen.findByText('cases:screening_review.screening_state.case_closed');
    await elapse(SCREENING_REVIEW_HIDE_DELAY_MS);
    // Both No hit hits stay, stacked.
    expect(noHitStack()).not.toBeNull();
    expect(screen.getByRole('button', { name: 'cases:screening_review.stack.unstack' }).textContent).toBe('×2');
    expect(screen.queryByText('cases:screening_review.unavailable')).toBeNull();
  });

  it('takes no decision while the previous search’s page still shows', async () => {
    renderDecisionPage();
    await waitFor(() => expect(activeCard()?.textContent).toContain('List record A'));
    vi.mocked(listScreeningReviewPageFn).mockImplementation(() => new Promise(() => undefined));
    const search = screen.getByRole('textbox', { name: 'cases:screening_review.search.label' });
    fireEvent.change(search, { target: { value: 'Bob' } });
    fireEvent.keyDown(search, { key: 'Enter', code: 'Enter' });
    await waitFor(() =>
      expect(listScreeningReviewPageFn).toHaveBeenLastCalledWith({ data: expect.objectContaining({ name: 'Bob' }) }),
    );
    expect(activeCard()?.textContent).toContain('List record A');
    fireEvent.click(decisionButton('no_hit'));
    fireEvent.click(validateButton());
    await elapse(SCREENING_REVIEW_UNDO_DELAY_MS);
    expect(reviewScreeningReviewMatchFn).not.toHaveBeenCalled();
    expect(reviewScreeningReviewMatchesFn).not.toHaveBeenCalled();
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

  describe('close case instead of loading more matches', () => {
    /** A partial screening whose one loaded hit is already No hit. */
    function decidedPartial() {
      const screening = objectReviewScreening();
      screening.partial = true;
      screening.matches = screening.matches.slice(0, 1).map((match) => ({ ...match, status: 'no_hit' as const }));
      return screening;
    }
    const closeButton = () => screen.queryByRole('button', { name: 'cases:screening_review.close_case' });
    /** Its decided hits list under All, opened on the partial screening's hit. */
    function renderClosable(screenings: ContinuousScreening[], canDismissScreenings = true) {
      const items = buildScreeningReviewItems([reviewCase(caseId, screenings)]);
      vi.mocked(listScreeningReviewPageFn).mockResolvedValue({ items, nextCursor: null, failed: false });
      const hit = items.find((item) => item.screeningId === 'screening-1')!.id;
      return renderPage({ filter: 'all', hit }, false, true, canDismissScreenings);
    }

    it('ends the screening at No hit and shows the case closed', async () => {
      vi.mocked(closeScreeningReviewCaseFn).mockResolvedValue({
        ok: true,
        screeningStatus: 'no_hit',
        caseClosed: true,
      });
      renderClosable([decidedPartial()]);
      await screen.findByText('cases:screening_review.screening_state.load_more');
      fireEvent.click(closeButton()!);
      await waitFor(() =>
        expect(closeScreeningReviewCaseFn).toHaveBeenCalledWith({ data: { caseId, screeningId: 'screening-1' } }),
      );
      await screen.findByText('cases:screening_review.screening_state.case_closed');
      expect(loadMoreContinuousScreeningMatchesFn).not.toHaveBeenCalled();
    });

    it('writes the pending batch in one request before closing the case', async () => {
      const screening = objectReviewScreening();
      screening.partial = true;
      let finishWrites: () => void = () => undefined;
      const writes = new Promise<void>((resolve) => {
        finishWrites = resolve;
      });
      vi.mocked(reviewScreeningReviewMatchesFn).mockImplementation(async ({ data }) => {
        await writes;
        return data.decisions.map(() => inReview);
      });
      vi.mocked(closeScreeningReviewCaseFn).mockResolvedValue({
        ok: true,
        screeningStatus: 'no_hit',
        caseClosed: true,
      });
      vi.mocked(listScreeningReviewPageFn).mockResolvedValue({
        items: buildScreeningReviewItems([reviewCase(caseId, [screening])]),
        nextCursor: null,
        failed: false,
      });
      renderPage(undefined, false, true, true);
      await waitFor(() => expect(activeCard()?.textContent).toContain('List record A'));
      press('a', 'KeyA');
      press('Enter', 'Enter');
      fireEvent.click(await screen.findByRole('button', { name: 'cases:screening_review.close_case' }));
      await waitFor(() => expect(reviewScreeningReviewMatchesFn).toHaveBeenCalledOnce());
      expect(closeButton()?.hasAttribute('disabled')).toBe(true);
      expect(closeScreeningReviewCaseFn).not.toHaveBeenCalled();
      finishWrites();
      await waitFor(() => expect(closeScreeningReviewCaseFn).toHaveBeenCalledOnce());
      expect(reviewScreeningReviewMatchFn).not.toHaveBeenCalled();
      // Settled, the group leaves To review.
      await screen.findByText('cases:screening_review.empty.all_reviewed.title');
    });

    it('shows the screening at No hit when reading it back after the closure fails', async () => {
      vi.mocked(closeScreeningReviewCaseFn).mockResolvedValue({ ok: true, screeningStatus: null, caseClosed: false });
      renderClosable([decidedPartial()]);
      await screen.findByText('cases:screening_review.screening_state.load_more');
      fireEvent.click(closeButton()!);
      await screen.findByText('cases:screening_review.screening_state.closure_pending');
      expect(closeButton()).toBeNull();
    });

    it('keeps a partial screening with no pending hit in To review after a reload', async () => {
      vi.mocked(listScreeningReviewPageFn).mockResolvedValue({
        items: buildScreeningReviewItems([reviewCase(caseId, [decidedPartial()])]),
        nextCursor: null,
        failed: false,
      });
      renderPage(undefined, false, true, true);
      await screen.findByText('cases:screening_review.screening_state.load_more');
      expect(screen.getByRole('button', { name: 'cases:screening_review.load_more' })).toBeTruthy();
      expect(screen.queryByText('cases:screening_review.empty.all_reviewed.title')).toBeNull();
    });

    it('explains a refused closure', async () => {
      vi.mocked(closeScreeningReviewCaseFn).mockResolvedValue({ ok: false, reason: 'not_closable' });
      renderClosable([decidedPartial()]);
      await screen.findByText('cases:screening_review.screening_state.load_more');
      fireEvent.click(closeButton()!);
      expect((await screen.findByRole('alert')).textContent).toBe('cases:screening_review.rejection.not_closable');
    });

    it('is not offered without the dismiss permission', async () => {
      renderClosable([decidedPartial()], false);
      await screen.findByText('cases:screening_review.screening_state.load_more');
      expect(closeButton()).toBeNull();
    });

    it('is not offered on a partial screening that holds a Hit', async () => {
      const screening = objectReviewScreening();
      screening.partial = true;
      screening.matches = screening.matches.map((match, index) => ({
        ...match,
        status: index === 0 ? ('confirmed_hit' as const) : ('no_hit' as const),
      }));
      renderClosable([screening]);
      await screen.findByRole('button', { name: 'cases:screening_review.load_more' });
      expect(closeButton()).toBeNull();
    });

    /** The closable case, and another customer's case with pending hits to move to. */
    function renderWithAnotherCase() {
      const items = buildScreeningReviewItems([
        reviewCase(caseId, [decidedPartial()]),
        reviewCase('other-case', [objectReviewScreening('screening-9', 'bob')]),
      ]);
      vi.mocked(listScreeningReviewPageFn).mockResolvedValue({ items, nextCursor: null, failed: false });
      const hit = items.find((item) => item.caseId === caseId)!.id;
      renderPage({ filter: 'all', hit }, false, true, true);
    }

    it('shows a refused closure even once the analyst has moved to another hit', async () => {
      const response = Promise.withResolvers<{ ok: false; reason: 'not_closable' }>();
      vi.mocked(closeScreeningReviewCaseFn).mockReturnValue(response.promise);
      renderWithAnotherCase();
      fireEvent.click(await screen.findByRole('button', { name: 'cases:screening_review.close_case' }));
      await waitFor(() => expect(closeScreeningReviewCaseFn).toHaveBeenCalledOnce());
      fireEvent.click(card('List record B')!);
      await waitFor(() => expect(closeButton()).toBeNull());
      response.resolve({ ok: false, reason: 'not_closable' });
      expect((await screen.findByRole('alert')).textContent).toBe('cases:screening_review.rejection.not_closable');
    });

    it('refreshes the queue after Load more even once the analyst has moved to another hit', async () => {
      const response = Promise.withResolvers<undefined>();
      vi.mocked(loadMoreContinuousScreeningMatchesFn).mockReturnValue(response.promise);
      renderWithAnotherCase();
      fireEvent.click(await screen.findByRole('button', { name: 'cases:screening_review.load_more' }));
      await waitFor(() => expect(loadMoreContinuousScreeningMatchesFn).toHaveBeenCalledOnce());
      fireEvent.click(card('List record B')!);
      await waitFor(() =>
        expect(screen.queryByRole('button', { name: 'cases:screening_review.load_more' })).toBeNull(),
      );
      const reads = vi.mocked(listScreeningReviewPageFn).mock.calls.length;
      response.resolve(undefined);
      await waitFor(() => expect(vi.mocked(listScreeningReviewPageFn).mock.calls.length).toBeGreaterThan(reads));
    });

    it('refreshes the queue when the closure request fails, since the dismissal may have committed', async () => {
      vi.mocked(closeScreeningReviewCaseFn).mockRejectedValue(new Error('hydration failed'));
      renderClosable([decidedPartial()]);
      await screen.findByText('cases:screening_review.screening_state.load_more');
      const reads = vi.mocked(listScreeningReviewPageFn).mock.calls.length;
      fireEvent.click(closeButton()!);
      await waitFor(() => expect(vi.mocked(listScreeningReviewPageFn).mock.calls.length).toBeGreaterThan(reads));
    });

    it('is not offered while another screening of the case is open', async () => {
      renderClosable([decidedPartial(), datasetReviewScreening()]);
      await screen.findByText('cases:screening_review.screening_state.load_more');
      expect(screen.getByRole('button', { name: 'cases:screening_review.load_more' })).toBeTruthy();
      expect(closeButton()).toBeNull();
    });
  });

  it('waits for Load more before loading a partial screening’s next matches, even once its hits are written', async () => {
    const screening = objectReviewScreening();
    screening.partial = true;
    const items = buildScreeningReviewItems([reviewCase(caseId, [screening])]);
    vi.mocked(reviewScreeningReviewMatchFn).mockResolvedValue(inReview);
    vi.mocked(loadMoreContinuousScreeningMatchesFn).mockResolvedValue(undefined);
    renderDecisionPage(items);
    await waitFor(() => expect(activeCard()?.textContent).toContain('List record A'));
    press('a', 'KeyA');
    press('Enter', 'Enter');
    // The server keeps the screening partial, its loaded hits now No hit.
    const decided = objectReviewScreening();
    decided.partial = true;
    decided.matches = decided.matches.map((match) => ({ ...match, status: 'no_hit' as const }));
    vi.mocked(listScreeningReviewPageFn).mockResolvedValue({
      items: buildScreeningReviewItems([reviewCase(caseId, [decided])]),
      nextCursor: null,
      failed: false,
    });
    await elapse(SCREENING_REVIEW_UNDO_DELAY_MS);
    await waitFor(() => expect(reviewScreeningReviewMatchFn).toHaveBeenCalledTimes(2));
    await screen.findByText('cases:screening_review.screening_state.load_more');
    await elapse(SCREENING_REVIEW_UNDO_DELAY_MS);
    expect(loadMoreContinuousScreeningMatchesFn).not.toHaveBeenCalled();
    fireEvent.click(await screen.findByRole('button', { name: 'cases:screening_review.load_more' }));
    await waitFor(() =>
      expect(loadMoreContinuousScreeningMatchesFn).toHaveBeenCalledExactlyOnceWith({
        data: { screeningId: 'screening-1' },
      }),
    );
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
      // The hit shows the server's decision, read-only, under the cursor.
      await waitFor(() =>
        expect(card('List record A')?.textContent).toContain('cases:screening_review.decision.no_hit'),
      );
      expect(onSearchChange.mock.lastCall?.[0].hit).toBe(hitId('screening-1-high'));
      expect(screen.queryByRole('group', { name: 'cases:screening_review.dock.title' })).toBeNull();
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
    it('takes the undo toast down as soon as Undo is pressed', async () => {
      renderDecisionPage();
      await waitFor(() => expect(activeCard()?.textContent).toContain('List record A'));
      press('n', 'KeyN');
      press('Enter', 'Enter');
      fireEvent.click(await undoButton());
      await screen.findByText('cases:screening_review.undo.recalled');
      expect(screen.queryByRole('button', { name: /screening_review\.undo\.action/ })).toBeNull();
    });

    it('undoes with the toast or U, restoring the hit, its decision and its comment without a write', async () => {
      renderDecisionPage();
      await waitFor(() => expect(activeCard()?.textContent).toContain('List record A'));
      fireEvent.click(decisionButton('no_hit'));
      fireEvent.change(commentBox(), { target: { value: 'Same name only' } });
      press('Enter', 'Enter');
      await waitFor(() => expect(activeCard()?.textContent).toContain('Shared list record'));
      expect(screen.getByText('cases:screening_review.undo.validated')).toBeTruthy();
      fireEvent.click(await undoButton());
      await waitFor(() => expect(activeCard()?.textContent).toContain('List record A'));
      // The undo toast gives way to the recall.
      expect(await screen.findByText('cases:screening_review.undo.recalled')).toBeTruthy();
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

    it('tells an analyst who can’t validate that the decision went for validation', async () => {
      vi.mocked(listScreeningReviewPageFn).mockResolvedValue({ items: decisionItems, nextCursor: null, failed: false });
      renderPage(undefined, false, false);
      await waitFor(() => expect(activeCard()?.textContent).toContain('List record A'));
      press('n', 'KeyN');
      press('Enter', 'Enter');
      expect(await screen.findByText('cases:screening_review.undo.sent_for_validation')).toBeTruthy();
      expect(screen.queryByText('cases:screening_review.undo.validated')).toBeNull();
    });

    it('writes the previous decision at once when another is made, and undoes only the latest', async () => {
      vi.mocked(reviewScreeningReviewMatchFn).mockResolvedValue(inReview);
      renderDecisionPage();
      await waitFor(() => expect(activeCard()?.textContent).toContain('List record A'));
      press('n', 'KeyN');
      press('Enter', 'Enter');
      await waitFor(() => expect(activeCard()?.textContent).toContain('Shared list record'));
      // Moving doesn't write.
      press('j', 'KeyJ');
      press('k', 'KeyK');
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
      fireEvent.click(screen.getByRole('tab', { name: /screening_review\.filter\.all/ }));
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
      // Back on the decided hit, its dock links to its case.
      await waitFor(() => expect(activeCard()?.textContent).toContain('Shared list record'));
      press('j', 'KeyJ');
      await waitFor(() => expect(activeCard()?.textContent).toContain('List record B'));
      fireEvent.click(screen.getByRole('link', { name: 'cases:screening_review.open_case' }));
      expect(open).toHaveBeenLastCalledWith('', '_blank');
      await waitFor(() => expect(reviewScreeningReviewMatchFn).toHaveBeenCalledTimes(2));
      await waitFor(() => expect(tab.location.href).toBe(new URL(caseHref, window.location.href).href));
      open.mockRestore();
    });
    it('keeps O, modified and middle clicks on the case link waiting for a write the delay already started', async () => {
      const tab = { opener: {} as unknown, location: { href: '' } };
      const open = vi.spyOn(window, 'open').mockReturnValue(tab as unknown as Window);
      const write = Promise.withResolvers<{ ok: true; screeningStatus: 'confirmed_hit'; caseClosed: false }>();
      vi.mocked(reviewScreeningReviewMatchFn).mockImplementation(() => write.promise as never);
      renderDecisionPage();
      await waitFor(() => expect(activeCard()?.textContent).toContain('List record A'));
      press('m', 'KeyM');
      press('Enter', 'Enter');
      await elapse(SCREENING_REVIEW_UNDO_DELAY_MS);
      await waitFor(() => expect(reviewScreeningReviewMatchFn).toHaveBeenCalledTimes(1));
      // The undo window is over, but the write is still running.
      press('o', 'KeyO');
      expect(open).toHaveBeenLastCalledWith('', '_blank');

      // The decided hit's dock links to its case.
      press('k', 'KeyK');
      await waitFor(() => expect(activeCard()?.textContent).toContain('List record A'));
      const link = screen.getByRole('link', { name: 'cases:screening_review.open_case' });
      expect(fireEvent.click(link, { metaKey: true })).toBe(false);
      expect(fireEvent.click(link, { ctrlKey: true, shiftKey: true })).toBe(false);
      expect(fireEvent(link, new MouseEvent('auxclick', { button: 1, bubbles: true, cancelable: true }))).toBe(false);
      expect(open).toHaveBeenCalledTimes(4);
      expect(open.mock.calls.every((call) => call[0] === '')).toBe(true);
      // Alt+click downloads the link: left to the browser.
      expect(fireEvent.click(link, { altKey: true })).toBe(true);
      expect(tab.location.href).toBe('');

      write.resolve({ ok: true, screeningStatus: 'confirmed_hit', caseClosed: false });
      await waitFor(() => expect(tab.location.href).not.toBe(''));
      // Everything is written: links keep their default behavior.
      expect(fireEvent.click(link, { metaKey: true })).toBe(true);
      expect(fireEvent(link, new MouseEvent('auxclick', { button: 1, bubbles: true, cancelable: true }))).toBe(true);
      expect(open).toHaveBeenCalledTimes(4);
      open.mockRestore();
    });

    it('loads more matches only after a write the delay already started has finished', async () => {
      const screening = objectReviewScreening();
      screening.partial = true;
      screening.matches = screening.matches.slice(0, 1);
      const items = buildScreeningReviewItems([reviewCase(caseId, [screening])]);
      const write = Promise.withResolvers<typeof inReview>();
      vi.mocked(reviewScreeningReviewMatchFn).mockImplementation(() => write.promise as never);
      vi.mocked(loadMoreContinuousScreeningMatchesFn).mockResolvedValue(undefined);
      renderDecisionPage(items);
      await waitFor(() => expect(activeCard()?.textContent).toContain('List record A'));
      press('n', 'KeyN');
      press('Enter', 'Enter');
      await elapse(SCREENING_REVIEW_UNDO_DELAY_MS);
      await waitFor(() => expect(reviewScreeningReviewMatchFn).toHaveBeenCalledTimes(1));
      fireEvent.click(await screen.findByRole('button', { name: 'cases:screening_review.load_more' }));
      await elapse(100);
      expect(loadMoreContinuousScreeningMatchesFn).not.toHaveBeenCalled();
      write.resolve(inReview);
      await waitFor(() => expect(loadMoreContinuousScreeningMatchesFn).toHaveBeenCalledTimes(1));
    });

    it('leaves the screen alone when a write redirects, and still opens the waiting case tab', async () => {
      const tab = { opener: {} as unknown, location: { href: '' } };
      const open = vi.spyOn(window, 'open').mockReturnValue(tab as unknown as Window);
      // `useServerFn` navigates on a redirect and resolves with nothing.
      vi.mocked(reviewScreeningReviewMatchFn).mockResolvedValue(undefined as never);
      renderDecisionPage();
      await waitFor(() => expect(activeCard()?.textContent).toContain('List record A'));
      press('n', 'KeyN');
      press('Enter', 'Enter');
      press('o', 'KeyO');
      await waitFor(() => expect(tab.location.href).toBe(caseHref));
      expect(reviewScreeningReviewMatchFn).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole('alert')).toBeNull();

      press('a', 'KeyA');
      press('Enter', 'Enter');
      await elapse(SCREENING_REVIEW_UNDO_DELAY_MS);
      // The batch is one request, which the redirect ends.
      await waitFor(() => expect(reviewScreeningReviewMatchesFn).toHaveBeenCalledOnce());
      await elapse(0);
      expect(screen.queryByRole('alert')).toBeNull();
      open.mockRestore();
    });
  });

  describe('batch No hit', () => {
    it('selects with X, A and the mouse, shows a summary, and clears the selection with Esc, Shift+A and Clear', async () => {
      renderDecisionPage();
      await waitFor(() => expect(activeCard()?.textContent).toContain('List record A'));
      press('x', 'KeyX');
      expect(checked()).toBe(1);
      expect(screen.getByRole('heading', { name: 'cases:screening_review.batch.title' })).toBeTruthy();
      // The dock offers No hit only, already chosen, and Validate records it.
      expect(screen.queryByRole('button', { name: /screening_review\.decision\.confirmed_hit/ })).toBeNull();
      expect(decisionButton('no_hit').getAttribute('aria-pressed')).toBe('true');
      expect(validateButton()).toBeTruthy();
      press('x', 'KeyX');
      expect(checked()).toBe(0);
      expect(decisionButton('confirmed_hit')).toBeTruthy();

      press('a', 'KeyA');
      expect(checked()).toBe(3);
      press('Escape', 'Escape');
      expect(checked()).toBe(0);

      // Clear appears once a hit of the customer is checked, and clears that customer only.
      expect(screen.queryByRole('checkbox', { name: /screening_review\.batch\.deselect_customer_hits/ })).toBeNull();
      press('a', 'KeyA');
      expect(checked()).toBe(3);
      press('A', 'KeyA', true);
      expect(checked()).toBe(0);
      press('a', 'KeyA');
      const clearGroup = screen.getByRole('checkbox', { name: /screening_review\.batch\.deselect_customer_hits/ });
      expect(clearGroup.getAttribute('aria-checked')).toBe('mixed');
      // Shift+A, in one key cap.
      expect(clearGroup.parentElement!.querySelectorAll('kbd')).toHaveLength(1);
      fireEvent.click(clearGroup);
      expect(checked()).toBe(0);

      fireEvent.click(checkbox('List record B'));
      expect(checked()).toBe(1);
      fireEvent.click(checkbox('List record B'));
      expect(checked()).toBe(0);
      // A case with one hit has no Select all: its hit's checkbox does it.
      const selectGroup = screen.getByRole('checkbox', { name: /screening_review\.batch\.select_customer_hits/ });
      expect(selectGroup.getAttribute('aria-checked')).toBe('false');
      expect(selectGroup.parentElement!.querySelectorAll('kbd')).toHaveLength(1);
      fireEvent.click(selectGroup);
      expect(checked()).toBe(3);
      fireEvent.click(selectGroup);
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
      // The customer's three No hit hits stack.
      await waitFor(() => expect(noHitStack()?.textContent).toContain('cases:screening_review.decision.no_hit'));
      expect(card('List record A')).toBeUndefined();
      expect(screen.getByRole('button', { name: 'cases:screening_review.stack.unstack' }).textContent).toBe('×3');
      expect(checked()).toBe(0);
      expect(screen.getByText('cases:screening_review.undo.batch_validated')).toBeTruthy();

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
      // A and the shared record stack; B is pending again.
      expect(noHitStack()).toBeTruthy();
      expect(card('List record B')?.textContent).not.toContain('cases:screening_review.decision.no_hit');
      expect(reviewScreeningReviewMatchFn).toHaveBeenCalledTimes(3);
    });

    it('keeps a failed batch selected with its comment when undoing a later batch, each hit retrying with its own', async () => {
      const failing = Promise.withResolvers<never>();
      vi.mocked(reviewScreeningReviewMatchFn).mockImplementation((({ data }: { data: { matchId: string } }) =>
        data.matchId === 'screening-1-high' ? failing.promise : Promise.resolve(inReview)) as never);
      renderDecisionPage();
      await waitFor(() => expect(activeCard()?.textContent).toContain('List record A'));
      press('x', 'KeyX');
      fireEvent.change(commentBox(), { target: { value: 'Comment A' } });
      press('Enter', 'Enter');
      await waitFor(() => expect(activeCard()?.textContent).toContain('Shared list record'));
      press('x', 'KeyX');
      fireEvent.change(commentBox(), { target: { value: 'Comment B' } });
      // Submitting B writes A.
      press('Enter', 'Enter');
      await waitFor(() => expect(reviewScreeningReviewMatchFn).toHaveBeenCalledTimes(1));
      failing.reject(new Error('network'));
      expect((await screen.findByRole('alert')).textContent).toBe('cases:screening_review.batch.failed');
      expect(isChecked('List record A')).toBe(true);
      expect(commentBox().value).toBe('Comment A');

      press('u', 'KeyU');
      await waitFor(() => expect(isChecked('Shared list record')).toBe(true));
      expect(isChecked('List record A')).toBe(true);
      expect(screen.getByRole('alert').textContent).toBe('cases:screening_review.batch.failed');
      // The hits keep different comments: the box offers to replace them, and each row shows its own.
      expect(commentBox().value).toBe('');
      expect(commentBox().getAttribute('placeholder')).toBe('cases:screening_review.batch.mixed_comments');
      expect(screen.getAllByText('cases:screening_review.batch.hit_comment')).toHaveLength(2);

      vi.mocked(reviewScreeningReviewMatchFn).mockResolvedValue(inReview);
      press('Enter', 'Enter');
      await elapse(SCREENING_REVIEW_UNDO_DELAY_MS);
      await waitFor(() => expect(reviewScreeningReviewMatchFn).toHaveBeenCalledTimes(3));
      expect(reviewScreeningReviewMatchFn).toHaveBeenCalledWith(
        written('screening-1-high', 'no_hit', { comment: 'Comment A' }),
      );
      expect(reviewScreeningReviewMatchFn).toHaveBeenCalledWith(
        written('dataset-1-alice', 'no_hit', { comment: 'Comment B' }),
      );
    });

    it('keeps a newer screening result when an earlier batch finishes on a slower case', async () => {
      const slower = Promise.withResolvers<typeof inReview>();
      // The fast case's other screening keeps its group listed once fast is decided.
      const items = buildScreeningReviewItems([
        reviewCase(caseId, [objectReviewScreening('fast'), objectReviewScreening('extra')]),
        reviewCase('44444444-4444-4444-8444-444444444444', [objectReviewScreening('slow', 'bob')]),
      ]).map((item) => ({
        ...item,
        score: item.screeningId === 'extra' ? 0.1 : item.score,
        listRecord: { ...item.listRecord, caption: item.matchId },
      }));
      vi.mocked(reviewScreeningReviewMatchFn).mockImplementation((async ({ data }: { data: { matchId: string } }) => {
        if (data.matchId === 'slow-high') return slower.promise;
        if (data.matchId === 'fast-low') return { ok: true, screeningStatus: 'no_hit', caseClosed: true };
        return inReview;
      }) as never);
      renderDecisionPage(items);
      await waitFor(() => expect(activeCard()?.textContent).toContain('fast-high'));
      fireEvent.click(checkbox('fast-high'));
      fireEvent.click(checkbox('slow-high'));
      press('Enter', 'Enter');
      fireEvent.click(card('fast-low')!);
      press('n', 'KeyN');
      // The newer single decision starts the batch, whose slow case remains in flight.
      press('Enter', 'Enter');
      await waitFor(() => expect(reviewScreeningReviewMatchFn).toHaveBeenCalledTimes(2));
      await elapse(SCREENING_REVIEW_UNDO_DELAY_MS);
      await waitFor(() => expect(reviewScreeningReviewMatchFn).toHaveBeenCalledTimes(3));
      // fast-high and fast-low stack; the stack opens on fast-high.
      fireEvent.click(noHitStack()!);
      await screen.findByText('cases:screening_review.screening_state.case_closed');

      await act(async () => {
        slower.resolve(inReview);
      });
      await waitFor(() => expect(listScreeningReviewPageFn).toHaveBeenCalledTimes(3));
      expect(screen.getByText('cases:screening_review.screening_state.case_closed')).toBeTruthy();
    });

    it('keeps a failed single decision and its draft when undoing a later decision', async () => {
      const failing = Promise.withResolvers<never>();
      vi.mocked(reviewScreeningReviewMatchFn).mockImplementationOnce(() => failing.promise);
      renderDecisionPage();
      await waitFor(() => expect(activeCard()?.textContent).toContain('List record A'));
      press('n', 'KeyN');
      fireEvent.change(commentBox(), { target: { value: 'Comment A' } });
      press('Enter', 'Enter');
      await waitFor(() => expect(activeCard()?.textContent).toContain('Shared list record'));
      press('n', 'KeyN');
      fireEvent.change(commentBox(), { target: { value: 'Comment B' } });
      press('Enter', 'Enter');
      failing.reject(new Error('network'));
      expect((await screen.findByRole('alert')).textContent).toBe('cases:screening_review.decision_failed');
      press('u', 'KeyU');
      await waitFor(() => expect(activeCard()?.textContent).toContain('Shared list record'));
      expect(commentBox().value).toBe('Comment B');
      expect(screen.getByRole('alert').textContent).toBe('cases:screening_review.decision_failed');
      press('k', 'KeyK');
      await waitFor(() => expect(activeCard()?.textContent).toContain('List record A'));
      expect(decisionButton('no_hit').getAttribute('aria-pressed')).toBe('true');
      expect(commentBox().value).toBe('Comment A');
    });

    it('shows an unchecked checkbox on hover or keyboard focus only, even on the hit under the cursor', async () => {
      renderDecisionPage();
      await waitFor(() => expect(activeCard()?.textContent).toContain('List record A'));
      const classes = () => checkbox('List record A').className.split(/\s+/);
      expect(classes()).toContain('opacity-0');
      expect(classes()).not.toContain('opacity-100');
      expect(classes()).toEqual(
        expect.arrayContaining([
          'group-hover/hit:opacity-100',
          'group-has-[:focus-visible]/hit:opacity-100',
          'radix-state-checked:opacity-100',
        ]),
      );
    });
  });
});

describe('screening review queue tools', () => {
  const closedItems = buildScreeningReviewItems([
    reviewCase(
      'closed-case',
      [
        {
          ...objectReviewScreening('closed-screening', 'bob'),
          status: 'no_hit',
          matches: objectReviewScreening('closed-screening', 'bob').matches.map((match) => ({
            ...match,
            status: 'no_hit' as const,
          })),
        },
      ],
      { status: 'closed' },
    ),
  ]);
  const filterTab = (filter: string) =>
    screen.getByRole('tab', { name: new RegExp(`screening_review\\.filter\\.${filter}`) });
  const searchBox = () => screen.getByRole('textbox', { name: 'cases:screening_review.search.label' });

  it('counts each filter among the loaded hits, with + where more may exist', async () => {
    vi.mocked(listScreeningReviewPageFn).mockResolvedValue({
      items: [...initialItems, ...closedItems],
      nextCursor: null,
      failed: false,
    });
    renderPage();
    await waitFor(() => expect(activeCard()).not.toBeNull());
    expect(filterTab('to_review').textContent).toMatch(/4$/);
    // To review never reads closed cases, so the other filters may hold more.
    expect(filterTab('validated').textContent).toMatch(/2\+$/);
    expect(filterTab('all').textContent).toBe('cases:screening_review.filter.all');
    expect(filterTab('to_review').getAttribute('data-status')).toBe('active');
  });

  it('says nothing is loaded yet, not that the search is empty, while more cases remain to read', async () => {
    vi.mocked(listScreeningReviewPageFn).mockResolvedValue({ items: [], nextCursor: pageTwoCursor, failed: false });
    renderPage({ filter: 'to_review', q: 'Nobody' });
    await screen.findByText('cases:screening_review.empty.page_empty.title');
    expect(screen.queryByText('cases:screening_review.empty.no_results.title')).toBeNull();
    expect(screen.queryByRole('button', { name: 'cases:screening_review.search.clear' })).toBeNull();
  });

  it('stops the search field at the length the route accepts', async () => {
    vi.mocked(listScreeningReviewPageFn).mockResolvedValue({ items: initialItems, nextCursor: null, failed: false });
    renderPage();
    await waitFor(() => expect(activeCard()).not.toBeNull());
    expect(searchBox().getAttribute('maxLength')).toBe(String(SCREENING_REVIEW_SEARCH_MAX));
  });

  it('shows + on every count while more cases remain to load', async () => {
    vi.mocked(listScreeningReviewPageFn).mockResolvedValue({
      items: [...initialItems, ...closedItems],
      nextCursor: pageTwoCursor,
      failed: false,
    });
    renderPage({ filter: 'all' });
    await waitFor(() => expect(activeCard()).not.toBeNull());
    expect(filterTab('to_review').textContent).toMatch(/4\+$/);
    expect(filterTab('validated').textContent).toMatch(/2\+$/);
  });

  it('switches to Validated through the search, then lists decided hits read-only', async () => {
    vi.mocked(listScreeningReviewPageFn)
      .mockResolvedValueOnce({ items: initialItems, nextCursor: null, failed: false })
      .mockResolvedValue({ items: [...initialItems, ...closedItems], nextCursor: null, failed: false });
    renderPage({ filter: 'to_review' });
    await waitFor(() => expect(activeCard()).not.toBeNull());
    fireEvent.click(filterTab('validated'));
    expect(onSearchChange).toHaveBeenCalledWith({ filter: 'validated', hit: undefined });
    await waitFor(() =>
      expect(listScreeningReviewPageFn).toHaveBeenLastCalledWith({
        data: { filter: 'validated', limit: 50, cursor: null, inboxId: 'my-inbox' },
      }),
    );
    await waitFor(() => expect(onSearchChange.mock.lastCall?.[0].hit).toBe(closedItems[0]!.id));
    const listed = screen
      .getAllByRole('button')
      .filter((button) => button.hasAttribute('data-review-hit-card'))
      .map((button) => button.textContent);
    // The case's two No hit hits stack as one card.
    expect(listed).toHaveLength(1);
    expect(listed[0]).toContain('cases:screening_review.decision.no_hit');
    expect(screen.getByRole('button', { name: 'cases:screening_review.stack.unstack' }).textContent).toBe('×2');
    // The stack under the cursor lists its hits, each with its decision, and its case's state.
    const summary = screen.getByRole('region', { name: 'cases:screening_review.stack.label' });
    expect(
      within(summary)
        .getAllByRole('listitem')
        .map((row) => row.textContent),
    ).toEqual([expect.stringContaining('List record A'), expect.stringContaining('List record B')]);
    expect(within(summary).getAllByText('cases:screening_review.decision.no_hit')).toHaveLength(2);
    expect(within(summary).queryByRole('checkbox')).toBeNull();
    expect(screen.getByText('cases:screening_review.screening_state.case_closed')).toBeTruthy();
    // Decided hits can't be decided again.
    press('m', 'KeyM');
    expect(screen.queryByRole('group', { name: 'cases:screening_review.dock.title' })).toBeNull();
  });

  it('searches by name after a pause, keeping the filter and resetting the page', async () => {
    vi.mocked(listScreeningReviewPageFn)
      .mockResolvedValueOnce({ items: initialItems, nextCursor: null, failed: false })
      .mockResolvedValue({ items: [], nextCursor: null, failed: false });
    renderPage({ filter: 'all' });
    await waitFor(() => expect(activeCard()).not.toBeNull());
    fireEvent.change(searchBox(), { target: { value: '  Ali' } });
    fireEvent.change(searchBox(), { target: { value: '  Alice ' } });
    await waitFor(() => expect(onSearchChange).toHaveBeenCalledWith({ filter: 'all', q: 'Alice', hit: undefined }));
    expect(onSearchChange.mock.calls.filter(([search]) => search.q === 'Ali')).toHaveLength(0);
    await waitFor(() =>
      expect(listScreeningReviewPageFn).toHaveBeenLastCalledWith({
        data: { filter: 'all', name: 'Alice', limit: 50, cursor: null, inboxId: 'my-inbox' },
      }),
    );
    // The typed text stays as typed while the search echoes back.
    expect(searchBox()).toHaveProperty('value', '  Alice ');
    await screen.findByText('cases:screening_review.empty.no_results.title');
    fireEvent.click(screen.getByRole('button', { name: 'cases:screening_review.search.clear' }));
    await waitFor(() => expect(onSearchChange.mock.lastCall?.[0].q).toBeUndefined());
    await waitFor(() => expect(searchBox()).toHaveProperty('value', ''));
  });

  it('applies the search at once on Enter', async () => {
    renderPage();
    await waitFor(() => expect(activeCard()).not.toBeNull());
    fireEvent.change(searchBox(), { target: { value: 'Bob' } });
    fireEvent.keyDown(searchBox(), { key: 'Enter', code: 'Enter' });
    expect(onSearchChange).toHaveBeenLastCalledWith({ filter: 'to_review', q: 'Bob', hit: undefined });
  });

  it('loads more of a filtered search, and keys stop at the last loaded hit', async () => {
    vi.mocked(listScreeningReviewPageFn)
      .mockResolvedValueOnce({ items: closedItems, nextCursor: pageTwoCursor, failed: false })
      .mockResolvedValue({ items: secondPageItems, nextCursor: null, failed: false });
    renderPage({ filter: 'validated', q: 'Bob' });
    await waitFor(() => expect(noHitStack()?.getAttribute('aria-current')).toBe('true'));
    fireEvent.click(screen.getByRole('button', { name: 'cases:screening_review.stack.unstack' }));
    press('j', 'KeyJ');
    await waitFor(() => expect(activeCard()?.textContent).toContain('List record B'));
    // The last loaded hit: J stays, it doesn't load more.
    press('j', 'KeyJ');
    press('ArrowDown', 'ArrowDown');
    expect(activeCard()?.textContent).toContain('List record B');
    expect(listScreeningReviewPageFn).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: 'cases:screening_review.load_more_cases' }));
    await waitFor(() =>
      expect(listScreeningReviewPageFn).toHaveBeenLastCalledWith({
        data: { filter: 'validated', name: 'Bob', limit: 50, cursor: pageTwoCursor, inboxId: 'my-inbox' },
      }),
    );
    // No new hit matches the filter, so the cursor stays.
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'cases:screening_review.load_more_cases' })).toBeNull(),
    );
    expect(activeCard()?.textContent).toContain('List record B');
    expect(onSearchChange.mock.lastCall?.[0]).toMatchObject({ filter: 'validated', q: 'Bob' });
  });

  it('shows an empty Validated filter apart from an empty queue', async () => {
    vi.mocked(listScreeningReviewPageFn).mockResolvedValue({ items: [], nextCursor: null, failed: false });
    renderPage({ filter: 'validated' });
    await screen.findByText('cases:screening_review.empty.no_validated.title');
  });
});

describe('screening review details panel', () => {
  const caseId = '44444444-4444-4444-8444-444444444444';
  beforeEach(() => {
    vi.mocked(listScreeningReviewPageFn).mockResolvedValue({
      items: buildScreeningReviewItems([reviewCase(caseId, [objectReviewScreening(), datasetReviewScreening()])]),
      nextCursor: null,
      failed: false,
    });
  });
  const panel = () => screen.queryByRole('complementary', { name: 'cases:screening_review.panel.label' });
  const panelTitle = () => within(panel()!).getByRole('heading', { level: 2 }).textContent;
  const panelTab = (tab: string) =>
    within(panel()!).getByRole('tab', { name: new RegExp(`screening_review\\.panel\\.tab\\.${tab}`) });

  it('opens each tab with P, L and H, closes with the same key, and follows the active hit', async () => {
    renderPage();
    await waitFor(() => expect(activeCard()?.textContent).toContain('List record A'));
    expect(panel()).toBeNull();
    press('p', 'KeyP');
    expect(panelTitle()).toBe('Alice');
    expect(panelTab('customer').getAttribute('aria-selected')).toBe('true');
    expect(within(panel()!).getByText('cases:screening_review.panel.heading.customer')).toBeTruthy();
    press('l', 'KeyL');
    expect(panelTitle()).toBe('List record A');
    // J keeps working: the panel follows the active hit.
    press('j', 'KeyJ');
    await waitFor(() => expect(panelTitle()).toBe('Shared list record'));
    press('h', 'KeyH');
    expect(panelTitle()).toBe(`Case ${caseId}`);
    expect(within(panel()!).getByLabelText('cases:screening_review.panel.trigger')).toBeTruthy();
    press('h', 'KeyH');
    expect(panel()).toBeNull();
  });

  it('opens from the buttons above the hit and switches with the panel tabs', async () => {
    renderPage();
    await waitFor(() => expect(activeCard()).not.toBeNull());
    const opener = screen.getByRole('button', { name: /screening_review\.panel\.tab\.list_record/ });
    fireEvent.click(opener);
    expect(opener.getAttribute('aria-pressed')).toBe('true');
    expect(panelTitle()).toBe('List record A');
    fireEvent.click(panelTab('customer'));
    expect(panelTitle()).toBe('Alice');
    fireEvent.click(within(panel()!).getByRole('button', { name: 'cases:screening_review.panel.close' }));
    expect(panel()).toBeNull();
  });

  it('is not a modal dialog, so the review keys keep working while it is open', async () => {
    renderPage();
    await waitFor(() => expect(activeCard()).not.toBeNull());
    press('p', 'KeyP');
    expect(screen.queryByRole('dialog')).toBeNull();
    press('n', 'KeyN');
    expect(screen.getByRole('button', { name: /screening_review\.decision\.no_hit/, pressed: true })).toBeTruthy();
  });

  it('closes with Esc before clearing the decision', async () => {
    renderPage();
    await waitFor(() => expect(activeCard()).not.toBeNull());
    press('n', 'KeyN');
    press('p', 'KeyP');
    press('Escape', 'Escape');
    expect(panel()).toBeNull();
    const noHit = () => screen.getByRole('button', { name: /screening_review\.decision\.no_hit/ });
    expect(noHit().getAttribute('aria-pressed')).toBe('true');
    press('Escape', 'Escape');
    expect(noHit().getAttribute('aria-pressed')).toBe('false');
  });

  it('opens the case in a new tab from the button above the hit', async () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    renderPage();
    await waitFor(() => expect(activeCard()).not.toBeNull());
    fireEvent.click(screen.getByRole('button', { name: /screening_review\.open_case/ }));
    expect(open).toHaveBeenCalledWith(`/cases/m/${fromUUIDtoSUUID(caseId)}`, '_blank', 'noopener');
  });
});

describe('screening review list rail', () => {
  const list = () => screen.getByRole('navigation', { name: 'cases:screening_review.hit_list' }).closest('[id]')!;
  const railButton = () => screen.getByRole('button', { name: /screening_review\.list\.show/ });
  function setPageWidth(width: number) {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(width);
  }
  afterEach(() => vi.restoreAllMocks());

  it('shows the hits left to review on the rail, which controls the list', async () => {
    renderPage();
    await waitFor(() => expect(activeCard()).not.toBeNull());
    expect(railButton().textContent).toContain('4');
    expect(railButton().getAttribute('aria-controls')).toBe(list().id);
  });

  it('opens the list over the hit on a narrow page, and Esc closes it after the panel', async () => {
    setPageWidth(900);
    renderPage();
    await waitFor(() => expect(activeCard()).not.toBeNull());
    expect(list().className).toMatch(/(^| )hidden( |$)/);
    press('[', 'BracketLeft');
    expect(list().className).toContain('absolute');
    // J keeps moving through the open list.
    press('j', 'KeyJ');
    await waitFor(() => expect(activeCard()?.textContent).toContain('Shared list record'));
    press('p', 'KeyP');
    press('Escape', 'Escape');
    expect(screen.queryByRole('complementary')).toBeNull();
    expect(list().className).toContain('absolute');
    press('Escape', 'Escape');
    expect(list().className).not.toContain('absolute');
  });

  it('toggles the list with [ only, not with the key in its place on other layouts', async () => {
    setPageWidth(900);
    renderPage();
    await waitFor(() => expect(activeCard()).not.toBeNull());
    // French layouts type ^, a dead key, where US layouts type [.
    press('Dead', 'BracketLeft');
    press('^', 'BracketLeft');
    expect(list().className).toMatch(/(^| )hidden( |$)/);
    press('[', 'BracketLeft');
    expect(list().className).toContain('absolute');
  });
});

describe('screening review case groups', () => {
  // Alice matches both list records in two cases: one group per case, under the same name.
  const one = '55555555-5555-4555-8555-555555555555';
  const two = '66666666-6666-4666-8666-666666666666';
  const caseItems = buildScreeningReviewItems([
    reviewCase(one, [objectReviewScreening('one')]),
    reviewCase(two, [objectReviewScreening('two')]),
  ]);
  const hitCards = () => document.querySelectorAll('[data-review-hit-card]');
  const groupHeadings = () =>
    within(screen.getByRole('navigation', { name: 'cases:screening_review.hit_list' }))
      .getAllByRole('heading', { level: 2 })
      .map((heading) => heading.textContent);
  it('leaves Select all and the counter out of a case with one hit', async () => {
    const screening = objectReviewScreening('single-screening', 'bob');
    screening.matches = screening.matches.slice(0, 1);
    // Even with more matches to load, which would read 1 / 1+.
    screening.partial = true;
    vi.mocked(listScreeningReviewPageFn).mockResolvedValue({
      items: buildScreeningReviewItems([reviewCase('single-case', [screening])]),
      nextCursor: null,
      failed: false,
    });
    renderPage();
    await waitFor(() => expect(activeCard()).not.toBeNull());
    expect(screen.queryByRole('checkbox', { name: /screening_review\.batch\.select_customer_hits/ })).toBeNull();
    expect(screen.queryByText('cases:screening_review.group_hits_to_review')).toBeNull();
  });

  const stackToggle = (label: 'unstack' | 'restack') =>
    screen.getAllByRole('button', { name: `cases:screening_review.stack.${label}` });
  const elapse = (ms: number) =>
    act(async () => {
      await vi.advanceTimersByTimeAsync(ms);
    });

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({ matches: false, media: query })),
    );
    vi.mocked(listScreeningReviewPageFn).mockResolvedValue({ items: caseItems, nextCursor: null, failed: false });
    vi.mocked(reviewScreeningReviewMatchFn).mockResolvedValue({
      ok: true,
      screeningStatus: 'in_review',
      caseClosed: false,
    });
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('shows one group per case, repeating the customer name, and moves hit by hit', async () => {
    renderPage();
    await waitFor(() => expect(activeCard()?.textContent).toContain('List record A'));
    expect(groupHeadings()).toEqual(['Alice', 'Alice']);
    expect(hitCards()).toHaveLength(4);
    press('j', 'KeyJ');
    await waitFor(() => expect(onSearchChange.mock.lastCall?.[0].hit).toBe(`${one}:one:one-low`));
    press('J', 'KeyJ', true);
    await waitFor(() => expect(onSearchChange.mock.lastCall?.[0].hit).toBe(`${two}:two:two-high`));
  });

  it('moves the cursor to a case’s first hit on a click on its card, and leaves hits and Select all their own click', async () => {
    renderPage();
    await waitFor(() => expect(activeCard()?.textContent).toContain('List record A'));
    const [first, second] = document.querySelectorAll<HTMLElement>('[data-review-group]');
    const hits = (group: HTMLElement) => group.querySelectorAll<HTMLElement>('[data-review-hit-card]');

    fireEvent.click(hits(second!)[1]!);
    await waitFor(() => expect(onSearchChange.mock.lastCall?.[0].hit).toBe(`${two}:two:two-low`));
    fireEvent.click(within(second!).getByRole('heading', { level: 2 }));
    await waitFor(() => expect(onSearchChange.mock.lastCall?.[0].hit).toBe(`${two}:two:two-high`));
    fireEvent.click(hits(first!)[1]!);
    await waitFor(() => expect(onSearchChange.mock.lastCall?.[0].hit).toBe(`${one}:one:one-low`));
    // The card's padding, below its last hit.
    fireEvent.click(first!);
    await waitFor(() => expect(onSearchChange.mock.lastCall?.[0].hit).toBe(`${one}:one:one-high`));

    onSearchChange.mockClear();
    fireEvent.click(within(second!).getByRole('checkbox', { name: /screening_review\.batch\.select_customer_hits/ }));
    expect(second!.querySelectorAll('[data-review-hit-card] ~ [role="checkbox"][aria-checked="true"]')).toHaveLength(2);
    expect(onSearchChange).not.toHaveBeenCalled();
    expect(activeCard()?.closest('[data-review-group]')).toBe(first);
  });

  it('decides and selects one hit at a time, even on a list record another case shares', async () => {
    renderPage();
    await waitFor(() => expect(activeCard()?.textContent).toContain('List record A'));
    press('x', 'KeyX');
    const summary = screen.getByRole('region', { name: 'cases:screening_review.batch.title' });
    expect(within(summary).getAllByRole('listitem')).toHaveLength(1);
    press('x', 'KeyX');

    press('n', 'KeyN');
    press('Enter', 'Enter');
    await waitFor(() => expect(onSearchChange.mock.lastCall?.[0].hit).toBe(`${one}:one:one-low`));
    await elapse(SCREENING_REVIEW_UNDO_DELAY_MS);
    await waitFor(() => expect(reviewScreeningReviewMatchFn).toHaveBeenCalledTimes(1));
    expect(reviewScreeningReviewMatchFn).toHaveBeenCalledWith({
      data: { caseId: one, screeningId: 'one', matchId: 'one-high', status: 'no_hit' },
    });
  });

  it('stacks a group’s No hit hits as one stop, shown separately with ×N and stacked again with −', async () => {
    renderPage();
    await waitFor(() => expect(activeCard()?.textContent).toContain('List record A'));
    press('n', 'KeyN');
    press('Enter', 'Enter');
    await waitFor(() => expect(onSearchChange.mock.lastCall?.[0].hit).toBe(`${one}:one:one-low`));
    press('n', 'KeyN');
    press('Enter', 'Enter');
    await waitFor(() => expect(onSearchChange.mock.lastCall?.[0].hit).toBe(`${two}:two:two-high`));
    expect(hitCards()).toHaveLength(3);
    expect(stackToggle('unstack')[0]!.textContent).toBe('×2');
    expect(stackToggle('unstack')[0]!.getAttribute('aria-expanded')).toBe('false');
    // The stack has no checkbox, and K stops on it once.
    expect(stackToggle('unstack')[0]!.parentElement!.querySelector('[role="checkbox"]')).toBeNull();
    press('k', 'KeyK');
    await waitFor(() => expect(onSearchChange.mock.lastCall?.[0].hit).toBe(`${one}:one:one-high`));
    expect(activeCard()?.textContent).toContain('cases:screening_review.decision.no_hit');
    press('j', 'KeyJ');
    await waitFor(() => expect(onSearchChange.mock.lastCall?.[0].hit).toBe(`${two}:two:two-high`));

    fireEvent.click(stackToggle('unstack')[0]!);
    expect(hitCards()).toHaveLength(4);
    expect(stackToggle('restack').map((button) => button.textContent)).toEqual(['−', '−']);
    press('k', 'KeyK');
    await waitFor(() => expect(onSearchChange.mock.lastCall?.[0].hit).toBe(`${one}:one:one-low`));
    fireEvent.click(stackToggle('restack')[1]!);
    expect(hitCards()).toHaveLength(3);
    // The stack keeps the cursor, without naming its hit.
    expect(activeCard()).toBe(noHitStack());
  });

  it('shows the No hit stack under the cursor one by one with +, and stacks it again with -', async () => {
    renderPage();
    await waitFor(() => expect(activeCard()?.textContent).toContain('List record A'));
    // Nothing to unstack yet.
    press('+', 'Equal', true);
    expect(hitCards()).toHaveLength(4);
    for (const next of [`${one}:one:one-low`, `${two}:two:two-high`]) {
      press('n', 'KeyN');
      press('Enter', 'Enter');
      await waitFor(() => expect(onSearchChange.mock.lastCall?.[0].hit).toBe(next));
    }
    expect(hitCards()).toHaveLength(3);
    // Only on the stack: the cursor is on another case's pending hit.
    press('+', 'Equal', true);
    expect(hitCards()).toHaveLength(3);

    press('k', 'KeyK');
    await waitFor(() => expect(onSearchChange.mock.lastCall?.[0].hit).toBe(`${one}:one:one-high`));
    expect(stackToggle('unstack')[0]!.getAttribute('aria-keyshortcuts')).toBe('+');
    press('+', 'Equal', true);
    expect(hitCards()).toHaveLength(4);
    expect(stackToggle('restack')[0]!.getAttribute('aria-keyshortcuts')).toBe('+ -');
    press('-', 'Minus');
    expect(hitCards()).toHaveLength(3);
    press('-', 'Minus');
    expect(hitCards()).toHaveLength(3);
    // + typed where US layouts have /, as on a French Mac, without opening the help.
    press('+', 'Slash', true);
    expect(hitCards()).toHaveLength(4);
    expect(screen.queryByRole('dialog')).toBeNull();
    press('+', 'Equal', true);
    expect(hitCards()).toHaveLength(3);
  });

  it('loads a partly reviewed case with its No hit stack, and a confirmed one with its Hit only', async () => {
    const reviewed = objectReviewScreening('one');
    reviewed.matches.push({ ...reviewed.matches[1]!, id: 'one-third', opensanctionEntityId: 'record-third' });
    reviewed.matches[0]!.status = 'no_hit';
    reviewed.matches[1]!.status = 'no_hit';
    const confirmed = objectReviewScreening('two');
    confirmed.status = 'confirmed_hit';
    confirmed.matches[0]!.status = 'confirmed_hit';
    confirmed.matches[1]!.status = 'skipped';
    vi.mocked(listScreeningReviewPageFn).mockResolvedValue({
      items: buildScreeningReviewItems([
        reviewCase(one, [reviewed]),
        reviewCase(two, [
          confirmed,
          { ...objectReviewScreening('three'), matches: objectReviewScreening('three').matches.slice(1) },
        ]),
      ]),
      nextCursor: null,
      failed: false,
    });
    renderPage();
    // The cursor opens on the first pending hit.
    await waitFor(() => expect(onSearchChange.mock.lastCall?.[0].hit).toBe(`${one}:one:one-third`));
    const [first, second] = [...document.querySelectorAll<HTMLElement>('[data-review-group]')];
    expect(within(first!).getByRole('button', { name: 'cases:screening_review.stack.unstack' }).textContent).toBe('×2');
    expect(first!.querySelectorAll('[data-review-hit-card]')).toHaveLength(2);
    expect(second!.querySelectorAll('[data-review-hit-card]')).toHaveLength(2);
    expect(second!.textContent).toContain('cases:screening_review.decision.confirmed_hit');
    expect(within(second!).getByText('cases:screening_review.set_aside')).toBeTruthy();
  });
});
