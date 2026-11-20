import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

/** The end of the hit list: appends the next cases and their hits, below the ones on screen. */
export function LoadMoreCases({
  onLoadMore,
  loading,
  disabled,
}: {
  onLoadMore: () => void;
  /** The next hits are on their way. */
  loading: boolean;
  disabled: boolean;
}) {
  const { t } = useTranslation(['cases']);
  return (
    <div className="flex justify-center py-sm">
      <Button variant="secondary" disabled={disabled || loading} onClick={onLoadMore}>
        {loading ? <Icon icon="spinner" aria-hidden className="size-4 animate-spin" /> : null}
        {t('cases:screening_review.load_more_cases')}
      </Button>
    </div>
  );
}
