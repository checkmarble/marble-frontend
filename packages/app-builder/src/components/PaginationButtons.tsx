import { type PaginatedResponse, type PaginationParams } from '@app-builder/models/pagination';
import { formatDateTime, formatNumber, useFormatLanguage } from '@app-builder/utils/format';
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
  createdAt: string;
};

type CursorPaginationsButtonsProps = PaginatedResponse<ItemWithId> & {
  onPaginationChange: (paginationParams: PaginationParams) => void;
  hasPreviousPage: boolean;
  hideBoundaries?: boolean;
};

function FormattedDatesRange({
  startTs,
  endTs,
  language,
}: {
  startTs: string | undefined;
  endTs: string | undefined;
  language: string;
}) {
  const { t } = useTranslation(['common']);
  if (!startTs || !endTs) {
    return null;
  }

  const startDate = new Date(startTs);
  const endDate = new Date(endTs);

  // Compare local date parts (year, month, day)
  const isSameLocalDay =
    startDate.getFullYear() === endDate.getFullYear() &&
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getDate() === endDate.getDate();
  const isSameMinute =
    isSameLocalDay &&
    startDate.getHours() === endDate.getHours() &&
    startDate.getMinutes() === endDate.getMinutes();

  if (isSameMinute && startDate.getSeconds() === endDate.getSeconds())
    return (
      <Trans
        t={t}
        i18nKey="common:items_displayed_same_datetime"
        components={{ StartToEnd: <span /> }}
        values={{
          date: formatDateTime(startDate, {
            language,
            dateStyle: 'medium',
            timeStyle: undefined,
          }),
          time: formatDateTime(startDate, {
            language,
            dateStyle: undefined,
            timeStyle: 'short',
          }),
        }}
      />
    );

  if (isSameLocalDay || isSameMinute)
    return (
      <Trans
        t={t}
        i18nKey="common:items_displayed_same_date"
        components={{ StartToEnd: <span /> }}
        values={{
          date: formatDateTime(startDate, {
            language,
            dateStyle: 'medium',
            timeStyle: undefined,
          }),
          start: formatDateTime(startTs, {
            language,
            dateStyle: undefined,
            timeStyle: isSameMinute ? 'medium' : 'short',
          }),
          end: formatDateTime(endTs, {
            language,
            dateStyle: undefined,
            timeStyle: isSameMinute ? 'medium' : 'short',
          }),
        }}
      />
    );

  return (
    <Trans
      t={t}
      i18nKey="common:items_displayed_dates"
      components={{ StartToEnd: <span /> }}
      values={{
        start: formatDateTime(startTs, {
          language,
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
        end: formatDateTime(endTs, {
          language,
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
      }}
    />
  );
}

export function CursorPaginationButtons({
  items,
  hasNextPage,
  hasPreviousPage,
  onPaginationChange,
  hideBoundaries,
}: CursorPaginationsButtonsProps) {
  const language = useFormatLanguage();

  const startTs = items[0]?.createdAt;
  const endTs = items[items.length - 1]?.createdAt;

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

  const previousDisabled = !hasPreviousPage;
  const nextDisabled = !hasNextPage;

  return (
    <div className="flex items-center justify-end gap-2">
      {hideBoundaries ? null : <FormattedDatesRange {...{ startTs, endTs, language }} />}
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
