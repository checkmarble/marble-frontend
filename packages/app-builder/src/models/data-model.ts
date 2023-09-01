import {
  type DataModel as DataModelDto,
  type DataModelField as DataModelFieldDto,
  type LinkToSingle as LinkToSingleDto,
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
  const dataFieldsModel: DataModelField[] = [];
  Object.keys(dataModelFieldsDto).forEach((key) => {
    dataFieldsModel.push({
      name: key,
      dataType: dataModelFieldsDto[key].data_type,
    });
  });
  return dataFieldsModel;
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
