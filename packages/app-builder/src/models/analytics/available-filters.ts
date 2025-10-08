import { type AvailableFiltersRequestDto, type AvailableFiltersResponseDto } from 'marble-api';
import * as R from 'remeda';

export type AvailableFilterType = 'string' | 'number' | 'boolean';
export type FiltersTypes = 'triggerObject';

export type AvailableFiltersRequest = {
  scenarioId: string;
  start: string;
  end: string;
};

export type AvailableFiltersResponse = {
  name: string;
  type: AvailableFilterType;
  source: FiltersTypes;
}[];

export const adaptAvailableFiltersResponse = (
  response: AvailableFiltersResponseDto,
): AvailableFiltersResponse => {
  return response.map((item) => ({
    name: item.name,
    type: item.type as AvailableFilterType,
    source: R.toCamelCase(item.source) as FiltersTypes,
  }));
};

export const transformAvailableFiltersRequest = (
  request: AvailableFiltersRequest,
): AvailableFiltersRequestDto => {
  return {
    scenario_id: request.scenarioId,
    start: request.start,
    end: request.end,
  };
};
