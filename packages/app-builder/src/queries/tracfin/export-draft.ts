import type { TracfinDraft, TracfinRevisionInput } from '@app-builder/models/tracfin';
import { isTracfinRequestError, unwrapTracfinResult } from '@app-builder/models/tracfin';
import { exportTracfinDraftFn } from '@app-builder/server-fns/tracfin';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { tracfinKeys } from './keys';

/**
 * Exports a saved revision. The new export becomes the `last_export` of the cached draft (it may
 * belong to an older revision than the one being edited). After a timeout, a server error or a
 * network error the outcome is uncertain: the draft is re-read so `last_export` can be checked
 * before any retry.
 */
export const useTracfinExportMutation = (caseId: string) => {
  const exportDraft = useServerFn(exportTracfinDraftFn);
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['tracfin', 'case', caseId, 'export'],
    mutationFn: async (body: TracfinRevisionInput) =>
      unwrapTracfinResult(await exportDraft({ data: { caseId, body } })),
    onSuccess: (tracfinExport) => {
      queryClient.setQueryData<TracfinDraft | null>(tracfinKeys.draft(caseId), (draft) =>
        draft ? { ...draft, last_export: tracfinExport } : draft,
      );
    },
    onError: (error) => {
      if (!isTracfinRequestError(error)) return;
      if (error.error.kind === 'timeout' || error.error.kind === 'server' || error.error.kind === 'network') {
        queryClient.invalidateQueries({ queryKey: tracfinKeys.draft(caseId) });
      }
    },
  });
};
