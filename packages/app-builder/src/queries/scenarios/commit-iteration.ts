import { type CommitIterationPayload, commitIterationPayloadSchema } from '@app-builder/schemas/scenarios';
import { commitIterationFn } from '@app-builder/server-fns/scenarios';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { commitIterationPayloadSchema, type CommitIterationPayload };

export const useCommitIterationMutation = (scenarioId: string, iterationId: string) => {
  const commitIteration = useServerFn(commitIterationFn);

  return useMutation({
    mutationKey: ['scenarios', 'iterations', 'commit', scenarioId, iterationId],
    mutationFn: async (payload: CommitIterationPayload) =>
      commitIteration({ data: { ...payload, scenarioId, iterationId } }),
  });
};
