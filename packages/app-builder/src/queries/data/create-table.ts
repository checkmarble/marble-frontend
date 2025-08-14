import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import z from 'zod/v4';

export const createTableValueSchema = z.object({
  name: z
    .string()
    .min(1)
    .regex(/^[a-z]+[a-z0-9_]+$/, {
      error: 'Only lower case alphanumeric and _, must start with a letter',
    }),
  description: z.string(),
});

export type CreateTableValue = z.infer<typeof createTableValueSchema>;

const endpoint = getRoute('/ressources/data/createTable');

export const useCreateTableMutation = () => {
  return useMutation({
    mutationKey: ['data', 'create-table'],
    mutationFn: async (table: CreateTableValue) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(table),
      });

      return response.json();
    },
  });
};
