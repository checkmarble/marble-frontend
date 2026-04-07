import { checkVersionUpdateFn } from '@app-builder/server-fns/version';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

interface UseVersionUpdateQueryOptions {
  enabled?: boolean;
}

export function useVersionUpdateQuery({ enabled = true }: UseVersionUpdateQueryOptions = {}) {
  const checkVersionUpdate = useServerFn(checkVersionUpdateFn);

  return useQuery({
    queryKey: ['version-update'],
    queryFn: async () => checkVersionUpdate(),
    staleTime: 1000 * 60 * 60, // 1 hour - don't refetch too frequently
    refetchOnWindowFocus: false,
    enabled,
  });
}
