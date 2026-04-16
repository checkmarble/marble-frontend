import { CreateTableValue } from '@app-builder/schemas/data';
import { type ParseKeys } from 'i18next';
import {
  type ClientDataListRequestBody as ClientDataListRequestBodyDto,
  type ClientDataListResponseDto,
  type ClientObjectDetailDto,
  type CreateAnnotationDto,
  type CreateNavigationOptionDto,
  type CreatePivotInputDto,
  CreateTableBody,
  type CreateTableFieldDto,
  type DataModelDto,
  type DataModelObjectDto,
  type DataModelTableOptionsDto,
  type ExportedFieldsDto,
  type FieldDto,
  FieldStatisticsDto,
  FtmEntity,
  type GroupedAnnotations,
  type LinkToSingleDto,
  type NavigationOptionDto,
  type PivotDto,
  type SetDataModelTableOptionsBodyDto,
  type TableDto,
  UpdateTableBodyDto,
  type UpdateTableFieldDto,
} from 'marble-api';
import * as R from 'remeda';
import { match } from 'ts-pattern';
import { type IconName } from 'ui-icons';
import { ScreeningCategory } from './screening';
import {
  isSemanticSubTypeField,
  isSemanticTypeField,
  type SemanticSubTypeField,
  type SemanticTypeField,
} from './semantic-types';

export const primitiveTypes = ['Bool', 'Int', 'Float', 'String', 'Timestamp', 'IpAddress', 'Coords'] as const;
export type PrimitiveTypes = (typeof primitiveTypes)[number];
export type DataType = PrimitiveTypes | `${PrimitiveTypes}[]` | 'DerivedData' | 'unknown';
export const EnumDataTypes = ['Float', 'Int', 'String'];
export const UniqueDataTypes = ['Float', 'Int', 'String'];
export type UnicityConstraintType = 'no_unicity_constraint' | 'pending_unique_constraint' | 'active_unique_constraint';
export const ftmEntities = ['person', 'account', 'transaction', 'event', 'other'] as const;
export const ftmEntityPersonOptions = ['moral', 'natural', 'generic'] as const;

export type FtmEntityV2 = (typeof ftmEntities)[number];
export type FtmEntityPersonOption = (typeof ftmEntityPersonOptions)[number];

export const linkRelationTypes = ['belongs_to', 'related'] as const;
export type LinkRelationType = (typeof linkRelationTypes)[number];

type PrimitiveValue = number | string | boolean;
export type DataModelObjectValue = PrimitiveValue | Record<string, PrimitiveValue>;

export type EnumValue = string | number;
export interface DataModelField {
  id: string;
  dataType: DataType;
  description: string;
  isEnum: boolean;
  name: string;
  nullable: boolean;
  tableId: string;
  values?: EnumValue[];
  unicityConstraint: UnicityConstraintType;
  ftmProperty?: string;
  alias?: string;
  order?: number;
  semanticType?: SemanticTypeField;
  semanticSubType?: SemanticSubTypeField;
  currencyExponent?: number;
  decimalPrecision?: number;
  currencyFieldId?: string;
  booleanDisplay?: 'yes_no' | 'checkbox';
  foreignkeyTable?: string;
  hidden?: boolean;
}

function readMetadataString(m: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const k of keys) {
    const v = m[k];
    if (typeof v === 'string') return v;
  }
  return undefined;
}

function readMetadataNumber(m: Record<string, unknown>, ...keys: string[]): number | undefined {
  for (const k of keys) {
    const v = m[k];
    if (typeof v === 'number' && !Number.isNaN(v)) return v;
  }
  return undefined;
}

function readMetadataBoolean(m: Record<string, unknown>, key: string): boolean | undefined {
  const v = m[key];
  return typeof v === 'boolean' ? v : undefined;
}

function adaptDataModelField(dataModelFieldDto: FieldDto): DataModelField {
  const raw = dataModelFieldDto as FieldDto & {
    alias?: string;
    order?: number;
    metadata?: Record<string, unknown> | null;
    semantic_type?: string;
    semantic_sub_type?: string;
  };
  const meta =
    raw.metadata && typeof raw.metadata === 'object' && !Array.isArray(raw.metadata)
      ? (raw.metadata as Record<string, unknown>)
      : {};
  const alias = typeof raw.alias === 'string' ? raw.alias : readMetadataString(meta, 'alias');
  const order = typeof raw.order === 'number' ? raw.order : readMetadataNumber(meta, 'order');
  const semanticTypeRaw =
    readMetadataString(meta, 'semanticTypeForFront') ??
    (typeof raw.semantic_type === 'string' ? raw.semantic_type : undefined);
  const semanticType =
    semanticTypeRaw !== undefined && isSemanticTypeField(semanticTypeRaw) ? semanticTypeRaw : undefined;

  const semanticSubTypeRaw =
    readMetadataString(meta, 'semanticSubType', 'semantic_sub_type') ??
    (typeof raw.semantic_sub_type === 'string' ? raw.semantic_sub_type : undefined);
  const semanticSubType =
    semanticSubTypeRaw !== undefined && isSemanticSubTypeField(semanticSubTypeRaw) ? semanticSubTypeRaw : undefined;
  const currencyExponent = readMetadataNumber(meta, 'currencyExponent');
  const decimalPrecision = readMetadataNumber(meta, 'decimalPrecision');
  const currencyFieldId = readMetadataString(meta, 'currencyFieldId');
  const booleanDisplayRaw = readMetadataString(meta, 'booleanDisplay');
  const booleanDisplay =
    booleanDisplayRaw === 'yes_no' || booleanDisplayRaw === 'checkbox' ? booleanDisplayRaw : undefined;
  const foreignkeyTable = readMetadataString(meta, 'foreignkeyTable', 'foreignkey_table');
  const hidden = readMetadataBoolean(meta, 'hidden');

  return {
    id: raw.id,
    dataType: raw.data_type,
    description: raw.description,
    isEnum: raw.is_enum,
    name: raw.name,
    nullable: raw.nullable,
    tableId: raw.table_id,
    values: raw.values,
    unicityConstraint: raw.unicity_constraint,
    ftmProperty: raw.ftm_property,
    alias,
    order,
    semanticType,
    semanticSubType,
    currencyExponent,
    decimalPrecision,
    currencyFieldId,
    booleanDisplay,
    foreignkeyTable,
    hidden,
  };
}

export interface LinkToSingle {
  id: string;
  name: string;
  parentTableName: string;
  parentTableId: string;
  parentFieldName: string;
  parentFieldId: string;
  childTableName: string;
  childTableId: string;
  childFieldName: string;
  childFieldId: string;
  relationType: LinkRelationType;
}

function adaptLinkToSingle(linkName: string, linksToSingleDto: LinkToSingleDto): LinkToSingle {
  const dto = linksToSingleDto as LinkToSingleDto & { link_type?: LinkRelationType };
  return {
    id: linksToSingleDto.id,
    name: linkName,
    parentTableName: linksToSingleDto.parent_table_name,
    parentTableId: linksToSingleDto.parent_table_id,
    parentFieldName: linksToSingleDto.parent_field_name,
    parentFieldId: linksToSingleDto.parent_field_id,
    childTableName: linksToSingleDto.child_table_name,
    childTableId: linksToSingleDto.child_table_id,
    childFieldName: linksToSingleDto.child_field_name,
    childFieldId: linksToSingleDto.child_field_id,
    relationType: dto.link_type ?? 'belongs_to',
  };
}

export type NavigationOption = {
  sourceTableName: string;
  sourceTableId: string;
  sourceFieldName: string;
  sourceFieldId: string;
  targetTableName: string;
  targetTableId: string;
  filterFieldName: string;
  filterFieldId: string;
  orderingFieldName: string;
  orderingFieldId: string;
  status: 'pending' | 'valid' | 'invalid';
};

function adaptNavigationOptions(dto: NavigationOptionDto): NavigationOption {
  return {
    sourceTableName: dto.source_table_name,
    sourceTableId: dto.source_table_id,
    sourceFieldName: dto.source_field_name,
    sourceFieldId: dto.source_field_id,
    targetTableName: dto.target_table_name,
    targetTableId: dto.target_table_id,
    filterFieldName: dto.filter_field_name,
    filterFieldId: dto.filter_field_id,
    orderingFieldName: dto.ordering_field_name,
    orderingFieldId: dto.ordering_field_id,
    status: dto.status,
  };
}

export interface TableModel {
  id: string;
  name: string;
  description: string;
  semanticType: FtmEntityV2 | null;
  /** Present when `semanticType` is `person`; maps API `semantic_type` (company/person/partner) to UI sub-entity. */
  subEntity?: FtmEntityPersonOption | null;
  alias: string;
  captionField: string;
  fields: DataModelField[];
  linksToSingle: LinkToSingle[];
  navigationOptions?: NavigationOption[];
  ftmEntity?: FtmEntity;
  /** Field id of the main ordering timestamp (from table `metadata` on create / GET). */
  mainTimestampFieldName?: string;
  belongsToTableId?: string;
}

/**
 * Maps API `semantic_type` (create table / data model) back to UI entity type + person sub-entity.
 * Inverse of `getEntityType` in create-table-types.
 */
export function apiSemanticTypeToFormEntity(apiType: string): {
  entityType: FtmEntityV2 | null;
  subEntity: FtmEntityPersonOption | null;
} {
  return match(apiType)
    .with('company', () => ({ entityType: 'person' as const, subEntity: 'moral' as const }))
    .with('person', () => ({ entityType: 'person' as const, subEntity: 'natural' as const }))
    .with('partner', () => ({ entityType: 'person' as const, subEntity: 'generic' as const }))
    .with('account', () => ({ entityType: 'account' as const, subEntity: null }))
    .with('transaction', () => ({ entityType: 'transaction' as const, subEntity: null }))
    .with('event', () => ({ entityType: 'event' as const, subEntity: null }))
    .with('other', () => ({ entityType: 'other' as const, subEntity: null }))
    .otherwise(() => ({ entityType: null, subEntity: null }));
}

function adaptTableModel(tableDto: TableDto): TableModel {
  const raw = tableDto as TableDto & {
    alias?: string;
    semantic_type?: string;
    caption_field?: string;
    metadata?: Record<string, unknown> | null;
  };
  const meta =
    raw.metadata && typeof raw.metadata === 'object' && !Array.isArray(raw.metadata)
      ? (raw.metadata as Record<string, unknown>)
      : {};
  const { entityType, subEntity } = apiSemanticTypeToFormEntity(
    typeof raw.semantic_type === 'string' ? raw.semantic_type : 'other',
  );
  const belongsToTableId = readMetadataString(meta, 'belongsToTableId');

  const fieldOrderNames: string[] = (() => {
    const raw = meta['fieldOrder'];
    if (typeof raw === 'string' && raw.length > 0) {
      return raw.split(',');
    }
    return [];
  })();

  const fields = R.pipe(raw.fields, R.values(), R.map(adaptDataModelField), (arr) =>
    fieldOrderNames.length > 0
      ? [...arr].sort((a, b) => {
          const ai = fieldOrderNames.indexOf(a.name);
          const bi = fieldOrderNames.indexOf(b.name);
          if (ai === -1 && bi === -1) return a.name.localeCompare(b.name);
          if (ai === -1) return 1;
          if (bi === -1) return -1;
          return ai - bi;
        })
      : [...arr].sort((a, b) => {
          const ao = a.order ?? Number.POSITIVE_INFINITY;
          const bo = b.order ?? Number.POSITIVE_INFINITY;
          if (ao !== bo) return ao - bo;
          return a.name.localeCompare(b.name);
        }),
  );

  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    alias: typeof raw.alias === 'string' ? raw.alias : '',
    captionField: typeof raw.caption_field === 'string' ? raw.caption_field : '',
    semanticType: entityType,
    subEntity,
    mainTimestampFieldName: raw.primary_ordering_field,
    belongsToTableId,
    fields,
    linksToSingle: R.pipe(
      raw.links_to_single ?? {},
      R.entries(),
      R.map(([linkName, linkDto]) => adaptLinkToSingle(linkName, linkDto)),
    ),
    navigationOptions: raw.navigation_options?.map(adaptNavigationOptions),
    ftmEntity: raw.ftm_entity,
  };
}

export type DataModel = TableModel[];

export function adaptDataModel(dataModelDto: DataModelDto): DataModel {
  return R.pipe(dataModelDto.tables, R.values(), R.map(adaptTableModel));
}

export type Pivot =
  | {
      type: 'field';
      id: string;
      createdAt: string;
      baseTable: string;
      baseTableId: string;
      field: string;
      fieldId: string;
    }
  | {
      type: 'link';
      id: string;
      createdAt: string;
      baseTable: string;
      baseTableId: string;
      pivotTable: string;
      pivotTableId: string;
      field: string;
      fieldId: string;
      pathLinks: string[];
      pathLinkIds: string[];
    };

export function adaptPivot(pivotDto: PivotDto): Pivot {
  if (pivotDto.path_link_ids.length === 0) {
    return {
      type: 'field',
      id: pivotDto.id,
      createdAt: pivotDto.created_at,
      baseTable: pivotDto.base_table,
      baseTableId: pivotDto.base_table_id,
      field: pivotDto.field,
      fieldId: pivotDto.field_id,
    };
  }
  return {
    type: 'link',
    id: pivotDto.id,
    createdAt: pivotDto.created_at,
    baseTable: pivotDto.base_table,
    baseTableId: pivotDto.base_table_id,
    pivotTable: pivotDto.pivot_table,
    pivotTableId: pivotDto.pivot_table_id,
    field: pivotDto.field,
    fieldId: pivotDto.field_id,
    pathLinks: pivotDto.path_links,
    pathLinkIds: pivotDto.path_link_ids,
  };
}

export type CreatePivotInput =
  | {
      baseTableId: string;
      fieldId: string;
    }
  | {
      baseTableId: string;
      pathLinkIds: string[];
    };

export function adaptCreatePivotInputDto(createPivotInput: CreatePivotInput): CreatePivotInputDto {
  if ('fieldId' in createPivotInput) {
    return {
      base_table_id: createPivotInput.baseTableId,
      field_id: createPivotInput.fieldId,
    };
  } else {
    return {
      base_table_id: createPivotInput.baseTableId,
      path_link_ids: createPivotInput.pathLinkIds,
    };
  }
}

export interface CreateFieldInput {
  name: string;
  description: string;
  type: PrimitiveTypes;
  nullable: boolean;
  isEnum?: boolean;
  isUnique?: boolean;
}

export function adaptCreateTableFieldDto(createFieldInput: CreateFieldInput): CreateTableFieldDto {
  return {
    name: createFieldInput.name,
    description: createFieldInput.description,
    type: createFieldInput.type,
    nullable: createFieldInput.nullable,
    is_enum: createFieldInput.isEnum,
    is_unique: createFieldInput.isUnique,
  };
}

export interface UpdateFieldInput {
  description?: string;
  isEnum?: boolean;
  isUnique?: boolean;
  isNullable?: boolean;
}

export function adaptUpdateFieldDto(updateFieldInput: UpdateFieldInput): UpdateTableFieldDto {
  return {
    description: updateFieldInput.description,
    is_enum: updateFieldInput.isEnum,
    is_unique: updateFieldInput.isUnique,
    is_nullable: updateFieldInput.isNullable,
  };
}

export function findDataModelTableByName({
  dataModel,
  tableName,
}: {
  dataModel: DataModel;
  tableName: string;
}): TableModel {
  const table = dataModel.find((t) => t.name == tableName);
  if (!table) {
    throw Error(`can't find table '${tableName}' in data model`);
  }
  return table;
}

export function findDataModelTable({
  dataModel,
  tableName,
  path,
}: {
  dataModel: DataModel;
  tableName: string;
  path: string[];
}): TableModel {
  let table = findDataModelTableByName({ dataModel, tableName });

  for (const linkName of path) {
    const link = table.linksToSingle.find((link) => link.name === linkName);
    if (!link) {
      throw Error(`can't find link '${linkName}' in table '${table.name}'`);
    }
    table = findDataModelTableByName({
      dataModel,
      tableName: link.parentTableName,
    });
  }

  return table;
}

export function findDataModelField({ table, fieldName }: { table: TableModel; fieldName: string }): DataModelField {
  const field = table.fields.find((f) => f.name == fieldName);
  if (!field) {
    throw Error(`can't find field '${fieldName}' in table '${table.name}'`);
  }

  return field;
}

export function getEnumValues(dataModel: DataModel, tableName: string, fieldName: string): EnumValue[] {
  const table = findDataModelTableByName({ dataModel, tableName });
  const field = findDataModelField({ table, fieldName });
  return field.values ?? [];
}

export function getDataTypeIcon(dataType?: DataType): IconName | undefined {
  switch (dataType) {
    case 'Timestamp':
      return 'schedule';
    case 'String':
    case 'String[]':
      return 'string';
    case 'IpAddress':
      return 'dns';
    case 'Coords':
      return 'world';
    case 'Int':
    case 'Int[]':
    case 'Float':
    case 'Float[]':
      return 'number';
    case 'Bool':
      return 'boolean';
    default:
      return undefined;
  }
}

export function getDataTypeTKey(dataType?: DataType): ParseKeys<'scenarios'> | undefined {
  switch (dataType) {
    case 'String':
      return 'edit_operand.data_type.string';
    case 'String[]':
      return 'edit_operand.data_type.string[]';
    case 'Int':
    case 'Float':
      return 'edit_operand.data_type.number';
    case 'Int[]':
    case 'Float[]':
      return 'edit_operand.data_type.number[]';
    case 'Bool':
      return 'edit_operand.data_type.boolean';
    case 'Timestamp':
      return 'edit_operand.data_type.timestamp';
    default:
      return undefined;
  }
}

export function getConstantDataTypeTKey(dataType?: DataType): ParseKeys<'scenarios'> | undefined {
  switch (dataType) {
    case 'String':
      return 'edit_operand.constant.use_data_type.string';
    case 'Timestamp':
      return 'edit_operand.constant.use_data_type.timestamp';
    case 'Int':
    case 'Float':
      return 'edit_operand.constant.use_data_type.number';
    case 'Bool':
      return 'edit_operand.constant.use_data_type.boolean';
    case 'String[]':
      return 'edit_operand.constant.use_data_type.string[]';
    case 'Timestamp[]':
      return 'edit_operand.constant.use_data_type.timestamp[]';
    case 'Int[]':
    case 'Float[]':
      return 'edit_operand.constant.use_data_type.number[]';
    case 'Bool[]':
      return 'edit_operand.constant.use_data_type.boolean[]';
    default:
      return undefined;
  }
}

export type DataModelObject = {
  data: Record<string, DataModelObjectValue>;
  metadata: {
    validFrom: string;
  };
};

export function adaptDataModelObject(dto: DataModelObjectDto): DataModelObject {
  return {
    data: dto.data,
    metadata: {
      validFrom: dto.metadata.valid_from,
    },
  };
}

export type ClientObjectDetail = {
  metadata: {
    /** The last ingestion timestamp of the object. Null if the object has not been ingested yet (e.g. pivot object in a case, where we may have the object_id but nothing else) */
    validFrom?: string;
    objectType: string;
    canBeAnnotated: boolean;
  };
  /** The actual data of the object, as described in the client data model. */
  data: {
    object_id: string;
    updated_at: string;
    [key: string]: DataModelObjectValue;
  };
  relatedObjects: {
    /** The name of the link pointing to the object */
    linkName?: string;
    relatedObjectDetail?: ClientObjectDetail;
  }[];
  annotations?: GroupedAnnotations | undefined;
};

export type FileAnnotation = GroupedAnnotations['files'][number];

export function adaptClientObjectDetail(dto: ClientObjectDetailDto): ClientObjectDetail {
  return {
    metadata: {
      validFrom: dto.metadata.valid_from,
      objectType: dto.metadata.object_type,
      canBeAnnotated: dto.metadata.can_be_annotated,
    },
    data: dto.data,
    relatedObjects: dto.related_objects.map((rel) => ({
      linkName: rel.link_name,
      relatedObjectDetail: rel?.related_object_detail ? adaptClientObjectDetail(rel.related_object_detail) : undefined,
    })),
    annotations: dto.annotations,
  };
}

export type ClientDataListRequestBody = {
  explorationOptions: {
    sourceTableName: string;
    filterFieldName: string;
    filterFieldValue: string | number;
    orderingFieldName: string;
  };
  limit?: number;
  offsetId?: string | number;
};

export function adaptClientDataListRequestBodyDto(model: ClientDataListRequestBody): ClientDataListRequestBodyDto {
  return {
    exploration_options: {
      source_table_name: model.explorationOptions.sourceTableName,
      filter_field_name: model.explorationOptions.filterFieldName,
      filter_field_value: model.explorationOptions.filterFieldValue,
      ordering_field_name: model.explorationOptions.orderingFieldName,
    },
    cursor_id: model.offsetId,
    limit: model.limit,
  };
}

export type FieldStatistics =
  | { type: 'String'; maxLength?: number; format?: string }
  | { type: 'Float'; maxLength?: number }
  | {
      type: 'Bool' | 'Timestamp' | 'IpAddress' | 'Coords';
    };

export type ClientDataListResponse = {
  data: ClientObjectDetail[];
  metadata: {
    fieldStatistics: Record<string, FieldStatistics>;
  };
  pagination: {
    nextCursorId?: string | number;
    hasNextPage: boolean;
  };
};

export function adaptFieldStatistics(dto: FieldStatisticsDto): FieldStatistics {
  return match(dto)
    .with({ type: 'String' }, ({ max_length, format }) => ({
      type: 'String' as const,
      maxLength: max_length,
      format: format,
    }))
    .with({ type: 'Float' }, ({ max_length }) => ({
      type: 'Float' as const,
      maxLength: max_length,
    }))
    .with({ type: 'Bool' }, () => ({
      type: 'Bool' as const,
    }))
    .with({ type: 'Timestamp' }, () => ({
      type: 'Timestamp' as const,
    }))
    .with({ type: 'IpAddress' }, () => ({
      type: 'IpAddress' as const,
    }))
    .with({ type: 'Coords' }, () => ({
      type: 'Coords' as const,
    }))
    .exhaustive();
}

export function adaptClientDataListResponse(dto: ClientDataListResponseDto): ClientDataListResponse {
  return {
    data: dto.data.map(adaptClientObjectDetail),
    metadata: {
      fieldStatistics: R.pipe(
        dto.metadata.field_statistics,
        R.entries(),
        R.map(([key, value]) => [key, adaptFieldStatistics(value)] as const),
        R.fromEntries(),
      ),
    },
    pagination: {
      hasNextPage: dto.pagination.has_next_page,
      nextCursorId: dto.pagination.next_cursor_id,
    },
  };
}

export type CreateNavigationOption = {
  sourceFieldId: string;
  targetTableId: string;
  filterFieldId: string;
  orderingFieldId: string;
};

export function adaptCreateNavigationOptionDto(model: CreateNavigationOption): CreateNavigationOptionDto {
  return {
    source_field_id: model.sourceFieldId,
    target_table_id: model.targetTableId,
    filter_field_id: model.filterFieldId,
    ordering_field_id: model.orderingFieldId,
  };
}

export type DataModelTableOptions = {
  displayedFields?: string[];
  fieldOrder: string[];
};

export function adaptDataModelTableOptions(dto: DataModelTableOptionsDto): DataModelTableOptions {
  return {
    displayedFields: dto.displayed_fields,
    fieldOrder: dto.field_order,
  };
}

export type SetDataModelTableOptionsBody = {
  displayedFields: string[];
  fieldOrder: string[];
};

export function adaptSetDataModelTableOptionBodyDto(
  model: SetDataModelTableOptionsBody,
): SetDataModelTableOptionsBodyDto {
  return {
    displayed_fields: model.displayedFields,
    field_order: model.fieldOrder,
  };
}

export type DataModelFieldWithDisplay = DataModelField & {
  displayed: boolean;
};

export type TableModelWithOptions = Omit<TableModel, 'fields'> & {
  options: DataModelTableOptions;
  fields: DataModelFieldWithDisplay[];
};

export type DataModelWithTableOptions = TableModelWithOptions[];

export function mergeDataModelWithTableOptions(
  table: TableModel,
  options: DataModelTableOptions,
): TableModelWithOptions {
  return {
    ...table,
    fields: table.fields.map((field) => {
      return {
        ...field,
        displayed:
          field.name === 'object_id'
            ? true
            : options.displayedFields
              ? options.displayedFields.includes(field.id)
              : true,
      };
    }),
    options,
  };
}

export function getTriggerObjectFields(
  dataModelWithTableOptions: DataModelWithTableOptions,
  triggerObjectType: string,
): { id: string; name: string }[] {
  const tableOptions = dataModelWithTableOptions.find(({ name }) => name === triggerObjectType);

  return R.pipe(
    tableOptions?.options.fieldOrder ?? [],
    R.filter((id) =>
      tableOptions?.options.displayedFields ? tableOptions.options.displayedFields.includes(id) : true,
    ),
    R.map((id) => {
      const field = tableOptions?.fields.find((f) => f.id === id);
      return field ? { id, name: field.name } : null;
    }),
    R.filter((f): f is { id: string; name: string } => f !== null),
  );
}

export type CreateAnnotationBody = { caseId?: string } & (
  | {
      type: 'comment';
      payload: {
        text: string;
      };
    }
  | {
      type: 'tag';
      payload: {
        tagId: string;
      };
    }
  | {
      type: 'risk_tag';
      payload: {
        tag: ScreeningCategory;
      };
    }
);

export function adaptCreateAnnotationDto(model: CreateAnnotationBody): CreateAnnotationDto {
  return match(model)
    .with(
      { type: 'comment' },
      ({ payload: { text }, caseId }) =>
        ({
          case_id: caseId,
          type: 'comment',
          payload: { text },
        }) as const,
    )
    .with(
      { type: 'tag' },
      ({ payload: { tagId }, caseId }) =>
        ({
          case_id: caseId,
          type: 'tag',
          payload: {
            tag_id: tagId,
          },
        }) as const,
    )
    .with(
      { type: 'risk_tag' },
      ({ payload: { tag }, caseId }) =>
        ({
          case_id: caseId,
          type: 'risk_tag',
          payload: {
            tag,
          },
        }) as const,
    )
    .exhaustive();
}

export type IngestedDataField = {
  path: string[];
  name: string;
};

export type ExportedFields = {
  triggerObjectFields: string[];
  ingestedDataFields: IngestedDataField[];
};

export const adaptExportedFields = (dto: ExportedFieldsDto): ExportedFields => ({
  triggerObjectFields: dto.trigger_object_fields,
  ingestedDataFields: dto.ingested_data_fields.map((field) => ({
    path: field.Path,
    name: field.Name,
  })),
});

export const adaptExportedFieldsDto = (model: ExportedFields): ExportedFieldsDto => ({
  trigger_object_fields: model.triggerObjectFields,
  ingested_data_fields: model.ingestedDataFields.map((field) => ({
    Path: field.path,
    Name: field.name,
  })),
});

// Destroy Data Model Report types for deletion operations
export interface DestroyDataModelReportRef {
  id: string;
  label: string;
}

export interface DestroyDataModelReportIteration {
  name: string;
  scenarioId: string;
  draft: boolean;
  triggerCondition: boolean;
  rules: DestroyDataModelReportRef[];
  screenings: DestroyDataModelReportRef[];
}

export interface DestroyDataModelReportConflicts {
  continuousScreening: boolean;
  links: string[];
  pivots: string[];
  analyticsSettings: number;
  scenarios: DestroyDataModelReportRef[];
  emptyScenarios: DestroyDataModelReportRef[];
  scenarioIterations: Record<string, DestroyDataModelReportIteration>;
  workflows: DestroyDataModelReportRef[];
  testRuns: boolean;
}

export interface DestroyDataModelReport {
  performed: boolean;
  conflicts: DestroyDataModelReportConflicts;
  archivedIterations: DestroyDataModelReportRef[];
}

interface DestroyDataModelReportRefDto {
  id: string;
  label: string;
}

interface DestroyDataModelReportIterationDto {
  name: string;
  scenario_id: string;
  draft: boolean;
  trigger_condition: boolean;
  rules: DestroyDataModelReportRefDto[];
  screenings: DestroyDataModelReportRefDto[];
}

interface DestroyDataModelReportConflictsDto {
  continuous_screening: boolean;
  links: string[];
  pivots: string[];
  analytics_settings: number;
  scenarios: DestroyDataModelReportRefDto[];
  empty_scenarios: DestroyDataModelReportRefDto[];
  scenario_iterations: Record<string, DestroyDataModelReportIterationDto>;
  workflows?: DestroyDataModelReportRefDto[];
  test_runs: boolean;
}

export interface DestroyDataModelReportDto {
  performed: boolean;
  conflicts: DestroyDataModelReportConflictsDto;
  archived_iterations: DestroyDataModelReportRefDto[];
}

function adaptDestroyDataModelReportRef(dto: DestroyDataModelReportRefDto): DestroyDataModelReportRef {
  return {
    id: dto.id,
    label: dto.label.replace(/\((\d+)\)$/, '(v$1)'),
  };
}

function adaptDestroyDataModelReportIteration(
  dto: DestroyDataModelReportIterationDto,
): DestroyDataModelReportIteration {
  return {
    name: dto.name,
    scenarioId: dto.scenario_id,
    draft: dto.draft,
    triggerCondition: dto.trigger_condition,
    rules: dto.rules.map(adaptDestroyDataModelReportRef),
    screenings: dto.screenings.map(adaptDestroyDataModelReportRef),
  };
}

function adaptDestroyDataModelReportConflicts(
  dto: DestroyDataModelReportConflictsDto,
): DestroyDataModelReportConflicts {
  return {
    continuousScreening: dto.continuous_screening,
    links: dto.links,
    pivots: dto.pivots,
    analyticsSettings: dto.analytics_settings,
    scenarios: dto.scenarios.map(adaptDestroyDataModelReportRef),
    emptyScenarios: dto.empty_scenarios.map(adaptDestroyDataModelReportRef),
    scenarioIterations: R.pipe(
      dto.scenario_iterations,
      R.entries(),
      R.map(([key, value]) => [key, adaptDestroyDataModelReportIteration(value)] as const),
      R.fromEntries(),
    ),
    workflows: dto.workflows?.map(adaptDestroyDataModelReportRef) ?? [],
    testRuns: dto.test_runs,
  };
}

export function adaptDestroyDataModelReport(dto: DestroyDataModelReportDto): DestroyDataModelReport {
  return {
    performed: dto.performed,
    conflicts: adaptDestroyDataModelReportConflicts(dto.conflicts),
    archivedIterations: dto.archived_iterations.map(adaptDestroyDataModelReportRef),
  };
}

export type UpdateTableBody = {
  description?: string;
  ftmEntity?: FtmEntity;
  semanticType?: 'person' | 'company';
  captionField?: string;
  alias?: string;
};

export function adaptUpdateTableBodyDto(model: UpdateTableBody): UpdateTableBodyDto {
  return {
    description: model.description,
    ftm_entity: model.ftmEntity,
    semantic_type: model.semanticType,
    caption_field: model.captionField,
    alias: model.alias,
  };
}

/**
 * Check if a deletion report has blocking conflicts that prevent deletion.
 * Blocking conflicts include:
 * - Active scenarios or scenario iterations using this resource
 * - Workflows using this resource
 * - Continuous screening configuration
 * - Test runs
 * - Links or pivots depending on this resource
 * - Analytics settings using this resource
 * Non-blocking conflicts are drafts that will be archived.
 */
export function hasBlockingConflicts(report: DestroyDataModelReport): boolean {
  const { conflicts } = report;
  return (
    conflicts.continuousScreening ||
    conflicts.scenarios.length > 0 ||
    Object.keys(conflicts.scenarioIterations).length > 0 ||
    conflicts.workflows.length > 0 ||
    conflicts.testRuns ||
    conflicts.links.length > 0 ||
    conflicts.pivots.length > 0 ||
    conflicts.analyticsSettings > 0
  );
}

const ftmEntityValues: readonly FtmEntity[] = ['Person', 'Company', 'Organization', 'Vessel', 'Airplane'];

export function createTableValueToCreateTableBody(value: CreateTableValue): CreateTableBody {
  const ftmEntity =
    value.ftm_entity !== undefined && (ftmEntityValues as readonly string[]).includes(value.ftm_entity)
      ? (value.ftm_entity as FtmEntity)
      : undefined;

  return {
    name: value.name,
    description: value.description,
    alias: value.alias,
    semantic_type: value.semantic_type,
    ftm_entity: ftmEntity,
    metadata: value.metadata ?? null,
    primary_ordering_field: value.primary_ordering_field,
    fields: value.fields.map((f) => ({
      name: f.name,
      description: f.description,
      type: f.type,
      alias: f.alias,
      nullable: f.nullable,
      is_enum: f.is_enum,
      is_unique: f.is_unique,
      ftm_property: f.ftm_property,
      metadata: f.metadata ?? null,
      semantic_type: f.semantic_type,
    })),
    links: value.links.map((l) => ({
      name: l.name,
      link_type: l.link_type,
      child_field_name: l.child_field_name,
      parent_table_id: l.parent_table_id,
    })),
  };
}
