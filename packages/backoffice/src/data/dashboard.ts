import type { DashboardMonths } from '@bo/schemas/dashboard';
import { getDashboardMetricsFn } from '@bo/server-fns/dashboard';
import { queryOptions } from '@tanstack/react-query';

export const dashboardQueryKey = ['dashboard'];

export const dashboardQueryOptions = (months: DashboardMonths) =>
  queryOptions({
    queryKey: [...dashboardQueryKey, months],
    queryFn: () => getDashboardMetricsFn({ data: { months } }),
  });
