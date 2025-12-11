import { useTranslation } from 'react-i18next';
import { ButtonV2, cn } from 'ui-design-system';
import { Icon } from 'ui-icons';

type PaginationRowProps = {
  totalItems: number;
  currentPage: number;
  currentLimit: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  setLimit: (limit: number) => void;
  className?: string;
};

export const PaginationRow = ({
  totalItems,
  currentPage,
  currentLimit,
  totalPages,
  setCurrentPage,
  setLimit,
  className,
}: PaginationRowProps) => {
  const { t } = useTranslation(['settings']);

  const startIndex = totalItems > 0 ? currentPage * currentLimit + 1 : 0;
  const endIndex = Math.min((currentPage + 1) * currentLimit, totalItems);

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
        {totalItems > 0 && (
          <span>
            From {startIndex} to {endIndex}
          </span>
        )}
        <ButtonV2
          mode="icon"
          size="default"
          variant="secondary"
          appearance="stroked"
          disabled={currentPage === 0}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          <Icon icon="arrow-left" className="size-5" />
        </ButtonV2>
        <ButtonV2
          mode="icon"
          size="default"
          variant="secondary"
          appearance="stroked"
          disabled={currentPage >= totalPages - 1 || totalItems === 0}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          <Icon icon="arrow-right" className="size-5" />
        </ButtonV2>
      </div>
    </div>
  );
};
