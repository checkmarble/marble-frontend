import { semanticTypeTable } from '@app-builder/components/Data/SemanticTables/Shared/semanticData-types';
import { dataModelNameRegex } from '@app-builder/components/Data/shared/dataModelNameValidation';
import { semanticFieldForBack } from '@app-builder/constants/data-model';
import { linkRelationTypes, primitiveTypes } from '@app-builder/models';
import { z } from 'zod/v4';

export const applyArchetypePayloadSchema = z.object({
  name: z.string().min(1),
});
export type ApplyArchetypePayload = z.infer<typeof applyArchetypePayloadSchema>;

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

export const deleteTablePayloadSchema = z.object({
  tableId: z.uuid(),
  perform: z.boolean(),
});
export type DeleteTablePayload = z.infer<typeof deleteTablePayloadSchema>;

export const createNavigationOptionSchema = z.object({
  sourceFieldId: z.uuid(),
  targetTableId: z.uuid(),
  filterFieldId: z.uuid(),
  orderingFieldId: z.uuid(),
});
export type CreateNavigationOptionValue = z.infer<typeof createNavigationOptionSchema>;

export const listObjectsInputSchema = z.object({
  tableName: z.string(),
  sourceTableName: z.string(),
  filterFieldName: z.string(),
  filterFieldValue: z.union([z.string(), z.number()]),
  orderingFieldName: z.string(),
  limit: z.number().optional(),
  offsetId: z.union([z.string(), z.number()]).optional(),
});
export type ListObjectsInput = z.infer<typeof listObjectsInputSchema>;

// New data model schemas

const fieldOperationSchema = z.union([
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

const linkOperationSchema = z.union([
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

export const editSemanticTablePayloadSchema = z.object({
  tableId: z.string(),
  description: z.string().optional(),
  semantic_type: z.enum(semanticTypeTable).optional(),
  caption_field: z.string().optional(),
  alias: z.string().optional(),
  ftm_entity: z.string().optional(),
  primary_ordering_field: z.string().optional(),
  fields: z.array(fieldOperationSchema).optional(),
  links: z.array(linkOperationSchema).optional(),
  metadata: z.record(z.string(), z.string().optional()).optional(),
});

export type EditSemanticTablePayload = z.infer<typeof editSemanticTablePayloadSchema>;
export type EditSemanticFieldPayload = z.infer<typeof fieldOperationSchema>;
export type EditSemanticLinkPayload = z.infer<typeof linkOperationSchema>;
