import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { PaginatedResponse } from '@app-builder/models/pagination';
import { getRoute } from '@app-builder/utils/routes';
import { useInfiniteQuery } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const client360SearchPayloadSchema = z.object({
  table: z.string(),
  terms: z.string(),
});

export type Client360SearchPayload = z.infer<typeof client360SearchPayloadSchema>;

const endpoint = (page: number) => getRoute('/ressources/client-360/search') + (page > 1 ? `?page=${page}` : '');

export const useSearchClient360Query = (payload: Client360SearchPayload) => {
  const navigate = useAgnosticNavigation();

  return useInfiniteQuery({
    queryKey: ['client360', 'search', payload.table, payload.terms],
    queryFn: async ({ pageParam }) => {
      const response = await fetch(endpoint(pageParam), {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if ('redirectTo' in result) {
        navigate(result.redirectTo);
        return { items: [], hasNextPage: false };
      }

      return result as PaginatedResponse<Record<string, unknown>>;
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasNextPage ? pages.length + 1 : null;
    },
    initialPageParam: 1,
  });
};
