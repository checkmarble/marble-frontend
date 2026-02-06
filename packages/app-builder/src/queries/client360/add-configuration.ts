import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

const semanticTypes = ['person', 'company'] as const;

export const addConfigurationPayloadSchema = z.object({
  tableId: z.uuid(),
  semanticType: z.enum(semanticTypes),
  captionField: z.string().min(1),
  alias: z.string(),
});

export type AddConfigurationPayload = z.infer<typeof addConfigurationPayloadSchema>;

const endpoint = getRoute('/ressources/client-360/add-configuration');

export const useAddConfigurationMutation = () => {
  const navigate = useAgnosticNavigation();

  return useMutation({
    mutationKey: ['client360', 'add-configuration'],
    mutationFn: async (payload: AddConfigurationPayload) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.redirectTo) {
        navigate(result.redirectTo);
        return { success: false, errors: [] };
      }

      return result;
    },
  });
};
