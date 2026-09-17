import {
  adaptSavedFreeformSearchPreset,
  adaptSaveFreeformSearchPresetDto,
  freeformSearchPresetSchema,
} from '@app-builder/models/freeform-search-preset';
import { createScreeningFilters } from '@app-builder/models/screening-config';
import { makeGetScreeningRepository } from '@app-builder/repositories/ScreeningRepository';
import { marblecoreApi } from 'marble-api';
import { describe, expect, it, vi } from 'vitest';
import {
  buildFreeformSearchPreset,
  isFreeformSearchPresetDirty,
  normalizeFreeformSearchPreset,
} from './freeform-search-preset';

const metadata = {
  id: 'b7927fb7-630c-40dd-9b8b-ff55492a48bd',
  org_id: 'ef30d8d2-5a79-4794-8853-c10ab6cc2f64',
  name: 'Sanctions and PEPs',
  provider: 'opensanctions',
  created_at: '2026-09-16T10:00:00Z',
};

const datasets = [
  'sanctions',
  'sanctions:dataset:fr_tresor_gels_avoir',
  'peps',
  'peps:topic:role:pep',
  'adverse-media',
  'third-parties',
  'custom',
  'global:topic:alive_deceased:filter.alive',
];

describe('backend screening presets', () => {
  it('round-trips filters and threshold with the required search query placeholder', () => {
    const original = buildFreeformSearchPreset({ datasets, threshold: 83 });
    const request = adaptSaveFreeformSearchPresetDto(metadata.name, original);
    const saved = adaptSavedFreeformSearchPreset({ ...metadata, ...request });
    const applied = normalizeFreeformSearchPreset(saved.config, { datasets: [], threshold: 70 });

    expect(request.config).toEqual({
      query: { Thing: { name: '' } },
      datasets: [],
      filters: createScreeningFilters(datasets),
      threshold: 83,
    });
    expect(saved).toMatchObject({ id: metadata.id, name: metadata.name });
    expect(isFreeformSearchPresetDirty(original, applied)).toBe(false);
  });

  it('excludes entity type, fields and limit from persistence and dirty tracking', () => {
    const original = {
      entityType: 'Person',
      fields: { name: 'Alice', nationality: 'FR' },
      datasets: [],
      threshold: 70,
      limit: 10,
    };
    const preset = buildFreeformSearchPreset(original);
    const changedInput = {
      ...original,
      entityType: 'Organization',
      fields: { name: 'ACME', country: 'US' },
      limit: 50,
    };
    const changed = buildFreeformSearchPreset(changedInput);
    expect(isFreeformSearchPresetDirty(preset, changed)).toBe(false);
    expect(preset).toEqual({ datasets: [], threshold: 70 });
    const request = adaptSaveFreeformSearchPresetDto('Generic', preset);
    expect(request.config).toEqual({
      query: { Thing: { name: '' } },
      datasets: [],
      filters: createScreeningFilters([]),
      threshold: 70,
    });
    expect(freeformSearchPresetSchema.parse(original)).toEqual(preset);
  });

  it.each([{ Thing: { name: 'Old search' } }, { Person: { nationality: 'FR' } }])(
    'ignores entity queries from the backend: %j',
    (query) => {
      const response = { ...metadata, config: { query, datasets: [], threshold: 80 } };
      expect(adaptSavedFreeformSearchPreset(response)).toEqual({
        id: metadata.id,
        name: metadata.name,
        config: { datasets: [], threshold: 80 },
      });
    },
  );

  it('uses the generated list/save/delete endpoints and sends the same filters as manual search', async () => {
    const config = {
      query: { Thing: { name: '' } },
      datasets: [],
      filters: createScreeningFilters(datasets),
      threshold: 80,
    };
    const response = { ...metadata, config };
    const api = {
      ...marblecoreApi,
      listScreeningSavedSearches: vi.fn().mockResolvedValue([response]),
      saveScreeningSearch: vi.fn().mockResolvedValue(response),
      deleteScreeningSavedSearch: vi.fn().mockResolvedValue(undefined),
      freeformSearch: vi.fn().mockResolvedValue({ id: 'search-id', matches: [] }),
    };
    const repository = makeGetScreeningRepository()(api);
    const [listed] = await repository.listFreeformSearchPresets();
    expect(listed).toEqual({
      id: metadata.id,
      name: metadata.name,
      config: { datasets, threshold: 80 },
    });
    await repository.saveFreeformSearchPreset({
      name: metadata.name,
      value: { datasets, threshold: 80 },
    });
    await repository.freeformSearch({
      entityType: 'Person',
      fields: { name: 'Alice', nationality: 'FR' },
      datasets,
      threshold: 80,
      limit: 30,
    });
    expect(api.saveScreeningSearch).toHaveBeenCalledWith({ name: metadata.name, config });
    expect(api.freeformSearch).toHaveBeenCalledWith(
      { ...config, query: { Person: { name: 'Alice', nationality: 'FR' } } },
      { limit: 30 },
    );
    await repository.deleteFreeformSearchPreset({ id: metadata.id });
    expect(api.deleteScreeningSavedSearch).toHaveBeenCalledWith(metadata.id);
    expect(api.listScreeningSavedSearches).toHaveBeenCalledOnce();
  });
});
