import {
  type CreateCustomListBodyDto,
  type CustomListDto,
  type CustomListValueDto,
  type CustomListWithValuesDto,
  type UpdateCustomListBodyDto,
} from 'marble-api';

export interface CustomList {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateCustomListBody = {
  name: string;
  description: string;
};
export type CustomListValue = {
  id: string;
  value: string;
};
export type CustomListWithValues = CustomList & {
  values?: CustomListValue[];
};
export type UpdateCustomListBody = {
  name: string;
  description: string;
};
export type CreateCustomListValueBody = {
  value: string;
};

export function adaptCustomList(dto: CustomListDto): CustomList {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export function adaptCustomListValue(dto: CustomListValueDto): CustomListValue {
  return {
    id: dto.id,
    value: dto.value,
  };
}

export function adaptCustomListWithValues(dto: CustomListWithValuesDto): CustomListWithValues {
  return {
    ...adaptCustomList(dto),
    values: dto.values.map(adaptCustomListValue),
  };
}

export function adaptCreateCustomListBody(body: CreateCustomListBodyDto): CreateCustomListBody {
  return {
    name: body.name,
    description: body.description,
  };
}

export function adaptUpdateCustomListBody(body: UpdateCustomListBody): UpdateCustomListBodyDto {
  return {
    name: body.name,
    description: body.description,
  };
}
