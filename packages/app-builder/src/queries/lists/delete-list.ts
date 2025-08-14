import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { type DeleteListPayload } from '@app-builder/schemas/lists';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { serialize } from 'object-to-formdata';

const endpoint = getRoute('/ressources/lists/delete');

export const useDeleteListMutation = () => {
  const navigate = useAgnosticNavigation();

  return useMutation({
    mutationKey: ['lists', 'delete'],
    mutationFn: async (data: DeleteListPayload) => {
      const response = await fetch(endpoint, {
        method: 'DELETE',
        body: serialize(data),
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
