import { AddValuePayload } from '@app-builder/schemas/lists';
import { addListValueFn } from '@app-builder/server-fns/lists';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useAddListValueMutation = () => {
  const addListValue = useServerFn(addListValueFn);

  return useMutation({
    mutationKey: ['lists', 'addListValue'],
    mutationFn: async (data: AddValuePayload) => addListValue({ data }),
  });
};
