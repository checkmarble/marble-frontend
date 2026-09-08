import { startScoringDryRunFn } from '@app-builder/server-fns/scoring';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useStartScoringDryRunMutation = () => {
  const startScoringDryRun = useServerFn(startScoringDryRunFn);
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['scoring', 'start-dry-run'],
    mutationFn: async (recordType: string) => {
      return startScoringDryRun({ data: { recordType } });
    },
    onSuccess: (result, recordType) => {
      queryClient.setQueryData(['scoring', 'dry-run', recordType], result);
    },
  });
};
