import type { SaveScreeningSearchDto, ScreeningConfigBodyFiltersDto, ScreeningSavedSearch } from 'marble-api';
import { z } from 'zod/v4';
import { createScreeningFilters, getDatasetFromFilters } from './screening-config';

export const freeformSearchPresetSchema = z.object({
  datasets: z.array(z.string()).optional(),
  threshold: z.number().min(0).max(100).optional(),
});

export type FreeformSearchPreset = z.infer<typeof freeformSearchPresetSchema>;

export interface SavedFreeformSearchPreset {
  id: string;
  name: string;
  config: FreeformSearchPreset;
}

// Structured filters are supported by manual search but are missing from the generated config type.
type FreeformSearchPresetConfigDto = ScreeningSavedSearch['config'] & {
  filters?: ScreeningConfigBodyFiltersDto;
};

export function adaptSaveFreeformSearchPresetDto(name: string, preset: FreeformSearchPreset): SaveScreeningSearchDto {
  const config: FreeformSearchPresetConfigDto = {
    // Satisfy the search schema without persisting the form's entity type or fields.
    query: { Thing: { name: '' } },
    datasets: [],
    filters: createScreeningFilters(preset.datasets ?? []),
    threshold: preset.threshold,
  };
  return { name, config };
}

export function adaptSavedFreeformSearchPreset(dto: ScreeningSavedSearch): SavedFreeformSearchPreset {
  const config: FreeformSearchPresetConfigDto = dto.config;
  return {
    id: dto.id,
    name: dto.name,
    config: freeformSearchPresetSchema.parse({
      datasets: config.filters ? getDatasetFromFilters(config.filters) : config.datasets,
      threshold: config.threshold,
    }),
  };
}
