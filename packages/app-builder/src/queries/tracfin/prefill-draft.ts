import type { TracfinRevisionInput } from '@app-builder/models/tracfin';
import { unwrapTracfinResult } from '@app-builder/models/tracfin';
import { prefillTracfinDraftFn } from '@app-builder/server-fns/tracfin';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

/** Computes proposals for a revision. Nothing is written: proposals are applied with `apply_prefill` changes. */
export const useTracfinPrefillMutation = (caseId: string) => {
  const prefill = useServerFn(prefillTracfinDraftFn);

  return useMutation({
    mutationKey: ['tracfin', 'case', caseId, 'prefill'],
    mutationFn: async (body: TracfinRevisionInput) => unwrapTracfinResult(await prefill({ data: { caseId, body } })),
  });
};
