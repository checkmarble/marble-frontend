import { type ParseKeys } from 'i18next';
import {
  type CreateTableFieldDto,
  type DataModelDto,
  type FieldDto,
  type LinkToSingleDto,
  type TableDto,
  type UpdateTableFieldDto,
} from 'marble-api';
import * as R from 'remeda';
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

function adaptLinkToSingle(
  linkName: string,
  linksToSingleDto: LinkToSingleDto,
): LinkToSingle {
  return {
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

export interface TableModel {
  id: string;
  name: string;
  description: string;
  fields: DataModelField[];
  linksToSingle: LinkToSingle[];
}

function adaptTableModel(tableDto: TableDto): TableModel {
  return {
    id: tableDto.id,
    name: tableDto.name,
    description: tableDto.description,
    fields: R.pipe(tableDto.fields, R.values, R.map(adaptDataModelField)),
    linksToSingle: R.pipe(
      tableDto.links_to_single ?? {},
      R.entries(),
      R.map(([linkName, linkDto]) => adaptLinkToSingle(linkName, linkDto)),
    ),
  };
}

export type DataModel = TableModel[];

export function adaptDataModel(dataModelDto: DataModelDto): DataModel {
  return R.pipe(dataModelDto.tables, R.values, R.map(adaptTableModel));
}

export interface CreateFieldInput {
  name: string;
  description: string;
  type: 'Bool' | 'Int' | 'Float' | 'String' | 'Timestamp';
  nullable: boolean;
  isEnum?: boolean;
  isUnique?: boolean;
}

export function adaptCreateTableFieldDto(
  createFieldInput: CreateFieldInput,
): CreateTableFieldDto {
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

export function adaptUpdateFieldDto(
  updateFieldInput: UpdateFieldInput,
): UpdateTableFieldDto {
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

export function getDataTypeTKey(
  dataType?: DataType,
): ParseKeys<'scenarios'> | undefined {
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

export function getConstantDataTypeTKey(
  dataType?: DataType,
): ParseKeys<'scenarios'> | undefined {
  switch (dataType) {
    case 'String':
      return 'edit_operand.constant.use_data_type.string';
    case 'Int':
    case 'Float':
      return 'edit_operand.constant.use_data_type.number';
    case 'Bool':
      return 'edit_operand.constant.use_data_type.boolean';
    case 'String[]':
      return 'edit_operand.constant.use_data_type.string[]';
    case 'Int[]':
    case 'Float[]':
      return 'edit_operand.constant.use_data_type.number[]';
    case 'Bool[]':
      return 'edit_operand.constant.use_data_type.boolean[]';
    default:
      return undefined;
  }
}
