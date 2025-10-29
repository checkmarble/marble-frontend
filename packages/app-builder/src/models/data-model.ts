import { type ParseKeys } from 'i18next';
import {
  type ClientDataListRequestBody as ClientDataListRequestBodyDto,
  type ClientDataListResponseDto,
  type ClientObjectDetailDto,
  type CreateAnnotationDto,
  type CreateNavigationOptionDto,
  type CreatePivotInputDto,
  type CreateTableFieldDto,
  type DataModelDto,
  type DataModelObjectDto,
  type DataModelTableOptionsDto,
  type ExportedFieldsDto,
  type FieldDto,
  FieldStatisticsDto,
  type GroupedAnnotations,
  type LinkToSingleDto,
  type NavigationOptionDto,
  type PivotDto,
  type SetDataModelTableOptionsBodyDto,
  type TableDto,
  type UpdateTableFieldDto,
} from 'marble-api';
import * as R from 'remeda';
import { match } from 'ts-pattern';
import { type IconName } from 'ui-icons';

type PrimitiveTypes = 'Bool' | 'Int' | 'Float' | 'String' | 'Timestamp';
export type DataType = PrimitiveTypes | `${PrimitiveTypes}[]` | 'unknown';
export const EnumDataTypes = ['Float', 'Int', 'String'];
export const UniqueDataTypes = ['Float', 'Int', 'String'];
export type UnicityConstraintType =
  | 'no_unicity_constraint'
  | 'pending_unique_constraint'
  | 'active_unique_constraint';

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
}

function adaptDataModelField(dataModelFieldDto: FieldDto): DataModelField {
  return {
    id: dataModelFieldDto.id,
    dataType: dataModelFieldDto.data_type,
    description: dataModelFieldDto.description,
    isEnum: dataModelFieldDto.is_enum,
    name: dataModelFieldDto.name,
    nullable: dataModelFieldDto.nullable,
    tableId: dataModelFieldDto.table_id,
    values: dataModelFieldDto.values,
    unicityConstraint: dataModelFieldDto.unicity_constraint,
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
}

function adaptLinkToSingle(linkName: string, linksToSingleDto: LinkToSingleDto): LinkToSingle {
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
  fields: DataModelField[];
  linksToSingle: LinkToSingle[];
  navigationOptions?: NavigationOption[];
}

function adaptTableModel(tableDto: TableDto): TableModel {
  return {
    id: tableDto.id,
    name: tableDto.name,
    description: tableDto.description,
    fields: R.pipe(tableDto.fields, R.values(), R.map(adaptDataModelField)),
    linksToSingle: R.pipe(
      tableDto.links_to_single ?? {},
      R.entries(),
      R.map(([linkName, linkDto]) => adaptLinkToSingle(linkName, linkDto)),
    ),
    navigationOptions: tableDto.navigation_options?.map(adaptNavigationOptions),
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
  type: 'Bool' | 'Int' | 'Float' | 'String' | 'Timestamp';
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

export function findDataModelField({
  table,
  fieldName,
}: {
  table: TableModel;
  fieldName: string;
}): DataModelField {
  const field = table.fields.find((f) => f.name == fieldName);
  if (!field) {
    throw Error(`can't find field '${fieldName}' in table '${table.name}'`);
  }

  return field;
}

export function getEnumValues(
  dataModel: DataModel,
  tableName: string,
  fieldName: string,
): EnumValue[] {
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
  data: Record<string, unknown>;
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
    object_id?: string;
    updated_at?: string;
    [key: string]: unknown;
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
      relatedObjectDetail: rel?.related_object_detail
        ? adaptClientObjectDetail(rel.related_object_detail)
        : undefined,
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

export function adaptClientDataListRequestBodyDto(
  model: ClientDataListRequestBody,
): ClientDataListRequestBodyDto {
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
      type: 'Bool' | 'Timestamp';
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
    .exhaustive();
}

export function adaptClientDataListResponse(
  dto: ClientDataListResponseDto,
): ClientDataListResponse {
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

export function adaptCreateNavigationOptionDto(
  model: CreateNavigationOption,
): CreateNavigationOptionDto {
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

export type CreateAnnotationBody = { caseId: string } & (
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

export function adaptExportedFieldsDto(dto: ExportedFieldsDto): ExportedFields {
  return {
    triggerObjectFields: dto.trigger_object_fields,
    ingestedDataFields: dto.ingested_data_fields.map((field) => ({
      path: field.path,
      name: field.name,
    })),
  };
}

export function transformExportedFields(model: ExportedFields): ExportedFieldsDto {
  return {
    trigger_object_fields: model.triggerObjectFields,
    ingested_data_fields: model.ingestedDataFields.map((field) => ({
      path: field.path,
      name: field.name,
    })),
  };
}
