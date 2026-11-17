import { SCREENING_CATEGORY_I18N_KEY_MAP, type ScreeningCategory } from '@app-builder/models/screening';
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
import { CustomerTypeTag } from './ScreeningReviewHit';
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
}: {
  groups: readonly ScreeningReviewGroup[];
  activeId: string | undefined;
  ready: boolean;
  selection: BatchSelection;
  onSelectionChange: SelectionUpdate;
  /** The groups whose No hit hits show one card each. */
  expanded: ReadonlySet<string>;
  onToggleNoHitStack: (groupKey: string) => void;
  onActivate: (item: ScreeningReviewItem) => void;
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
    const items = entry.kind === 'hit' ? [entry.item] : entry.items;
    const item = items.find((member) => member.id === activeId) ?? screeningReviewCardLead(entry);
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
        stack={
          entry.kind === 'no_hit_stack'
            ? { size: entry.items.length, stacked: true }
            : item.status === 'no_hit' && noHitCount > 1
              ? { size: noHitCount, stacked: false }
              : undefined
        }
        onActivate={() => onActivate(item)}
        onToggle={() =>
          onSelectionChange((current) =>
            selection.has(item.id) ? withoutSelected(current, [item.id]) : withSelected(current, [item.id]),
          )
        }
        onToggleStack={() => onToggleNoHitStack(group.key)}
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
        {groups.map((group) => (
          <CaseGroup
            key={group.key}
            group={group}
            active={group.items.some((item) => item.id === activeId)}
            ready={ready}
            selection={selection}
            onSelectionChange={onSelectionChange}
          >
            {screeningReviewCards(group, expanded).map((entry) => card(group, entry))}
          </CaseGroup>
        ))}
      </ul>
    </nav>
  );
}

/** One customer's hits in one case. Its header sticks to the top of the list while its hits scroll. */
function CaseGroup({
  group,
  active,
  ready,
  selection,
  onSelectionChange,
  children,
}: {
  group: ScreeningReviewGroup;
  /** Holds the hit under the cursor. */
  active: boolean;
  ready: boolean;
  selection: BatchSelection;
  onSelectionChange: SelectionUpdate;
  children: React.ReactNode;
}) {
  const { t } = useTranslation(['cases']);
  const selectionId = useId();
  const pendingIds = group.items.filter(isPendingReviewItem).map((item) => item.id);
  const selectedCount = pendingIds.filter((id) => selection.has(id)).length;
  const hasSelected = selectedCount > 0;
  const selectionLabel = t(
    hasSelected
      ? 'cases:screening_review.batch.deselect_customer_hits'
      : 'cases:screening_review.batch.select_customer_hits',
  );
  return (
    <Card
      as="li"
      data-review-group={group.key}
      className={cn('flex min-w-0 flex-col gap-sm p-3', active && 'border-purple-primary')}
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
          {pendingIds.length > 0 ? (
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
        <p className="flex flex-wrap items-center gap-xs text-xs text-grey-secondary">
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
 * One hit. A No hit stack shows its first hit with the cards behind it peeking out, and its tag
 * shows the stack's hits one by one. Their tag stacks them again.
 */
function HitCard({
  item,
  active,
  ready,
  selectable,
  selected,
  mappedProperties,
  stack,
  onActivate,
  onToggle,
  onToggleStack,
}: {
  item: ScreeningReviewItem;
  active: boolean;
  ready: boolean;
  selectable: boolean;
  selected: boolean;
  mappedProperties: MappedProperties;
  /** The group's No hit hits, when there are several. */
  stack: { size: number; stacked: boolean } | undefined;
  onActivate: () => void;
  onToggle: () => void;
  onToggleStack: () => void;
}) {
  const { t } = useTranslation(['cases']);
  const showLayers = !!stack?.stacked;
  const stackLabel = stack ? (stack.stacked ? `×${stack.size}` : '−') : undefined;
  const layered = showLayers && stack.size > 2;
  return (
    <li data-review-hit className={cn('group/hit relative', showLayers && (layered ? 'pb-2' : 'pb-1'))}>
      {showLayers ? (
        <>
          {layered ? <StackLayer className="inset-x-2 bottom-0" /> : null}
          <StackLayer className={cn('inset-x-1', layered ? 'bottom-1' : 'bottom-0')} />
        </>
      ) : null}
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
          <bdi className="shrink-0 text-2xs text-grey-secondary">{Math.round(item.score * 100)}%</bdi>
          <span className="ms-auto">
            <DecisionTag status={item.status} />
          </span>
        </span>
        <span className="flex w-full flex-wrap items-center gap-xs empty:hidden">
          <MatchedFieldChips item={item} mappedProperties={mappedProperties} />
          {stackLabel ? (
            // Keeps room for the stack button, which can't sit inside the card's button.
            <Tag size="xs" aria-hidden className="invisible ms-auto tabular-nums">
              {stackLabel}
            </Tag>
          ) : null}
        </span>
      </Card>
      {stack && stackLabel ? (
        <button
          type="button"
          aria-expanded={!stack.stacked}
          aria-keyshortcuts={stack.stacked ? '+' : '+ -'}
          aria-label={t(
            stack.stacked ? 'cases:screening_review.stack.unstack' : 'cases:screening_review.stack.restack',
            {
              count: stack.size,
            },
          )}
          title={t(stack.stacked ? 'cases:screening_review.stack.unstack' : 'cases:screening_review.stack.restack', {
            count: stack.size,
          })}
          onClick={onToggleStack}
          className={cn(
            'absolute end-3 cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-purple-primary',
            // Level with the card's bottom row, above the layers' padding.
            showLayers ? (layered ? 'bottom-4.5' : 'bottom-3.5') : 'bottom-2.5',
          )}
        >
          <Tag size="xs" className="tabular-nums">
            {stackLabel}
          </Tag>
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
