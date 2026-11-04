import type { TracfinDraftInput } from '@app-builder/models/tracfin';
import { unwrapTracfinResult } from '@app-builder/models/tracfin';
import { patchTracfinDraftFn } from '@app-builder/server-fns/tracfin';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { cancelTracfinDraftReads, writeTracfinDraft } from './draft-cache';

/**
 * Applies changes against `expected_revision`. The returned draft replaces the cached one: it holds
 * the server IDs that replace the temporary block aliases of the request, unless the cache already
 * holds a newer revision. Reads in flight when the save starts are cancelled, so they cannot bring an
 * older draft back. A stale revision throws a `TracfinRequestError` of kind `conflict` and leaves the
 * cache untouched.
 */
export const useTracfinPatchDraftMutation = (caseId: string) => {
  const patchDraft = useServerFn(patchTracfinDraftFn);
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['tracfin', 'case', caseId, 'patch-draft'],
    mutationFn: async (body: TracfinDraftInput) => unwrapTracfinResult(await patchDraft({ data: { caseId, body } })),
    onMutate: () => cancelTracfinDraftReads(queryClient, caseId),
    onSuccess: (draft) => writeTracfinDraft(queryClient, caseId, draft),
  });
};
