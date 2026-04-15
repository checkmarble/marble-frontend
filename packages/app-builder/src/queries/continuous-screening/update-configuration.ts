import { PrevalidationCreateContinuousScreeningConfig } from '@app-builder/models/continuous-screening';
import { updateContinuousScreeningConfigurationFn } from '@app-builder/server-fns/continuous-screening';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useUpdateContinuousScreeningConfigurationMutation = (configStableId: string) => {
  const updateContinuousScreeningConfiguration = useServerFn(updateContinuousScreeningConfigurationFn);
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['continuous-screening', 'update-configuration'],
    mutationFn: async (payload: PrevalidationCreateContinuousScreeningConfig) => {
      await updateContinuousScreeningConfiguration({ data: { ...payload, configStableId } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['continuous-screening', 'configurations'] });
    },
  });
};
