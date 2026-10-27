import { unwrapTracfinResultOrNull } from '@app-builder/models/tracfin';
import { getTracfinConfigurationFn } from '@app-builder/server-fns/tracfin';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { tracfinKeys } from './keys';
import { shouldRetryTracfinQuery } from './retry';

/** `null` data means the organization has no configuration yet (the next save creates it at revision 0). */
export const useTracfinConfigurationQuery = (options?: { enabled?: boolean }) => {
  const getConfiguration = useServerFn(getTracfinConfigurationFn);

  return useQuery({
    queryKey: tracfinKeys.configuration(),
    queryFn: async () => unwrapTracfinResultOrNull(await getConfiguration()),
    enabled: options?.enabled ?? true,
    retry: shouldRetryTracfinQuery,
  });
};
