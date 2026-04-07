import { semanticTypeTable } from '@app-builder/components/Data/SemanticTables/Shared/semanticData-types';
import { dataModelNameRegex } from '@app-builder/components/Data/shared/dataModelNameValidation';
import { linkRelationTypes, primitiveTypes } from '@app-builder/models';
import { formatTableMutationError } from '@app-builder/services/data/table-mutation-errors';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { CreateTableResponseDto, FieldSemanticType } from 'marble-api';
import toast from 'react-hot-toast';
import z from 'zod/v4';

// need it as an array from the backend enum for zod validation
export const semanticFieldForBack: FieldSemanticType[] = [
  'name',
  'first_name',
  'middle_name',
  'last_name',
  'enum',
  'currency',
  'foreign_key',
  'country',
  'address',
  'id',
  'registration_number',
  'tax_id',
  'account_number',
  'iban',
  'bic',
  'url',
  'email',
  'phone_number',
  'date_of_birth',
  'last_update',
  'creation_date',
  'deletion_date',
  'initiation_date',
  'validation_date',
  'monetary_amount',
  'percentage',
];
export type SemanticFieldForBack = FieldSemanticType;

export const createFieldValuesSchema = z.object({
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
  semantic_type: z.enum(semanticFieldForBack).optional(),
});

export const createLinksValuesSchema = z.object({
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
  semantic_type: z.enum(semanticTypeTable),
  ftm_entity: z.string().optional(),
  metadata: z.record(z.string(), z.string().optional()).optional(),
  fields: z.array(createFieldValuesSchema),
  links: z.array(createLinksValuesSchema),
  primary_ordering_field: z.string(),
});

export type CreateTableValue = z.infer<typeof createTableValueSchema>;
export type CreateTableResponse =
  | { success: true; data: CreateTableResponseDto }
  | { success: false; errors: unknown; status: number; message?: string };

const endpoint = getRoute('/ressources/data/createTable');

export const useCreateTableMutation = () => {
  return useMutation({
    mutationKey: ['data', 'create-table'],
    mutationFn: async (table: CreateTableValue) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(table),
      });

      const result = (await response.json()) as CreateTableResponse;

      if (!response.ok && !result.success) {
        toast.error(
          formatTableMutationError({
            status: result.status,
            message: (result.message ?? response.statusText) || 'Request failed',
          }),
        );
      }

      return result;
    },
  });
};
