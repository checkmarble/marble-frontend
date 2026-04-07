import { addClient360ConfigurationFn } from '@app-builder/server-fns/client-360';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { z } from 'zod/v4';

const semanticTypes = ['person', 'company'] as const;

export const addConfigurationPayloadSchema = z.object({
  tableId: z.uuid(),
  semanticType: z.enum(semanticTypes),
  captionField: z.string().min(1),
  alias: z.string().optional(),
});

export type AddConfigurationPayload = z.infer<typeof addConfigurationPayloadSchema>;

export const useAddConfigurationMutation = () => {
  const addConfiguration = useServerFn(addClient360ConfigurationFn);

  return useMutation({
    mutationKey: ['client360', 'add-configuration'],
    mutationFn: async (payload: AddConfigurationPayload) => addConfiguration({ data: payload }),
  });
};
