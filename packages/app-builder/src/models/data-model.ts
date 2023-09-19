import {
  type DataModelDto,
  type DataModelFieldDto,
  type LinkToSingleDto,
} from '@marble-api';
import * as R from 'remeda';

export type DataType =
  | 'Bool'
  | 'Int'
  | 'Float'
  | 'String'
  | 'Timestamp'
  | 'unknown';

export interface DataModelField {
  name: string;
  dataType: DataType;
  description: string;
  nullable: boolean;
}

export interface LinksToSingle {
  linkName: string;
  linkedTableName: string;
  parentFieldName: string;
  childFieldName: string;
}

export interface TableModel {
  name: string;
  fields: DataModelField[];
  linksToSingle: LinksToSingle[];
  description?: string;
}

function adaptFieldDto(dataModelFieldsDto: {
  [key: string]: DataModelFieldDto;
}): DataModelField[] {
  return R.pipe(
    R.toPairs(dataModelFieldsDto),
    R.map(([name, field]) => ({
      name: name,
      dataType: field.data_type,
      description: field.description,
      nullable: field.nullable,
    }))
  );
}

function adaptLinkToSingleDto(linksToSingleDto: {
  [key: string]: LinkToSingleDto;
}): LinksToSingle[] {
  return R.pipe(
    R.toPairs(linksToSingleDto),
    R.map(([linkName, linkToSingleDto]) => ({
      linkName,
      linkedTableName: linkToSingleDto.linked_table_name,
      parentFieldName: linkToSingleDto.parent_field_name,
      childFieldName: linkToSingleDto.child_field_name,
    }))
  );
}

export function adaptDataModelDto(dataModelDto: DataModelDto): TableModel[] {
  return R.pipe(
    R.toPairs(dataModelDto.tables),
    R.map(([tableName, tableDto]) => ({
      name: tableName,
      fields: adaptFieldDto(tableDto.fields),
      linksToSingle: adaptLinkToSingleDto(tableDto.links_to_single ?? {}),
      description: tableDto.description,
    }))
  );
}

export function findDataModelTableByName({
  dataModel,
  tableName,
}: {
  dataModel: TableModel[];
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
  dataModel: TableModel[];
  tableName: string;
  path: string[];
}): TableModel {
  let table = findDataModelTableByName({ dataModel, tableName });

  for (const linkName of path) {
    const link = table.linksToSingle.find((link) => link.linkName === linkName);
    if (!link) {
      throw Error(`can't find link '${linkName}'' in table '${table.name}''`);
    }
    table = findDataModelTableByName({
      dataModel,
      tableName: link.linkedTableName,
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
    throw Error("can't find field in datamodel");
  }

  return field;
}
