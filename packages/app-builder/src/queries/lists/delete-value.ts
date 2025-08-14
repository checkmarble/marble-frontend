import { type DeleteValuePayload } from '@app-builder/schemas/lists';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { serialize } from 'object-to-formdata';

const endpoint = getRoute('/ressources/lists/value_delete');

export const useDeleteListValueMutation = () => {
  return useMutation({
    mutationKey: ['lists', 'deleteListValue'],
    mutationFn: async (data: DeleteValuePayload) => {
      const response = await fetch(endpoint, {
        method: 'DELETE',
        body: serialize(data),
      });

      return response.json();
    },
  });
};
