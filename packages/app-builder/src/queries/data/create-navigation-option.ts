import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const createNavigationOptionSchema = z.object({
  sourceFieldId: z.uuid(),
  targetTableId: z.uuid(),
  filterFieldId: z.uuid(),
  orderingFieldId: z.uuid(),
});

type CreateNavigationOptionValue = z.infer<typeof createNavigationOptionSchema>;

const endpoint = (tableId: string) => getRoute('/ressources/data/:tableId/createNavigationOption', { tableId });

/** @deprecated Use useCreateNavigationOptionMutationV2 instead */
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

type CreateNavigationOptionWithTableId = CreateNavigationOptionValue & {
  tableId: string;
  scenarioId: string;
};

/**
 * Creates a navigation option for a table.
 * tableId is passed as part of the mutation variables, allowing multiple calls with different tableIds.
 * Invalidates builder-options query on success to refresh the dataModel.
 */
export const useCreateNavigationOptionMutationV2 = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['data', 'create-navigation-option'],
    mutationFn: async ({ tableId, scenarioId: _, ...value }: CreateNavigationOptionWithTableId) => {
      return fetch(endpoint(tableId), {
        method: 'POST',
        body: JSON.stringify(value),
      });
    },
    onSuccess: (_, { scenarioId }) => {
      // Invalidate builder-options query to refresh dataModel with new navigation options
      queryClient.invalidateQueries({
        queryKey: ['resources', 'builder-options', fromUUIDtoSUUID(scenarioId)],
      });
    },
  });
};
