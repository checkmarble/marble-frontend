import { Page } from '@app-builder/components/Page';
import { MY_INBOX_ID } from '@app-builder/constants/inboxes';
import type { DataModel } from '@app-builder/models/data-model';
import type { InboxMetadata } from '@app-builder/models/inbox';
import { SCREENING_CATEGORY_I18N_KEY_MAP, type ScreeningCategory } from '@app-builder/models/screening';
import {
  adjacentScreeningReviewItem,
  applyScreeningReviewSession,
  compareScreeningReviewFields,
  emptyScreeningReviewSession,
  groupScreeningReviewItems,
  isListedInScreeningReviewSession,
  isPendingReviewItem,
  nextPendingScreeningReviewItem,
  SCREENING_REVIEW_HIDE_DELAY_MS,
  type ScreeningReviewItem,
  type ScreeningReviewScreeningState,
  type ScreeningReviewSession,
  screeningReviewChipFields,
  screeningReviewHitsSkippedBy,
  screeningReviewScreeningState,
  screeningReviewTopicFamilies,
} from '@app-builder/models/screening-review';
import { useScreeningReviewDecisionMutation } from '@app-builder/queries/cases/screening-review-decision';
import { useScreeningReviewPageQuery } from '@app-builder/queries/cases/screening-review-page';
import { useDataModelQuery } from '@app-builder/queries/data/get-data-model';
import type { ScreeningReviewRejection } from '@app-builder/services/screening-review-decision';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, cn, Tag, Typo } from 'ui-design-system';
import { FilterInboxSelector } from '../Inbox/FilterBar/FilterInboxSelector';
import { CasesNavigationTabs } from '../Navigation/Tabs';
import { ActionDock, DecisionTag, OpenCaseLink, ReadOnlyDock, type ScreeningReviewDraft, StepTag } from './ActionDock';
import { CustomerTypeTag, ScreeningReviewHit } from './ScreeningReviewHit';
import { ShortcutHelp, ShortcutKeys } from './ShortcutHelp';
import { ScreeningReviewShortcutProvider, useScreeningReviewShortcuts } from './shortcuts';

export interface ScreeningReviewSearch {
  inboxId?: string;
  limit: 25 | 50 | 100;
  cursors: string[];
  hit?: string;
}

interface ScreeningReviewPageProps {
  search: ScreeningReviewSearch;
  onSearchChange: (search: ScreeningReviewSearch) => void;
  canViewAdminSections: boolean;
  canViewRiskLevel: boolean;
  inboxes: InboxMetadata[];
}

export function ScreeningReviewPage(props: ScreeningReviewPageProps) {
  return (
    <ScreeningReviewShortcutProvider scope="screening-review">
      <ReviewStream {...props} />
    </ScreeningReviewShortcutProvider>
  );
}

const DOT_COLOR_CLASSES: Record<ScreeningCategory, string> = {
  sanctions: 'bg-red-primary',
  peps: 'bg-blue-58',
  'adverse-media': 'bg-orange-primary',
  'third-parties': 'bg-grey-placeholder',
  custom: 'bg-grey-placeholder',
  global: 'bg-green-primary',
};

function TopicDots({ topics }: { topics: string[] }) {
  const { t } = useTranslation(['scenarios']);
  return (
    <span className="flex shrink-0 items-center gap-xs">
      {screeningReviewTopicFamilies(topics).map((family) => {
        const label = t(`scenarios:monitoring_list_check.hit_type.${SCREENING_CATEGORY_I18N_KEY_MAP[family]}`);
        return (
          <span
            key={family}
            role="img"
            aria-label={label}
            title={label}
            className={cn('size-2 rounded-full', DOT_COLOR_CLASSES[family])}
          />
        );
      })}
    </span>
  );
}

type MappedProperties = (objectType: string) => readonly string[] | undefined;

/** FTM properties mapped on each table, so the comparison follows the screening configuration. */
function useMappedProperties(): MappedProperties {
  const dataModelQuery = useDataModelQuery();
  const byTable = useMemo(() => mappedPropertiesByTable(dataModelQuery.data?.dataModel), [dataModelQuery.data]);
  return (objectType) => byTable.get(objectType);
}

function mappedPropertiesByTable(dataModel: DataModel | undefined) {
  return new Map(
    (dataModel ?? []).flatMap((table) => {
      const properties = table.fields.flatMap((field) => (field.ftmProperty ? [field.ftmProperty] : []));
      return table.ftmEntity && properties.length ? [[table.name, properties] as const] : [];
    }),
  );
}

function MatchedFieldChips({
  item,
  mappedProperties,
}: {
  item: ScreeningReviewItem;
  mappedProperties: MappedProperties;
}) {
  const { t } = useTranslation(['cases']);
  const fields = screeningReviewChipFields(
    compareScreeningReviewFields(item, mappedProperties(item.customer.objectType)),
  );
  if (!fields.length) return null;
  return (
    <span className="flex flex-wrap gap-xs">
      {fields.map((field) => (
        <Tag
          key={field}
          size="xs"
          className="h-5 px-sm"
          color="red"
          title={t(`cases:screening_review.matched_field.${field}_description`)}
        >
          {t(`cases:screening_review.matched_field.${field}`)}
        </Tag>
      ))}
    </span>
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

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
}

type ScreeningReviewNotice = ScreeningReviewRejection | 'decision_failed';

/** Notes for a customer's screenings that need something besides a decision. */
function GroupScreeningNotes({
  items,
  listed,
  session,
}: {
  items: readonly ScreeningReviewItem[];
  listed: readonly ScreeningReviewItem[];
  session: ScreeningReviewSession;
}) {
  const { t } = useTranslation(['cases']);
  const notes = new Map<string, { item: ScreeningReviewItem; state: ScreeningReviewScreeningState }>();
  for (const item of listed) {
    if (notes.has(item.screeningId)) continue;
    const state = screeningReviewScreeningState(items, item, session);
    if (state !== 'in_review') notes.set(item.screeningId, { item, state });
  }
  if (!notes.size) return null;
  return (
    <ul className="flex flex-col gap-2xs text-xs text-grey-secondary">
      {[...notes.values()].map(({ item, state }) => (
        <li key={item.screeningId} className="flex flex-wrap items-center gap-xs">
          <span>{t(`cases:screening_review.group_state.${state}`)}</span>
          {state === 'confirmed_hit' ? <OpenCaseLink caseId={item.caseId} /> : null}
        </li>
      ))}
    </ul>
  );
}

function ReviewStream({
  search,
  onSearchChange,
  canViewAdminSections,
  canViewRiskLevel,
  inboxes,
}: ScreeningReviewPageProps) {
  const { t } = useTranslation(['cases', 'common']);
  const queryClient = useQueryClient();
  const allInboxes = [{ id: MY_INBOX_ID, name: t('cases:inbox.my-inbox.link') }, ...inboxes];
  const selectedInbox = allInboxes.find((inbox) => inbox.id === search.inboxId) ?? allInboxes[0]!;
  const query = useScreeningReviewPageQuery(search.limit, search.cursors.at(-1) ?? null, selectedInbox.id);
  const decisionMutation = useScreeningReviewDecisionMutation();
  const mappedProperties = useMappedProperties();
  const [helpOpen, setHelpOpen] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [notice, setNotice] = useState<ScreeningReviewNotice>();
  const [session, setSession] = useState<ScreeningReviewSession>(emptyScreeningReviewSession);
  const [draft, setDraft] = useState<{ itemId: string } & ScreeningReviewDraft>();
  const activeRef = useRef<HTMLButtonElement>(null);
  const commentRef = useRef<HTMLTextAreaElement>(null);
  const sessionRef = useRef(session);
  const hideTimers = useRef<number[]>([]);
  const hasMore = !!query.data?.nextCursor || !!query.data?.failed;
  const reviewItems = useMemo(
    () => applyScreeningReviewSession(query.data?.items ?? [], session),
    [query.data, session],
  );
  const groups = useMemo(
    () => groupScreeningReviewItems(reviewItems, hasMore, (item) => isListedInScreeningReviewSession(item, session)),
    [reviewItems, hasMore, session],
  );
  const items = useMemo(() => groups.flatMap((group) => group.items), [groups]);
  const active = items.find((item) => item.id === search.hit) ?? items.find(isPendingReviewItem) ?? items[0];
  const ready = !!query.data && !query.isPlaceholderData;
  const submitting = decisionMutation.isPending;
  const reviewable = !!active && isPendingReviewItem(active);
  const activeDraft: ScreeningReviewDraft = (draft?.itemId === active?.id ? draft : undefined) ?? { comment: '' };
  // The latest server data, read when a write completes to pick the next hit.
  const latest = useRef({ items: query.data?.items ?? [], hasMore });
  useEffect(() => {
    latest.current = { items: query.data?.items ?? [], hasMore };
  });
  useEffect(() => () => hideTimers.current.forEach((timer) => window.clearTimeout(timer)), []);

  const updateSession = (update: (current: ScreeningReviewSession) => ScreeningReviewSession) => {
    sessionRef.current = update(sessionRef.current);
    setSession(sessionRef.current);
    return sessionRef.current;
  };
  // Decisions belong to the page they were made on.
  const resetSession = () => {
    hideTimers.current.forEach((timer) => window.clearTimeout(timer));
    hideTimers.current = [];
    sessionRef.current = emptyScreeningReviewSession;
    setSession(emptyScreeningReviewSession);
    setDraft(undefined);
    setNotice(undefined);
  };

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
    if (!item || !ready || submitting) return;
    setUnavailable(false);
    setNotice(undefined);
    onSearchChange({ ...search, hit: item.id });
  };
  const move = (direction: -1 | 1, byCustomer = false) =>
    select(adjacentScreeningReviewItem(groups, active?.id, direction, byCustomer));
  const changeDraft = (next: Partial<ScreeningReviewDraft>) => {
    if (active) setDraft({ ...activeDraft, ...next, itemId: active.id });
  };

  const submit = () => {
    if (!active || !reviewable || !activeDraft.decision || submitting) return;
    const item = active;
    const decision = activeDraft.decision;
    const comment = activeDraft.comment.trim() || undefined;
    setNotice(undefined);
    setUnavailable(false);
    decisionMutation.mutate(
      {
        caseId: item.caseId,
        screeningId: item.screeningId,
        matchId: item.matchId,
        status: decision,
        ...(comment ? { comment } : {}),
      },
      {
        onSuccess: (result) => {
          if (!result.ok) {
            // Show what changed, then return to the server's state.
            setNotice(result.reason);
            setDraft(undefined);
            void query.refetch();
            return;
          }
          const next = updateSession((current) => ({
            ...current,
            decided: { ...current.decided, [item.id]: { item, decision, ...(comment ? { comment } : {}) } },
            screenings: {
              ...current.screenings,
              [item.screeningId]: {
                status: result.screeningStatus ?? item.screeningStatus,
                caseClosed: result.caseClosed,
              },
            },
          }));
          setDraft(undefined);
          const nextGroups = groupScreeningReviewItems(
            applyScreeningReviewSession(latest.current.items, next),
            latest.current.hasMore,
            (other) => isListedInScreeningReviewSession(other, next),
          );
          const nextItem = nextPendingScreeningReviewItem(nextGroups, item.id);
          if (nextItem) onSearchChange({ ...search, hit: nextItem.id });
          if (result.caseClosed) {
            hideTimers.current.push(
              window.setTimeout(
                () => updateSession((current) => ({ ...current, hiddenCases: [...current.hiddenCases, item.caseId] })),
                SCREENING_REVIEW_HIDE_DELAY_MS,
              ),
            );
          }
          void queryClient.invalidateQueries({ queryKey: ['cases', 'screening-review'] });
        },
        // Keep the decision and comment, so the analyst can try again.
        onError: () => setNotice('decision_failed'),
      },
    );
  };
  const refreshPage = () => queryClient.invalidateQueries({ queryKey: ['cases', 'screening-review'] });

  const canNavigate = ready && !helpOpen && !submitting;
  const canDecide = canNavigate && reviewable;
  useScreeningReviewShortcuts([
    { hotkey: 'J', action: () => move(1), enabled: canNavigate },
    { hotkey: 'ArrowDown', action: () => move(1), enabled: canNavigate },
    { hotkey: 'K', action: () => move(-1), enabled: canNavigate },
    { hotkey: 'ArrowUp', action: () => move(-1), enabled: canNavigate },
    { hotkey: 'Shift+J', action: () => move(1, true), enabled: canNavigate },
    { hotkey: 'Shift+K', action: () => move(-1, true), enabled: canNavigate },
    { hotkey: 'M', action: () => changeDraft({ decision: 'confirmed_hit' }), enabled: canDecide },
    { hotkey: 'N', action: () => changeDraft({ decision: 'no_hit' }), enabled: canDecide },
    { hotkey: 'C', action: () => commentRef.current?.focus(), enabled: canDecide },
    { hotkey: 'Enter', action: submit, enabled: canDecide && !!activeDraft.decision, yieldToControls: true },
    { hotkey: '?', action: () => setHelpOpen(true) },
    {
      hotkey: 'Escape',
      // The help closes first. Other dialogs keep their own Escape.
      action: () => (helpOpen ? setHelpOpen(false) : changeDraft({ decision: undefined })),
      allowInModal: helpOpen,
    },
  ]);

  const changePage = (cursors: string[]) => {
    setUnavailable(false);
    resetSession();
    onSearchChange({ ...search, cursors, hit: undefined });
  };

  return (
    <Page.Main className="h-screen max-h-screen min-h-0 overflow-hidden">
      <Page.Content className="min-h-0 gap-md">
        <div className="shrink-0">
          <CasesNavigationTabs showAdminSections={canViewAdminSections} inboxId={selectedInbox.id} />
        </div>
        {notice ? (
          <p role="alert" className="shrink-0 text-red-primary">
            {notice === 'decision_failed'
              ? t('cases:screening_review.decision_failed')
              : t(`cases:screening_review.rejection.${notice}`)}
          </p>
        ) : unavailable ? (
          <p role="status" className="shrink-0">
            {t('cases:screening_review.unavailable')}
          </p>
        ) : null}
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
          className="grid min-h-0 min-w-0 flex-1 grid-cols-[270px_minmax(0,1fr)] grid-rows-1 gap-lg overflow-hidden"
          aria-busy={query.isFetching}
        >
          <div className="flex min-h-0 min-w-0 flex-col gap-sm">
            <div className="shrink-0">
              <FilterInboxSelector
                inboxes={allInboxes}
                selectedInbox={selectedInbox}
                onSelectInbox={(inbox) => {
                  if (inbox.id === selectedInbox.id) return;
                  setUnavailable(false);
                  resetSession();
                  onSearchChange({ ...search, inboxId: inbox.id, cursors: [], hit: undefined });
                }}
                variant="secondary"
              />
            </div>
            <div className="relative min-h-0 flex-1">
              <nav
                aria-label={t('cases:screening_review.hit_list')}
                className="absolute inset-0 overflow-y-auto overscroll-y-contain"
              >
                <ul className="flex flex-col gap-sm">
                  {groups.map((group) => (
                    <li
                      key={group.key}
                      className="flex min-w-0 flex-col gap-sm rounded-lg border border-purple-primary/15 bg-surface-card p-3"
                    >
                      <div className="flex flex-col gap-xs">
                        <div className="flex min-w-0 items-center gap-xs">
                          <Typo
                            as="h2"
                            variant="subtitle2"
                            className={cn(
                              'min-w-0 truncate',
                              group.items.some((item) => item.id === active?.id) && 'text-purple-primary',
                            )}
                          >
                            <bdi>{group.customer.name}</bdi>
                          </Typo>
                          <CustomerTypeTag customer={group.customer} />
                        </div>
                        <p className="flex items-center gap-xs text-xs text-grey-secondary">
                          <Tag
                            color="orange"
                            size="xs"
                            className="border-transparent bg-orange-background-light font-semibold text-orange-hover"
                          >
                            {group.remaining}
                          </Tag>
                          <span>{t('cases:screening_review.group_hits_to_review', { count: group.remaining })}</span>
                          <span>
                            / {group.total}
                            {group.incomplete ? '+' : ''}
                          </span>
                        </p>
                        <GroupScreeningNotes items={reviewItems} listed={group.items} session={session} />
                      </div>
                      <ul className="flex flex-col gap-xs">
                        {group.items.map((item) => {
                          const isActive = item.id === active?.id;
                          return (
                            <li key={item.id}>
                              <button
                                type="button"
                                data-review-hit-card
                                ref={isActive ? activeRef : undefined}
                                aria-current={isActive ? 'true' : undefined}
                                disabled={!ready || submitting}
                                onClick={() => select(item)}
                                className={cn(
                                  'flex w-full min-w-0 scroll-my-sm cursor-pointer flex-col gap-xs rounded-lg border border-grey-border bg-surface-card px-3 py-2.5 text-start text-small focus-visible:outline-2 focus-visible:outline-purple-primary',
                                  isActive && 'border-purple-primary bg-purple-background-light',
                                )}
                              >
                                <span className="flex w-full min-w-0 items-center gap-xs">
                                  <bdi
                                    className={cn('min-w-0 truncate', isActive && 'font-semibold text-purple-primary')}
                                  >
                                    {item.listRecord.caption || item.listRecord.id}
                                  </bdi>
                                  <TopicDots topics={item.topics} />
                                  <bdi className="shrink-0 text-2xs text-grey-secondary">
                                    {Math.round(item.score * 100)}%
                                  </bdi>
                                </span>
                                <span className="flex flex-wrap items-center gap-xs empty:hidden">
                                  <DecisionTag status={item.status} />
                                  <MatchedFieldChips item={item} mappedProperties={mappedProperties} />
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
            <ShortcutHint onOpenHelp={() => setHelpOpen(true)} />
          </div>
          {active ? (
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
              />
              {reviewable ? (
                <ActionDock
                  item={active}
                  draft={activeDraft}
                  onDraftChange={changeDraft}
                  onSubmit={submit}
                  onCancel={() => changeDraft({ decision: undefined, comment: '' })}
                  submitting={submitting}
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
                  onMatchesLoaded={refreshPage}
                />
              )}
            </div>
          ) : ready && !query.data?.failed && !items.length ? (
            <div className="flex flex-col items-start gap-md self-start rounded border border-grey-border p-lg">
              <Typo variant="title2">{t('cases:screening_review.empty_title')}</Typo>
              <p>{t('cases:screening_review.empty_description')}</p>
              <Link
                to="/cases/inboxes/$inboxId"
                params={{
                  inboxId: selectedInbox.id === MY_INBOX_ID ? selectedInbox.id : fromUUIDtoSUUID(selectedInbox.id),
                }}
                className="text-purple-primary underline"
              >
                {t('cases:screening_review.go_to_cases')}
              </Link>
            </div>
          ) : null}
        </div>
        <Page.StickyFooter className="mt-auto shrink-0 flex-wrap gap-md">
          <div className="flex flex-wrap items-center gap-xs">
            <span>{t('cases:screening_review.hits_per_page')}</span>
            {([25, 50, 100] as const).map((limit) => (
              <Button
                key={limit}
                variant="secondary"
                aria-pressed={search.limit === limit}
                className={cn(search.limit === limit && 'border-purple-primary text-purple-primary')}
                onClick={() => {
                  setUnavailable(false);
                  resetSession();
                  onSearchChange({ ...search, limit, cursors: [], hit: undefined });
                }}
              >
                {limit}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-sm">
            <span role="status" className="text-s text-grey-secondary">
              {query.isFetching
                ? t('cases:screening_review.loading')
                : t('cases:screening_review.page_count', { count: items.length, page: search.cursors.length + 1 })}
            </span>
            <Button
              variant="secondary"
              disabled={!search.cursors.length || query.isFetching || submitting}
              onClick={() => changePage(search.cursors.slice(0, -1))}
            >
              {t('cases:screening_review.previous_page')}
            </Button>
            <Button
              variant="secondary"
              disabled={!ready || !query.data?.nextCursor || query.data.failed || query.isFetching || submitting}
              onClick={() => {
                if (query.data?.nextCursor) changePage([...search.cursors, query.data.nextCursor]);
              }}
            >
              {t('cases:screening_review.next_page')}
            </Button>
          </div>
        </Page.StickyFooter>
      </Page.Content>
      <ShortcutHelp open={helpOpen} onOpenChange={setHelpOpen} />
    </Page.Main>
  );
}
