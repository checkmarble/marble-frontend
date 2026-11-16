import { TopicsDisplay } from '@app-builder/components/Screenings/TopicsDisplay';
import { type ScreeningReviewItem, stackScreeningReviewItems } from '@app-builder/models/screening-review';
import type { Ref } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Checkbox, Tag, Typo } from 'ui-design-system';
import { BatchDock } from './ActionDock';
import {
  type BatchSelection,
  emptyBatchSelection,
  sharedBatchComment,
  withBatchComment,
  withoutSelected,
} from './batch-selection';
import { type MappedProperties, MatchedFieldChips, useMappedProperties } from './MatchedFieldChips';
import { listRecordAliasCount, SchemaTag, useListRecordListTitles } from './ScreeningReviewHit';

/** Replaces the comparison view while hits are selected: the selected hits, then No hit for all of them. */
export function BatchPanel({
  items,
  unstacked,
  selection,
  onSelectionChange,
  onSubmit,
  commentRef,
}: {
  /** The selected hits that are still pending. */
  items: readonly ScreeningReviewItem[];
  /** The stacks the list shows as one card per hit. */
  unstacked: ReadonlySet<string>;
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
        unstacked={unstacked}
        // Each hit shows the comment it keeps when they differ.
        comments={comment === undefined ? selection : undefined}
        onDeselect={(stack) =>
          onSelectionChange((current) =>
            withoutSelected(
              current,
              stack.map((item) => item.id),
            ),
          )
        }
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
  unstacked,
  comments,
  onDeselect,
}: {
  items: readonly ScreeningReviewItem[];
  unstacked: ReadonlySet<string>;
  comments: BatchSelection | undefined;
  onDeselect: (stack: readonly ScreeningReviewItem[]) => void;
}) {
  const mappedProperties = useMappedProperties();
  const { t } = useTranslation(['cases']);
  return (
    <Card
      as="section"
      aria-label={t('cases:screening_review.batch.title', { count: items.length })}
      className="flex min-h-0 flex-1 flex-col gap-md overflow-hidden p-md"
    >
      <div className="flex flex-col gap-xs">
        <Typo as="h2" variant="title2">
          {t('cases:screening_review.batch.title', { count: items.length })}
        </Typo>
        <p className="text-s text-grey-secondary">{t('cases:screening_review.batch.description')}</p>
      </div>
      <ul className="flex min-h-0 flex-col gap-xs overflow-y-auto overscroll-y-contain">
        {stackScreeningReviewItems(items, unstacked).map((stack) => (
          <BatchSummaryRow
            key={stack[0]!.id}
            stack={stack}
            comment={comments?.get(stack[0]!.id)?.trim()}
            mappedProperties={mappedProperties}
            onDeselect={onDeselect}
          />
        ))}
      </ul>
    </Card>
  );
}

/** One selected stack: its first hit, with how many hits the stack holds. */
function BatchSummaryRow({
  stack,
  comment,
  mappedProperties,
  onDeselect,
}: {
  stack: readonly ScreeningReviewItem[];
  comment: string | undefined;
  mappedProperties: MappedProperties;
  onDeselect: (stack: readonly ScreeningReviewItem[]) => void;
}) {
  const { t } = useTranslation(['cases']);
  const item = stack[0]!;
  const name = item.listRecord.caption || item.listRecord.id;
  const aliases = listRecordAliasCount(item);
  const lists = useListRecordListTitles(item.listRecord.datasets ?? []);
  const details = [...(aliases ? [t('cases:screening_review.aliases_count', { count: aliases })] : []), ...lists];
  return (
    <Card as="li" className="flex min-w-0 items-center gap-sm px-md py-sm">
      <Checkbox
        size="small"
        checked
        onCheckedChange={() => onDeselect(stack)}
        aria-label={t('cases:screening_review.batch.deselect_hit', { name })}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-xs">
        <div className="flex min-w-0 flex-wrap items-center gap-sm">
          <Typo variant="subtitle1" className="min-w-0 truncate">
            <bdi>{name}</bdi>
          </Typo>
          <SchemaTag schema={item.listRecord.schema} />
          <TopicsDisplay entity={{ id: item.listRecord.id, properties: { topics: item.topics } }} />
          <bdi className="shrink-0 text-xs text-grey-secondary">{Math.round(item.score * 100)}%</bdi>
          {stack.length > 1 ? (
            <Tag size="xs" className="tabular-nums">
              <span aria-hidden>×{stack.length}</span>
              <span className="sr-only">{t('cases:screening_review.stack.count', { count: stack.length })}</span>
            </Tag>
          ) : null}
        </div>
        {details.length ? <p className="truncate text-xs text-grey-secondary">{details.join(' · ')}</p> : null}
        {comment ? (
          <p className="truncate text-xs text-grey-secondary">
            {t('cases:screening_review.batch.hit_comment', { comment })}
          </p>
        ) : null}
      </div>
      <MatchedFieldChips item={item} mappedProperties={mappedProperties} />
    </Card>
  );
}
