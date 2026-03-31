import { CreateTableValue, FieldEntity } from '@app-builder/queries/data/create-table';
import { match } from 'ts-pattern';
import z from 'zod/v4';
import { dataModelNameRegex } from '../../shared/dataModelNameValidation';
import {
  type FtmEntityPersonOption,
  type FtmEntityV2,
  type FtmEntityVehicleOption,
  ftmEntities,
  ftmEntityPersonOptions,
  ftmEntityVehicleOptions,
  type LinkValue,
  type TableField,
} from '../Shared/semanticData-types';

export type CreateTableFormValues = {
  name: string;
  alias: string;
  entityType: FtmEntityV2;
  subEntity: FtmEntityPersonOption | FtmEntityVehicleOption;
  belongsToTableId: string;
  fields: TableField[];
  mainTimestampFieldId: string;
  links: LinkValue[];
};

export const defaultCreateTableFields: TableField[] = [
  {
    id: 'default_object_id',
    name: 'object_id',
    description: '',
    dataType: 'String',
    tableId: '',
    isEnum: false,
    nullable: false,
    alias: 'object_id',
    hidden: false,
    order: 0,
    unicityConstraint: 'no_unicity_constraint',
    ftmProperty: '',
    semanticType: 'unique_id',
    semanticSubType: 'opaque_id',
    isNew: false,
    locked: true,
  },
  {
    id: 'default_updated_at',
    name: 'updated_at',
    description: '',
    dataType: 'Timestamp',
    tableId: '',
    isEnum: false,
    nullable: false,
    alias: 'updated_at',
    hidden: false,
    order: 1,
    unicityConstraint: 'no_unicity_constraint',
    ftmProperty: '',
    semanticType: 'last_update',
    semanticSubType: undefined,
    isNew: false,
    locked: true,
  },
];

export const defaultCreateTableFormValues: CreateTableFormValues = {
  name: '',
  alias: '',
  entityType: 'person',
  subEntity: 'moral',
  belongsToTableId: '',
  fields: defaultCreateTableFields,
  mainTimestampFieldId: '',
  links: [],
};

const entityTypesWithSubEntity = ['person', 'vehicle'] as const;
const entityTypesRequiringLink = ['transaction', 'event'] as const;

export const createTableEntityStepSchema = z
  .object({
    name: z.string().min(1).regex(dataModelNameRegex, {
      error: 'Only lower case alphanumeric and _, must start with a letter',
    }),
    alias: z.string(),
    entityType: z.enum(ftmEntities),
    subEntity: z.string(),
    belongsToTableId: z.string(),
  })
  .refine(
    (data) => {
      if (data.entityType === 'person') {
        return ftmEntityPersonOptions.includes(data.subEntity as (typeof ftmEntityPersonOptions)[number]);
      }
      if (data.entityType === 'vehicle') {
        return ftmEntityVehicleOptions.includes(data.subEntity as (typeof ftmEntityVehicleOptions)[number]);
      }
      return true;
    },
    { error: 'Please select a sub-entity', path: ['subEntity'] },
  )
  .refine(
    (data) => {
      if (data.entityType === 'transaction' || data.entityType === 'event') {
        return data.belongsToTableId.length > 0;
      }
      return true;
    },
    { error: 'Please select a destination table', path: ['belongsToTableId'] },
  );

export function hasSubEntityOptions(entityType: FtmEntityV2 | ''): entityType is 'person' | 'vehicle' {
  return entityTypesWithSubEntity.includes(entityType as (typeof entityTypesWithSubEntity)[number]);
}

export function requiresLink(entityType: FtmEntityV2 | ''): entityType is 'transaction' | 'event' {
  return entityTypesRequiringLink.includes(entityType as (typeof entityTypesRequiringLink)[number]);
}

export function canProceedToStep2(values: CreateTableFormValues): boolean {
  return createTableEntityStepSchema.safeParse(values).success;
}

export function adaptCreateTableValue(values: CreateTableFormValues): CreateTableValue {
  return {
    name: values.name,
    alias: values.alias,
    semantic_type: getEntityType(values.entityType, values.subEntity),
    description: '',
    fields: values.fields.map(adaptTableField),
    links: values.links
      .filter((l) => l.name && l.tableFieldId && l.targetTableId)
      .map((l) => ({
        name: l.name,
        child_field_name: values.fields.find((f) => f.id === l.tableFieldId)?.name ?? '',
        parent_table_id: l.targetTableId,
        // TODO: resolve parent_field_id from dataModel (object_id field of destination table)
        parent_field_id: '',
      })),
    metadata: {
      belongsToTableId: values.belongsToTableId,
      mainTimestampFieldId: values.mainTimestampFieldId,
    },
  };
}

function adaptTableField(field: TableField): CreateTableValue['fields'][number] {
  return {
    name: field.name,
    description: field.description,
    type: field.dataType,
    alias: field.alias,
    nullable: field.nullable,
    is_enum: field.isEnum,
    is_unique: field.unicityConstraint === 'active_unique_constraint',
    ftm_property: field.ftmProperty,
    metadata: {
      semanticType: field.semanticType,
      semanticSubType: field.semanticSubType,
      currencyExponent: field.currencyExponent,
      decimalPrecision: field.decimalPrecision,
      currencyFieldId: field.currencyFieldId,
      hidden: field.hidden,
      order: field.order,
    },
  };
}

function getEntityType(
  entityType: FtmEntityV2,
  subEntity: FtmEntityPersonOption | FtmEntityVehicleOption,
): FieldEntity {
  const fieldEntity = match(entityType)
    .with('person', () => {
      return match(subEntity)
        .with('moral', () => 'company')
        .with('natural', () => 'person')
        .with('generic', () => 'partner');
    })
    .with('vehicle', () => 'vehicle')
    .with('transaction', () => 'transaction')
    .with('event', () => 'event')
    .with('other', () => 'other')
    .with('account', () => 'account')
    .exhaustive();

  return fieldEntity as FieldEntity;
}
