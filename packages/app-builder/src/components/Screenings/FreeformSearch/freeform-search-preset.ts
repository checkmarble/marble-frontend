import {
  applyAliveDeceasedDefaults,
  applyUniqueLexisNexisSectionDefault,
  getCanonicalSelectedKeys,
} from '@app-builder/components/ListAndTopicConfiguration';
import { type SearchableSchema } from '@app-builder/constants/screening-entity';
import { type ScreeningProviders } from '@app-builder/models/screening';
import { type ListConfigFilters } from '@app-builder/queries/screening/lists-config';
import { type FreeformSearchInput, type FreeformSearchPreset } from '@app-builder/server-fns/screenings';
import { isDeepEqual } from 'remeda';
import { match } from 'ts-pattern';

const PRESET_FIELDS_BY_ENTITY = {
  Thing: [],
  Person: ['birthDate', 'nationality', 'passportNumber', 'address'],
  Organization: ['country', 'registrationNumber', 'address'],
  Vehicle: ['registrationNumber'],
} as const satisfies Record<SearchableSchema, readonly (keyof NonNullable<FreeformSearchPreset['fields']>)[]>;

export function collectPresetFields(
  fields: Record<string, string | undefined> | undefined,
  entityType: SearchableSchema = 'Thing',
): FreeformSearchPreset['fields'] {
  if (!fields) return undefined;
  const collected: NonNullable<FreeformSearchPreset['fields']> = {};
  for (const key of PRESET_FIELDS_BY_ENTITY[entityType]) {
    const value = fields[key]?.trim();
    if (value) collected[key] = value;
  }
  return Object.keys(collected).length > 0 ? collected : undefined;
}

export function buildFreeformSearchPreset(input: {
  entityType?: SearchableSchema;
  fields?: Record<string, string | undefined>;
  datasets: string[];
  threshold?: number;
  limit?: number;
}): FreeformSearchPreset {
  const entityType = input.entityType ?? 'Thing';
  return {
    entityType,
    fields: collectPresetFields(input.fields, entityType),
    datasets: [...input.datasets].toSorted(),
    threshold: input.threshold,
    limit: input.limit,
  };
}

export function normalizeFreeformSearchPreset(
  preset: FreeformSearchPreset,
  defaults: { threshold: number; datasets: string[]; limit: number },
): FreeformSearchPreset {
  const entityType = preset.entityType ?? 'Thing';
  return {
    entityType,
    fields: collectPresetFields(preset.fields, entityType),
    datasets: [...(preset.datasets ?? defaults.datasets)].toSorted(),
    threshold: preset.threshold ?? defaults.threshold,
    limit: preset.limit ?? defaults.limit,
  };
}

export function isFreeformSearchPresetDirty(current: FreeformSearchPreset, applied: FreeformSearchPreset) {
  return !isDeepEqual(current, applied);
}

export function getPresetFormFields(
  entityType: SearchableSchema,
  presetFields: FreeformSearchPreset['fields'],
  name: string,
): FreeformSearchInput['fields'] {
  return match(entityType)
    .with('Thing', () => ({ name }))
    .with('Person', () => ({
      name,
      birthDate: presetFields?.birthDate,
      nationality: presetFields?.nationality,
      passportNumber: presetFields?.passportNumber,
      address: presetFields?.address,
    }))
    .with('Organization', () => ({
      name,
      country: presetFields?.country,
      registrationNumber: presetFields?.registrationNumber,
      address: presetFields?.address,
    }))
    .with('Vehicle', () => ({
      name,
      registrationNumber: presetFields?.registrationNumber,
    }))
    .exhaustive();
}

export function getDefaultManualSearchDatasets(listConfig: ListConfigFilters, provider: ScreeningProviders) {
  const initial: Record<string, boolean> = {};
  applyAliveDeceasedDefaults(initial, listConfig, 'manual_search');
  applyUniqueLexisNexisSectionDefault(initial, listConfig, provider);
  return getCanonicalSelectedKeys(initial);
}

export function hasFilledPresetFields(
  fields: Record<string, string | undefined> | undefined,
  entityType: SearchableSchema = 'Thing',
) {
  return collectPresetFields(fields, entityType) !== undefined;
}
