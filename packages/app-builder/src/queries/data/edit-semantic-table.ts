import { semanticTypeTable } from '@app-builder/components/Data/SemanticTables/Shared/semanticData-types';
import { dataModelNameRegex } from '@app-builder/components/Data/shared/dataModelNameValidation';
import { linkRelationTypes } from '@app-builder/models';
import { formatTableMutationError } from '@app-builder/services/data/table-mutation-errors';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { z } from 'zod/v4';
import { createFieldValuesSchema, createLinksValuesSchema, semanticFieldForBack } from './create-table';

const fieldOperation = z.union([
  z.object({
    op: z.literal('MOD'),
    data: z.object({
      id: z.string(),
      description: z.string().optional(),
      is_enum: z.boolean().optional(),
      is_unique: z.boolean().optional(),
      is_nullable: z.boolean().optional(),
      ftm_property: z.string().optional(),
      alias: z.string().optional(),
      semantic_type: z.enum(semanticFieldForBack).optional(),
      metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()]).optional()).optional(),
    }),
  }),
  z.object({
    op: z.literal('DEL'),
    data: z.object({ id: z.uuid() }),
  }),
  z.object({
    op: z.literal('ADD'),
    data: createFieldValuesSchema,
  }),
]);

const linkOperation = z.union([
  z.object({
    op: z.literal('ADD'),
    data: createLinksValuesSchema,
  }),
  z.object({
    op: z.literal('MOD'),
    data: z.object({
      id: z.string(),
      name: z
        .string()
        .min(1)
        .regex(dataModelNameRegex, {
          error: 'Only lower case alphanumeric and _, must start with a letter',
        })
        .optional(),
      child_field_name: z
        .string()
        .min(1)
        .regex(dataModelNameRegex, {
          error: 'Only lower case alphanumeric and _, must start with a letter',
        })
        .optional(),
      parent_table_id: z.uuid().optional(),
      parent_field_id: z.uuid().optional(),
      link_type: z.enum(linkRelationTypes).optional(),
    }),
  }),
  z.object({
    op: z.literal('DEL'),
    data: z.object({ id: z.uuid() }),
  }),
]);

export const EditSemanticTablePayloadSchema = z.object({
  tableId: z.string(),
  description: z.string().optional(),
  semantic_type: z.enum(semanticTypeTable).optional(),
  caption_field: z.string().optional(),
  alias: z.string().optional(),
  ftm_entity: z.string().optional(),
  primary_ordering_field: z.string().optional(),
  fields: z.array(fieldOperation).optional(),
  links: z.array(linkOperation).optional(),
  metadata: z.record(z.string(), z.string().optional()).optional(),
});

export type EditSemanticTablePayload = z.infer<typeof EditSemanticTablePayloadSchema>;
export type EditSemanticFieldPayload = z.infer<typeof fieldOperation>;
export type EditSemanticLinkPayload = z.infer<typeof linkOperation>;

export type EditSemanticTableResponse =
  | { success: true; errors: [] }
  | { success: false; errors: unknown; status: number; message?: string };

const endpoint = getRoute('/ressources/data/editSemanticTable');

export const useEditSemanticTableMutation = () => {
  return useMutation({
    mutationKey: ['data', 'edit-table'],
    mutationFn: async (table: EditSemanticTablePayload) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(table),
      });

      const result = (await response.json()) as EditSemanticTableResponse;

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
