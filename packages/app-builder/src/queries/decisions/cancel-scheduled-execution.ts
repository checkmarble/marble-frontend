import { cancelScheduledExecutionFn } from '@app-builder/server-fns/decisions';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useCancelScheduledExecutionMutation = (scheduledExecutionId: string) => {
  const cancelScheduledExecution = useServerFn(cancelScheduledExecutionFn);
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['decisions', 'scheduled-executions', 'cancel', scheduledExecutionId],
    mutationFn: async () => cancelScheduledExecution({ data: { scheduledExecutionId } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['decisions', 'list-scheduled-executions'] }),
  });
};
