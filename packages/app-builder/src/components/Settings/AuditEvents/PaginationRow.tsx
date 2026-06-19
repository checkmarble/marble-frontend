import { type FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, cn } from 'ui-design-system';
import { Icon } from 'ui-icons';

type PaginationRowProps = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  currentLimit: number;
  onNextPage: () => void;
  onPreviousPage: () => void;
  setLimit: (limit: number) => void;
  className?: string;
};

export const PaginationRow: FunctionComponent<PaginationRowProps> = ({
  hasNextPage,
  hasPreviousPage,
  currentLimit,
  onNextPage,
  onPreviousPage,
  setLimit,
  className,
}) => {
  const { t } = useTranslation(['settings']);

  return (
    <div
      className={cn(
        'flex items-center justify-between sticky bottom-0 bg-surface-card -mx-md md:-mx-lg lg:-mx-2xl -mb-md md:-mb-lg lg:-mb-lg pt-md px-md md:px-lg lg:px-2xl pb-md md:pb-lg lg:pb-lg border-t border-transparent',
        className,
      )}
    >
      <div className="flex items-center gap-xs">
        <span>{t('settings:audit.pagination.per_page')}</span>
        {[25, 50, 100].map((limit) => {
          const isActive = limit === currentLimit;

          return (
            <Button
              variant="secondary"
              appearance="stroked"
              size="medium"
              key={`pagination-limit-${limit}`}
              className={cn(isActive && 'border-purple-primary text-purple-primary')}
              onClick={() => {
                if (!isActive) {
                  setLimit(limit);
                }
              }}
            >
              {limit}
            </Button>
          );
        })}
      </div>
      <div className="flex items-center gap-xs">
        <Button
          mode="icon"
          size="medium"
          variant="secondary"
          appearance="stroked"
          disabled={!hasPreviousPage}
          onClick={onPreviousPage}
        >
          <Icon icon="arrow-left" className="size-5" />
        </Button>
        <Button
          mode="icon"
          size="medium"
          variant="secondary"
          appearance="stroked"
          disabled={!hasNextPage}
          onClick={onNextPage}
        >
          <Icon icon="arrow-right" className="size-5" />
        </Button>
      </div>
    </div>
  );
};
