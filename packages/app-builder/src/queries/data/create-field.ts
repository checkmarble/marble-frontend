import { CreateFieldValue } from '@app-builder/schemas/data';
import { createFieldFn } from '@app-builder/server-fns/data';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useCreateFieldMutation = () => {
  const createField = useServerFn(createFieldFn);

  return useMutation({
    mutationKey: ['data', 'create-field'],
    mutationFn: async (field: CreateFieldValue) => createField({ data: field }),
  });
};
