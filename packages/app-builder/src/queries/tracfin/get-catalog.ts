import { unwrapTracfinResult } from '@app-builder/models/tracfin';
import { getTracfinCatalogFn } from '@app-builder/server-fns/tracfin';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { tracfinKeys } from './keys';
import { shouldRetryTracfinQuery } from './retry';

/** The profile is fixed for a given server version: it is fetched once and never refetched. */
export const useTracfinCatalogQuery = () => {
  const getCatalog = useServerFn(getTracfinCatalogFn);

  return useQuery({
    queryKey: tracfinKeys.catalog(),
    queryFn: async () => unwrapTracfinResult(await getCatalog()),
    staleTime: Infinity,
    retry: shouldRetryTracfinQuery,
  });
};
