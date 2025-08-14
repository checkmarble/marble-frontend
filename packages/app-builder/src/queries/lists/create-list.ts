import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { CreateListPayload } from '@app-builder/schemas/lists';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';

const endpoint = getRoute('/ressources/lists/create');

export const useCreateListMutation = () => {
  const navigate = useAgnosticNavigation();

  return useMutation({
    mutationKey: ['lists', 'create'],
    mutationFn: async (data: CreateListPayload) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.redirectTo) {
        navigate(result.redirectTo);
        return;
      }

      return result;
    },
  });
};
