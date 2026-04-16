import { type DeleteValuePayload } from '@app-builder/schemas/lists';
import { deleteListValueFn } from '@app-builder/server-fns/lists';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useDeleteListValueMutation = () => {
  const deleteListValue = useServerFn(deleteListValueFn);

  return useMutation({
    mutationKey: ['lists', 'deleteListValue'],
    mutationFn: async (data: DeleteValuePayload) => deleteListValue({ data }),
  });
};
