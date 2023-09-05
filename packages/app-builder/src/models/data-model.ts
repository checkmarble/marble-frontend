import {
  type DataModelDto,
  type DataModelFieldDto,
  type LinkToSingleDto,
} from '@marble-api';

export interface DataModelField {
  name: string;
  dataType: 'Bool' | 'Int' | 'Float' | 'String' | 'Timestamp' | 'unknown';
}

export interface LinksToSingle {
  linkedTableName: string;
  parentFieldName: string;
  childFieldName: string;
}

export interface DataModel {
  name: string;
  fields: DataModelField[];
  linksToSingle: LinksToSingle[];
}

function adaptFieldDto(dataModelFieldsDto: {
  [key: string]: DataModelFieldDto;
}): DataModelField[] {
  return Object.entries(dataModelFieldsDto).map(
    ([name, field]): DataModelField => ({
      name: name,
      dataType: field.data_type,
    })
  );
}

function adaptLinkToSingleDto(linksToSingleDto: {
  [key: string]: LinkToSingleDto;
}): LinksToSingle[] {
  const linkToSingle: LinksToSingle[] = [];
  Object.keys(linksToSingleDto).forEach((key) => {
    linkToSingle.push({
      linkedTableName: linksToSingleDto[key].linkedTableName,
      parentFieldName: linksToSingleDto[key].parentFieldName,
      childFieldName: linksToSingleDto[key].childFieldName,
    });
  });
  return linkToSingle;
}

export function adaptDataModelDto(dataModelDto: DataModelDto): DataModel[] {
  const dataModel: DataModel[] = [];
  Object.keys(dataModelDto.tables).forEach((key) => {
    let linksToSingle: LinksToSingle[] = [];
    if (dataModelDto.tables[key].links_to_single !== undefined) {
      linksToSingle = adaptLinkToSingleDto(
        dataModelDto.tables[key].links_to_single ?? {}
      );
    }
    dataModel.push({
      name: dataModelDto.tables[key].name,
      fields: adaptFieldDto(dataModelDto.tables[key].fields),
      linksToSingle: linksToSingle,
    });
  });
  return dataModel;
}
