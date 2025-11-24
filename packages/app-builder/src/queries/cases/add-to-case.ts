import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const addToCasePayloadSchema = z.discriminatedUnion('newCase', [
  z.object({
    newCase: z.literal(true),
    name: z.string().min(1),
    decisionIds: z.array(z.string()),
    inboxId: z.string().min(1),
  }),
  z.object({
    newCase: z.literal(false),
    caseId: z.string().min(1),
    decisionIds: z.array(z.string()),
  }),
]);

export type AddToCasePayload = z.infer<typeof addToCasePayloadSchema>;

const endpoint = getRoute('/ressources/cases/add-to-case');

export const useAddToCaseMutation = () => {
  const navigate = useAgnosticNavigation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['cases', 'add-to-case'],
    mutationFn: async (payload: AddToCasePayload) => {
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
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });
};
