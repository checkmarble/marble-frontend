import { updateScoringSettingsFn } from '@app-builder/server-fns/scoring';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { z } from 'zod/v4';

export const updateScoringSettingsPayloadSchema = z.object({
  maxRiskLevel: z.number(),
});

export type UpdateScoringSettingsPayload = z.infer<typeof updateScoringSettingsPayloadSchema>;

export const useUpdateScoringSettingsMutation = () => {
  const updateScoringSettings = useServerFn(updateScoringSettingsFn);
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['scoring', 'update-settings'],
    mutationFn: async (payload: UpdateScoringSettingsPayload) => {
      await updateScoringSettings({ data: payload });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scoring'] });
    },
  });
};
