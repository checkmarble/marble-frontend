import type { TracfinDraft } from '@app-builder/models/tracfin';
import { unwrapTracfinResultOrNull } from '@app-builder/models/tracfin';
import { getTracfinDraftFn } from '@app-builder/server-fns/tracfin';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { newerTracfinDraft } from './draft-cache';
import { tracfinKeys } from './keys';
import { shouldRetryTracfinQuery } from './retry';

/** `null` data means the case has no draft yet: a 404 is not an error here. */
export const useTracfinDraftQuery = (caseId: string) => {
  const getDraft = useServerFn(getTracfinDraftFn);
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: tracfinKeys.draft(caseId),
    queryFn: async () => {
      const fetched = unwrapTracfinResultOrNull(await getDraft({ data: { caseId } }));
      // A read that started before a save finished must not bring the cache back to the draft from before it.
      return newerTracfinDraft(fetched, queryClient.getQueryData<TracfinDraft | null>(tracfinKeys.draft(caseId)));
    },
    retry: shouldRetryTracfinQuery,
  });
};
