import {
  LinkValue,
  type SemanticSubType,
  type SemanticTableFormValues,
  type SemanticType,
  type TableField,
} from '@app-builder/components/Data/SemanticTables/Shared/semanticData-types';
import { dataModelNameRegex } from '@app-builder/components/Data/shared/dataModelNameValidation';
import { CREATE_TABLE_SELF_LINK_TARGET_ID } from '@app-builder/components/Data/shared/LinksEditorContext';
import { FtmEntityPersonOption, FtmEntityV2, ftmEntities, ftmEntityPersonOptions } from '@app-builder/models';
import { CreateTableValue, FieldEntity } from '@app-builder/queries/data/create-table';
import { match } from 'ts-pattern';
import z from 'zod/v4';

export type { SemanticTableFormValues };

export type TablePropertyError = {
  kind: 'table';
  field: 'name' | 'entityType' | 'subEntity' | 'belongsToTableId' | 'mainTimestampFieldId';
  message: string;
};
export type FieldValidationError = { kind: 'field'; fieldId: string; message: string };
export type LinkValidationError = { kind: 'link'; linkId: string; message: string };
export type ValidationError = TablePropertyError | FieldValidationError | LinkValidationError;
export type ValidationResult = { ok: true } | { ok: false; errors: ValidationError[] };
export type ValidationScope = 'all' | 'table' | 'fields' | 'links';

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

export const defaultCreateTableFormValues: SemanticTableFormValues = {
  tableId: '',
  name: '',
  alias: '',
  entityType: 'person',
  subEntity: 'moral',
  belongsToTableId: '',
  fields: defaultCreateTableFields,
  mainTimestampFieldId: 'updated_at',
  links: [],
  metaData: {},
  isCanceled: false,
  isVisited: false,
};

const entityTypesWithSubEntity = ['person'] as const;
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

export function hasSubEntityOptions(entityType: FtmEntityV2 | ''): entityType is 'person' {
  return entityTypesWithSubEntity.includes(entityType as (typeof entityTypesWithSubEntity)[number]);
}

export function requiresLink(entityType: FtmEntityV2 | ''): entityType is 'transaction' | 'event' {
  return entityTypesRequiringLink.includes(entityType as (typeof entityTypesRequiringLink)[number]);
}

export function canProceedToStep2(values: SemanticTableFormValues): boolean {
  return createTableEntityStepSchema.safeParse(values).success;
}

export function adaptCreateTableValue(values: SemanticTableFormValues): CreateTableValue {
  return {
    name: values.name,
    alias: values.alias,
    semantic_type: getEntityType(values.entityType, values.subEntity),
    description: '',
    fields: values.fields.map(adaptTableField),
    links: values.links.map(adaptLink),
    metadata: {
      belongsToTableId: values.belongsToTableId || undefined,
      mainTimestampFieldId: values.mainTimestampFieldId || undefined,
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
    // ftm_property: field.ftmProperty,
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

function adaptLink(link: LinkValue): CreateTableValue['links'][number] {
  return {
    name: link.name,
    child_field_name: link.tableFieldId,
    link_type: link.relationType,
    parent_table_id: link.targetTableId,
  };
}

function getEntityType(entityType: FtmEntityV2, subEntity: FtmEntityPersonOption): FieldEntity {
  const fieldEntity = match(entityType)
    .with('person', () =>
      match(subEntity)
        .with('moral', () => 'company')
        .with('natural', () => 'person')
        .with('generic', () => 'partner')
        .exhaustive(),
    )
    .with('transaction', () => 'transaction')
    .with('event', () => 'event')
    .with('other', () => 'other')
    .with('account', () => 'account')
    .exhaustive();

  return fieldEntity as FieldEntity;
}

type SemanticTableConstraints = {
  fieldExist?: { type: SemanticType; subType?: SemanticSubType; name?: string };
  linkExist?: { dataType: FtmEntityV2 };
}[];

const defaultTableConstraints = [
  { fieldExist: { name: 'object_id', type: 'unique_id', subType: 'opaque_id' } },
  { fieldExist: { name: 'updated_at', type: 'last_update' } },
] as const satisfies SemanticTableConstraints;

const specificTableConstraints: Record<FtmEntityV2, SemanticTableConstraints> = {
  person: [{ fieldExist: { type: 'name' } }],
  transaction: [{ linkExist: { dataType: 'person' } }],
  event: [{ linkExist: { dataType: 'person' } }],
  account: [],
  other: [],
} as const;

const knownTableFields = ['name', 'entityType', 'subEntity', 'belongsToTableId'] as const;

function getTablePropertyErrors(values: SemanticTableFormValues): TablePropertyError[] {
  const parsing = createTableEntityStepSchema.safeParse(values);
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

function getConstraintErrors(values: SemanticTableFormValues, scope: Exclude<ValidationScope, 'all' | 'table'>) {
  const errors: ValidationError[] = [];
  const constraints: SemanticTableConstraints = [
    ...defaultTableConstraints,
    ...specificTableConstraints[values.entityType],
  ];

  for (const constraint of constraints) {
    if (scope === 'fields' && constraint.fieldExist) {
      const { name, type, subType } = constraint.fieldExist;
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
          message: `Missing required field: ${name ?? type}`,
        });
      }
    }

    if (scope === 'links' && constraint.linkExist) {
      const found = values.links.some((l) => l.targetTableId !== '');
      if (!found) {
        errors.push({
          kind: 'table',
          field: 'belongsToTableId',
          message: 'A link to a related table is required for this entity type',
        });
      }
    }
  }

  return errors;
}

function getFieldErrors(values: SemanticTableFormValues): FieldValidationError[] {
  const errors: FieldValidationError[] = [];
  const nameCounts = new Map<string, string[]>();

  for (const field of values.fields) {
    if (!field.name.trim()) {
      errors.push({
        kind: 'field',
        fieldId: field.id,
        message: `Field "${field.alias || field.id}": name is required`,
      });
    } else if (!dataModelNameRegex.test(field.name)) {
      errors.push({
        kind: 'field',
        fieldId: field.id,
        message: `Field "${field.name}": only lower case alphanumeric and _, must start with a letter`,
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
        errors.push({ kind: 'field', fieldId, message: `Duplicate field name: "${name}"` });
      }
    }
  }

  return errors;
}

function getLinkErrors(values: SemanticTableFormValues): LinkValidationError[] {
  const errors: LinkValidationError[] = [];

  for (const link of values.links) {
    const linkField = values.fields.find((field) => field.id === link.tableFieldId);
    const isSelfLink =
      link.targetTableId === CREATE_TABLE_SELF_LINK_TARGET_ID ||
      (values.tableId !== '' && link.targetTableId === values.tableId);

    if (!link.name.trim()) {
      errors.push({ kind: 'link', linkId: link.linkId, message: 'A link is missing a name' });
    }
    if (!link.targetTableId) {
      errors.push({
        kind: 'link',
        linkId: link.linkId,
        message: `Link "${link.name || '(unnamed)'}": target table is required`,
      });
    }
    if (!link.tableFieldId) {
      errors.push({
        kind: 'link',
        linkId: link.linkId,
        message: `Link "${link.name || '(unnamed)'}": field is required`,
      });
    }
    if (isSelfLink && linkField?.name === 'object_id') {
      errors.push({
        kind: 'link',
        linkId: link.linkId,
        message: `Link "${link.name || '(unnamed)'}": object_id cannot point to the current table`,
      });
    }
  }

  return errors;
}

export function validateValues(values: SemanticTableFormValues, scope: ValidationScope = 'all'): ValidationResult {
  if (scope === 'table') {
    // enforce 'updated_at' to be the default sort order if there is no other
    if (!values.mainTimestampFieldId && values.fields.some((f) => f.name === 'updated_at')) {
      values.mainTimestampFieldId = 'updated_at';
    }
    const errors = getTablePropertyErrors(values);
    if (!values.mainTimestampFieldId) {
      errors.push({
        kind: 'table',
        field: 'mainTimestampFieldId',
        message: 'One Timestamp field should be selected as the main ordering field',
      });
    }
    return errors.length > 0 ? { ok: false, errors } : { ok: true };
  }

  if (scope === 'fields') {
    const errors = [...getConstraintErrors(values, 'fields'), ...getFieldErrors(values)];
    return errors.length > 0 ? { ok: false, errors } : { ok: true };
  }

  if (scope === 'links') {
    const errors = [...getConstraintErrors(values, 'links'), ...getLinkErrors(values)];
    return errors.length > 0 ? { ok: false, errors } : { ok: true };
  }

  const tableErrors = getTablePropertyErrors(values);
  if (tableErrors.length > 0) {
    return { ok: false, errors: tableErrors };
  }

  const errors: ValidationError[] = [
    ...getConstraintErrors(values, 'fields'),
    ...getFieldErrors(values),
    ...getConstraintErrors(values, 'links'),
    ...getLinkErrors(values),
  ];

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true };
}
