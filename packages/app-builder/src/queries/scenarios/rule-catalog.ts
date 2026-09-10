import { getRuleCatalogFn } from '@app-builder/server-fns/scenarios';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export function useRuleCatalogQuery({ isEnabled = true }: { isEnabled?: boolean } = {}) {
  const getRuleCatalog = useServerFn(getRuleCatalogFn);

  console.log('rule catalog enabled', isEnabled);

  return useQuery({
    queryKey: ['scenario', 'rule-catalog'],
    queryFn: () => getRuleCatalog(),
    enabled: isEnabled,
  });
}
