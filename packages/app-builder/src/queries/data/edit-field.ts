import { type EditFieldPayload, editFieldPayloadSchema } from '@app-builder/schemas/data';
import { editFieldFn } from '@app-builder/server-fns/data';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { editFieldPayloadSchema, type EditFieldPayload };

export const useEditFieldMutation = () => {
  const editField = useServerFn(editFieldFn);

  return useMutation({
    mutationKey: ['data', 'edit-field'],
    mutationFn: async (field: EditFieldPayload) => editField({ data: field }),
  });
};
