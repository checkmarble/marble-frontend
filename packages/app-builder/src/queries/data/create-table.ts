import { dataModelNameRegex } from '@app-builder/components/Data/shared/dataModelNameValidation';
import { linkRelationTypes, primitiveTypes } from '@app-builder/models';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import z from 'zod/v4';

const fieldEntities = ['person', 'company', 'account', 'transaction', 'event', 'partner', 'other'] as const;
export type FieldEntity = (typeof fieldEntities)[number];

const createFieldValuesSchema = z.object({
  name: z.string().min(1).regex(dataModelNameRegex, {
    error: 'Only lower case alphanumeric and _, must start with a letter',
  }),
  description: z.string().optional(),
  type: z.enum(primitiveTypes),
  alias: z.string().optional(),
  nullable: z.boolean().optional(),
  is_enum: z.boolean().optional(),
  is_unique: z.boolean().optional(),
  ftm_property: z.string().optional(),
  metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()]).optional()).optional(),
});

const createLinksValuesSchema = z.object({
  name: z.string().min(1).regex(dataModelNameRegex, {
    error: 'Only lower case alphanumeric and _, must start with a letter',
  }),
  child_field_name: z.string().min(1).regex(dataModelNameRegex, {
    error: 'Only lower case alphanumeric and _, must start with a letter',
  }),
  parent_table_id: z.uuid(),
  parent_field_id: z.uuid().optional(),
  link_type: z.enum(linkRelationTypes),
});

export const createTableValueSchema = z.object({
  name: z.string().min(1).regex(dataModelNameRegex, {
    error: 'Only lower case alphanumeric and _, must start with a letter',
  }),
  description: z.string().optional(),
  alias: z.string().optional(),
  semantic_type: z.enum(fieldEntities),
  ftm_entity: z.string().optional(),
  metadata: z.record(z.string(), z.string().optional()).optional(),
  fields: z.array(createFieldValuesSchema),
  links: z.array(createLinksValuesSchema),
});

export type CreateTableValue = z.infer<typeof createTableValueSchema>;
export type CreateTableResponse = { success: true; data: { id: string } } | { success: false; errors: unknown };

const endpoint = getRoute('/ressources/data/createTable');

export const useCreateTableMutation = () => {
  return useMutation({
    mutationKey: ['data', 'create-table'],
    mutationFn: async (table: CreateTableValue) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(table),
      });

      return response.json() as Promise<CreateTableResponse>;
    },
  });
};
