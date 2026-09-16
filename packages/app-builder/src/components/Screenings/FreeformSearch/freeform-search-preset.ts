import {
  applyAliveDeceasedDefaults,
  applyUniqueLexisNexisSectionDefault,
  getCanonicalSelectedKeys,
} from '@app-builder/components/ListAndTopicConfiguration';
import { SEARCH_ENTITIES, type SearchableSchema } from '@app-builder/constants/screening-entity';
import { type FreeformSearchPreset } from '@app-builder/models/freeform-search-preset';
import { type ScreeningProviders } from '@app-builder/models/screening';
import { type ListConfigFilters } from '@app-builder/queries/screening/lists-config';
import { isDeepEqual } from 'remeda';

export function buildFreeformSearchPreset(input: { datasets: string[]; threshold?: number }): FreeformSearchPreset {
  return {
    datasets: [...input.datasets].toSorted(),
    threshold: input.threshold,
  };
}

export function normalizeFreeformSearchPreset(
  preset: FreeformSearchPreset,
  defaults: { threshold: number; datasets: string[] },
): FreeformSearchPreset {
  return {
    datasets: [...(preset.datasets ?? defaults.datasets)].toSorted(),
    threshold: preset.threshold ?? defaults.threshold,
  };
}

export function isFreeformSearchPresetDirty(current: FreeformSearchPreset, applied: FreeformSearchPreset) {
  return !isDeepEqual(current, applied);
}

export function getDefaultManualSearchDatasets(listConfig: ListConfigFilters, provider: ScreeningProviders) {
  const initial: Record<string, boolean> = {};
  applyAliveDeceasedDefaults(initial, listConfig, 'manual_search');
  applyUniqueLexisNexisSectionDefault(initial, listConfig, provider);
  return getCanonicalSelectedKeys(initial);
}

export function hasFilledAdditionalFields(
  fields: Record<string, string | undefined> | undefined,
  entityType: SearchableSchema = 'Thing',
) {
  return SEARCH_ENTITIES[entityType].fields.some((key) => key !== 'name' && !!fields?.[key]?.trim());
}
