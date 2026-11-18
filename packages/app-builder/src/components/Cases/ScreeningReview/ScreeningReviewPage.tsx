import { Callout } from '@app-builder/components/Callout';
import { Page } from '@app-builder/components/Page';
import { MY_INBOX_ID } from '@app-builder/constants/inboxes';
import type { InboxMetadata } from '@app-builder/models/inbox';
import {
  adjacentScreeningReviewItem,
  applyScreeningReviewSession,
  awaitsMoreMatches,
  compareScreeningReviewFields,
  countScreeningReviewFilters,
  groupScreeningReviewItems,
  isLastOpenScreeningOfCase,
  isListedInScreeningReviewSession,
  isPendingReviewItem,
  isSettledScreeningReviewGroup,
  matchesScreeningReviewFilter,
  type ScreeningReviewFilter,
  type ScreeningReviewItem,
  type ScreeningReviewScreeningState,
  screeningReviewCards,
  screeningReviewGroupKey,
  screeningReviewGroupPendingItems,
  screeningReviewHitsSkippedBy,
  screeningReviewScreeningState,
} from '@app-builder/models/screening-review';
import { useScreeningReviewPageQuery } from '@app-builder/queries/cases/screening-review-page';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { Link, useRouter } from '@tanstack/react-router';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, cn, Tag, Typo } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { FilterInboxSelector } from '../Inbox/FilterBar/FilterInboxSelector';
import { CasesNavigationTabs } from '../Navigation/Tabs';
import {
  ActionDock,
  DecisionTag,
  ReadOnlyDock,
  type ScreeningStateActions,
  ScreeningStateNote,
  StepTag,
} from './ActionDock';
import { BatchPanel, NoHitStackSummary } from './BatchSummary';
import { emptyBatchSelection, withoutSelected, withSelected } from './batch-selection';
import { DETAILS_PANEL_TABS, DetailsPanel, type DetailsPanelTab } from './DetailsPanel';
import { HitList } from './HitList';
import { useMappedProperties } from './MatchedFieldChips';
import { PaginationFooter, type ScreeningReviewPageSize } from './PaginationFooter';
import { openInNewTabAfter, PendingDecisionProvider } from './pending-decision';
import { QueueFilters } from './QueueFilters';
import { type ScreeningReviewNotice, useReviewDecisions } from './review-decisions';
import { ScreeningReviewHit } from './ScreeningReviewHit';
import { ShortcutButton } from './ShortcutButton';
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
  /** Ending a screening without loading its other matches needs the dismiss permission. */
  canDismissScreenings: boolean;
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

/*
 * Breakpoints on the page area, which leaves out the collapsed 56px sidebar: the design's 1100px
 * and 1350px windows. Below 1044px the list collapses to a rail and opens over the hit. From 1294px
 * the details panel docks; below that, it floats over the hit.
 */
const WIDE_PAGE_WIDTH = 1044;

/** Full class names, so Tailwind finds every one. */
function gridColumns(listCollapsed: boolean, panelOpen: boolean) {
  return cn(
    'grid-cols-[2.5rem_minmax(0,1fr)]',
    !listCollapsed && '@min-[1044px]/review:grid-cols-[270px_minmax(0,1fr)]',
    panelOpen &&
      (listCollapsed
        ? '@min-[1294px]/review:grid-cols-[2.5rem_minmax(0,1fr)_480px]'
        : '@min-[1294px]/review:grid-cols-[270px_minmax(0,1fr)_480px]'),
  );
}

function listPlacement(listCollapsed: boolean, overlayOpen: boolean) {
  return cn(
    // Narrow pages: hidden behind the rail, or open over the hit.
    overlayOpen ? 'absolute inset-y-0 start-0 z-20 flex w-[270px] bg-surface-page pe-sm shadow-lg' : 'hidden',
    listCollapsed
      ? '@min-[1044px]/review:hidden'
      : '@min-[1044px]/review:static @min-[1044px]/review:flex @min-[1044px]/review:h-full @min-[1044px]/review:w-auto @min-[1044px]/review:pe-0 @min-[1044px]/review:shadow-none',
  );
}

const PANEL_PLACEMENT =
  'absolute inset-y-0 end-0 z-10 w-[min(480px,100%)] shadow-lg @min-[1294px]/review:static @min-[1294px]/review:w-auto @min-[1294px]/review:shadow-none';

/** The collapsed list: a button that opens it, with the hits left to review. */
function ListRail({
  listId,
  remaining,
  partial,
  onOpen,
  className,
}: {
  listId: string;
  remaining: number;
  partial: boolean;
  onOpen: () => void;
  className?: string;
}) {
  const { t } = useTranslation(['cases']);
  return (
    // The top padding keeps the badge inside the grid, which clips what overflows it.
    <div className={cn('flex flex-col items-center pt-2', className)}>
      <Button
        variant="secondary"
        mode="icon"
        className="relative"
        aria-controls={listId}
        aria-expanded={false}
        aria-keyshortcuts="["
        onClick={onOpen}
      >
        <Icon icon="left-panel-open" className="size-4" aria-hidden />
        <span className="sr-only">{t('cases:screening_review.list.show')}</span>
        {remaining > 0 ? (
          <Tag
            color="orange"
            size="xs"
            className="absolute -end-2 -top-2 min-w-4 justify-center border-transparent bg-orange-background-light font-semibold text-orange-hover tabular-nums"
          >
            {remaining}
            {partial ? '+' : ''}
          </Tag>
        ) : null}
      </Button>
    </div>
  );
}

function ReviewStream({
  search,
  onSearchChange,
  canViewAdminSections,
  canViewRiskLevel,
  canValidate,
  canDismissScreenings,
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
  // Wide and narrow pages keep their own list state: collapsed by choice, or open over the hit.
  const [listCollapsed, setListCollapsed] = useState(false);
  const [listOverlayOpen, setListOverlayOpen] = useState(false);
  // The groups whose No hit hits show one card each instead of one stack.
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => new Set());
  const mainRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const [unavailable, setUnavailable] = useState(false);
  const commentRef = useRef<HTMLTextAreaElement>(null);
  const hasMore = !!query.data?.nextCursor || !!query.data?.failed;
  const ready = !!query.data && !query.isPlaceholderData;
  // The latest search, read when a delayed write moves the cursor.
  const latestSearch = useRef(search);
  useEffect(() => {
    latestSearch.current = search;
  });
  const decisions = useReviewDecisions({
    serverItems: query.data?.items ?? [],
    hasMore,
    closedCaseIds: ready && !query.isFetching ? query.data?.closedCaseIds : undefined,
    canValidate,
    onNavigate: (itemId) => onSearchChange({ ...latestSearch.current, hit: itemId }),
  });
  const { session, selection, setSelection, pendingDecision } = decisions;
  // Only To review lets a closed case go. All and Validated read closed cases, so they keep it.
  const viewSession = useMemo(
    () => (search.filter === 'to_review' ? session : { ...session, hiddenCases: [] }),
    [session, search.filter],
  );
  const reviewItems = useMemo(
    () => applyScreeningReviewSession(query.data?.items ?? [], viewSession),
    [query.data, viewSession],
  );
  const groups = useMemo(() => {
    if (search.filter !== 'to_review') {
      return groupScreeningReviewItems(reviewItems, hasMore, (item) =>
        matchesScreeningReviewFilter(item, search.filter),
      );
    }
    // To review keeps this visit's decisions listed, so the analyst sees them land, until a group
    // without a Hit has nothing left to decide and its decisions are written.
    return groupScreeningReviewItems(reviewItems, hasMore, (item) =>
      isListedInScreeningReviewSession(item, session),
    ).filter((group) => !isSettledScreeningReviewGroup(group, session));
  }, [reviewItems, hasMore, session, search.filter]);
  const counts = useMemo(() => countScreeningReviewFilters(reviewItems), [reviewItems]);
  // Counts cover this page only, and To review never reads closed cases.
  const isCountPartial = (filter: ScreeningReviewFilter) =>
    hasMore || search.cursors.length > 0 || (search.filter === 'to_review' && filter !== 'to_review');
  const items = useMemo(() => groups.flatMap((group) => group.items), [groups]);
  const active = items.find((item) => item.id === search.hit) ?? items.find(isPendingReviewItem) ?? items[0];
  const selectedItems = items.filter((item) => selection.has(item.id) && isPendingReviewItem(item));
  const batchMode = selectedItems.length > 0;
  const reviewable = !!active && isPendingReviewItem(active);
  const draftId = active?.id;
  // The end of the queue: nothing left to decide on the first and only page.
  const allReviewed =
    ready &&
    !hasMore &&
    !search.cursors.length &&
    search.filter !== 'validated' &&
    !counts.to_review &&
    !reviewItems.some(awaitsMoreMatches);
  const activeDraft = decisions.draftFor(draftId);

  useEffect(() => {
    // Wait for fresh data before declaring a bookmarked hit unavailable.
    if (!ready || query.isFetching || query.data?.failed) return;
    // A hit decided this visit leaves with its case or its settled group, not because it vanished.
    const hidden =
      (!!search.hit && !!session.decided[search.hit]) ||
      viewSession.hiddenCases.some((caseId) => search.hit?.startsWith(`${caseId}:`));
    if (search.hit && !hidden && !items.some((item) => item.id === search.hit)) setUnavailable(true);
    if (active?.id !== search.hit) onSearchChange({ ...search, hit: active?.id });
  }, [ready, query.isFetching, query.data?.failed, items, active?.id, search, onSearchChange, viewSession.hiddenCases]);

  const select = (item: ScreeningReviewItem | undefined) => {
    if (!item || !ready) return;
    setUnavailable(false);
    decisions.clearNotice();
    onSearchChange({ ...search, hit: item.id });
  };
  const move = (direction: -1 | 1, byGroup = false) =>
    select(adjacentScreeningReviewItem(groups, active?.id, direction, byGroup, expanded));
  const changeDraft = (next: Parameters<typeof decisions.changeDraft>[1]) => {
    if (draftId) decisions.changeDraft(draftId, next);
  };
  /** A decision stacks its groups' No hit hits again. */
  const collapse = (decided: readonly ScreeningReviewItem[]) =>
    setExpanded((current) => {
      const keys = decided.map(screeningReviewGroupKey).filter((key) => current.has(key));
      if (!keys.length) return current;
      const next = new Set(current);
      for (const key of keys) next.delete(key);
      return next;
    });
  // While the previous search's page still shows, its hits take no decision.
  const submit = () => {
    if (!ready || !draftId || !reviewable) return;
    setUnavailable(false);
    collapse([active]);
    decisions.submit(active, draftId);
  };
  const submitBatch = () => {
    if (!ready) return;
    setUnavailable(false);
    collapse(selectedItems);
    decisions.submitBatch(selectedItems, active?.id);
  };
  /** Selects the cursor's hit, or clears it when it is selected. */
  const toggleActive = () => {
    if (!active || !isPendingReviewItem(active)) return;
    const ids = [active.id];
    setSelection((current) => (current.has(active.id) ? withoutSelected(current, ids) : withSelected(current, ids)));
  };
  /** Shows a group's No hit hits one card each, or stacked again. */
  const toggleNoHitStack = (groupKey: string) =>
    setExpanded((current) => {
      const next = new Set(current);
      if (!next.delete(groupKey)) next.add(groupKey);
      return next;
    });
  const activeGroup = () => groups.find((group) => group.items.some((item) => item.id === active?.id));
  // The No hit stack under the cursor, which + and - show one by one or stack again.
  const activeStackGroup =
    active?.status === 'no_hit'
      ? groups.find(
          (group) =>
            group.items.some((item) => item.id === active.id) &&
            group.items.filter((item) => item.status === 'no_hit').length > 1,
        )
      : undefined;
  const activeStackExpanded = !!activeStackGroup && expanded.has(activeStackGroup.key);
  // The stacked No hit hits under the cursor, shown as a list instead of the cursor's hit.
  const activeStack = activeStackGroup
    ? screeningReviewCards(activeStackGroup, expanded).find(
        (card) => card.kind === 'no_hit_stack' && card.items.some((item) => item.id === active?.id),
      )
    : undefined;

  const openActiveCase = () => {
    if (!active) return;
    const { href } = router.buildLocation({
      to: '/cases/m/$caseId',
      params: { caseId: fromUUIDtoSUUID(active.caseId) },
    });
    if (pendingDecision.hasUnsaved()) openInNewTabAfter(href, pendingDecision.flush);
    else window.open(href, '_blank', 'noopener');
  };

  /** One note per state of the stack's screenings, and one per screening with matches to load. */
  const stackStateNotes = (stack: readonly ScreeningReviewItem[]) => {
    const notes = new Map<string, [ScreeningReviewItem, ScreeningReviewScreeningState]>();
    for (const item of stack) {
      const state = screeningReviewScreeningState(reviewItems, item, session);
      if (state === 'in_review') continue;
      const key = state === 'load_more' ? `${state}:${item.screeningId}` : state;
      if (!notes.has(key)) notes.set(key, [item, state]);
    }
    return [...notes.values()];
  };

  const stateActions: ScreeningStateActions = {
    onMatchesLoaded: decisions.refreshPage,
    canCloseCase: (item) => canDismissScreenings && isLastOpenScreeningOfCase(reviewItems, item),
    onCaseClosed: decisions.caseClosed,
  };

  const canNavigate = ready && !helpOpen;
  const panelOpen = !!panelTab && !!active;
  /** Opens the panel on `tab`, or closes it when `tab` is already shown. */
  const togglePanel = (tab: DetailsPanelTab) => setPanelTab((current) => (current === tab ? undefined : tab));
  // The layout follows container queries; the width is only read to know what a toggle means.
  const isNarrow = () => (mainRef.current?.clientWidth ?? WIDE_PAGE_WIDTH) < WIDE_PAGE_WIDTH;
  const toggleList = () => {
    if (isNarrow()) setListOverlayOpen((open) => !open);
    else setListCollapsed((collapsed) => !collapsed);
  };

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
        const ids = screeningReviewGroupPendingItems(groups, active.id).map((item) => item.id);
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
    { hotkey: { key: '[' }, action: toggleList, enabled: canNavigate },
    { hotkey: { key: '(' }, action: toggleList, enabled: canNavigate },
    {
      hotkey: { key: '+' },
      action: () => activeStackGroup && toggleNoHitStack(activeStackGroup.key),
      enabled: canNavigate && !!activeStackGroup,
    },
    {
      hotkey: { key: '-' },
      action: () => activeStackGroup && toggleNoHitStack(activeStackGroup.key),
      enabled: canNavigate && activeStackExpanded,
    },
    { hotkey: '?', action: () => setHelpOpen(true) },
    {
      hotkey: 'Escape',
      // The help closes first, then the panel, then the list over the hit, then the selection clears.
      // Other dialogs keep their own Escape.
      action: () => {
        if (helpOpen) setHelpOpen(false);
        else if (panelOpen) setPanelTab(undefined);
        else if (listOverlayOpen && isNarrow()) setListOverlayOpen(false);
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
      <Page.Main ref={mainRef} className="@container/review h-screen max-h-screen min-h-0 overflow-hidden">
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
              'relative grid min-h-0 min-w-0 flex-1 grid-rows-1 gap-lg overflow-hidden',
              gridColumns(listCollapsed, panelOpen),
            )}
            aria-busy={query.isFetching}
          >
            <div className="relative min-h-0 min-w-0">
              <ListRail
                listId={listId}
                remaining={counts.to_review}
                partial={isCountPartial('to_review')}
                onOpen={toggleList}
                className={cn(!listCollapsed && '@min-[1044px]/review:hidden')}
              />
              <div
                id={listId}
                className={cn('min-h-0 min-w-0 flex-col gap-sm', listPlacement(listCollapsed, listOverlayOpen))}
              >
                <div className="flex shrink-0 flex-col gap-sm">
                  <div className="flex items-center gap-xs">
                    <div className="min-w-0 flex-1">
                      <FilterInboxSelector
                        inboxes={allInboxes}
                        selectedInbox={selectedInbox}
                        onSelectInbox={(inbox) => {
                          if (inbox.id !== selectedInbox.id) changeSearch({ inboxId: inbox.id, cursors: [] });
                        }}
                        variant="secondary"
                      />
                    </div>
                    <Button
                      variant="secondary"
                      mode="icon"
                      aria-label={t('cases:screening_review.list.hide')}
                      aria-controls={listId}
                      aria-expanded
                      aria-keyshortcuts="["
                      onClick={toggleList}
                    >
                      <Icon icon="left-panel-close" className="size-4" aria-hidden />
                    </Button>
                  </div>
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
                    activeId={active?.id}
                    ready={ready}
                    selection={selection}
                    onSelectionChange={setSelection}
                    expanded={expanded}
                    onToggleNoHitStack={toggleNoHitStack}
                    onActivate={select}
                  />
                </div>
                <ShortcutHint onOpenHelp={() => setHelpOpen(true)} />
              </div>
            </div>
            {batchMode ? (
              <BatchPanel
                items={selectedItems}
                selection={selection}
                onSelectionChange={setSelection}
                onSubmit={submitBatch}
                commentRef={commentRef}
              />
            ) : activeStack?.kind === 'no_hit_stack' ? (
              <NoHitStackSummary items={activeStack.items}>
                {stackStateNotes(activeStack.items).map(([item, state]) => (
                  <ScreeningStateNote
                    key={`${item.screeningId}:${state}`}
                    item={item}
                    state={state}
                    actions={stateActions}
                  />
                ))}
              </NoHitStackSummary>
            ) : active ? (
              <div className="flex min-h-0 min-w-0 flex-col gap-md">
                <ScreeningReviewHit
                  key={active.id}
                  item={active}
                  comparisons={compareScreeningReviewFields(active, mappedProperties(active.customer.objectType))}
                  canViewRiskLevel={canViewRiskLevel}
                  tags={
                    <>
                      <StepTag item={active} decidedThisVisit={!!session.decided[active.id]} />
                      <DecisionTag status={active.status} />
                    </>
                  }
                  actions={
                    <>
                      {DETAILS_PANEL_TABS.map(({ tab, hotkey }) => (
                        <ShortcutButton
                          key={tab}
                          tone="neutral"
                          hotkeys={[hotkey]}
                          aria-pressed={panelTab === tab}
                          aria-keyshortcuts={hotkey}
                          onClick={() => togglePanel(tab)}
                        >
                          {t(`cases:screening_review.panel.tab.${tab}`)}
                        </ShortcutButton>
                      ))}
                      <ShortcutButton tone="neutral" hotkeys={['O']} aria-keyshortcuts="O" onClick={openActiveCase}>
                        {t('cases:screening_review.open_case')}
                      </ShortcutButton>
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
                    canMoveNext={!!adjacentScreeningReviewItem(groups, active.id, 1, false, expanded) && canNavigate}
                    onNext={() => move(1)}
                    actions={stateActions}
                  />
                )}
              </div>
            ) : ready && !query.data?.failed && !items.length ? (
              <EmptyQueue
                inboxId={selectedInbox.id}
                state={
                  // A request scans a bounded number of cases, so a page can come back empty with more to read.
                  hasMore
                    ? 'page_empty'
                    : search.q
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

type EmptyQueueState = 'empty' | 'all_reviewed' | 'no_validated' | 'no_results' | 'page_empty';

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
      ) : state === 'page_empty' ? null : (
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
