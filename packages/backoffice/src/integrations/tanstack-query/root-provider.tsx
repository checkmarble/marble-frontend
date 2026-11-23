import { MutationCache, matchQuery, QueryClient } from '@tanstack/react-query';
import superjson from 'superjson';

export function getContext() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 10,
        retry(failureCount, error) {
          // Abort retries for redirects status codes
          if (error instanceof Response && error.status >= 300 && error.status < 400) {
            return false;
          }
          return failureCount < 3;
        },
      },
      dehydrate: { serializeData: superjson.serialize },
      hydrate: { deserializeData: superjson.deserialize },
    },
    mutationCache: new MutationCache({
      onSuccess: (_data, variables, _context, mutation) => {
        const invalidates = mutation.meta?.invalidates;
        if (!invalidates) {
          return;
        }
        const queryKeys = invalidates(variables);
        if (queryKeys.length === 0) {
          return;
        }

        queryClient.invalidateQueries({
          predicate: (query) => {
            // Invalidates all queries matching the invalidate meta or none
            return queryKeys.some((queryKey) => matchQuery({ queryKey }, query));
          },
        });
      },
    }),
  });

  return { queryClient };
}
