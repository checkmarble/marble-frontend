import { type DeleteListPayload } from '@app-builder/schemas/lists';
import { deleteListFn } from '@app-builder/server-fns/lists';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useDeleteListMutation = () => {
  const deleteList = useServerFn(deleteListFn);

  return useMutation({
    mutationKey: ['lists', 'delete'],
    mutationFn: async (data: DeleteListPayload) => deleteList({ data }),
  });
};
