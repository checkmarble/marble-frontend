import { type FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonV2, cn } from 'ui-design-system';
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
        'flex items-center justify-between sticky bottom-0 bg-white -mx-v2-lg -mb-v2-lg pt-v2-md px-v2-lg pb-v2-lg border-t border-transparent',
        className,
      )}
    >
      <div className="flex items-center gap-v2-xs">
        <span>{t('settings:activity_follow_up.pagination.per_page')}</span>
        {[25, 50, 100].map((limit) => {
          const isActive = limit === currentLimit;

          return (
            <ButtonV2
              variant="secondary"
              appearance="stroked"
              size="default"
              key={`pagination-limit-${limit}`}
              className={cn(isActive && 'border-purple-65 text-purple-65')}
              onClick={() => {
                if (!isActive) {
                  setLimit(limit);
                }
              }}
            >
              {limit}
            </ButtonV2>
          );
        })}
      </div>
      <div className="flex items-center gap-v2-xs">
        <ButtonV2
          mode="icon"
          size="default"
          variant="secondary"
          appearance="stroked"
          disabled={!hasPreviousPage}
          onClick={onPreviousPage}
        >
          <Icon icon="arrow-left" className="size-5" />
        </ButtonV2>
        <ButtonV2
          mode="icon"
          size="default"
          variant="secondary"
          appearance="stroked"
          disabled={!hasNextPage}
          onClick={onNextPage}
        >
          <Icon icon="arrow-right" className="size-5" />
        </ButtonV2>
      </div>
    </div>
  );
};
