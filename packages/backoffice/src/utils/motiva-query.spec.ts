import type { DataModelObjectDto, FieldDto, TableDto } from 'marble-api';
import { describe, expect, it } from 'vitest';
import { buildMotivaQuery, createMotivaQueryId } from './motiva-query';

const makeField = (name: string, ftmProperty?: string, dataType: FieldDto['data_type'] = 'String'): FieldDto => ({
  id: `${name}-id`,
  data_type: dataType,
  description: '',
  is_enum: false,
  name,
  nullable: true,
  table_id: 'table-id',
  unicity_constraint: 'no_unicity_constraint',
  ftm_property: ftmProperty,
});

const makeTable = (fields: FieldDto[], ftmEntity: TableDto['ftm_entity'] | null = 'Person'): TableDto => ({
  id: 'table-id',
  name: 'people',
  description: '',
  fields: Object.fromEntries(fields.map((field) => [field.id, field])),
  ftm_entity: ftmEntity ?? undefined,
});

const makeObject = (data: Record<string, unknown>): DataModelObjectDto => ({
  data,
  metadata: { valid_from: '2026-10-01T00:00:00Z' },
});

describe('buildMotivaQuery', () => {
  it('creates a unique namespaced ID for each screening query', () => {
    const firstId = createMotivaQueryId();
    const secondId = createMotivaQueryId();

    expect(firstId).toMatch(/^backoffice-screening-[0-9a-f-]{36}$/);
    expect(secondId).not.toBe(firstId);
  });

  it('uses the table entity and field FTM properties', () => {
    const result = buildMotivaQuery(
      makeTable([makeField('full_name', 'name'), makeField('birth_date', 'birthDate'), makeField('unmapped')]),
      makeObject({ full_name: 'Victoire AUBRY', birth_date: '05/06/1966', unmapped: 'ignored' }),
      'test',
    );

    expect(result).toEqual({
      success: true,
      queryId: 'test',
      query: {
        queries: {
          test: {
            schema: 'Person',
            properties: {
              name: ['Victoire AUBRY'],
              birthDate: ['05/06/1966'],
            },
          },
        },
      },
    });
  });

  it('merges repeated mappings, flattens arrays, and preserves false and zero', () => {
    const result = buildMotivaQuery(
      makeTable([
        makeField('primary_name', 'name'),
        makeField('aliases', 'name'),
        makeField('active', 'active'),
        makeField('score', 'score'),
      ]),
      makeObject({ primary_name: 'Victoire AUBRY', aliases: ['V. Aubry', null], active: false, score: 0 }),
      'test',
    );

    expect(result).toMatchObject({
      success: true,
      query: {
        queries: {
          test: {
            properties: {
              name: ['Victoire AUBRY', 'V. Aubry'],
              active: ['false'],
              score: ['0'],
            },
          },
        },
      },
    });
  });

  it('formats timestamp fields as ISO dates without their time', () => {
    const result = buildMotivaQuery(
      makeTable([
        makeField('birth_date', 'birthDate', 'Timestamp'),
        makeField('other_dates', 'otherDate', 'Timestamp'),
      ]),
      makeObject({
        birth_date: '1966-06-05T23:45:00+02:00',
        other_dates: ['2024-01-02T00:00:00Z', '2025-03-04'],
      }),
      'test',
    );

    expect(result).toMatchObject({
      success: true,
      query: {
        queries: {
          test: {
            properties: {
              birthDate: ['1966-06-05'],
              otherDate: ['2024-01-02', '2025-03-04'],
            },
          },
        },
      },
    });
  });

  it('omits null and missing values', () => {
    const result = buildMotivaQuery(
      makeTable([makeField('missing', 'name'), makeField('empty', 'birthDate')]),
      makeObject({ empty: null }),
      'test',
    );

    expect(result).toMatchObject({
      success: true,
      query: { queries: { test: { properties: {} } } },
    });
  });

  it('cannot build a query without a table FTM entity', () => {
    expect(
      buildMotivaQuery(makeTable([makeField('name', 'name')], null), makeObject({ name: 'Aubry' }), 'test'),
    ).toEqual({
      success: false,
      reason: 'missing_ftm_entity',
    });
  });
});
