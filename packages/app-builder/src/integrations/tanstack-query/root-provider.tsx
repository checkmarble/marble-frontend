import { MutationCache, matchQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import superjson from 'superjson';

export function getContext() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 10 * 1000,
        retry(failureCount, error) {
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
      onSuccess(_data, variables, _context, mutation) {
        const invalidates = mutation.meta?.invalidates;
        if (!invalidates) {
          return;
        }

        const queryKeys = invalidates(variables);
        if (queryKeys.length === 0) {
          return;
        }

        queryClient.invalidateQueries({
          predicate(query) {
            return queryKeys.some((queryKey) => matchQuery({ queryKey }, query));
          },
        });
      },
    }),
  });

  return {
    queryClient,
  };
}

export function Provider({
  children,
  queryClient,
}: {
  children: Parameters<typeof QueryClientProvider>[0]['children'];
  queryClient: QueryClient;
}) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
