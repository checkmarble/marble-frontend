import { type PaginatedResponse, type PaginationParams } from '@app-builder/models/pagination';
import { formatNumber, useFormatLanguage } from '@app-builder/utils/format';
import { type Table } from '@tanstack/react-table';
import { Trans, useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

export const paginationSchema = z.object({
  offsetId: z.string().optional(),
  next: z.coerce.boolean().optional(),
  previous: z.coerce.boolean().optional(),
  limit: z.number().optional(),
  order: z.enum(['ASC', 'DESC']).optional(),
  sorting: z.enum(['created_at']).optional(),
});

type ItemWithId = {
  id: string;
};

type CursorPaginationsButtonsProps = PaginatedResponse<ItemWithId> & {
  onPaginationChange: (paginationParams: PaginationParams) => void;
};

export function CursorPaginationButtons({
  items,
  startIndex,
  endIndex,
  hasNextPage,
  onPaginationChange,
}: CursorPaginationsButtonsProps) {
  const { t } = useTranslation(['common']);
  const start = Math.min(startIndex, endIndex);
  const end = Math.max(startIndex, endIndex);

  const fetchPrevious = () => {
    const pagination: PaginationParams = {
      previous: true,
      offsetId: items[0]?.id,
    };
    onPaginationChange(pagination);
  };

  const fetchNext = () => {
    const pagination: PaginationParams = {
      next: true,
      offsetId: items[items.length - 1]?.id,
    };
    onPaginationChange(pagination);
  };

  const previousDisabled = start <= 1;
  const nextDisabled = !hasNextPage;
  return (
    <div className="flex items-center justify-end gap-2">
      <Trans
        t={t}
        i18nKey="common:items_displayed"
        components={{ StartToEnd: <span style={{ fontWeight: 'bold' }} /> }}
        values={{ start, end }}
      />

      <Button onClick={fetchPrevious} variant="secondary" disabled={previousDisabled}>
        <Icon icon="arrow-left" className="size-4" />
      </Button>
      <Button onClick={fetchNext} variant="secondary" disabled={nextDisabled}>
        <Icon icon="arrow-right" className="size-4" />
      </Button>
    </div>
  );
}

interface OffsetPaginationButtonsProps {
  previousPage: () => void;
  canPreviousPage: boolean;
  nextPage: () => void;
  canNextPage: boolean;
  currentPage: number;
  pageCount: number;
}

export function OffsetPaginationButtons({
  previousPage,
  canPreviousPage,
  nextPage,
  canNextPage,
  currentPage,
  pageCount,
}: OffsetPaginationButtonsProps) {
  const { t } = useTranslation(['common']);
  const language = useFormatLanguage();

  return (
    <div className="flex items-center justify-end gap-2">
      <Trans
        t={t}
        i18nKey="common:page_displayed_of_total"
        components={{ PageCount: <span style={{ fontWeight: 'bold' }} /> }}
        values={{
          currentPage: formatNumber(currentPage, { language }),
          pageCount: formatNumber(pageCount, { language }),
        }}
      />
      <Button onClick={previousPage} variant="secondary" disabled={canPreviousPage}>
        <Icon icon="arrow-left" className="size-4" />
      </Button>
      <Button onClick={nextPage} variant="secondary" disabled={canNextPage}>
        <Icon icon="arrow-right" className="size-4" />
      </Button>
    </div>
  );
}

export function adaptOffsetPaginationButtonsProps<T>(
  table: Table<T>,
): OffsetPaginationButtonsProps {
  return {
    previousPage: () => table.previousPage(),
    canPreviousPage: !table.getCanPreviousPage(),
    nextPage: () => table.nextPage(),
    canNextPage: !table.getCanNextPage(),
    currentPage: table.getState().pagination.pageIndex + 1,
    pageCount: table.getPageCount(),
  };
}
