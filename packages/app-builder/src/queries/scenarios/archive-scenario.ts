import { type ArchiveScenarioPayload, archiveScenarioPayloadSchema } from '@app-builder/schemas/scenarios';
import { archiveScenarioFn } from '@app-builder/server-fns/scenarios';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { archiveScenarioPayloadSchema, type ArchiveScenarioPayload };

export const useArchiveScenarioMutation = () => {
  const archiveScenario = useServerFn(archiveScenarioFn);

  return useMutation({
    mutationKey: ['scenarios', 'archive'],
    mutationFn: async (data: ArchiveScenarioPayload) => archiveScenario({ data }),
  });
};
