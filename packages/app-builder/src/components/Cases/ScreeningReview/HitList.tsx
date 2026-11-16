import { SCREENING_CATEGORY_I18N_KEY_MAP, type ScreeningCategory } from '@app-builder/models/screening';
import {
  isPendingReviewItem,
  type ScreeningReviewGroup,
  type ScreeningReviewItem,
  type ScreeningReviewSession,
  screeningReviewStackKey,
  screeningReviewStackLead,
  screeningReviewTopicFamilies,
  stackScreeningReviewItems,
} from '@app-builder/models/screening-review';
import { type Ref, useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Checkbox, cn, Tag, Typo } from 'ui-design-system';
import { DecisionTag } from './ActionDock';
import { type BatchSelection, withoutSelected, withSelected } from './batch-selection';
import { type MappedProperties, MatchedFieldChips, useMappedProperties } from './MatchedFieldChips';
import { CustomerTypeTag } from './ScreeningReviewHit';
import { ShortcutKeys } from './ShortcutHelp';

type SelectionUpdate = (update: (current: BatchSelection) => BatchSelection) => void;

/** The page's hits, grouped by customer. Clicking a card moves the cursor; checkboxes select for a batch. */
export function HitList({
  groups,
  reviewItems,
  session,
  activeId,
  activeRef,
  ready,
  selection,
  onSelectionChange,
  unstacked,
  onToggleStack,
  onActivate,
}: {
  groups: readonly ScreeningReviewGroup[];
  /** Every hit of the page, to tell what each screening needs besides a decision. */
  reviewItems: readonly ScreeningReviewItem[];
  session: ScreeningReviewSession;
  activeId: string | undefined;
  activeRef: Ref<HTMLButtonElement>;
  ready: boolean;
  selection: BatchSelection;
  onSelectionChange: SelectionUpdate;
  /** The keys of the stacks shown as one card per hit. */
  unstacked: ReadonlySet<string>;
  onToggleStack: (key: string) => void;
  onActivate: (item: ScreeningReviewItem) => void;
}) {
  const { t } = useTranslation(['cases']);
  const mappedProperties = useMappedProperties();
  /** One card for `items`: a whole stack, or one hit of an unstacked stack. */
  const card = (items: readonly ScreeningReviewItem[], stack: readonly ScreeningReviewItem[], key: string) => {
    const item = items.find((member) => member.id === activeId) ?? screeningReviewStackLead(items)!;
    const pendingIds = items.filter(isPendingReviewItem).map((member) => member.id);
    const selectedCount = pendingIds.filter((id) => selection.has(id)).length;
    const allSelected = pendingIds.length > 0 && selectedCount === pendingIds.length;
    return (
      <HitCard
        key={items.length > 1 ? key : item.id}
        item={item}
        stackSize={stack.length}
        stacked={items.length > 1}
        active={item.id === activeId}
        activeRef={activeRef}
        ready={ready}
        selectable={pendingIds.length > 0}
        selected={allSelected ? true : selectedCount > 0 ? 'indeterminate' : false}
        mappedProperties={mappedProperties}
        onActivate={() => onActivate(item)}
        onToggle={() =>
          onSelectionChange((current) =>
            allSelected ? withoutSelected(current, pendingIds) : withSelected(current, pendingIds),
          )
        }
        onToggleStack={() => onToggleStack(key)}
      />
    );
  };
  return (
    <nav
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
          <CustomerGroup
            key={group.key}
            group={group}
            active={group.items.some((item) => item.id === activeId)}
            ready={ready}
            selection={selection}
            onSelectionChange={onSelectionChange}
          >
            {stackScreeningReviewItems(group.items).flatMap((stack) => {
              const key = screeningReviewStackKey(stack[0]!);
              return unstacked.has(key) ? stack.map((item) => card([item], stack, key)) : [card(stack, stack, key)];
            })}
          </CustomerGroup>
        ))}
      </ul>
    </nav>
  );
}

function CustomerGroup({
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
    <Card as="li" className={cn('flex min-w-0 flex-col gap-sm p-3', active && 'border-purple-primary')}>
      <div className="flex flex-col gap-xs">
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
      <ul className="flex flex-col gap-xs">{children}</ul>
    </Card>
  );
}

/**
 * One card: a whole stack, with the cards behind it peeking out when it holds several hits, or one
 * hit of an unstacked stack. A stack's tag unstacks it, and an unstacked hit's tag stacks it again.
 */
function HitCard({
  item,
  stackSize,
  stacked,
  active,
  activeRef,
  ready,
  selectable,
  selected,
  mappedProperties,
  onActivate,
  onToggle,
  onToggleStack,
}: {
  item: ScreeningReviewItem;
  stackSize: number;
  stacked: boolean;
  active: boolean;
  activeRef: Ref<HTMLButtonElement>;
  ready: boolean;
  selectable: boolean;
  selected: boolean | 'indeterminate';
  mappedProperties: MappedProperties;
  onActivate: () => void;
  onToggle: () => void;
  onToggleStack: () => void;
}) {
  const { t } = useTranslation(['cases']);
  const hasStack = stackSize > 1;
  const showLayers = hasStack && stacked;
  const stackLabel = hasStack ? (stacked ? `×${stackSize}` : '−') : undefined;
  return (
    <li className={cn('group/hit relative', showLayers && (stackSize > 2 ? 'pb-2' : 'pb-1'))}>
      {showLayers ? (
        <>
          {stackSize > 2 ? <StackLayer className="inset-x-2 bottom-0" /> : null}
          <StackLayer className={cn('inset-x-1', stackSize > 2 ? 'bottom-1' : 'bottom-0')} />
        </>
      ) : null}
      <Card
        as="button"
        type="button"
        data-review-hit-card
        ref={active ? activeRef : undefined}
        aria-current={active ? 'true' : undefined}
        disabled={!ready}
        onClick={onActivate}
        className={cn(
          'relative flex w-full min-w-0 scroll-my-sm cursor-pointer flex-col gap-xs px-3 py-2.5 text-start text-small focus-visible:outline-2 focus-visible:outline-purple-primary',
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
      {stackLabel ? (
        <button
          type="button"
          aria-expanded={!stacked}
          aria-keyshortcuts={stacked ? '+' : '+ -'}
          aria-label={t(stacked ? 'cases:screening_review.stack.unstack' : 'cases:screening_review.stack.restack', {
            count: stackSize,
          })}
          title={t(stacked ? 'cases:screening_review.stack.unstack' : 'cases:screening_review.stack.restack', {
            count: stackSize,
          })}
          onClick={onToggleStack}
          className={cn(
            'absolute end-3 cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-purple-primary',
            // Level with the card's bottom row, above the layers' padding.
            showLayers ? (stackSize > 2 ? 'bottom-4.5' : 'bottom-3.5') : 'bottom-2.5',
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
          className="absolute -start-1.5 top-2.5 opacity-0 transition-opacity group-hover/hit:opacity-100 group-has-[:focus-visible]/hit:opacity-100 radix-state-checked:opacity-100 radix-state-indeterminate:opacity-100"
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
