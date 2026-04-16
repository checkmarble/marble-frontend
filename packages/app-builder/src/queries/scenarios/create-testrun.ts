import { type CreateTestRunPayload, createTestRunPayloadSchema } from '@app-builder/schemas/scenarios';
import { createTestRunFn } from '@app-builder/server-fns/scenarios';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { createTestRunPayloadSchema, type CreateTestRunPayload };

export const useCreateTestRunMutation = (scenarioId: string) => {
  const createTestRun = useServerFn(createTestRunFn);

  return useMutation({
    mutationKey: ['scenarios', 'testrun', 'create', scenarioId],
    mutationFn: async (payload: CreateTestRunPayload) => createTestRun({ data: { ...payload, scenarioId } }),
  });
};
