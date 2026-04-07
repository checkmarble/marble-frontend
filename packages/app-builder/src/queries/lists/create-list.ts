import { CreateListPayload } from '@app-builder/schemas/lists';
import { createListFn } from '@app-builder/server-fns/lists';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useCreateListMutation = () => {
  const createList = useServerFn(createListFn);

  return useMutation({
    mutationKey: ['lists', 'create'],
    mutationFn: async (data: CreateListPayload) => createList({ data }),
  });
};
