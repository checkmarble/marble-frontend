import { type PaginatedResponse, type PaginationParams } from '@app-builder/models/pagination';
import {
  formatDateTimeWithoutPresets,
  formatNumber,
  useFormatLanguage,
} from '@app-builder/utils/format';
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

  const start = new Date(startTs);
  const end = new Date(endTs);

  const isSameLocalDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();
  const isSameMinute =
    isSameLocalDay &&
    start.getHours() === end.getHours() &&
    start.getMinutes() === end.getMinutes();
  const isSameSecond = isSameMinute && end.getSeconds() === end.getSeconds();

  if (isSameSecond)
    return (
      <Trans
        t={t}
        i18nKey="common:items_displayed_same_datetime"
        components={{ datetime: <span className="font-bold" /> }}
        values={{
          date: formatDateTimeWithoutPresets(start, {
            language,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          }),
          time: formatDateTimeWithoutPresets(start, {
            language,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
        }}
      />
    );

  if (isSameLocalDay) {
    const dateFormatOpts = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    } as Intl.DateTimeFormatOptions;
    const timeFormatOpts = {
      hour: '2-digit',
      minute: '2-digit',
    } as Intl.DateTimeFormatOptions;
    if (isSameMinute) {
      timeFormatOpts.second = '2-digit';
    }

    return (
      <Trans
        t={t}
        i18nKey={'common:items_displayed_same_date'}
        components={{ datetime: <span className="font-bold" /> }}
        values={{
          date: formatDateTimeWithoutPresets(start, {
            language,
            ...dateFormatOpts,
          }),
          start: formatDateTimeWithoutPresets(start, {
            language,
            ...timeFormatOpts,
          }),
          end: formatDateTimeWithoutPresets(end, {
            language,
            ...timeFormatOpts,
          }),
        }}
      />
    );
  }

  const dtFormatOpts = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  } as Intl.DateTimeFormatOptions;
  return (
    <Trans
      t={t}
      i18nKey={'common:items_displayed_dates'}
      components={{ datetime: <span className="font-bold" /> }}
      values={{
        start: formatDateTimeWithoutPresets(start, {
          language,
          ...dtFormatOpts,
        }),
        end: formatDateTimeWithoutPresets(end, {
          language,
          ...dtFormatOpts,
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
