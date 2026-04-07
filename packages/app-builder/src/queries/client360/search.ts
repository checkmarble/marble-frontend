import { DataModelObjectValue } from '@app-builder/models';
import { PaginatedResponse } from '@app-builder/models/pagination';
import { searchClient360Fn } from '@app-builder/server-fns/client-360';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { z } from 'zod/v4';

export const client360SearchPayloadSchema = z.object({
  table: z.string(),
  terms: z.string(),
});

export type Client360SearchPayload = z.infer<typeof client360SearchPayloadSchema>;

export const useSearchClient360Query = (payload: Client360SearchPayload) => {
  const searchClient360 = useServerFn(searchClient360Fn);

  return useInfiniteQuery({
    queryKey: ['client360', 'search', payload.table, payload.terms],
    queryFn: async () =>
      searchClient360({ data: payload }) as Promise<PaginatedResponse<Record<string, DataModelObjectValue>>>,
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasNextPage ? pages.length + 1 : null;
    },
    initialPageParam: 1,
  });
};
