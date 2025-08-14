import { PivotOption } from '@app-builder/services/data/pivot';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';

const endpoint = getRoute('/ressources/data/create-pivot');

export const useCreatePivotMutation = () => {
  return useMutation({
    mutationKey: ['data', 'create-pivot'],
    mutationFn: async (pivot: PivotOption) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ pivot }),
      });

      return response.json();
    },
  });
};
