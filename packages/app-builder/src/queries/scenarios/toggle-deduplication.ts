import {
  type ToggleScenarioDeduplicationPayload,
  toggleScenarioDeduplicationPayloadSchema,
} from '@app-builder/schemas/scenarios';
import { toggleScenarioDeduplicationFn } from '@app-builder/server-fns/scenarios';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { type ToggleScenarioDeduplicationPayload, toggleScenarioDeduplicationPayloadSchema };

export const useToggleScenarioDeduplicationMutation = () => {
  const toggleDeduplication = useServerFn(toggleScenarioDeduplicationFn);

  return useMutation({
    mutationKey: ['scenarios', 'toggle-deduplication'],
    mutationFn: async (data: ToggleScenarioDeduplicationPayload) => toggleDeduplication({ data }),
  });
};
