import { type ExportedFieldPayload, exportedFieldSchema } from '@app-builder/schemas/settings';
import { updateExportedFieldFn } from '@app-builder/server-fns/settings';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { exportedFieldSchema as createExportedFieldSchema, type ExportedFieldPayload as CreateExportedFieldPayload };

export const useCreateFilterMutation = () => {
  const updateExportedField = useServerFn(updateExportedFieldFn);

  return useMutation({
    mutationKey: ['settings', 'data-model', 'exported-fields', 'create'],
    mutationFn: async ({ tableId, payload }: { tableId: string; payload: ExportedFieldPayload }) =>
      updateExportedField({ data: { ...payload, tableId } }),
  });
};
