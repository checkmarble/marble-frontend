import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { type UnarchiveScenarioPayload, unarchiveScenarioPayloadSchema } from '@app-builder/schemas/scenarios';
import { unarchiveScenarioFn } from '@app-builder/server-fns/scenarios';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { unarchiveScenarioPayloadSchema, type UnarchiveScenarioPayload };

export const useUnarchiveScenarioMutation = () => {
  const unarchiveScenario = useServerFn(unarchiveScenarioFn);
  const revalidate = useLoaderRevalidator();

  return useMutation({
    mutationKey: ['scenarios', 'unarchive'],
    mutationFn: async (data: UnarchiveScenarioPayload) => unarchiveScenario({ data }),
    onSuccess: () => {
      revalidate();
    },
  });
};
