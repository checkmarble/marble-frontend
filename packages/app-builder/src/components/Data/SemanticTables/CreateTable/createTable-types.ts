import {
  LinkValue,
  type SemanticTableFormValues,
  SemanticTypeTable,
  type TableField,
} from '@app-builder/components/Data/SemanticTables/Shared/semanticData-types';
import { dataModelNameRegex } from '@app-builder/components/Data/shared/dataModelNameValidation';
import {
  FtmEntityPersonOption,
  FtmEntityV2,
  ftmEntities,
  ftmEntityPersonOptions,
  type SemanticSubTypeField,
  SemanticSubTypeFieldMap,
  SemanticTypeField,
  type TableModel,
} from '@app-builder/models';
import { CreateTableValue } from '@app-builder/schemas/data';
import { TFunction } from 'i18next';
import { FieldSemanticType } from 'marble-api';
import { match } from 'ts-pattern';
import z from 'zod/v4';

export type { SemanticTableFormValues };

export type TablePropertyError = {
  kind: 'table';
  field: 'name' | 'entityType' | 'subEntity' | 'belongsToTableId' | 'mainTimestampFieldName';
  message: string;
};
export type FieldValidationError = { kind: 'field'; fieldId: string; message: string };
export type LinkValidationError = { kind: 'link'; linkId: string; message: string };
export type ValidationError = TablePropertyError | FieldValidationError | LinkValidationError;
export type ValidationResult = { ok: true } | { ok: false; errors: ValidationError[] };
export type ValidationScope = 'all' | 'table' | 'fields' | 'links';
type ValidationTableModel = Pick<TableModel, 'id' | 'semanticType' | 'belongsToTableId' | 'linksToSingle'>;

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
    unicityConstraint: 'no_unicity_constraint',
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
    unicityConstraint: 'no_unicity_constraint',
    semanticType: 'last_update',
    semanticSubType: undefined,
    isNew: false,
    locked: true,
  },
];

export const defaultCreateTableFormValues: SemanticTableFormValues = {
  tableId: '',
  name: '',
  alias: '',
  entityType: 'person',
  subEntity: 'moral',
  belongsToTableId: '',
  fields: defaultCreateTableFields,
  mainTimestampFieldName: 'updated_at',
  links: [],
  metaData: {},
  isCanceled: false,
  isVisited: false,
};

const entityTypesRequiringLink = ['transaction', 'event', 'account'] as const;
type EntityTypeRequiringLink = (typeof entityTypesRequiringLink)[number];

const tableEntityStepCommonShape = {
  name: z.string().min(1).regex(dataModelNameRegex, {
    error: 'Only lower case alphanumeric and _, must start with a letter',
  }),
  alias: z.string(),
  belongsToTableId: z.string(),
};

export const createTableEntityStepSchema = z
  .object({
    ...tableEntityStepCommonShape,
    entityType: z.enum(ftmEntities),
    subEntity: z.enum(ftmEntityPersonOptions).optional(),
  })
  .refine(
    (data) => {
      if (data.entityType === 'person') return !!data.subEntity;

      return true;
    },
    { error: 'Please select a sub-entity', path: ['subEntity'] },
  )
  .refine(
    (data) => {
      if (requiresLink(data.entityType)) return data.belongsToTableId.length > 0;

      return true;
    },
    { error: 'Please select a destination table', path: ['belongsToTableId'] },
  );
const editTableEntityStepSchema = z
  .object({
    ...tableEntityStepCommonShape,
    entityType: z.union([z.enum(ftmEntities), z.literal('unset')]),
    subEntity: z.union([z.enum(ftmEntityPersonOptions), z.literal('unset')]).optional(),
  })
  .refine(
    (data) => {
      if (data.entityType === 'person') return !!data.subEntity && data.subEntity !== 'unset';

      return true;
    },
    { error: 'Please select a sub-entity', path: ['subEntity'] },
  )
  .refine(
    (data) => {
      if (data.entityType === 'unset') return true;
      if (requiresLink(data.entityType)) return data.belongsToTableId.length > 0;

      return true;
    },
    { error: 'Please select a destination table', path: ['belongsToTableId'] },
  );

export function requiresLink(entityType: FtmEntityV2 | ''): entityType is EntityTypeRequiringLink {
  return entityTypesRequiringLink.includes(entityType as EntityTypeRequiringLink);
}

export function canProceedToStep2(values: SemanticTableFormValues): boolean {
  return createTableEntityStepSchema.safeParse(values).success;
}

export function adaptSemanticField(
  semanticType: SemanticTypeField | undefined,
  subType?: SemanticSubTypeField,
): FieldSemanticType | undefined {
  return match(semanticType)
    .with(undefined, () => undefined)
    .with('text', () => undefined)
    .with('name', () =>
      match(subType as SemanticSubTypeFieldMap['name'] | undefined)
        .with(undefined, () => undefined)
        .with('first_name', () => 'first_name' as const)
        .with('middle_name', () => 'middle_name' as const)
        .with('last_name', () => 'last_name' as const)
        .with('caption', () => 'name' as const)
        .exhaustive(),
    )
    .with('enum', () => 'enum' as const)
    .with('currency_code', () => 'currency' as const)
    .with('foreign_key', () => 'foreign_key' as const)
    .with('country', () => 'country' as const)
    .with('address', () => 'address' as const)
    .with('unique_id', () => 'id' as const)
    .with('link', () =>
      match(subType as SemanticSubTypeFieldMap['link'] | undefined)
        .with(undefined, () => undefined)
        .with('url', () => 'url' as const)
        .with('email', () => 'email' as const)
        .with('phone', () => 'phone_number' as const)
        .exhaustive(),
    )
    .with('account_identifier', () =>
      match(subType as SemanticSubTypeFieldMap['account_identifier'] | undefined)
        .with(undefined, () => undefined)
        .with('account_number', () => 'account_number' as const)
        .with('iban', () => 'iban' as const)
        .with('bic', () => 'bic' as const)
        .exhaustive(),
    )
    .with('timestamp', () => undefined)
    .with('date_of_birth', () => 'date_of_birth' as const)
    .with('last_update', () => 'last_update' as const)
    .with('creation_date', () => 'creation_date' as const)
    .with('deletion_date', () => 'deletion_date' as const)
    .with('initiation_date', () => 'initiation_date' as const)
    .with('validation_date', () => 'validation_date' as const)
    .with('number', () => undefined)
    .with('monetary_amount', () => 'monetary_amount' as const)
    .with('percentage', () => 'percentage' as const)
    .exhaustive();
}

export function adaptCreateTableValue(values: SemanticTableFormValues): CreateTableValue {
  return {
    name: values.name,
    alias: values.alias || values.name,
    semantic_type: getEntityType(
      values.entityType === 'unset' ? 'other' : values.entityType,
      values.subEntity === 'unset' ? 'moral' : values.subEntity,
    ),
    description: '',
    fields: values.fields.map(adaptTableField),
    links: values.links.map(adaptLink),
    primary_ordering_field: values.mainTimestampFieldName || 'updated_at',
    metadata: {
      belongsToTableId: values.belongsToTableId || undefined,
      fieldOrder: values.fields.map((f) => f.name).join(','),
    },
  };
}

export function adaptTableField(field: TableField): CreateTableValue['fields'][number] {
  return {
    name: field.name,
    description: field.description,
    type: field.dataType,
    alias: field.alias || field.name,
    nullable: field.nullable,
    is_enum: field.isEnum || field.semanticType === 'enum',
    is_unique: field.unicityConstraint === 'active_unique_constraint',
    semantic_type: adaptSemanticField(field.semanticType, field.semanticSubType),
    metadata: {
      semanticTypeForFront: field.semanticType,
      semanticSubType: field.semanticSubType,
      currencyExponent: field.currencyExponent,
      decimalPrecision: field.decimalPrecision,
      currencyFieldId: field.currencyFieldId,
      foreignkeyTable: field.foreignkeyTable,
      hidden: field.hidden,
      booleanDisplay: field.booleanDisplay,
      isInteger: field.isInteger,
    },
  };
}

export function adaptLink(link: LinkValue): CreateTableValue['links'][number] {
  return {
    name: link.name,
    child_field_name: link.tableFieldId,
    link_type: link.relationType,
    parent_table_id: link.targetTableId,
  };
}

function getEntityType(entityType: FtmEntityV2, subEntity: FtmEntityPersonOption): SemanticTypeTable {
  const fieldEntity = match(entityType)
    .with('person', () => getEntitySubtype(subEntity))
    .with('transaction', () => 'transaction')
    .with('event', () => 'event')
    .with('other', () => 'other')
    .with('account', () => 'account')
    .exhaustive();

  return fieldEntity as SemanticTypeTable;
}

export function getEntitySubtype(subEntity: FtmEntityPersonOption): SemanticTypeTable {
  return match(subEntity)
    .with('moral', () => 'company' as const)
    .with('natural', () => 'person' as const)
    .with('generic', () => 'partner' as const)
    .exhaustive();
}

type SemanticTableConstraints = {
  type: SemanticTypeField;
  subType?: SemanticSubTypeField;
  name?: string;
  dataType?: FtmEntityV2;
}[];

const tableConstraints = [
  { name: 'object_id', type: 'unique_id', subType: 'opaque_id' },
  { name: 'updated_at', type: 'last_update' },
  { type: 'name', dataType: 'person' },
] as const satisfies SemanticTableConstraints;

const knownTableFields = ['name', 'entityType', 'subEntity', 'belongsToTableId'] as const;

function getTablePropertyErrors(values: SemanticTableFormValues, creationMode: boolean = false): TablePropertyError[] {
  const parsing = creationMode
    ? createTableEntityStepSchema.safeParse(values)
    : editTableEntityStepSchema.safeParse(values);
  if (!parsing.success) {
    return parsing.error.issues.map((issue) => ({
      kind: 'table' as const,
      field: (knownTableFields.includes(issue.path[0] as (typeof knownTableFields)[number])
        ? issue.path[0]
        : 'name') as TablePropertyError['field'],
      message: issue.message,
    }));
  }

  return [];
}

function resolveBelongsToParentTableId(table: ValidationTableModel): string | undefined {
  return (
    table.belongsToTableId ?? table.linksToSingle.find((link) => link.relationType === 'belongs_to')?.parentTableId
  );
}

function getEntityTypeChangeErrors(
  values: SemanticTableFormValues,
  t: TFunction<['data']>,
  tables?: ValidationTableModel[],
): TablePropertyError[] {
  if (!tables || !values.tableId) return [];
  const previousTable = tables.find((table) => table.id === values.tableId);
  if (!previousTable) return [];

  const previousEntityType = previousTable.semanticType ?? '';
  const nextEntityType = values.entityType === 'unset' ? '' : values.entityType;
  if (previousEntityType !== 'person' || nextEntityType === 'person') return [];

  const hasBlockingChild = tables.some((table) => {
    if (table.id === values.tableId) return false;
    if (!requiresLink(table.semanticType ?? '')) return false;

    return resolveBelongsToParentTableId(table) === values.tableId;
  });

  if (!hasBlockingChild) return [];

  return [
    {
      kind: 'table',
      field: 'entityType',
      message: t('data:create_table.person_parent_entity_type_change_forbidden'),
    },
  ];
}

function getConstraintErrors(values: SemanticTableFormValues, t: TFunction<['data']>) {
  const errors: ValidationError[] = [];
  const constraints: SemanticTableConstraints = [...tableConstraints];
  const entityType = values.entityType === 'unset' ? '' : values.entityType;

  for (const constraint of constraints) {
    if (constraint) {
      const { name, type, subType, dataType } = constraint;
      if (dataType !== undefined && dataType !== entityType) continue;
      const found = values.fields.some((f) => {
        if (name && f.name !== name) return false;
        if (type && f.semanticType !== type) return false;
        if (subType && f.semanticSubType !== subType) return false;
        return true;
      });
      if (!found) {
        errors.push({
          kind: 'table',
          field: 'name',
          message: t('data:create_table.missing_required_field', { field: name ?? type }),
        });
      }
    }
  }

  return errors;
}

function getFieldErrors(values: SemanticTableFormValues, t: TFunction<['data']>): FieldValidationError[] {
  const errors: FieldValidationError[] = [];
  const nameCounts = new Map<string, string[]>();

  for (const field of values.fields) {
    if (!field.name.trim()) {
      errors.push({
        kind: 'field',
        fieldId: field.id,
        message: t('data:create_table.field_name_required', { field: field.alias || field.id }),
      });
    } else if (!dataModelNameRegex.test(field.name)) {
      errors.push({
        kind: 'field',
        fieldId: field.id,
        message: t('data:create_table.field_name_regex_error', { field: field.name }),
      });
    } else {
      const ids = nameCounts.get(field.name) ?? [];
      ids.push(field.id);
      nameCounts.set(field.name, ids);
    }
  }

  for (const [name, ids] of nameCounts) {
    if (ids.length > 1) {
      for (const fieldId of ids) {
        errors.push({ kind: 'field', fieldId, message: t('data:create_table.duplicate_field_name', { name }) });
      }
    }
  }

  return errors;
}

function getLinkErrors(values: SemanticTableFormValues, t: TFunction<['data']>): LinkValidationError[] {
  const errors: LinkValidationError[] = [];
  const nameCounts = new Map<string, string[]>();
  const entityType = values.entityType === 'unset' ? '' : values.entityType;
  const hasBelongsToLink = values.links.some((link) => link.relationType === 'belongs_to');

  for (const link of values.links) {
    const linkField = values.fields.find((field) => field.name === link.tableFieldId);
    const trimmedName = link.name.trim();

    if (!trimmedName) {
      errors.push({ kind: 'link', linkId: link.linkId, message: t('data:create_table.link_missing_name') });
    } else if (!dataModelNameRegex.test(trimmedName)) {
      errors.push({
        kind: 'link',
        linkId: link.linkId,
        message: t('data:create_table.link_name_regex_error', { link: link.name }),
      });
    } else {
      const ids = nameCounts.get(trimmedName) ?? [];
      ids.push(link.linkId);
      nameCounts.set(trimmedName, ids);
    }

    if (!link.targetTableId) {
      errors.push({
        kind: 'link',
        linkId: link.linkId,
        message: t('data:create_table.link_target_table_required', { link: link.name || '(unnamed)' }),
      });
    }
    if (!link.tableFieldId) {
      errors.push({
        kind: 'link',
        linkId: link.linkId,
        message: t('data:create_table.link_field_required', { link: link.name || '(unnamed)' }),
      });
    }
    if (linkField?.name === 'object_id') {
      errors.push({
        kind: 'link',
        linkId: link.linkId,
        message: t('data:create_table.link_object_id_cannot_point_to_current_table', {
          link: link.name || '(unnamed)',
        }),
      });
    }

    if (requiresLink(entityType) && !hasBelongsToLink) {
      errors.push({
        kind: 'link',
        linkId: link.linkId,
        message: t('data:create_table.link_to_related_table_required'),
      });
    }
  }

  for (const [name, ids] of nameCounts) {
    if (ids.length > 1) {
      for (const linkId of ids) {
        errors.push({ kind: 'link', linkId, message: t('data:create_table.duplicate_link_name', { name }) });
      }
    }
  }

  return errors;
}

export function validateValues(
  values: SemanticTableFormValues,
  scope: ValidationScope = 'all',
  t: TFunction<['data']>,
  creationMode: boolean = false,
  tables?: ValidationTableModel[],
): ValidationResult {
  const errors: ValidationError[] = [];

  if (scope === 'table' || scope === 'all') {
    // enforce 'updated_at' to be the default sort order if there is no other
    const hasUpdatedAt = values.fields.some((f) => f.name === 'updated_at'); // should always be true
    if (!values.mainTimestampFieldName && hasUpdatedAt) values.mainTimestampFieldName = 'updated_at';

    errors.push(...getTablePropertyErrors(values, creationMode));
    if (!creationMode) {
      errors.push(...getEntityTypeChangeErrors(values, t, tables));
    }
    if (!values.mainTimestampFieldName) {
      errors.push({
        kind: 'table',
        field: 'mainTimestampFieldName',
        message: t('data:create_table.one_timestamp_field_should_be_selected_as_the_main_ordering_field'),
      });
    }
  }

  if (scope === 'fields' || scope === 'all') {
    errors.push(...getConstraintErrors(values, t), ...getFieldErrors(values, t));
  }

  if (scope === 'links' || scope === 'all') {
    errors.push(...getLinkErrors(values, t));
  }

  return errors.length > 0 ? { ok: false, errors } : { ok: true };
}

export { apiSemanticTypeToFormEntity } from '@app-builder/models';
