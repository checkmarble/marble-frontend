import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const updateScoringSettingsPayloadSchema = z.object({
  maxRiskLevel: z.number(),
});

export type UpdateScoringSettingsPayload = z.infer<typeof updateScoringSettingsPayloadSchema>;

const endpoint = getRoute('/ressources/scoring/update-settings');

export const useUpdateScoringSettingsMutation = () => {
  const navigate = useAgnosticNavigation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['scoring', 'update-settings'],
    mutationFn: async (payload: UpdateScoringSettingsPayload) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.redirectTo) {
        navigate(result.redirectTo);
        return;
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scoring'] });
    },
  });
};
