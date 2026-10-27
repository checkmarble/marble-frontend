import { unwrapTracfinResultOrNull } from '@app-builder/models/tracfin';
import { getTracfinDraftFn } from '@app-builder/server-fns/tracfin';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { tracfinKeys } from './keys';

/** `null` data means the case has no draft yet: a 404 is not an error here. */
export const useTracfinDraftQuery = (caseId: string) => {
  const getDraft = useServerFn(getTracfinDraftFn);

  return useQuery({
    queryKey: tracfinKeys.draft(caseId),
    queryFn: async () => unwrapTracfinResultOrNull(await getDraft({ data: { caseId } })),
  });
};
