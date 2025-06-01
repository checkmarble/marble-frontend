import {
  defaultPaginationSize,
  type PaginatedResponse,
  type PaginationParams,
} from '@app-builder/models/pagination';
import { formatDateTimeWithoutPresets, useFormatLanguage } from '@app-builder/utils/format';
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
  boundariesDisplay: 'ranks' | 'dates';
  pageNb: number;
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
        components={{ emph: <span className="font-bold" /> }}
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
        components={{ emph: <span className="font-bold" /> }}
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
      components={{ emph: <span className="font-bold" /> }}
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

function RankNumberRange({ pageNb, nbInPage }: { pageNb: number; nbInPage: number }) {
  const { t } = useTranslation(['common']);

  const start = pageNb * defaultPaginationSize + 1;
  const end = nbInPage > 0 ? pageNb * defaultPaginationSize + nbInPage : 0;

  if (pageNb === 0 && nbInPage === 0) {
    return null;
  }

  return (
    <Trans
      t={t}
      i18nKey={'common:items_displayed_ranks'}
      components={{ emph: <span className="font-bold" /> }}
      values={{ start, end }}
    />
  );
}

export function CursorPaginationButtons({
  items,
  hasNextPage,
  hasPreviousPage,
  onPaginationChange,
  boundariesDisplay,
  pageNb,
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
      {boundariesDisplay === 'ranks' ? (
        <RankNumberRange pageNb={pageNb} nbInPage={items.length} />
      ) : (
        <FormattedDatesRange {...{ startTs, endTs, language }} />
      )}
      <Button onClick={fetchPrevious} variant="secondary" disabled={previousDisabled}>
        <Icon icon="arrow-left" className="size-4" />
      </Button>
      <Button onClick={fetchNext} variant="secondary" disabled={nextDisabled}>
        <Icon icon="arrow-right" className="size-4" />
      </Button>
    </div>
  );
}
