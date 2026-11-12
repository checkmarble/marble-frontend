import { SCREENING_CATEGORY_I18N_KEY_MAP, type ScreeningCategory } from '@app-builder/models/screening';
import {
  isPendingReviewItem,
  type ScreeningReviewGroup,
  type ScreeningReviewItem,
  type ScreeningReviewScreeningState,
  type ScreeningReviewSession,
  screeningReviewScreeningState,
  screeningReviewTopicFamilies,
} from '@app-builder/models/screening-review';
import { type Ref, useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Checkbox, cn, Tag, Typo } from 'ui-design-system';
import { DecisionTag, OpenCaseLink } from './ActionDock';
import { type BatchSelection, toggleSelected, withoutSelected, withSelected } from './batch-selection';
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
  onActivate: (item: ScreeningReviewItem) => void;
}) {
  const { t } = useTranslation(['cases']);
  const mappedProperties = useMappedProperties();
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
            notes={<GroupScreeningNotes items={reviewItems} listed={group.items} session={session} />}
            ready={ready}
            selection={selection}
            onSelectionChange={onSelectionChange}
          >
            {group.items.map((item) => (
              <HitCard
                key={item.id}
                item={item}
                active={item.id === activeId}
                activeRef={activeRef}
                ready={ready}
                selected={selection.has(item.id)}
                mappedProperties={mappedProperties}
                onActivate={() => onActivate(item)}
                onToggle={() => onSelectionChange((current) => toggleSelected(current, item.id))}
              />
            ))}
          </CustomerGroup>
        ))}
      </ul>
    </nav>
  );
}

function CustomerGroup({
  group,
  active,
  notes,
  ready,
  selection,
  onSelectionChange,
  children,
}: {
  group: ScreeningReviewGroup;
  /** Holds the hit under the cursor. */
  active: boolean;
  notes: React.ReactNode;
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
    <Card as="li" className="flex min-w-0 flex-col gap-sm p-3">
      <div className="flex flex-col gap-xs">
        <div className="flex min-w-0 items-center gap-xs">
          <Typo as="h2" variant="subtitle2" className={cn('min-w-0 truncate', active && 'text-purple-primary')}>
            <bdi>{group.customer.name}</bdi>
          </Typo>
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
        {notes}
      </div>
      <ul className="flex flex-col gap-xs">{children}</ul>
    </Card>
  );
}

function HitCard({
  item,
  active,
  activeRef,
  ready,
  selected,
  mappedProperties,
  onActivate,
  onToggle,
}: {
  item: ScreeningReviewItem;
  active: boolean;
  activeRef: Ref<HTMLButtonElement>;
  ready: boolean;
  selected: boolean;
  mappedProperties: MappedProperties;
  onActivate: () => void;
  onToggle: () => void;
}) {
  const { t } = useTranslation(['cases']);
  return (
    <li className="group/hit relative">
      <Card
        as="button"
        type="button"
        data-review-hit-card
        ref={active ? activeRef : undefined}
        aria-current={active ? 'true' : undefined}
        disabled={!ready}
        onClick={onActivate}
        className={cn(
          'flex w-full min-w-0 scroll-my-sm cursor-pointer flex-col gap-xs px-3 py-2.5 text-start text-small focus-visible:outline-2 focus-visible:outline-purple-primary',
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
        </span>
        <span className="flex flex-wrap items-center gap-xs empty:hidden">
          <DecisionTag status={item.status} />
          <MatchedFieldChips item={item} mappedProperties={mappedProperties} />
        </span>
      </Card>
      {isPendingReviewItem(item) ? (
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
