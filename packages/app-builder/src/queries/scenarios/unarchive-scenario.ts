import { type UnarchiveScenarioPayload } from '@app-builder/schemas/scenarios';
import { unarchiveScenarioFn } from '@app-builder/server-fns/scenarios';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';

export const useUnarchiveScenarioMutation = () => {
  const unarchiveScenario = useServerFn(unarchiveScenarioFn);
  const router = useRouter();

  return useMutation({
    mutationKey: ['scenarios', 'unarchive'],
    mutationFn: async (data: UnarchiveScenarioPayload) => unarchiveScenario({ data }),
    onSuccess: () => {
      router.invalidate();
    },
  });
};
