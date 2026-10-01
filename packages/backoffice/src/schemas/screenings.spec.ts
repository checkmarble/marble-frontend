import { describe, expect, it } from 'vitest';
import {
  motivaMatchResponseSchema,
  organizationClientObjectInputSchema,
  organizationDataModelInputSchema,
  organizationScreeningsSearchSchema,
} from './screenings';

const ORG_ID = 'ef30d8d2-5a79-4794-8853-c10ab6cc2f64';

describe('organization screenings schemas', () => {
  it('normalizes valid URL lookup parameters', () => {
    expect(
      organizationScreeningsSearchSchema.parse({
        table: '  customers  ',
        objectId: '  customer-42  ',
      }),
    ).toEqual({ table: 'customers', objectId: 'customer-42' });
  });

  it('keeps known providers and drops unknown ones', () => {
    expect(organizationScreeningsSearchSchema.parse({ provider: 'lexisnexis' }).provider).toBe('lexisnexis');
    expect(organizationScreeningsSearchSchema.parse({ provider: 'acme' }).provider).toBeUndefined();
  });

  it('drops incomplete URL lookup parameters', () => {
    expect(organizationScreeningsSearchSchema.parse({ table: ' ', objectId: '' })).toEqual({
      table: undefined,
      objectId: undefined,
    });
  });

  it('requires a valid organization id for data-model reads', () => {
    expect(organizationDataModelInputSchema.safeParse({ orgId: ORG_ID }).success).toBe(true);
    expect(organizationDataModelInputSchema.safeParse({ orgId: 'not-an-org-id' }).success).toBe(false);
  });

  it('accepts arbitrary non-empty object identifiers and rejects blank path segments', () => {
    expect(
      organizationClientObjectInputSchema.parse({
        orgId: ORG_ID,
        tableName: '  customers  ',
        objectId: '  external/customer/42  ',
      }),
    ).toEqual({ orgId: ORG_ID, tableName: 'customers', objectId: 'external/customer/42' });

    expect(
      organizationClientObjectInputSchema.safeParse({ orgId: ORG_ID, tableName: ' ', objectId: 'customer-42' }).success,
    ).toBe(false);
  });

  it('accepts empty and populated Motiva match responses', () => {
    expect(
      motivaMatchResponseSchema.parse({
        responses: { test: { status: 200, results: [], total: { relation: 'eq', value: 0 } } },
        limit: 5,
      }).responses['test']?.results,
    ).toEqual([]);

    const populated = motivaMatchResponseSchema.parse({
      responses: {
        test: {
          status: 200,
          total: { relation: 'eq', value: 1 },
          results: [
            {
              id: 'Q7747',
              caption: 'Vladimir Vladimirovich PUTIN',
              schema: 'Person',
              datasets: ['eu_fsf'],
              referents: ['eu-fsf-eu-7510-16'],
              target: true,
              last_seen: '2026-09-25T14:57:01',
              last_change: '2026-04-24T10:57:01',
              properties: { name: ['Vladimir Vladimirovich PUTIN'] },
              features: { person_name_jaro_winkler: 1 },
              explanations: {
                person_name_jaro_winkler: {
                  score: 1,
                  weighted: 0.8,
                  detail: 'vladimirputin == vladimirvladimirovitjputin',
                },
                ignored_future_field: { detail: 'no match', future_field: true },
              },
              match: true,
              score: 0.9,
              ignored_future_field: true,
            },
          ],
        },
      },
      limit: 5,
    });

    expect(populated.responses['test']?.results[0]).toMatchObject({
      id: 'Q7747',
      score: 0.9,
      explanations: { person_name_jaro_winkler: { weighted: 0.8 } },
    });
    expect(populated.responses['test']?.results[0]?.first_seen).toBeUndefined();
    expect(populated.responses['test']?.results[0]?.['ignored_future_field']).toBe(true);
    expect(populated.responses['test']?.results[0]?.explanations['ignored_future_field']).toMatchObject({
      future_field: true,
    });
  });

  it('accepts results missing non-essential fields', () => {
    const result = motivaMatchResponseSchema.parse({
      responses: {
        test: {
          status: 200,
          total: { relation: 'eq', value: 1 },
          results: [{ id: 'LN-1', caption: 'Jane Doe', schema: 'Person', score: 0.5, last_seen: null }],
        },
      },
      limit: 10,
    }).responses['test']?.results[0];

    expect(result).toMatchObject({ datasets: [], referents: [], properties: {}, explanations: {}, last_seen: null });
  });
});
