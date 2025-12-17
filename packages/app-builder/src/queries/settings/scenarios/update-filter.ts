import { getRoute } from '@app-builder/utils/routes';
import { protectArray } from '@app-builder/utils/schema/helpers/array';
import { useMutation } from '@tanstack/react-query';
import z from 'zod';
import { ingestedDataFieldSchema } from './schema';

export const exportedFieldsSchema = z.object({
  triggerObjectFields: protectArray(z.array(z.string())),
  ingestedDataFields: protectArray(z.array(ingestedDataFieldSchema)),
});

export const createExportedFieldSchema = z.union([
  z.object({ triggerObjectField: z.string() }),
  z.object({ ingestedDataField: ingestedDataFieldSchema }),
]);
export type CreateExportedFieldPayload = z.infer<typeof createExportedFieldSchema>;

const getEndpoint = (tableId: string) => {
  return getRoute('/ressources/settings/data-model/tables/:tableId/exported-fields/update', {
    tableId,
  });
};

export const useCreateFilterMutation = () => {
  return useMutation({
    mutationKey: ['settings', 'data-model', 'exported-fields', 'create'],
    mutationFn: async ({ tableId, payload }: { tableId: string; payload: CreateExportedFieldPayload }) => {
      const response = await fetch(getEndpoint(tableId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      return response.json();
    },
  });
};
