import { DataType } from '@app-builder/models';

export const ftmEntities = ['person', 'account', 'transaction', 'event', 'other', 'vehicle'] as const;
export const ftmEntityPersonOptions = ['moral', 'natural', 'generic'] as const;
export const ftmEntityVehicleOptions = ['vessel', 'airplane'] as const;

export type FtmEntityV2 = (typeof ftmEntities)[number];

export const linkRelationTypes = ['belongs_to', 'related'] as const;
export type LinkRelationType = (typeof linkRelationTypes)[number];

export type LinkValue = {
  linkId: string;
  name: string;
  tableFieldId: string;
  relationType: LinkRelationType;
  targetTableId: string;
  sourceTableId: string;
};

export type RawLink = {
  id: string;
  name: string;
  parent_table_name: string;
  parent_table_id: string;
  parent_field_name: string;
  parent_field_id: string;
  child_table_name: string;
  child_table_id: string;
  child_field_name: string;
  child_field_id: string;
};

export type RawField = {
  id: string;
  name: string;
  description: string;
  data_type: DataType;
  table_id: string;
  is_enum?: boolean;
  nullable?: boolean;
  values?: (string | number)[];
  unicity_constraint?: string;
  ftm_property?: string;
};
