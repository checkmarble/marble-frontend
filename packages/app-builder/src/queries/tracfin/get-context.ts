import { unwrapTracfinResult } from '@app-builder/models/tracfin';
import { getTracfinContextFn } from '@app-builder/server-fns/tracfin';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { tracfinKeys } from './keys';
import { shouldRetryTracfinQuery } from './retry';

export const useTracfinContextQuery = (caseId: string) => {
  const getContext = useServerFn(getTracfinContextFn);

  return useQuery({
    queryKey: tracfinKeys.context(caseId),
    queryFn: async () => unwrapTracfinResult(await getContext({ data: { caseId } })),
    retry: shouldRetryTracfinQuery,
  });
};
