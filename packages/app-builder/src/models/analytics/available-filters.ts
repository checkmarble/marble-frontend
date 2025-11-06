import { type AvailableFiltersRequestDto, type AvailableFiltersResponseDto } from 'marble-api';
import * as R from 'remeda';
import { DateRangeFilter, getIsoBoundsFromDateRanges } from '.';

export type AvailableFilterType = 'string' | 'number' | 'boolean';
export type FilterSource = 'triggerObject';

export type AvailableFiltersRequest = {
  scenarioId: string;
  ranges: DateRangeFilter[];
};

export type AvailableFiltersResponse = {
  name: string;
  type: AvailableFilterType;
  source: FilterSource;
}[];

export const adaptAvailableFiltersResponse = (response: AvailableFiltersResponseDto): AvailableFiltersResponse => {
  return response.map((item) => ({
    name: item.name,
    type: item.type as AvailableFilterType,
    source: R.toCamelCase(item.source) as FilterSource,
  }));
};

export const transformAvailableFiltersRequest = (request: AvailableFiltersRequest): AvailableFiltersRequestDto => {
  return {
    scenario_id: request.scenarioId,
    ...getIsoBoundsFromDateRanges(request.ranges),
  };
};
