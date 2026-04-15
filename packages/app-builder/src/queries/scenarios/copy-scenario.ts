import { type CopyScenarioPayload, copyScenarioPayloadSchema } from '@app-builder/schemas/scenarios';
import { copyScenarioFn } from '@app-builder/server-fns/scenarios';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { copyScenarioPayloadSchema, type CopyScenarioPayload };

export const useCopyScenarioMutation = () => {
  const copyScenario = useServerFn(copyScenarioFn);

  return useMutation({
    mutationKey: ['scenarios', 'copy'],
    mutationFn: async (data: CopyScenarioPayload) => copyScenario({ data }),
  });
};
