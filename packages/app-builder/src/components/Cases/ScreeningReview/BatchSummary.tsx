import { TopicsDisplay } from '@app-builder/components/Screenings/TopicsDisplay';
import type { ScreeningReviewItem } from '@app-builder/models/screening-review';
import type { ReactNode, Ref } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Checkbox, Typo } from 'ui-design-system';
import { BatchDock, DecisionTag } from './ActionDock';
import {
  type BatchSelection,
  emptyBatchSelection,
  sharedBatchComment,
  withBatchComment,
  withoutSelected,
} from './batch-selection';
import { MatchedFieldChips, useMappedProperties } from './MatchedFieldChips';
import { listRecordAliasCount, SchemaTag, SimilarityScore, useListRecordListTitles } from './ScreeningReviewHit';

/** Replaces the comparison view while hits are selected: the selected hits, then No hit for all of them. */
export function BatchPanel({
  items,
  selection,
  onSelectionChange,
  onSubmit,
  commentRef,
}: {
  /** The selected hits that are still pending. */
  items: readonly ScreeningReviewItem[];
  selection: BatchSelection;
  onSelectionChange: (update: (current: BatchSelection) => BatchSelection) => void;
  onSubmit: () => void;
  commentRef: Ref<HTMLTextAreaElement>;
}) {
  const comment = sharedBatchComment(selection);
  return (
    <div className="flex min-h-0 min-w-0 flex-col gap-md">
      <BatchSummary
        items={items}
        // Each hit shows the comment it keeps when they differ.
        comments={comment === undefined ? selection : undefined}
        onDeselect={(item) => onSelectionChange((current) => withoutSelected(current, [item.id]))}
      />
      <BatchDock
        count={items.length}
        comment={comment ?? ''}
        mixedComments={comment === undefined}
        onCommentChange={(next) => onSelectionChange((current) => withBatchComment(current, next))}
        onSubmit={onSubmit}
        onClear={() => onSelectionChange(() => emptyBatchSelection)}
        commentRef={commentRef}
      />
    </div>
  );
}

function BatchSummary({
  items,
  comments,
  onDeselect,
}: {
  items: readonly ScreeningReviewItem[];
  comments: BatchSelection | undefined;
  onDeselect: (item: ScreeningReviewItem) => void;
}) {
  const mappedProperties = useMappedProperties();
  const { t } = useTranslation(['cases']);
  return (
    <HitSummary
      title={t('cases:screening_review.batch.title', { count: items.length })}
      description={t('cases:screening_review.batch.description')}
    >
      {items.map((item) => {
        const name = item.listRecord.caption || item.listRecord.id;
        return (
          <HitSummaryRow
            key={item.id}
            item={item}
            comment={comments?.get(item.id)?.trim()}
            start={
              <Checkbox
                size="small"
                checked
                onCheckedChange={() => onDeselect(item)}
                aria-label={t('cases:screening_review.batch.deselect_hit', { name })}
              />
            }
            end={<MatchedFieldChips item={item} mappedProperties={mappedProperties} />}
          />
        );
      })}
    </HitSummary>
  );
}

/** Replaces the comparison view while a No hit stack is under the cursor: its hits, each with its decision. */
export function NoHitStackSummary({
  items,
  children,
}: {
  items: readonly ScreeningReviewItem[];
  /** What happens next for their screenings. */
  children?: ReactNode;
}) {
  const { t } = useTranslation(['cases']);
  return (
    <div className="flex min-h-0 min-w-0 flex-col gap-md">
      <HitSummary
        title={t('cases:screening_review.stack.label', { count: items.length })}
        description={t('cases:screening_review.stack.description')}
      >
        {items.map((item) => (
          <HitSummaryRow key={item.id} item={item} end={<DecisionTag status={item.status} />} />
        ))}
      </HitSummary>
      {children ? <Card className="flex shrink-0 flex-col gap-sm p-md">{children}</Card> : null}
    </div>
  );
}

function HitSummary({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    // Sized to its hits: the list scrolls only once they overflow the column.
    <Card as="section" aria-label={title} className="flex min-h-0 flex-col gap-md overflow-hidden p-md">
      <div className="flex flex-col gap-xs">
        <Typo as="h2" variant="title2">
          {title}
        </Typo>
        <p className="text-s text-grey-secondary">{description}</p>
      </div>
      <ul className="flex min-h-0 flex-col gap-xs overflow-x-hidden overflow-y-auto overscroll-y-contain">
        {children}
      </ul>
    </Card>
  );
}

/** One hit of a summary: its list record, between `start` and `end`. */
function HitSummaryRow({
  item,
  comment,
  start,
  end,
}: {
  item: ScreeningReviewItem;
  comment?: string;
  start?: ReactNode;
  end: ReactNode;
}) {
  const { t } = useTranslation(['cases']);
  const name = item.listRecord.caption || item.listRecord.id;
  const aliases = listRecordAliasCount(item);
  const lists = useListRecordListTitles(item.listRecord.datasets ?? []);
  const details = [...(aliases ? [t('cases:screening_review.aliases_count', { count: aliases })] : []), ...lists];
  return (
    <Card as="li" className="flex min-w-0 items-center gap-sm px-md py-sm">
      {start}
      <div className="flex min-w-0 flex-1 flex-col gap-xs">
        <div className="flex min-w-0 flex-wrap items-center gap-sm">
          <Typo variant="subtitle1" className="min-w-0 truncate">
            <bdi>{name}</bdi>
          </Typo>
          <SchemaTag schema={item.listRecord.schema} />
          <TopicsDisplay entity={{ id: item.listRecord.id, properties: { topics: item.topics } }} />
          <SimilarityScore score={item.score} />
        </div>
        {details.length ? <p className="truncate text-xs text-grey-secondary">{details.join(' · ')}</p> : null}
        {comment ? (
          <p className="truncate text-xs text-grey-secondary">
            {t('cases:screening_review.batch.hit_comment', { comment })}
          </p>
        ) : null}
      </div>
      {end}
    </Card>
  );
}
