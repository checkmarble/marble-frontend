import { type UpdateScenarioPayload, updateScenarioPayloadSchema } from '@app-builder/schemas/scenarios';
import { updateScenarioFn } from '@app-builder/server-fns/scenarios';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { type UpdateScenarioPayload, updateScenarioPayloadSchema };

export const useUpdateScenarioMutation = () => {
  const updateScenario = useServerFn(updateScenarioFn);

  return useMutation({
    mutationKey: ['scenarios', 'update'],
    mutationFn: async (data: UpdateScenarioPayload) => updateScenario({ data }),
  });
};
