import { getCustomerAggregatesFn } from '@app-builder/server-fns/customer-aggregates';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const customerAggregatesQueryKey = (objectType: string, objectId: string) =>
  ['customer-aggregates', objectType, objectId] as const;

export function useCustomerAggregatesQuery(objectType: string | undefined, objectId: string | undefined) {
  const getCustomerAggregates = useServerFn(getCustomerAggregatesFn);

  return useQuery({
    queryKey: customerAggregatesQueryKey(objectType ?? '', objectId ?? ''),
    queryFn: ({ queryKey: [_, objectType, objectId] }) => getCustomerAggregates({ data: { objectType, objectId } }),
    enabled: !!objectType && !!objectId,
  });
}
