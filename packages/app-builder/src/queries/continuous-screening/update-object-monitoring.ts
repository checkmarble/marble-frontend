import { updateObjectMonitoringFn } from '@app-builder/server-fns/continuous-screening';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

type UpdateObjectMonitoringInput = {
  objectType: string;
  objectId: string;
  configStableIds: string[];
};

export const useUpdateObjectMonitoringMutation = () => {
  const updateObjectMonitoring = useServerFn(updateObjectMonitoringFn);
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['continuous-screening', 'update-object-monitoring'],
    mutationFn: async (payload: UpdateObjectMonitoringInput) => {
      return updateObjectMonitoring({ data: payload });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['continuous-screening', 'active-configs', variables.objectType, variables.objectId],
      });
    },
  });
};
