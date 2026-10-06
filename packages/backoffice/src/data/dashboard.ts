import type { DashboardMonths } from '@bo/schemas/dashboard';
import { getDashboardMetricsFn } from '@bo/server-fns/dashboard';
import { keepPreviousData, queryOptions } from '@tanstack/react-query';

export const dashboardQueryKey = ['dashboard'];

export const dashboardQueryOptions = (months: DashboardMonths) =>
  queryOptions({
    queryKey: [...dashboardQueryKey, months],
    queryFn: () => getDashboardMetricsFn({ data: { months } }),
    // Saving a dashboard preference invalidates the router, which re-runs the loader's prefetch. Mutations
    // invalidate `dashboardQueryKey` explicitly, so a short freshness window avoids refetching on every click.
    staleTime: 60_000,
    // A new period keeps the previous snapshot on screen (dimmed) instead of flashing the skeleton.
    placeholderData: keepPreviousData,
  });
