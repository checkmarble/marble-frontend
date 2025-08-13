import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const createFieldValueSchema = z.object({
  name: z
    .string()
    .min(1)
    .regex(/^[a-z]+[a-z0-9_]+$/, {
      error: 'Only lower case alphanumeric and _, must start with a letter',
    })
    .refine((value) => value !== 'id', {
      error: 'The name "id" is reserved',
    }),
  description: z.string(),
  required: z.string(),
  type: z.enum(['String', 'Bool', 'Timestamp', 'Float', 'Int']),
  tableId: z.string(),
  isEnum: z.boolean(),
  isUnique: z.boolean(),
});

export type CreateFieldValue = z.infer<typeof createFieldValueSchema>;

const endpoint = getRoute('/ressources/data/createField');

export const useCreateFieldMutation = () => {
  return useMutation({
    mutationKey: ['data', 'create-field'],
    mutationFn: async (field: CreateFieldValue) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(field),
      });

      return response.json();
    },
  });
};
