import type { ScreeningReviewItem } from '@app-builder/models/screening-review';
import { useTranslation } from 'react-i18next';
import { Button, Typo } from 'ui-design-system';

/** Replaces the comparison view while hits are selected. */
export function BatchSummary({
  items,
  onDeselect,
}: {
  items: readonly ScreeningReviewItem[];
  onDeselect: (item: ScreeningReviewItem) => void;
}) {
  const { t } = useTranslation(['cases']);
  return (
    <section
      aria-label={t('cases:screening_review.batch.title', { count: items.length })}
      className="flex min-h-0 flex-1 flex-col gap-md overflow-hidden rounded-lg border border-grey-border bg-surface-card p-md"
    >
      <div className="flex flex-col gap-xs">
        <Typo as="h2" variant="title2">
          {t('cases:screening_review.batch.title', { count: items.length })}
        </Typo>
        <p className="text-s text-grey-secondary">{t('cases:screening_review.batch.description')}</p>
      </div>
      <ul className="flex min-h-0 flex-col gap-xs overflow-y-auto overscroll-y-contain">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex min-w-0 items-center gap-sm rounded-md border border-grey-border px-sm py-xs text-s"
          >
            <bdi className="min-w-0 truncate font-medium">{item.customer.name}</bdi>
            <span aria-hidden className="text-grey-secondary">
              ·
            </span>
            <bdi className="min-w-0 truncate">{item.listRecord.caption || item.listRecord.id}</bdi>
            <bdi className="shrink-0 text-2xs text-grey-secondary">{Math.round(item.score * 100)}%</bdi>
            <Button variant="secondary" size="small" className="ms-auto shrink-0" onClick={() => onDeselect(item)}>
              {t('cases:screening_review.batch.deselect')}
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
