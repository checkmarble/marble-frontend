import { useGetCasesQuery } from '@app-builder/queries/cases/get-cases';
import { forwardRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { ButtonV2, cn } from 'ui-design-system';
import { Icon } from 'ui-icons';

export type SuccessCasesQuery = ReturnType<typeof useGetCasesQuery> extends infer T
  ? T extends { isSuccess: true }
    ? T
    : never
  : never;

type PaginationRowProps = {
  casesQuery: SuccessCasesQuery;
  currentPage: number;
  currentLimit: number;
  setCurrentPage: (page: number) => void;
  setLimit: (limit: number) => void;
  className?: string;
};

export const PaginationRow = forwardRef<HTMLDivElement, PaginationRowProps>(
  ({ casesQuery, currentPage, currentLimit, setCurrentPage, setLimit, className }, ref) => {
    const { t } = useTranslation(['cases']);
    const pagesRanges = useMemo(() => {
      if (!casesQuery.data?.pages) return [];

      const pagesStartIndexes = R.pipe(
        casesQuery.data.pages,
        R.map((_, index) =>
          R.pipe(
            casesQuery.data.pages.slice(0, index),
            R.sumBy((page) => page?.items.length ?? 0),
          ),
        ),
      );

      return casesQuery.data.pages.map((page, index) => {
        if (!page || page.items.length === 0) {
          return {
            startIndex: 0,
            endIndex: 0,
          };
        }
        const startIndex = pagesStartIndexes[index] !== undefined ? pagesStartIndexes[index] + 1 : 0;
        const pageLength = page?.items.length !== undefined ? page?.items.length - 1 : 0;

        return {
          startIndex: startIndex,
          endIndex: startIndex + pageLength,
        };
      });
    }, [casesQuery.data?.pages]);

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-between sticky bottom-0 bg-white -mx-v2-lg -mb-v2-lg pt-v2-md px-v2-lg pb-v2-lg border-t border-transparent',
          className,
        )}
      >
        <div className="flex items-center gap-v2-xs">
          <span>{t('cases:list.results_per_page')}</span>
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
          {casesQuery.isFetchingNextPage ? (
            <span>Loading...</span>
          ) : pagesRanges[currentPage] ? (
            <span>
              From {pagesRanges[currentPage].startIndex} to {pagesRanges[currentPage].endIndex}
            </span>
          ) : null}
          <ButtonV2
            mode="icon"
            size="default"
            variant="secondary"
            appearance="stroked"
            disabled={currentPage === 0}
            onClick={() => {
              setCurrentPage(currentPage - 1);
            }}
          >
            <Icon icon="arrow-left" className="size-5" />
          </ButtonV2>
          <ButtonV2
            mode="icon"
            size="default"
            variant="secondary"
            appearance="stroked"
            disabled={
              (currentPage === casesQuery.data.pages.length - 1 && !casesQuery.hasNextPage) ||
              casesQuery.isFetchingNextPage
            }
            onClick={() => {
              if (currentPage === casesQuery.data.pages.length - 1) {
                casesQuery.fetchNextPage();
              }
              setCurrentPage(currentPage + 1);
            }}
          >
            <Icon icon="arrow-right" className="size-5" />
          </ButtonV2>
        </div>
      </div>
    );
  },
);
PaginationRow.displayName = 'PaginationRow';
