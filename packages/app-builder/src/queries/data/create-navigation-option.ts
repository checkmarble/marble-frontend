import { type CreateNavigationOptionValue, createNavigationOptionSchema } from '@app-builder/schemas/data';
import { createNavigationOptionFn } from '@app-builder/server-fns/data';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { createNavigationOptionSchema, type CreateNavigationOptionValue };

type CreateNavigationOptionWithTableId = CreateNavigationOptionValue & {
  tableId: string;
  scenarioId: string;
};

export const useCreateNavigationOptionMutation = (tableId: string) => {
  const createNavigationOption = useServerFn(createNavigationOptionFn);

  return useMutation({
    mutationKey: ['data', 'create-navigation-option'],
    mutationFn: async (value: CreateNavigationOptionValue) => createNavigationOption({ data: { tableId, ...value } }),
  });
};

/**
 * Creates a navigation option for a table.
 * tableId is passed as part of the mutation variables, allowing multiple calls with different tableIds.
 * Invalidates builder-options query on success to refresh the dataModel.
 */
export const useCreateNavigationOptionForAstMutation = () => {
  const queryClient = useQueryClient();
  const createNavigationOption = useServerFn(createNavigationOptionFn);

  return useMutation({
    mutationKey: ['data', 'create-navigation-option'],
    mutationFn: async ({ tableId, scenarioId: _, ...value }: CreateNavigationOptionWithTableId) =>
      createNavigationOption({ data: { tableId, ...value } }),
    onSuccess: (_, { scenarioId }) => {
      // Invalidate builder-options query to refresh dataModel with new navigation options
      queryClient.invalidateQueries({
        queryKey: ['resources', 'builder-options', fromUUIDtoSUUID(scenarioId)],
      });
    },
  });
};
