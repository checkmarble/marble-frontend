import { defaultPaginationSize, type PaginatedResponse, type PaginationParams } from '@app-builder/models/pagination';
import { useFormatDateTime } from '@app-builder/utils/format';
import { useEffect, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod/v4';

export const paginationSchema = z.object({
  offsetId: z.string().optional(),
  next: z.coerce.boolean().optional(),
  previous: z.coerce.boolean().optional(),
  limit: z.coerce.number().optional(),
  order: z.enum(['ASC', 'DESC']).optional(),
  sorting: z.enum(['created_at']).optional(),
});

type ItemWithId = {
  id: string;
  createdAt: string;
};

type PageBoundaries = {
  firstId?: string;
  lastId?: string;
};

export type PaginationButtonsState = {
  pageNb: number;
  hasPreviousPage: boolean;
  goToNext: () => PaginationParams | undefined;
  goToPrevious: () => PaginationParams | undefined;
};

type CursorPaginationsButtonsProps = PaginatedResponse<ItemWithId> & {
  paginationState: PaginationButtonsState;
  onPaginationChange: (paginationParams: PaginationParams) => void;
  boundariesDisplay: 'ranks' | 'dates';
  itemsPerPage?: number;
};

function getPageBoundaries(items: ItemWithId[]): PageBoundaries | undefined {
  const firstId = items[0]?.id;
  const lastId = items[items.length - 1]?.id;

  if (!firstId && !lastId) {
    return undefined;
  }

  return {
    firstId,
    lastId,
  };
}

export function usePaginationsButton<TFilterValues>({
  filterValues,
  items,
  initialOffsetId,
}: {
  filterValues: TFilterValues;
  items: ItemWithId[];
  initialOffsetId?: string;
}): PaginationButtonsState {
  const [pageNb, setPageNb] = useState(() => (initialOffsetId ? 2 : 1));
  const [pageBoundaries, setPageBoundaries] = useState<PageBoundaries[]>(() => {
    const currentPageBoundaries = getPageBoundaries(items);
    if (!currentPageBoundaries) return [];
    if (!initialOffsetId) return [currentPageBoundaries];
    return [
      {
        firstId: initialOffsetId,
      },
      currentPageBoundaries,
    ];
  });

  const filterValuesKey = JSON.stringify(filterValues);
  const itemsKey = items.map((item) => item.id).join('|');
  const previousFilterValuesKey = useRef(filterValuesKey);
  const previousItemsKey = useRef(itemsKey);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const currentPageBoundaries = getPageBoundaries(items);
    const hasInitialOffsetId = Boolean(initialOffsetId);

    if (isFirstRender.current) {
      isFirstRender.current = false;
      previousFilterValuesKey.current = filterValuesKey;
      previousItemsKey.current = itemsKey;

      if (hasInitialOffsetId && currentPageBoundaries) {
        setPageNb((currentPageNb) => (currentPageNb > 1 ? currentPageNb : 2));
        setPageBoundaries((previousPageBoundaries) => {
          if (previousPageBoundaries.length > 1) {
            return previousPageBoundaries;
          }

          return [
            {
              firstId: initialOffsetId,
            },
            currentPageBoundaries,
          ];
        });
      }

      return;
    }

    if (previousFilterValuesKey.current !== filterValuesKey) {
      previousFilterValuesKey.current = filterValuesKey;
      previousItemsKey.current = itemsKey;
      setPageNb(1);
      setPageBoundaries(currentPageBoundaries ? [currentPageBoundaries] : []);
      return;
    }

    if (previousItemsKey.current === itemsKey) {
      return;
    }

    previousItemsKey.current = itemsKey;

    if (!currentPageBoundaries) {
      return;
    }

    setPageBoundaries((previousPageBoundaries) => {
      const nextPageBoundaries = [...previousPageBoundaries];
      nextPageBoundaries[pageNb - 1] = currentPageBoundaries;
      return nextPageBoundaries;
    });
  }, [filterValuesKey, initialOffsetId, items, itemsKey, pageNb]);

  const goToNext = () => {
    const currentPageBoundaries = pageBoundaries[pageNb - 1] ?? getPageBoundaries(items);

    if (!currentPageBoundaries?.lastId) {
      return undefined;
    }

    setPageBoundaries((previousPageBoundaries) => {
      const nextPageBoundaries = [...previousPageBoundaries];
      nextPageBoundaries[pageNb - 1] = currentPageBoundaries;
      return nextPageBoundaries;
    });
    setPageNb((currentPageNb) => currentPageNb + 1);

    return {
      next: true,
      offsetId: currentPageBoundaries.lastId,
    } satisfies PaginationParams;
  };

  const goToPrevious = () => {
    const previousPageBoundaries = pageBoundaries[pageNb - 2];

    if (!previousPageBoundaries?.firstId) {
      return undefined;
    }

    setPageNb((currentPageNb) => Math.max(1, currentPageNb - 1));

    return {
      previous: true,
      offsetId: previousPageBoundaries.firstId,
    } satisfies PaginationParams;
  };

  return {
    pageNb,
    hasPreviousPage: !!pageBoundaries[pageNb - 2]?.firstId,
    goToNext,
    goToPrevious,
  };
}

function FormattedDatesRange({ startTs, endTs }: { startTs: string | undefined; endTs: string | undefined }) {
  const { t } = useTranslation(['common']);
  const formatDateTime = useFormatDateTime();

  if (!startTs || !endTs) {
    return null;
  }

  const start = new Date(startTs);
  const end = new Date(endTs);

  const isSameLocalDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();
  const isSameMinute = isSameLocalDay && start.getHours() === end.getHours() && start.getMinutes() === end.getMinutes();
  const isSameSecond = isSameMinute && start.getSeconds() === end.getSeconds();

  if (isSameSecond)
    return (
      <Trans
        t={t}
        i18nKey="common:items_displayed_same_datetime"
        components={{ emph: <span className="font-bold" /> }}
        values={{
          date: formatDateTime(start, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          }),
          time: formatDateTime(start, {
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
          date: formatDateTime(start, dateFormatOpts),
          start: formatDateTime(start, timeFormatOpts),
          end: formatDateTime(end, timeFormatOpts),
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
        start: formatDateTime(start, dtFormatOpts),
        end: formatDateTime(end, dtFormatOpts),
      }}
    />
  );
}

function RankNumberRange({
  pageNumber,
  currentPageItemCount,
  itemsPerPage,
}: {
  pageNumber: number;
  currentPageItemCount: number;
  itemsPerPage: number;
}) {
  const { t } = useTranslation(['common']);

  const start = (pageNumber - 1) * itemsPerPage + 1;
  const end = currentPageItemCount > 0 ? (pageNumber - 1) * itemsPerPage + currentPageItemCount : 0;

  if (pageNumber === 1 && currentPageItemCount === 0) {
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
  paginationState,
  onPaginationChange,
  boundariesDisplay,
  itemsPerPage = defaultPaginationSize,
}: CursorPaginationsButtonsProps) {
  const startTs = items[0]?.createdAt;
  const endTs = items[items.length - 1]?.createdAt;

  const fetchPrevious = () => {
    const pagination = paginationState.goToPrevious();

    if (pagination) {
      onPaginationChange(pagination);
    }
  };

  const fetchNext = () => {
    const pagination = paginationState.goToNext();

    if (pagination) {
      onPaginationChange(pagination);
    }
  };

  const previousDisabled = !paginationState.hasPreviousPage;
  const nextDisabled = !hasNextPage;

  return (
    <div className="flex items-center justify-end gap-2">
      {boundariesDisplay === 'ranks' ? (
        <RankNumberRange
          pageNumber={paginationState.pageNb}
          currentPageItemCount={items.length}
          itemsPerPage={itemsPerPage}
        />
      ) : (
        <FormattedDatesRange startTs={startTs} endTs={endTs} />
      )}
      <Button onClick={fetchPrevious} variant="secondary" mode="icon" disabled={previousDisabled}>
        <Icon icon="arrow-left" className="size-4" />
      </Button>
      <Button onClick={fetchNext} variant="secondary" mode="icon" disabled={nextDisabled}>
        <Icon icon="arrow-right" className="size-4" />
      </Button>
    </div>
  );
}
