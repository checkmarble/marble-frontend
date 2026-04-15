import { cancelTestRunFn } from '@app-builder/server-fns/scenarios';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useCancelTestRunMutation = (scenarioId: string, testRunId: string) => {
  const cancelTestRun = useServerFn(cancelTestRunFn);

  return useMutation({
    mutationKey: ['scenarios', 'testrun', 'cancel', scenarioId, testRunId],
    mutationFn: async () => cancelTestRun({ data: { scenarioId, testRunId } }),
  });
};
