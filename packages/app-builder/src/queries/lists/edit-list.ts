import { EditListPayload } from '@app-builder/schemas/lists';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';

const endpoint = getRoute('/ressources/lists/edit');

export const useEditListMutation = () => {
  return useMutation({
    mutationKey: ['lists', 'edit'],
    mutationFn: async (data: EditListPayload) => {
      const response = await fetch(endpoint, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });

      return response.json();
    },
  });
};
