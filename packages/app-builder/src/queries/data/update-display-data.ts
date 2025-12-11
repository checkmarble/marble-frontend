import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';

type UpdateDataDisplayPayload = Record<string, { displayedFields: string[]; fieldOrder: string[] }>;

const endpoint = getRoute('/ressources/data/update/data-display');

export const useUpdateDisplayDataMutation = () => {
  const navigate = useAgnosticNavigation();

  return useMutation({
    mutationKey: ['data', 'update-display-data'],
    mutationFn: async (payload: UpdateDataDisplayPayload) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
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
