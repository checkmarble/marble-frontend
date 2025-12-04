import { type VersionUpdateResource } from '@app-builder/routes/ressources+/version+/check-update';
import { getRoute } from '@app-builder/utils/routes';
import { useQuery } from '@tanstack/react-query';

const endpoint = () => getRoute('/ressources/version/check-update');

interface UseVersionUpdateQueryOptions {
  enabled?: boolean;
}

export function useVersionUpdateQuery({ enabled = true }: UseVersionUpdateQueryOptions = {}) {
  const queryKey = ['version-update'] as const;

  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await fetch(endpoint(), { method: 'GET' });
      return response.json() as Promise<VersionUpdateResource>;
    },
    staleTime: 1000 * 60 * 60, // 1 hour - don't refetch too frequently
    refetchOnWindowFocus: false,
    enabled,
  });
}
