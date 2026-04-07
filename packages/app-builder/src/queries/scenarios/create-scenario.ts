import { type CreateScenarioPayload, createScenarioPayloadSchema } from '@app-builder/schemas/scenarios';
import { createScenarioFn } from '@app-builder/server-fns/scenarios';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { createScenarioPayloadSchema, type CreateScenarioPayload };

export const useCreateScenarioMutation = () => {
  const createScenario = useServerFn(createScenarioFn);

  return useMutation({
    mutationKey: ['scenarios', 'create'],
    mutationFn: async (data: CreateScenarioPayload) => createScenario({ data }),
  });
};
