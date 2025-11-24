import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const createCasePayloadSchema = z.object({
  name: z.string().min(1),
  inboxId: z.uuid(),
});

export type CreateCasePayload = z.infer<typeof createCasePayloadSchema>;

const endpoint = getRoute('/ressources/cases/create-case');

export const useCreateCaseMutation = () => {
  const navigate = useAgnosticNavigation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['cases', 'create-case'],
    mutationFn: async (payload: CreateCasePayload) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (result.redirectTo) {
        navigate(result.redirectTo);
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });
};
