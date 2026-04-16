import { EditListPayload } from '@app-builder/schemas/lists';
import { editListFn } from '@app-builder/server-fns/lists';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useEditListMutation = () => {
  const editList = useServerFn(editListFn);

  return useMutation({
    mutationKey: ['lists', 'edit'],
    mutationFn: async (data: EditListPayload) => editList({ data }),
  });
};
