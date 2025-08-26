import { CreateListPayload } from '@app-builder/schemas/lists';
import { useRedirectedMutation } from '@app-builder/utils/redirect/useRedirectedMutation';
import { getRoute } from '@app-builder/utils/routes';

const endpoint = getRoute('/ressources/lists/create');

export const useCreateListMutation = () => {
  return useRedirectedMutation({
    mutationKey: ['lists', 'create'],
    mutationFn: async (data: CreateListPayload) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      return response.json();
    },
  });
};
