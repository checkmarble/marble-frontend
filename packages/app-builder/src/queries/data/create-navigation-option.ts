import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const createNavigationOptionSchema = z.object({
  sourceFieldId: z.uuid(),
  targetTableId: z.uuid(),
  filterFieldId: z.uuid(),
  orderingFieldId: z.uuid(),
});

type CreateNavigationOptionValue = z.infer<typeof createNavigationOptionSchema>;

const endpoint = (tableId: string) =>
  getRoute('/ressources/data/:tableId/createNavigationOption', { tableId });

export const useCreateNavigationOptionMutation = (tableId: string) => {
  return useMutation({
    mutationKey: ['data', 'create-navigation-option'],
    mutationFn: async (value: CreateNavigationOptionValue) => {
      return fetch(endpoint(tableId), {
        method: 'POST',
        body: JSON.stringify(value),
      });
    },
  });
};
