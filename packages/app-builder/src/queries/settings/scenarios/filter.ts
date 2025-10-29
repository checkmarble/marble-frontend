import type { ExportedFields } from '@app-builder/models/data-model';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import z from 'zod';

export const exportedFieldsSchema = z.object({
  triggerObjectFields: z.array(z.string()),
  ingestedDataFields: z.array(
    z.object({
      path: z.array(z.string()),
      name: z.string(),
    }),
  ),
});

const ingestedDataFieldSchema = z.object({
  path: z.array(z.string()),
  name: z.string(),
});
export const createExportedFieldSchema = z.union([
  z.object({ triggerObjectField: z.string() }),
  z.object({ ingestedDataField: ingestedDataFieldSchema }),
]);
export type CreateExportedFieldPayload = z.infer<typeof createExportedFieldSchema>;

export const useCreateFilterMutation = () => {
  return useMutation({
    mutationKey: ['settings', 'data-model', 'exported-fields', 'create'],
    mutationFn: async ({
      tableId,
      payload,
    }: {
      tableId: string;
      payload: CreateExportedFieldPayload;
    }) => {
      const endpoint = getRoute('/ressources/settings/data-model/tables/:tableId/exported-fields', {
        tableId,
      });
      const response = await fetch(endpoint, {
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

export const deleteExportedFieldSchema = z.union([
  z.object({ triggerObjectField: z.string() }),
  z.object({ ingestedDataField: ingestedDataFieldSchema }),
]);
export type DeleteExportedFieldPayload = z.infer<typeof deleteExportedFieldSchema>;

export const useDeleteFilterMutation = () => {
  return useMutation({
    mutationKey: ['settings', 'data-model', 'exported-fields', 'delete'],
    mutationFn: async ({
      tableId,
      payload,
    }: {
      tableId: string;
      payload: DeleteExportedFieldPayload;
    }) => {
      const endpoint = getRoute('/ressources/settings/data-model/tables/:tableId/exported-fields', {
        tableId,
      });
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      return response.json();
    },
  });
};

export const useUpdateFilterMutation = () => {
  return useMutation({
    mutationKey: ['settings', 'data-model', 'exported-fields', 'update'],
    mutationFn: async ({ tableId, payload }: { tableId: string; payload: ExportedFields }) => {
      const endpoint = getRoute('/ressources/settings/data-model/tables/:tableId/exported-fields', {
        tableId,
      });
      const response = await fetch(endpoint, {
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
