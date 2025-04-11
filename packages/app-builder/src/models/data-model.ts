import { type ParseKeys } from 'i18next';
import {
  type ClientDataListRequestBody as ClientDataListRequestBodyDto,
  type ClientDataListResponseDto,
  type ClientObjectDetailDto,
  type CreatePivotInputDto,
  type CreateTableFieldDto,
  type DataModelDto,
  type DataModelObjectDto,
  type FieldDto,
  type LinkToSingleDto,
  type NavigationOptionDto,
  type PivotDto,
  type TableDto,
  type UpdateTableFieldDto,
} from 'marble-api';
import * as R from 'remeda';
import { type IconName } from 'ui-icons';

import { type FiltersWithPagination } from './pagination';

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
}

export function adaptUpdateFieldDto(updateFieldInput: UpdateFieldInput): UpdateTableFieldDto {
  return {
    description: updateFieldInput.description,
    is_enum: updateFieldInput.isEnum,
    is_unique: updateFieldInput.isUnique,
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
    throw Error(`can't find table in data models named '${tableName}'`);
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
      throw Error(`can't find link '${linkName}'' in table '${table.name}''`);
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
    throw Error("can't find field in table");
  }

  return field;
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
  /** Metadata of the object, in particular the ingestion date. Only present if the object has actually been ingested. */
  metadata?: {
    validFrom: string;
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
};

export function adaptClientObjectDetail(dto: ClientObjectDetailDto): ClientObjectDetail {
  return {
    metadata: dto.metadata ? { validFrom: dto.metadata.valid_from } : undefined,
    data: dto.data,
    relatedObjects: dto.related_objects.map((rel) => ({
      linkName: rel.link_name,
      relatedObjectDetail: rel?.related_object_detail
        ? adaptClientObjectDetail(rel.related_object_detail)
        : undefined,
    })),
  };
}

export type ClientDataListRequestBody = FiltersWithPagination<{
  explorationOptions: {
    sourceTableName: string;
    filterFieldName: string;
    filterFieldValue?: string | number;
    orderingFieldName: string;
  };
}>;

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

export type ClientDataListResponse = {
  data: ClientObjectDetail[];
  pagination: {
    nextCursorId?: string | number;
    hasNextPage: boolean;
  };
};

export function adaptClientDataListResponse(
  dto: ClientDataListResponseDto,
): ClientDataListResponse {
  return {
    data: dto.data.map(adaptClientObjectDetail),
    pagination: {
      hasNextPage: dto.pagination.has_next_page,
      nextCursorId: dto.pagination.next_cursor_id,
    },
  };
}
