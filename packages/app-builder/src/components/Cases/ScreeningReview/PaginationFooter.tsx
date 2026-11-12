import { Page } from '@app-builder/components/Page';
import { useTranslation } from 'react-i18next';
import { Button, cn } from 'ui-design-system';

export type ScreeningReviewPageSize = 25 | 50 | 100;

/** Page size, then Previous and Next through the cursors. */
export function PaginationFooter({
  limit,
  cursors,
  nextCursor,
  count,
  isFetching,
  onChange,
}: {
  limit: ScreeningReviewPageSize;
  cursors: readonly string[];
  /** Undefined when there is no next page, or it can't be opened yet. */
  nextCursor: string | undefined;
  /** Hits listed on this page. */
  count: number;
  isFetching: boolean;
  onChange: (limit: ScreeningReviewPageSize, cursors: string[]) => void;
}) {
  const { t } = useTranslation(['cases']);
  return (
    <Page.StickyFooter className="mt-auto shrink-0 flex-wrap gap-md">
      <div className="flex flex-wrap items-center gap-xs">
        <span>{t('cases:screening_review.hits_per_page')}</span>
        {([25, 50, 100] as const).map((size) => (
          <Button
            key={size}
            variant="secondary"
            aria-pressed={limit === size}
            className={cn(limit === size && 'border-purple-primary text-purple-primary')}
            onClick={() => onChange(size, [])}
          >
            {size}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-sm">
        <span role="status" className="text-s text-grey-secondary">
          {isFetching
            ? t('cases:screening_review.loading')
            : t('cases:screening_review.page_count', { count, page: cursors.length + 1 })}
        </span>
        <Button
          variant="secondary"
          disabled={!cursors.length || isFetching}
          onClick={() => onChange(limit, cursors.slice(0, -1))}
        >
          {t('cases:screening_review.previous_page')}
        </Button>
        <Button
          variant="secondary"
          disabled={!nextCursor || isFetching}
          onClick={() => {
            if (nextCursor) onChange(limit, [...cursors, nextCursor]);
          }}
        >
          {t('cases:screening_review.next_page')}
        </Button>
      </div>
    </Page.StickyFooter>
  );
}
