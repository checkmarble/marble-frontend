import { type SerializeFrom } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import qs from 'qs';
import { useCallback, useEffect, useState } from 'react';

import { useCursorPagination } from './useCursorPagination';

type BaseUseCursorPaginatedFetcherOptions<D> = {
  initialData: D;
  getQueryParams?: (cursor: string | null) => Record<string, unknown>;
  validateData?: (data: D) => boolean;
};

type UseCursorPaginatedFetcherOptions<T, D> =
  BaseUseCursorPaginatedFetcherOptions<D> &
    (D extends T
      ? Record<string, never>
      : {
          transform: (value: SerializeFrom<T>) => D;
        });

export const useCursorPaginatedFetcher = <T, D = T>({
  initialData,
  getQueryParams,
  validateData,
  ...opts
}: UseCursorPaginatedFetcherOptions<T, D>) => {
  const [previousFetcherData, setPreviousFetcherData] =
    useState<SerializeFrom<T> | null>(null);

  const [data, setData] = useState(initialData);
  const updateData = useCallback((data: D) => {
    setData(data);
  }, []);

  const {
    state: paginationState,
    next,
    previous,
    reset,
  } = useCursorPagination();
  const { data: fetcherData, submit } = useFetcher<T>();

  useEffect(() => {
    if (paginationState.isPristine) {
      return;
    }

    const queryParams = getQueryParams?.(paginationState.cursor) ?? {};
    submit(qs.stringify(queryParams, { skipNulls: true }), {
      method: 'GET',
    });
  }, [paginationState, getQueryParams, submit]);

  if (fetcherData !== previousFetcherData && fetcherData) {
    const transformedData =
      'transform' in opts ? opts.transform(fetcherData) : (fetcherData as D);

    if (validateData?.(transformedData) ?? true) {
      setPreviousFetcherData(fetcherData);
      setData(transformedData);
    }
  }

  return {
    data,
    update: updateData,
    next,
    previous,
    reset,
  };
};
