import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const createLinkValueSchema = z.object({
  name: z
    .string()
    .min(1)
    .regex(/^[a-z]+[a-z0-9_]+$/, {
      error: 'Only lower case alphanumeric and _, must start with a letter',
    }),
  parentTableId: z.uuid().min(1),
  parentFieldId: z.uuid().min(1),
  childTableId: z.uuid().min(1),
  childFieldId: z.uuid().min(1),
});

export type CreateLinkValue = z.infer<typeof createLinkValueSchema>;

const endpoint = getRoute('/ressources/data/createLink');

export const useCreateLinkMutation = () => {
  return useMutation({
    mutationKey: ['data', 'create-link'],
    mutationFn: async (link: CreateLinkValue) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(link),
      });

      return response.json();
    },
  });
};
