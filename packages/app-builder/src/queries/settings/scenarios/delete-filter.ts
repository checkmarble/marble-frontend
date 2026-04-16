import { type ExportedFieldPayload, exportedFieldSchema } from '@app-builder/schemas/settings';
import { deleteExportedFieldFn } from '@app-builder/server-fns/settings';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { exportedFieldSchema as deleteExportedFieldSchema, type ExportedFieldPayload as DeleteExportedFieldPayload };

export const useDeleteFilterMutation = () => {
  const deleteExportedField = useServerFn(deleteExportedFieldFn);

  return useMutation({
    mutationKey: ['settings', 'data-model', 'exported-fields', 'delete'],
    mutationFn: async ({ tableId, payload }: { tableId: string; payload: ExportedFieldPayload }) =>
      deleteExportedField({ data: { ...payload, tableId } }),
  });
};
