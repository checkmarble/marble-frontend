import "./settings-CEpHMlp5.js";
import { C as updateExportedFieldFn, D as deleteExportedFieldFn } from "./settings-CPv2zx4k.js";
import { u as useMutation } from "./useMutation-C5oG90Zs.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
const useCreateFilterMutation = () => {
  const updateExportedField = useServerFn(updateExportedFieldFn);
  return useMutation({
    mutationKey: ["settings", "data-model", "exported-fields", "create"],
    mutationFn: async ({ tableId, payload }) => updateExportedField({ data: { ...payload, tableId } })
  });
};
const useDeleteFilterMutation = () => {
  const deleteExportedField = useServerFn(deleteExportedFieldFn);
  return useMutation({
    mutationKey: ["settings", "data-model", "exported-fields", "delete"],
    mutationFn: async ({ tableId, payload }) => deleteExportedField({ data: { ...payload, tableId } })
  });
};
export {
  useDeleteFilterMutation as a,
  useCreateFilterMutation as u
};
