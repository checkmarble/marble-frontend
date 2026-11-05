import { Page } from '@app-builder/components/Page';
import { TopicsDisplay } from '@app-builder/components/Screenings/TopicsDisplay';
import { MY_INBOX_ID } from '@app-builder/constants/inboxes';
import type { InboxMetadata } from '@app-builder/models/inbox';
import {
  adjacentScreeningReviewItem,
  groupScreeningReviewItems,
  type ScreeningReviewItem,
} from '@app-builder/models/screening-review';
import { useScreeningReviewPageQuery } from '@app-builder/queries/cases/screening-review-page';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { Link } from '@tanstack/react-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, cn, Kbd, Typo } from 'ui-design-system';
import { FilterInboxSelector } from '../Inbox/FilterBar/FilterInboxSelector';
import { CasesNavigationTabs } from '../Navigation/Tabs';
import { ShortcutHelp } from './ShortcutHelp';
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
  const navigationGroup = t('cases:screening_review.shortcuts.navigation');
  useScreeningReviewShortcuts([
    {
      hotkey: 'J',
      name: t('cases:screening_review.next_hit'),
      group: navigationGroup,
      action: () => move(1),
      enabled: ready && !helpOpen,
    },
    {
      hotkey: 'ArrowDown',
      name: t('cases:screening_review.next_hit'),
      group: navigationGroup,
      action: () => move(1),
      enabled: ready && !helpOpen,
    },
    {
      hotkey: 'K',
      name: t('cases:screening_review.previous_hit'),
      group: navigationGroup,
      action: () => move(-1),
      enabled: ready && !helpOpen,
    },
    {
      hotkey: 'ArrowUp',
      name: t('cases:screening_review.previous_hit'),
      group: navigationGroup,
      action: () => move(-1),
      enabled: ready && !helpOpen,
    },
    {
      hotkey: 'Shift+J',
      name: t('cases:screening_review.next_customer'),
      group: navigationGroup,
      action: () => move(1, true),
      enabled: ready && !helpOpen,
    },
    {
      hotkey: 'Shift+K',
      name: t('cases:screening_review.previous_customer'),
      group: navigationGroup,
      action: () => move(-1, true),
      enabled: ready && !helpOpen,
    },
    {
      hotkey: '?',
      name: t('cases:screening_review.shortcuts.title'),
      group: navigationGroup,
      action: () => setHelpOpen(true),
    },
    {
      hotkey: 'Escape',
      name: t('cases:screening_review.shortcuts.close'),
      group: navigationGroup,
      action: () => setHelpOpen(false),
      allowInModal: true,
    },
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
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-sm">
          <FilterInboxSelector
            inboxes={allInboxes}
            selectedInbox={selectedInbox}
            onSelectInbox={(inbox) => {
              if (inbox.id === selectedInbox.id) return;
              setUnavailable(false);
              onSearchChange({ ...search, inboxId: inbox.id, cursors: [], hit: undefined });
            }}
          />
          <Button variant="secondary" onClick={() => setHelpOpen(true)}>
            {t('cases:screening_review.shortcuts.title')} <Kbd dir="ltr">?</Kbd>
          </Button>
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
          className="grid min-h-0 min-w-0 flex-1 grid-cols-[minmax(14rem,19rem)_minmax(0,1fr)] grid-rows-1 gap-md overflow-hidden"
          aria-busy={query.isFetching}
        >
          <div className="relative min-h-0">
            <nav
              aria-label={t('cases:screening_review.hit_list')}
              className="absolute inset-0 flex flex-col gap-md overflow-y-auto overscroll-y-contain"
            >
              <ul className="flex flex-col gap-md">
                {groups.map((group) => (
                  <li key={group.key} className="flex min-w-0 flex-col gap-sm">
                    <div className="flex flex-col gap-xs">
                      <Typo variant="subtitle2">{group.customer.name}</Typo>
                      <p className="text-s text-grey-secondary">
                        {t('cases:screening_review.group_count', {
                          remaining: group.remaining,
                          total: `${group.total}${group.incomplete ? '+' : ''}`,
                        })}
                      </p>
                    </div>
                    <ul className="flex flex-col gap-sm">
                      {group.items.map((item) => (
                        <li key={item.id}>
                          <button
                            type="button"
                            ref={item.id === active?.id ? activeRef : undefined}
                            aria-current={item.id === active?.id ? 'true' : undefined}
                            disabled={!ready}
                            onClick={() => select(item)}
                            className={cn(
                              'flex w-full min-w-0 scroll-my-sm flex-col gap-sm rounded-md border border-grey-border bg-surface-card p-md text-start focus-visible:outline-2 focus-visible:outline-purple-primary',
                              item.id === active?.id && 'border-purple-primary ring-2 ring-purple-primary',
                            )}
                          >
                            <span className="flex w-full justify-between gap-sm">
                              <bdi className="font-medium">{item.listRecord.caption || item.listRecord.id}</bdi>
                              <bdi className="shrink-0 text-s">{Math.round(item.score * 100)}%</bdi>
                            </span>
                            <TopicsDisplay entity={{ id: item.listRecord.id, properties: { topics: item.topics } }} />
                            <DataPoints item={item} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          {active ? (
            <section
              aria-labelledby="screening-review-active-title"
              className="flex max-h-full min-h-0 min-w-0 flex-col gap-md self-start overflow-y-auto rounded-lg border border-grey-border bg-surface-card p-lg"
            >
              <div aria-live="polite" aria-atomic="true" className="flex flex-col gap-md">
                <p className="text-grey-secondary">
                  <bdi>{active.customer.name}</bdi>
                </p>
                <Typo variant="subtitle2" id="screening-review-active-title">
                  <bdi>{active.listRecord.caption || active.listRecord.id}</bdi>
                </Typo>
              </div>
              <p>{t('cases:screening_review.score', { score: Math.round(active.score * 100) })}</p>
              <TopicsDisplay entity={{ id: active.listRecord.id, properties: { topics: active.topics } }} />
              <Typo variant="subtitle2">{t('cases:screening_review.data_points')}</Typo>
              <DataPoints item={active} />
              <p className="text-s text-grey-secondary">
                {t('cases:screening_review.case_name', { name: active.caseName })}
              </p>
              <div className="flex flex-wrap gap-sm">
                <Button
                  variant="secondary"
                  disabled={!ready || !adjacentScreeningReviewItem(groups, active.id, -1)}
                  onClick={() => move(-1)}
                >
                  {t('cases:screening_review.previous_hit')}
                </Button>
                <Button
                  variant="secondary"
                  disabled={!ready || !adjacentScreeningReviewItem(groups, active.id, 1)}
                  onClick={() => move(1)}
                >
                  {t('cases:screening_review.next_hit')}
                </Button>
                <Button
                  variant="secondary"
                  disabled={!ready || !adjacentScreeningReviewItem(groups, active.id, -1, true)}
                  onClick={() => move(-1, true)}
                >
                  {t('cases:screening_review.previous_customer')}
                </Button>
                <Button
                  variant="secondary"
                  disabled={!ready || !adjacentScreeningReviewItem(groups, active.id, 1, true)}
                  onClick={() => move(1, true)}
                >
                  {t('cases:screening_review.next_customer')}
                </Button>
              </div>
            </section>
          ) : ready && !query.data?.failed && !items.length ? (
            <div className="flex flex-col items-start gap-md rounded border border-grey-border p-lg">
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
