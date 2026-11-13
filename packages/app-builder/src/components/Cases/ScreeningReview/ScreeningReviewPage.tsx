import { Callout } from '@app-builder/components/Callout';
import { Page } from '@app-builder/components/Page';
import { MY_INBOX_ID } from '@app-builder/constants/inboxes';
import type { InboxMetadata } from '@app-builder/models/inbox';
import {
  adjacentScreeningReviewItem,
  applyScreeningReviewSession,
  compareScreeningReviewFields,
  countScreeningReviewFilters,
  groupScreeningReviewItems,
  isListedInScreeningReviewSession,
  isPendingReviewItem,
  matchesScreeningReviewFilter,
  type ScreeningReviewFilter,
  type ScreeningReviewItem,
  screeningReviewCustomerPendingItems,
  screeningReviewHitsSkippedBy,
  screeningReviewScreeningState,
} from '@app-builder/models/screening-review';
import { useScreeningReviewPageQuery } from '@app-builder/queries/cases/screening-review-page';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { Link, useRouter } from '@tanstack/react-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, cn, Typo } from 'ui-design-system';
import { FilterInboxSelector } from '../Inbox/FilterBar/FilterInboxSelector';
import { CasesNavigationTabs } from '../Navigation/Tabs';
import { ActionDock, DecisionTag, ReadOnlyDock, StepTag } from './ActionDock';
import { BatchPanel } from './BatchSummary';
import { emptyBatchSelection, toggleSelected, withoutSelected, withSelected } from './batch-selection';
import { DETAILS_PANEL_TABS, DetailsPanel, type DetailsPanelTab } from './DetailsPanel';
import { HitList } from './HitList';
import { useMappedProperties } from './MatchedFieldChips';
import { PaginationFooter, type ScreeningReviewPageSize } from './PaginationFooter';
import { openInNewTabAfter, PendingDecisionProvider } from './pending-decision';
import { QueueFilters } from './QueueFilters';
import { type ScreeningReviewNotice, useReviewDecisions } from './review-decisions';
import { ScreeningReviewHit } from './ScreeningReviewHit';
import { ShortcutHelp, ShortcutKeys } from './ShortcutHelp';
import { ScreeningReviewShortcutProvider, useScreeningReviewShortcuts } from './shortcuts';

export interface ScreeningReviewSearch {
  inboxId?: string;
  filter: ScreeningReviewFilter;
  /** Matched against case names. */
  q?: string;
  limit: ScreeningReviewPageSize;
  cursors: string[];
  hit?: string;
}

interface ScreeningReviewPageProps {
  search: ScreeningReviewSearch;
  onSearchChange: (search: ScreeningReviewSearch) => void;
  canViewAdminSections: boolean;
  canViewRiskLevel: boolean;
  /** The analyst's decisions are final. Otherwise they go to a validator. */
  canValidate: boolean;
  inboxes: InboxMetadata[];
}

export function ScreeningReviewPage(props: ScreeningReviewPageProps) {
  return (
    <ScreeningReviewShortcutProvider scope="screening-review">
      <ReviewStream {...props} />
    </ScreeningReviewShortcutProvider>
  );
}

function ShortcutHint({ onOpenHelp }: { onOpenHelp: () => void }) {
  const { t } = useTranslation(['cases']);
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-x-sm gap-y-xs text-xs text-grey-secondary">
      <span className="inline-flex items-center gap-xs">
        <ShortcutKeys hotkeys={['J', 'K']} />
        {t('cases:screening_review.hint.next_previous_hit')}
      </span>
      <span className="inline-flex items-center gap-xs">
        <ShortcutKeys hotkeys={['M', 'N']} />
        {t('cases:screening_review.hint.decide')}
      </span>
      <span className="inline-flex items-center gap-xs">
        <ShortcutKeys hotkeys={['X', 'A']} />
        {t('cases:screening_review.hint.select')}
      </span>
      <span className="inline-flex items-center gap-xs">
        <ShortcutKeys hotkeys={['Enter']} />
        {t('cases:screening_review.hint.validate')}
      </span>
      <button
        type="button"
        onClick={onOpenHelp}
        className="inline-flex cursor-pointer items-center gap-xs rounded-md focus-visible:outline-2 focus-visible:outline-purple-primary"
      >
        <ShortcutKeys hotkeys={['?']} />
        {t('cases:screening_review.hint.all_keys')}
      </button>
    </div>
  );
}

const DOCKED_PANEL_GRID = '@min-[1294px]/review:grid-cols-[270px_minmax(0,1fr)_480px]';
const PANEL_PLACEMENT =
  'absolute inset-y-0 end-0 z-10 w-[min(480px,100%)] shadow-lg @min-[1294px]/review:static @min-[1294px]/review:w-auto @min-[1294px]/review:shadow-none';

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
}

function ReviewStream({
  search,
  onSearchChange,
  canViewAdminSections,
  canViewRiskLevel,
  canValidate,
  inboxes,
}: ScreeningReviewPageProps) {
  const { t } = useTranslation(['cases', 'common']);
  const router = useRouter();
  const allInboxes = [{ id: MY_INBOX_ID, name: t('cases:inbox.my-inbox.link') }, ...inboxes];
  const selectedInbox = allInboxes.find((inbox) => inbox.id === search.inboxId) ?? allInboxes[0]!;
  const query = useScreeningReviewPageQuery({
    limit: search.limit,
    cursor: search.cursors.at(-1) ?? null,
    inboxId: selectedInbox.id,
    filter: search.filter,
    name: search.q,
  });
  const mappedProperties = useMappedProperties();
  const [helpOpen, setHelpOpen] = useState(false);
  const [panelTab, setPanelTab] = useState<DetailsPanelTab>();
  const [unavailable, setUnavailable] = useState(false);
  const activeRef = useRef<HTMLButtonElement>(null);
  const commentRef = useRef<HTMLTextAreaElement>(null);
  const hasMore = !!query.data?.nextCursor || !!query.data?.failed;
  // The latest search, read when a delayed write moves the cursor.
  const latestSearch = useRef(search);
  useEffect(() => {
    latestSearch.current = search;
  });
  const decisions = useReviewDecisions({
    serverItems: query.data?.items ?? [],
    hasMore,
    canValidate,
    onNavigate: (itemId) => onSearchChange({ ...latestSearch.current, hit: itemId }),
  });
  const { session, selection, setSelection, pendingDecision } = decisions;
  const reviewItems = useMemo(
    () => applyScreeningReviewSession(query.data?.items ?? [], session),
    [query.data, session],
  );
  const groups = useMemo(
    () =>
      groupScreeningReviewItems(reviewItems, hasMore, (item) =>
        // To review keeps this visit's decisions listed, so the analyst sees them land.
        search.filter === 'to_review'
          ? isListedInScreeningReviewSession(item, session)
          : matchesScreeningReviewFilter(item, search.filter),
      ),
    [reviewItems, hasMore, session, search.filter],
  );
  const counts = useMemo(() => countScreeningReviewFilters(reviewItems), [reviewItems]);
  // To review never reads closed cases, so the other counts can't be complete there.
  const isCountPartial = (filter: ScreeningReviewFilter) =>
    hasMore || (search.filter === 'to_review' && filter !== 'to_review');
  const items = useMemo(() => groups.flatMap((group) => group.items), [groups]);
  const active = items.find((item) => item.id === search.hit) ?? items.find(isPendingReviewItem) ?? items[0];
  const selectedItems = items.filter((item) => selection.has(item.id) && isPendingReviewItem(item));
  const batchMode = selectedItems.length > 0;
  const ready = !!query.data && !query.isPlaceholderData;
  const reviewable = !!active && isPendingReviewItem(active);
  // The end of the queue: nothing left to decide on the first and only page.
  const allReviewed = ready && !hasMore && !search.cursors.length && search.filter !== 'validated' && !counts.to_review;
  const activeDraft = decisions.draftFor(active?.id);

  useEffect(() => {
    // Wait for fresh data before declaring a bookmarked hit unavailable.
    if (!ready || query.isFetching || query.data?.failed) return;
    const hidden = session.hiddenCases.some((caseId) => search.hit?.startsWith(`${caseId}:`));
    if (search.hit && !hidden && !items.some((item) => item.id === search.hit)) setUnavailable(true);
    if (active?.id !== search.hit) onSearchChange({ ...search, hit: active?.id });
  }, [ready, query.isFetching, query.data?.failed, items, active?.id, search, onSearchChange, session.hiddenCases]);

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      block: 'nearest',
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  }, [active?.id]);

  const select = (item: ScreeningReviewItem | undefined) => {
    if (!item || !ready) return;
    setUnavailable(false);
    decisions.clearNotice();
    onSearchChange({ ...search, hit: item.id });
  };
  const move = (direction: -1 | 1, byCustomer = false) =>
    select(adjacentScreeningReviewItem(groups, active?.id, direction, byCustomer));
  const changeDraft = (next: Parameters<typeof decisions.changeDraft>[1]) => {
    if (active) decisions.changeDraft(active.id, next);
  };
  const submit = () => {
    if (!active || !reviewable) return;
    setUnavailable(false);
    decisions.submit(active);
  };
  const submitBatch = () => {
    setUnavailable(false);
    decisions.submitBatch(selectedItems, active?.id);
  };
  const toggleActive = () => {
    if (active) setSelection((current) => toggleSelected(current, active.id));
  };
  const activeGroup = () => groups.find((group) => group.items.some((item) => item.id === active?.id));

  const openActiveCase = () => {
    if (!active) return;
    const { href } = router.buildLocation({
      to: '/cases/m/$caseId',
      params: { caseId: fromUUIDtoSUUID(active.caseId) },
    });
    if (pendingDecision.hasUnsaved()) openInNewTabAfter(href, pendingDecision.flush);
    else window.open(href, '_blank', 'noopener');
  };

  const canNavigate = ready && !helpOpen;
  const panelOpen = !!panelTab && !!active;
  /** Opens the panel on `tab`, or closes it when `tab` is already shown. */
  const togglePanel = (tab: DetailsPanelTab) => setPanelTab((current) => (current === tab ? undefined : tab));

  const canDecide = canNavigate && reviewable && !batchMode;

  useScreeningReviewShortcuts([
    { hotkey: 'J', action: () => move(1), enabled: canNavigate },
    { hotkey: 'ArrowDown', action: () => move(1), enabled: canNavigate },
    { hotkey: 'K', action: () => move(-1), enabled: canNavigate },
    { hotkey: 'ArrowUp', action: () => move(-1), enabled: canNavigate },
    { hotkey: 'Shift+J', action: () => move(1, true), enabled: canNavigate },
    { hotkey: 'Shift+K', action: () => move(-1, true), enabled: canNavigate },
    { hotkey: 'M', action: () => changeDraft({ decision: 'confirmed_hit' }), enabled: canDecide },
    { hotkey: 'N', action: () => changeDraft({ decision: 'no_hit' }), enabled: canDecide },
    { hotkey: 'C', action: () => commentRef.current?.focus(), enabled: canDecide || (canNavigate && batchMode) },
    {
      hotkey: 'Enter',
      action: batchMode ? submitBatch : submit,
      enabled: batchMode ? canNavigate : canDecide && !!activeDraft.decision,
      yieldToControls: true,
    },
    { hotkey: 'U', action: pendingDecision.undo, enabled: canNavigate && pendingDecision.undoable },
    { hotkey: 'X', action: toggleActive, enabled: canNavigate && reviewable },
    // Space keeps pressing a focused button or checkbox, but toggles the hit when a hit card has focus.
    { hotkey: 'Space', action: toggleActive, enabled: canNavigate && reviewable, yieldToControls: true },
    {
      hotkey: 'A',
      action: () => {
        if (!active) return;
        const ids = screeningReviewCustomerPendingItems(groups, active.id).map((item) => item.id);
        setSelection((current) => withSelected(current, ids));
      },
      enabled: canNavigate && !!active,
    },
    {
      hotkey: 'Shift+A',
      action: () => {
        const group = activeGroup();
        if (group)
          setSelection((current) =>
            withoutSelected(
              current,
              group.items.map((item) => item.id),
            ),
          );
      },
      enabled: canNavigate && !!active,
    },
    { hotkey: 'O', action: openActiveCase, enabled: canNavigate && !!active },
    ...DETAILS_PANEL_TABS.map(({ tab, hotkey }) => ({
      hotkey,
      action: () => togglePanel(tab),
      enabled: canNavigate && !!active,
    })),
    { hotkey: '?', action: () => setHelpOpen(true) },
    {
      hotkey: 'Escape',
      // The help closes first, then the panel, then the selection clears. Other dialogs keep their own Escape.
      action: () => {
        if (helpOpen) setHelpOpen(false);
        else if (panelOpen) setPanelTab(undefined);
        else if (batchMode) setSelection(emptyBatchSelection);
        else changeDraft({ decision: undefined });
      },
      allowInModal: helpOpen,
    },
  ]);

  const changeSearch = (next: Partial<ScreeningReviewSearch>) => {
    setUnavailable(false);
    decisions.reset();
    onSearchChange({ ...search, ...next, hit: undefined });
  };

  return (
    <PendingDecisionProvider hasUnsaved={pendingDecision.hasUnsaved} flush={pendingDecision.flush}>
      <Page.Main className="@container/review h-screen max-h-screen min-h-0 overflow-hidden">
        <Page.Content className="min-h-0 gap-md">
          <div className="shrink-0">
            <CasesNavigationTabs showAdminSections={canViewAdminSections} inboxId={selectedInbox.id} />
          </div>
          <ReviewNotices notice={decisions.notice} unavailable={unavailable} />
          {query.isError || query.data?.failed ? (
            <div role="alert" className="flex shrink-0 items-center gap-md rounded border border-grey-border p-md">
              <p>{t('cases:screening_review.load_error')}</p>
              <Button variant="secondary" disabled={query.isFetching} onClick={() => void query.refetch()}>
                {t('cases:screening_review.retry')}
              </Button>
            </div>
          ) : null}
          {query.isPending ? (
            <p role="status" className="shrink-0">
              {t('cases:screening_review.loading')}
            </p>
          ) : null}
          <div
            className={cn(
              'relative grid min-h-0 min-w-0 flex-1 grid-cols-[270px_minmax(0,1fr)] grid-rows-1 gap-lg overflow-hidden',
              panelOpen && DOCKED_PANEL_GRID,
            )}
            aria-busy={query.isFetching}
          >
            <div className="flex min-h-0 min-w-0 flex-col gap-sm">
              <div className="flex shrink-0 flex-col gap-sm">
                <FilterInboxSelector
                  inboxes={allInboxes}
                  selectedInbox={selectedInbox}
                  onSelectInbox={(inbox) => {
                    if (inbox.id !== selectedInbox.id) changeSearch({ inboxId: inbox.id, cursors: [] });
                  }}
                  variant="secondary"
                />
                <QueueFilters
                  filter={search.filter}
                  counts={counts}
                  isCountPartial={isCountPartial}
                  query={search.q}
                  onFilterChange={(filter) => changeSearch({ filter, cursors: [] })}
                  onQueryChange={(q) => changeSearch({ q, cursors: [] })}
                />
                {allReviewed && items.length ? (
                  <AllReviewedNotice onShowValidated={() => changeSearch({ filter: 'validated', cursors: [] })} />
                ) : null}
              </div>
              <div className="relative min-h-0 flex-1">
                <HitList
                  groups={groups}
                  reviewItems={reviewItems}
                  session={session}
                  activeId={active?.id}
                  activeRef={activeRef}
                  ready={ready}
                  selection={selection}
                  onSelectionChange={setSelection}
                  onActivate={select}
                />
              </div>
              <ShortcutHint onOpenHelp={() => setHelpOpen(true)} />
            </div>
            {batchMode ? (
              <BatchPanel
                items={selectedItems}
                selection={selection}
                onSelectionChange={setSelection}
                onSubmit={submitBatch}
                commentRef={commentRef}
              />
            ) : active ? (
              <div className="flex min-h-0 min-w-0 flex-col gap-md">
                <ScreeningReviewHit
                  item={active}
                  comparisons={compareScreeningReviewFields(active, mappedProperties(active.customer.objectType))}
                  canViewRiskLevel={canViewRiskLevel}
                  tags={
                    <>
                      <StepTag pending={reviewable} />
                      <DecisionTag status={active.status} />
                    </>
                  }
                  actions={
                    <>
                      {DETAILS_PANEL_TABS.map(({ tab, hotkey }) => (
                        <Button
                          key={tab}
                          variant="secondary"
                          size="small"
                          aria-pressed={panelTab === tab}
                          aria-keyshortcuts={hotkey}
                          onClick={() => togglePanel(tab)}
                        >
                          {t(`cases:screening_review.panel.tab.${tab}`)}
                          <ShortcutKeys hotkeys={[hotkey]} variant="small" />
                        </Button>
                      ))}
                      <Button variant="secondary" size="small" aria-keyshortcuts="O" onClick={openActiveCase}>
                        {t('cases:screening_review.open_case')}
                        <ShortcutKeys hotkeys={['O']} variant="small" />
                      </Button>
                    </>
                  }
                />
                {reviewable ? (
                  <ActionDock
                    item={active}
                    draft={activeDraft}
                    onDraftChange={changeDraft}
                    onSubmit={submit}
                    onCancel={() => changeDraft({ decision: undefined, comment: '' })}
                    skippedCount={screeningReviewHitsSkippedBy(reviewItems, active).length}
                    commentRef={commentRef}
                  />
                ) : (
                  <ReadOnlyDock
                    item={active}
                    state={screeningReviewScreeningState(reviewItems, active, session)}
                    sessionComment={session.decided[active.id]?.comment}
                    canMoveNext={!!adjacentScreeningReviewItem(groups, active.id, 1) && canNavigate}
                    onNext={() => move(1)}
                    onMatchesLoaded={decisions.refreshPage}
                  />
                )}
              </div>
            ) : ready && !query.data?.failed && !items.length ? (
              <EmptyQueue
                inboxId={selectedInbox.id}
                state={
                  search.q
                    ? 'no_results'
                    : search.filter === 'validated'
                      ? 'no_validated'
                      : allReviewed && Object.keys(session.decided).length
                        ? 'all_reviewed'
                        : 'empty'
                }
                onClearSearch={() => changeSearch({ q: undefined, cursors: [] })}
                onShowValidated={() => changeSearch({ filter: 'validated', cursors: [] })}
              />
            ) : null}
            {panelOpen && panelTab && active ? (
              <DetailsPanel
                item={active}
                tab={panelTab}
                inboxes={inboxes}
                onTabChange={setPanelTab}
                onClose={() => setPanelTab(undefined)}
                className={PANEL_PLACEMENT}
              />
            ) : null}
          </div>
          <PaginationFooter
            limit={search.limit}
            cursors={search.cursors}
            nextCursor={ready && !query.data?.failed ? (query.data?.nextCursor ?? undefined) : undefined}
            count={items.length}
            isFetching={query.isFetching}
            onChange={(limit, cursors) => changeSearch({ limit, cursors })}
          />
        </Page.Content>
        <ShortcutHelp open={helpOpen} onOpenChange={setHelpOpen} />
      </Page.Main>
    </PendingDecisionProvider>
  );
}

function ReviewNotices({ notice, unavailable }: { notice: ScreeningReviewNotice | undefined; unavailable: boolean }) {
  const { t } = useTranslation(['cases']);
  if (notice) {
    return (
      <p role="alert" className="shrink-0 text-red-primary">
        {notice.reason === 'batch_failed'
          ? t('cases:screening_review.batch.failed', { count: notice.count })
          : notice.reason === 'decision_failed'
            ? t('cases:screening_review.decision_failed')
            : t(`cases:screening_review.rejection.${notice.reason}`)}
      </p>
    );
  }
  if (!unavailable) return null;
  return (
    <p role="status" className="shrink-0">
      {t('cases:screening_review.unavailable')}
    </p>
  );
}

type EmptyQueueState = 'empty' | 'all_reviewed' | 'no_validated' | 'no_results';

function EmptyQueue({
  inboxId,
  state,
  onClearSearch,
  onShowValidated,
}: {
  inboxId: string;
  state: EmptyQueueState;
  onClearSearch: () => void;
  onShowValidated: () => void;
}) {
  const { t } = useTranslation(['cases']);
  return (
    <div role="status" className="flex flex-col items-start gap-md self-start rounded border border-grey-border p-lg">
      <Typo variant="title2">{t(`cases:screening_review.empty.${state}.title`)}</Typo>
      <p>{t(`cases:screening_review.empty.${state}.description`)}</p>
      {state === 'no_results' ? (
        <Button variant="secondary" onClick={onClearSearch}>
          {t('cases:screening_review.search.clear')}
        </Button>
      ) : state === 'all_reviewed' ? (
        <Button variant="secondary" onClick={onShowValidated}>
          {t('cases:screening_review.all_reviewed.show_validated')}
        </Button>
      ) : (
        <Link
          to="/cases/inboxes/$inboxId"
          params={{ inboxId: inboxId === MY_INBOX_ID ? inboxId : fromUUIDtoSUUID(inboxId) }}
          className="text-purple-primary underline"
        >
          {t('cases:screening_review.go_to_cases')}
        </Link>
      )}
    </div>
  );
}

/** Shown above the list once its last pending hit is decided, while decided hits stay listed. */
function AllReviewedNotice({ onShowValidated }: { onShowValidated: () => void }) {
  const { t } = useTranslation(['cases']);
  return (
    <Callout role="status" color="purple" icon="tick" iconColor="purple">
      <div className="flex flex-col items-start gap-xs">
        <span className="font-medium">{t('cases:screening_review.empty.all_reviewed.title')}</span>
        <button
          type="button"
          onClick={onShowValidated}
          className="cursor-pointer text-purple-primary underline focus-visible:outline-2 focus-visible:outline-purple-primary"
        >
          {t('cases:screening_review.all_reviewed.show_validated')}
        </button>
      </div>
    </Callout>
  );
}
