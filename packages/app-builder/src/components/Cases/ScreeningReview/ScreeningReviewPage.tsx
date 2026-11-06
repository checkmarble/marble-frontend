import { Page } from '@app-builder/components/Page';
import { TopicsDisplay } from '@app-builder/components/Screenings/TopicsDisplay';
import { MY_INBOX_ID } from '@app-builder/constants/inboxes';
import type { InboxMetadata } from '@app-builder/models/inbox';
import { SCREENING_CATEGORY_I18N_KEY_MAP, type ScreeningCategory } from '@app-builder/models/screening';
import {
  adjacentScreeningReviewItem,
  groupScreeningReviewItems,
  matchedScreeningReviewFields,
  type ScreeningReviewItem,
  screeningReviewTopicFamilies,
} from '@app-builder/models/screening-review';
import { useScreeningReviewPageQuery } from '@app-builder/queries/cases/screening-review-page';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { Link } from '@tanstack/react-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, cn, Tag, Typo } from 'ui-design-system';
import { FilterInboxSelector } from '../Inbox/FilterBar/FilterInboxSelector';
import { CasesNavigationTabs } from '../Navigation/Tabs';
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
  inboxes: InboxMetadata[];
}

export function ScreeningReviewPage(props: ScreeningReviewPageProps) {
  return (
    <ScreeningReviewShortcutProvider scope="screening-review">
      <ReviewStream {...props} />
    </ScreeningReviewShortcutProvider>
  );
}

function DataPoints({ item }: { item: ScreeningReviewItem }) {
  const { t } = useTranslation(['cases', 'screenings']);
  const properties = item.listRecord.properties;
  const keys = ['name', 'birthDate', 'nationality', 'citizenship', 'country', 'address'];
  const points = keys.filter((key) => properties[key]?.length).slice(0, 3);
  if (!points.length) return null;
  return (
    <dl className="flex flex-col gap-xs text-s">
      {points.map((key) => (
        <div key={key} className="flex flex-wrap gap-x-xs">
          <dt className="text-grey-secondary">{t(`screenings:entity.property.${key}`)}:</dt>
          <dd className="wrap-break-words">
            <bdi>{properties[key]?.slice(0, 2).join(' · ')}</bdi>
          </dd>
        </div>
      ))}
    </dl>
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

function MatchedFieldChips({ item }: { item: ScreeningReviewItem }) {
  const { t } = useTranslation(['cases']);
  const fields = matchedScreeningReviewFields(item);
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

function CustomerTypeTag({ customer }: { customer: ScreeningReviewItem['customer'] }) {
  const { t } = useTranslation(['screenings']);
  const label = customer.schema
    ? t(`screenings:entity.schema.${customer.schema.toLowerCase()}`, { defaultValue: customer.schema })
    : customer.objectType;
  return (
    <Tag color="white" size="xs" appearance="monospace" className="h-5 shrink-0">
      {label}
    </Tag>
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

function ReviewStream({ search, onSearchChange, canViewAdminSections, inboxes }: ScreeningReviewPageProps) {
  const { t } = useTranslation(['cases', 'common']);
  const allInboxes = [{ id: MY_INBOX_ID, name: t('cases:inbox.my-inbox.link') }, ...inboxes];
  const selectedInbox = allInboxes.find((inbox) => inbox.id === search.inboxId) ?? allInboxes[0]!;
  const query = useScreeningReviewPageQuery(search.limit, search.cursors.at(-1) ?? null, selectedInbox.id);
  const [helpOpen, setHelpOpen] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const activeRef = useRef<HTMLButtonElement>(null);
  const groups = useMemo(
    () => groupScreeningReviewItems(query.data?.items ?? [], !!query.data?.nextCursor || !!query.data?.failed),
    [query.data],
  );
  const items = useMemo(() => groups.flatMap((group) => group.items), [groups]);
  const active = items.find((item) => item.id === search.hit) ?? items[0];
  const ready = !!query.data && !query.isPlaceholderData;

  useEffect(() => {
    // Wait for fresh data before declaring a bookmarked hit unavailable.
    if (!ready || query.isFetching || query.data?.failed) return;
    if (search.hit && !items.some((item) => item.id === search.hit)) setUnavailable(true);
    if (active?.id !== search.hit) onSearchChange({ ...search, hit: active?.id });
  }, [ready, query.isFetching, query.data?.failed, items, active?.id, search, onSearchChange]);

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      block: 'nearest',
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  }, [active?.id]);

  const select = (item: ScreeningReviewItem | undefined) => {
    if (!item || !ready) return;
    setUnavailable(false);
    onSearchChange({ ...search, hit: item.id });
  };
  const move = (direction: -1 | 1, byCustomer = false) =>
    select(adjacentScreeningReviewItem(groups, active?.id, direction, byCustomer));
  const canNavigate = ready && !helpOpen;
  useScreeningReviewShortcuts([
    { hotkey: 'J', action: () => move(1), enabled: canNavigate },
    { hotkey: 'ArrowDown', action: () => move(1), enabled: canNavigate },
    { hotkey: 'K', action: () => move(-1), enabled: canNavigate },
    { hotkey: 'ArrowUp', action: () => move(-1), enabled: canNavigate },
    { hotkey: 'Shift+J', action: () => move(1, true), enabled: canNavigate },
    { hotkey: 'Shift+K', action: () => move(-1, true), enabled: canNavigate },
    { hotkey: '?', action: () => setHelpOpen(true) },
    { hotkey: 'Escape', action: () => setHelpOpen(false), allowInModal: true },
  ]);

  const changePage = (cursors: string[]) => {
    setUnavailable(false);
    onSearchChange({ ...search, cursors, hit: undefined });
  };

  return (
    <Page.Main className="h-screen max-h-screen min-h-0 overflow-hidden">
      <Page.Content className="min-h-0 gap-md">
        <div className="shrink-0">
          <CasesNavigationTabs showAdminSections={canViewAdminSections} inboxId={selectedInbox.id} />
        </div>
        {unavailable ? (
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
                  onSearchChange({ ...search, inboxId: inbox.id, cursors: [], hit: undefined });
                }}
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
                      </div>
                      <ul className="flex flex-col gap-xs">
                        {group.items.map((item) => {
                          const isActive = item.id === active?.id;
                          return (
                            <li key={item.id}>
                              <button
                                type="button"
                                ref={isActive ? activeRef : undefined}
                                aria-current={isActive ? 'true' : undefined}
                                disabled={!ready}
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
                                <MatchedFieldChips item={item} />
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
            <section
              aria-labelledby="screening-review-active-title"
              className="flex min-h-0 min-w-0 flex-col gap-md overflow-y-auto"
            >
              <p className="sr-only" aria-live="polite" aria-atomic="true">
                {active.customer.name} · {active.listRecord.caption || active.listRecord.id}
              </p>
              <div className="flex min-w-0 items-center gap-sm">
                <Typo variant="title2" id="screening-review-active-title" className="min-w-0 truncate">
                  <bdi>{active.customer.name}</bdi>
                </Typo>
                <CustomerTypeTag customer={active.customer} />
              </div>
              <div className="flex flex-col gap-md rounded-lg border border-grey-border bg-surface-card p-lg">
                <Typo variant="subtitle1">
                  <bdi>{active.listRecord.caption || active.listRecord.id}</bdi>
                </Typo>
                <p>{t('cases:screening_review.score', { score: Math.round(active.score * 100) })}</p>
                <TopicsDisplay entity={{ id: active.listRecord.id, properties: { topics: active.topics } }} />
                <Typo variant="subtitle2">{t('cases:screening_review.data_points')}</Typo>
                <DataPoints item={active} />
                <p className="text-s text-grey-secondary">
                  {t('cases:screening_review.case_name', { name: active.caseName })}
                </p>
              </div>
            </section>
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
              disabled={!search.cursors.length || query.isFetching}
              onClick={() => changePage(search.cursors.slice(0, -1))}
            >
              {t('cases:screening_review.previous_page')}
            </Button>
            <Button
              variant="secondary"
              disabled={!ready || !query.data?.nextCursor || query.data.failed || query.isFetching}
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
