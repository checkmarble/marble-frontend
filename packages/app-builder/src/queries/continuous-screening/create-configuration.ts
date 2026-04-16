import { PrevalidationCreateContinuousScreeningConfig } from '@app-builder/models/continuous-screening';
import { createContinuousScreeningConfigurationFn } from '@app-builder/server-fns/continuous-screening';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useCreateContinuousScreeningConfigurationMutation = () => {
  const createContinuousScreeningConfiguration = useServerFn(createContinuousScreeningConfigurationFn);
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['continuous-screening', 'create-configuration'],
    mutationFn: async (payload: PrevalidationCreateContinuousScreeningConfig) => {
      await createContinuousScreeningConfiguration({ data: payload });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['continuous-screening', 'configurations'] });
    },
  });
};
