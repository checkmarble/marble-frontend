import { describe, expect, it } from 'vitest';
import { buildMotivaComparisons } from './motiva-comparison';

describe('buildMotivaComparisons', () => {
  it('groups compatible FollowTheMoney country properties on both sides', () => {
    const comparisons = buildMotivaComparisons(
      { nationality: ['fr'], birthCountry: ['us'], name: ['Victoire Aubry'] },
      { country: ['fr'], citizenship: ['ca'], name: ['Victory Aubrey'], notes: ['hidden'] },
      {
        country_mismatch: { weighted: -0.1, detail: 'fr vs ca' },
        person_name_jaro_winkler: { weighted: 0.4 },
      },
    );

    expect(comparisons).toEqual([
      {
        key: 'countries',
        label: 'Countries',
        submitted: [
          { property: 'nationality', values: ['fr'] },
          { property: 'birthCountry', values: ['us'] },
        ],
        candidate: [
          { property: 'country', values: ['fr'] },
          { property: 'citizenship', values: ['ca'] },
        ],
        explanations: [['country_mismatch', { weighted: -0.1, detail: 'fr vs ca' }]],
      },
      {
        key: 'names',
        label: 'Names',
        submitted: [{ property: 'name', values: ['Victoire Aubry'] }],
        candidate: [{ property: 'name', values: ['Victory Aubrey'] }],
        explanations: [['person_name_jaro_winkler', { weighted: 0.4 }]],
      },
    ]);
  });

  it('keeps an unknown submitted property as an exact property comparison', () => {
    expect(buildMotivaComparisons({ customField: ['left'] }, { customField: ['right'], other: ['hidden'] })).toEqual([
      {
        key: 'property:customField',
        label: 'Custom Field',
        submitted: [{ property: 'customField', values: ['left'] }],
        candidate: [{ property: 'customField', values: ['right'] }],
        explanations: [],
      },
    ]);
  });
});
