import { SCREENING_HIT_TYPE_T_KEYS, type ScreeningCategory } from '@app-builder/models/screening';
import {
  isPendingReviewItem,
  type ScreeningReviewCard,
  type ScreeningReviewGroup,
  type ScreeningReviewItem,
  screeningReviewCardLead,
  screeningReviewCards,
  screeningReviewTopicFamilies,
} from '@app-builder/models/screening-review';
import { useId, useLayoutEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Checkbox, cn, Tag, Typo } from 'ui-design-system';
import { DecisionTag } from './ActionDock';
import { type BatchSelection, withoutSelected, withSelected } from './batch-selection';
import { type MappedProperties, MatchedFieldChips, useMappedProperties } from './MatchedFieldChips';
import { CustomerTypeTag, SimilarityScore } from './ScreeningReviewHit';
import { ShortcutKeys } from './ShortcutHelp';

type SelectionUpdate = (update: (current: BatchSelection) => BatchSelection) => void;

/** The page's hits, grouped by case. Clicking a card moves the cursor; checkboxes select for a batch. */
export function HitList({
  groups,
  activeId,
  ready,
  selection,
  onSelectionChange,
  expanded,
  onToggleNoHitStack,
  onActivate,
  footer,
}: {
  groups: readonly ScreeningReviewGroup[];
  activeId: string | undefined;
  ready: boolean;
  selection: BatchSelection;
  onSelectionChange: SelectionUpdate;
  expanded: ReadonlySet<string>;
  onToggleNoHitStack: (groupKey: string) => void;
  onActivate: (item: ScreeningReviewItem) => void;
  footer?: React.ReactNode;
}) {
  const { t } = useTranslation(['cases']);
  const mappedProperties = useMappedProperties();
  const navRef = useRef<HTMLElement>(null);
  const shownGroup = useRef<string | null>(null);

  useLayoutEffect(() => {
    const nav = navRef.current;
    if (nav) shownGroup.current = revealActiveHit(nav, shownGroup.current);
  }, [activeId, groups, expanded]);

  const card = (group: ScreeningReviewGroup, entry: ScreeningReviewCard) => {
    if (entry.kind === 'no_hit_stack') {
      const item = entry.items.find((member) => member.id === activeId) ?? screeningReviewCardLead(entry);
      return (
        <NoHitStackCard
          key={entry.key}
          size={entry.items.length}
          active={item.id === activeId}
          ready={ready}
          onActivate={() => onActivate(item)}
          onUnstack={() => onToggleNoHitStack(group.key)}
        />
      );
    }
    const { item } = entry;
    const noHitCount = group.items.filter((member) => member.status === 'no_hit').length;
    return (
      <HitCard
        key={entry.key}
        item={item}
        active={item.id === activeId}
        ready={ready}
        selectable={isPendingReviewItem(item)}
        selected={selection.has(item.id)}
        mappedProperties={mappedProperties}
        restackSize={item.status === 'no_hit' && noHitCount > 1 ? noHitCount : undefined}
        onActivate={() => onActivate(item)}
        onToggle={() =>
          onSelectionChange((current) =>
            selection.has(item.id) ? withoutSelected(current, [item.id]) : withSelected(current, [item.id]),
          )
        }
        onRestack={() => onToggleNoHitStack(group.key)}
      />
    );
  };
  return (
    <nav
      ref={navRef}
      aria-label={t('cases:screening_review.hit_list')}
      className="absolute inset-0 overflow-y-auto overscroll-y-contain"
      onClick={(event) => {
        // A mouse click leaves no focus in the list, so Space and Enter act on the hit under
        // the cursor rather than on the card or checkbox clicked earlier. Keyboard clicks keep it.
        const focused = document.activeElement;
        if (event.detail > 0 && focused instanceof HTMLElement && event.currentTarget.contains(focused)) {
          focused.blur();
        }
      }}
    >
      <ul className="flex flex-col gap-sm">
        {groups.map((group) => {
          const cards = screeningReviewCards(group, expanded);
          const first = cards[0];
          const firstHit = first && (first.kind === 'no_hit_stack' ? screeningReviewCardLead(first) : first.item);
          return (
            <CaseGroup
              key={group.key}
              group={group}
              active={group.items.some((item) => item.id === activeId)}
              ready={ready}
              selection={selection}
              onSelectionChange={onSelectionChange}
              onActivate={firstHit ? () => onActivate(firstHit) : undefined}
            >
              {cards.map((entry) => card(group, entry))}
            </CaseGroup>
          );
        })}
      </ul>
      {footer}
    </nav>
  );
}

/**
 * One customer's hits in one case. Its header sticks to the top of the list while its hits scroll.
 * A click on the card outside its hits and controls moves the cursor to its first hit.
 */
function CaseGroup({
  group,
  active,
  ready,
  selection,
  onSelectionChange,
  onActivate,
  children,
}: {
  group: ScreeningReviewGroup;
  /** Holds the hit under the cursor. */
  active: boolean;
  ready: boolean;
  selection: BatchSelection;
  onSelectionChange: SelectionUpdate;
  /** Moves the cursor to the group's first hit. */
  onActivate: (() => void) | undefined;
  children: React.ReactNode;
}) {
  const { t } = useTranslation(['cases']);
  const selectionId = useId();
  const pendingIds = group.items.filter(isPendingReviewItem).map((item) => item.id);
  const selectedCount = pendingIds.filter((id) => selection.has(id)).length;
  const hasSelected = selectedCount > 0;
  // One hit: its own checkbox selects it, and the counter would only say 1 / 1, or 1 / 1+.
  const single = group.total === 1;
  const selectionLabel = t(
    hasSelected
      ? 'cases:screening_review.batch.deselect_customer_hits'
      : 'cases:screening_review.batch.select_customer_hits',
  );
  return (
    <Card
      as="li"
      data-review-group={group.key}
      // A mouse shortcut: the keyboard moves the cursor with J and K, so the card takes no focus.
      onClick={(event) => {
        if (!ready || !onActivate) return;
        // Hits, Select all and the stack tags keep their own click.
        const control = event.target instanceof Element ? event.target.closest('button, label, a, input') : null;
        if (control && event.currentTarget.contains(control)) return;
        onActivate();
      }}
      className={cn(
        'flex min-w-0 flex-col gap-sm p-3',
        ready && onActivate && 'cursor-pointer',
        active && 'border-purple-primary',
      )}
    >
      <div
        data-review-group-header
        // Covers the card's padding, so hits scrolling under the stuck header stay hidden.
        className="sticky top-0 z-10 -mx-3 -mt-3 flex flex-col gap-xs rounded-t-md bg-surface-card px-3 pt-3"
      >
        <Typo as="h2" variant="subtitle2" className={cn('min-w-0', active && 'text-purple-primary')}>
          <bdi>{group.customer.name}</bdi>
        </Typo>
        <div className="flex min-w-0 items-center gap-xs">
          <CustomerTypeTag customer={group.customer} />
          {pendingIds.length > 1 ? (
            <label
              htmlFor={selectionId}
              className={cn(
                'ms-auto inline-flex shrink-0 items-center gap-xs text-s text-grey-secondary',
                ready ? 'cursor-pointer' : 'cursor-not-allowed',
              )}
            >
              <Checkbox
                id={selectionId}
                size="small"
                checked={hasSelected ? 'indeterminate' : false}
                disabled={!ready}
                aria-label={selectionLabel}
                onCheckedChange={() =>
                  onSelectionChange((current) =>
                    hasSelected
                      ? withoutSelected(
                          current,
                          group.items.map((item) => item.id),
                        )
                      : withSelected(current, pendingIds),
                  )
                }
              />
              <span className="whitespace-nowrap">{selectionLabel}</span>
              <ShortcutKeys hotkeys={[hasSelected ? 'Shift+A' : 'A']} variant="small" />
            </label>
          ) : null}
        </div>
        <p className="flex flex-wrap items-center gap-xs text-xs text-grey-secondary empty:hidden">
          {single ? null : (
            <>
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
            </>
          )}
          {group.setAside > 0 ? (
            <Tag color="grey" size="xs" className="ms-auto">
              {t('cases:screening_review.set_aside', { count: group.setAside })}
            </Tag>
          ) : null}
        </p>
      </div>
      <ul className="flex flex-col gap-xs">{children}</ul>
    </Card>
  );
}

/**
 * Several No hit hits stacked as one small card, with the cards behind it peeking out. It names no
 * hit: its tag shows them one by one.
 */
function NoHitStackCard({
  size,
  active,
  ready,
  onActivate,
  onUnstack,
}: {
  size: number;
  active: boolean;
  ready: boolean;
  onActivate: () => void;
  onUnstack: () => void;
}) {
  const { t } = useTranslation(['cases']);
  const layered = size > 2;
  const unstackLabel = t('cases:screening_review.stack.unstack', { count: size });
  return (
    <li data-review-hit className={cn('relative', layered ? 'pb-2' : 'pb-1')}>
      {layered ? <StackLayer className="inset-x-2 bottom-0" /> : null}
      <StackLayer className={cn('inset-x-1', layered ? 'bottom-1' : 'bottom-0')} />
      <div className="relative">
        <Card
          as="button"
          type="button"
          data-review-hit-card
          aria-current={active ? 'true' : undefined}
          aria-label={t('cases:screening_review.stack.label', { count: size })}
          disabled={!ready}
          onClick={onActivate}
          className={cn(
            'flex w-full min-w-0 cursor-pointer items-center gap-xs px-3 py-1.5 text-start focus-visible:outline-2 focus-visible:outline-purple-primary',
            active && 'border-purple-primary bg-purple-background-light',
          )}
        >
          <DecisionTag status="no_hit" />
          {/* Keeps room for the unstack button, which can't sit inside the card's button. */}
          <Tag size="xs" aria-hidden className="invisible ms-auto tabular-nums">
            ×{size}
          </Tag>
        </Card>
        <button
          type="button"
          aria-expanded={false}
          aria-keyshortcuts="+"
          aria-label={unstackLabel}
          title={unstackLabel}
          onClick={onUnstack}
          className="absolute inset-y-0 end-3 my-auto h-fit cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-purple-primary"
        >
          <Tag size="xs" className="tabular-nums">
            ×{size}
          </Tag>
        </button>
      </div>
    </li>
  );
}

/** One hit. A hit of a shown No hit stack has a − tag that stacks the group's No hit hits again. */
function HitCard({
  item,
  active,
  ready,
  selectable,
  selected,
  mappedProperties,
  restackSize,
  onActivate,
  onToggle,
  onRestack,
}: {
  item: ScreeningReviewItem;
  active: boolean;
  ready: boolean;
  selectable: boolean;
  selected: boolean;
  mappedProperties: MappedProperties;
  /** How many No hit hits the group stacks again, on one of them. */
  restackSize: number | undefined;
  onActivate: () => void;
  onToggle: () => void;
  onRestack: () => void;
}) {
  const { t } = useTranslation(['cases']);
  const restackLabel =
    restackSize === undefined ? undefined : t('cases:screening_review.stack.restack', { count: restackSize });
  return (
    <li data-review-hit className="group/hit relative">
      <Card
        as="button"
        type="button"
        data-review-hit-card
        aria-current={active ? 'true' : undefined}
        disabled={!ready}
        onClick={onActivate}
        className={cn(
          'relative flex w-full min-w-0 cursor-pointer flex-col gap-xs px-3 py-2.5 text-start text-small focus-visible:outline-2 focus-visible:outline-purple-primary',
          active && 'border-purple-primary bg-purple-background-light',
          selected && 'bg-purple-background-light',
        )}
      >
        <span className="flex w-full min-w-0 items-center gap-xs">
          <bdi className={cn('min-w-0 truncate', active && 'font-semibold text-purple-primary')}>
            {item.listRecord.caption || item.listRecord.id}
          </bdi>
          <TopicDots topics={item.topics} />
          <SimilarityScore score={item.score} />
          <span className="ms-auto">
            <DecisionTag status={item.status} />
          </span>
        </span>
        <span className="flex w-full flex-wrap items-center gap-xs empty:hidden">
          <MatchedFieldChips item={item} mappedProperties={mappedProperties} />
          {restackLabel ? (
            // Keeps room for the restack button, which can't sit inside the card's button.
            <Tag size="xs" aria-hidden className="invisible ms-auto">
              −
            </Tag>
          ) : null}
        </span>
      </Card>
      {restackLabel ? (
        <button
          type="button"
          aria-expanded
          aria-keyshortcuts="+ -"
          aria-label={restackLabel}
          title={restackLabel}
          onClick={onRestack}
          className="absolute end-3 bottom-2.5 cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-purple-primary"
        >
          <Tag size="xs">−</Tag>
        </button>
      ) : null}
      {selectable ? (
        // Overlaps the card's corner. Shown on hover or keyboard focus, and kept while checked.
        <Checkbox
          size="small"
          className="absolute -start-1.5 top-2.5 opacity-0 transition-opacity group-hover/hit:opacity-100 group-has-[:focus-visible]/hit:opacity-100 radix-state-checked:opacity-100"
          checked={selected}
          disabled={!ready}
          onCheckedChange={onToggle}
          aria-label={t('cases:screening_review.batch.select_hit', {
            name: item.listRecord.caption || item.listRecord.id,
          })}
        />
      ) : null}
    </li>
  );
}

/** A card edge behind a stacked card. */
function StackLayer({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={cn('absolute top-2 rounded-md border border-grey-border bg-surface-card', className)}
    />
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

/** Room kept between the active hit and the list's edges, or the stuck header. */
const REVEAL_GAP = 8;

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
}

/**
 * Scrolls the hit list to the active hit, and returns the group it belongs to. On a group's first
 * hit, or on entering another group, the whole group shows when it fits, else from its top. Inside a
 * group, the hit shows below the group's stuck header.
 */
function revealActiveHit(nav: HTMLElement, shownGroup: string | null) {
  const hit = nav.querySelector<HTMLElement>('[data-review-hit-card][aria-current="true"]');
  const group = hit?.closest<HTMLElement>('[data-review-group]');
  const header = group?.querySelector<HTMLElement>('[data-review-group-header]');
  if (!hit || !group || !header) return shownGroup;
  const groupKey = group.getAttribute('data-review-group');
  const entering = groupKey !== shownGroup || hit === group.querySelector('[data-review-hit-card]');

  const view = nav.getBoundingClientRect();
  const top = (element: HTMLElement) => element.getBoundingClientRect().top - view.top + nav.scrollTop;
  const bottom = (element: HTMLElement) => element.getBoundingClientRect().bottom - view.top + nav.scrollTop;
  const viewTop = nav.scrollTop;
  const viewBottom = viewTop + nav.clientHeight;
  const groupTop = top(group);
  const groupBottom = bottom(group);
  // The hit's whole <li>, so a stack's layers show too.
  const hitBox = hit.closest<HTMLElement>('[data-review-hit]') ?? hit;
  const hitTop = top(hitBox);
  const hitBottom = bottom(hitBox);

  let next = viewTop;
  if (entering && groupBottom - groupTop <= nav.clientHeight) {
    // The whole group, moving as little as possible.
    if (groupTop < viewTop) next = groupTop;
    else if (groupBottom > viewBottom) next = groupBottom - nav.clientHeight;
  } else if (entering && (groupTop > viewTop || hitBottom > viewBottom)) {
    // Taller than the list: from its top, unless the hit would fall below.
    next = hitBottom - groupTop + REVEAL_GAP <= nav.clientHeight ? groupTop : hitBottom + REVEAL_GAP - nav.clientHeight;
  } else {
    // Under the header, which sticks once the group's top scrolls away.
    const covered = header.offsetHeight + REVEAL_GAP;
    if (hitTop - covered < viewTop) next = Math.max(groupTop, hitTop - covered);
    else if (hitBottom + REVEAL_GAP > viewBottom) next = hitBottom + REVEAL_GAP - nav.clientHeight;
  }
  next = Math.max(0, Math.round(next));
  if (Math.abs(next - viewTop) >= 1) {
    nav.scrollTo({ top: next, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }
  return groupKey;
}

function TopicDots({ topics }: { topics: string[] }) {
  const { t } = useTranslation(['scenarios']);
  return (
    <span className="flex shrink-0 items-center gap-xs">
      {screeningReviewTopicFamilies(topics).map((family) => {
        const label = t(SCREENING_HIT_TYPE_T_KEYS[family]);
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
