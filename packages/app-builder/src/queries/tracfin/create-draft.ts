import type { TracfinCreateDraftInput } from '@app-builder/models/tracfin';
import { unwrapTracfinResult } from '@app-builder/models/tracfin';
import { createTracfinDraftFn } from '@app-builder/server-fns/tracfin';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { cancelTracfinDraftReads, writeTracfinDraft } from './draft-cache';

export const useTracfinCreateDraftMutation = (caseId: string) => {
  const createDraft = useServerFn(createTracfinDraftFn);
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['tracfin', 'case', caseId, 'create-draft'],
    mutationFn: async (body: TracfinCreateDraftInput) =>
      unwrapTracfinResult(await createDraft({ data: { caseId, body } })),
    // A read of "no draft yet" still in flight must not erase the draft that is being created.
    onMutate: () => cancelTracfinDraftReads(queryClient, caseId),
    onSuccess: (draft) => writeTracfinDraft(queryClient, caseId, draft),
  });
};
