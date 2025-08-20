import { AddValuePayload } from '@app-builder/schemas/lists';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';

const endpoint = getRoute('/ressources/lists/value_create');

export const useAddListValueMutation = () => {
  return useMutation({
    mutationKey: ['lists', 'addListValue'],
    mutationFn: async (data: AddValuePayload) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      return response.json();
    },
  });
};
