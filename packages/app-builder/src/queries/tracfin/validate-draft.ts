import type { TracfinRevisionInput } from '@app-builder/models/tracfin';
import { unwrapTracfinResult } from '@app-builder/models/tracfin';
import { validateTracfinDraftFn } from '@app-builder/server-fns/tracfin';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useTracfinValidateMutation = (caseId: string) => {
  const validate = useServerFn(validateTracfinDraftFn);

  return useMutation({
    mutationKey: ['tracfin', 'case', caseId, 'validate'],
    mutationFn: async (body: TracfinRevisionInput) => unwrapTracfinResult(await validate({ data: { caseId, body } })),
  });
};
