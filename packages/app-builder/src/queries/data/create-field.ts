import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const createFieldValueSchema = z.object({
  name: z
    .string()
    .min(1, {
      message: 'data:create_field.name_min_error',
    })
    .regex(/^[a-z]+[a-z0-9_]*$/, {
      message: 'data:create_field.name_regex_error',
    })
    .refine((value) => value !== 'id', {
      message: 'data:create_field.name_reserved_error',
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
