import { type TracfinApiError, TracfinRequestError } from '@app-builder/models/tracfin';
import { describe, expect, it } from 'vitest';
import {
  classifySaveFailure,
  isKnownConfigurationErrorCode,
  placeConfigurationErrors,
  TRACFIN_CONFIGURATION_ERROR_CODES,
} from './configuration-errors';

const failure = (error: TracfinApiError) => classifySaveFailure(new TracfinRequestError(error));

describe('classifySaveFailure', () => {
  it('reads a 400 that lists diagnostics', () => {
    expect(
      failure({
        kind: 'bad_request',
        status: 400,
        message: 'invalid TRACFIN configuration: UNKNOWN_CATALOG_CODE /a; MISSING_SOURCE_CODE /b: bad parameter',
      }),
    ).toEqual({
      kind: 'invalid',
      errors: [
        { code: 'UNKNOWN_CATALOG_CODE', fieldId: '/a' },
        { code: 'MISSING_SOURCE_CODE', fieldId: '/b' },
      ],
      message: 'invalid TRACFIN configuration: UNKNOWN_CATALOG_CODE /a; MISSING_SOURCE_CODE /b: bad parameter',
    });
  });

  it('keeps the raw message of a bare 400 (invalid settings name nothing)', () => {
    expect(failure({ kind: 'bad_request', status: 400, message: 'bad parameter' })).toEqual({
      kind: 'rejected',
      message: 'bad parameter',
    });
    expect(failure({ kind: 'bad_request', status: 400, message: null })).toEqual({ kind: 'rejected', message: null });
  });

  it.each([
    ['conflict', 409, { kind: 'conflict' }],
    ['forbidden', 403, { kind: 'forbidden' }],
    ['too_large', 413, { kind: 'too_large' }],
  ] as const)('maps %s to its own failure', (kind, status, expected) => {
    expect(failure({ kind, status, message: 'x' })).toEqual(expected);
  });

  it('treats anything else as a failure to reach the server', () => {
    expect(failure({ kind: 'server', status: 500, message: 'boom' })).toEqual({ kind: 'unavailable', message: 'boom' });
    expect(classifySaveFailure(new Error('network down'))).toEqual({ kind: 'unavailable', message: 'network down' });
  });
});

describe('placeConfigurationErrors', () => {
  const mappings = [
    { id: 'm1', target_field: '/a', source: { kind: 'ingested' as const } },
    { id: 'm2', target_field: '/a', source: { kind: 'ingested' as const } },
    { id: 'm3', target_field: '/b', source: { kind: 'ingested' as const } },
  ];

  it('attaches an error to every mapping that targets its field, without repeating a code', () => {
    const placement = placeConfigurationErrors({
      errors: [
        { code: 'UNKNOWN_CATALOG_CODE', fieldId: '/a' },
        { code: 'UNKNOWN_CATALOG_CODE', fieldId: '/a' },
        { code: 'INVALID_MAPPING_PATH', fieldId: '/b' },
      ],
      mappings,
      settingFieldIds: new Set(),
    });

    expect(placement.byMappingId).toEqual({
      m1: ['UNKNOWN_CATALOG_CODE'],
      m2: ['UNKNOWN_CATALOG_CODE'],
      m3: ['INVALID_MAPPING_PATH'],
    });
    expect(placement.general).toEqual([]);
  });

  it('attaches an error to a settings field', () => {
    const placement = placeConfigurationErrors({
      errors: [{ code: 'X', fieldId: '/ds/organisme/libelle' }],
      mappings,
      settingFieldIds: new Set(['/ds/organisme/libelle']),
    });
    expect(placement.bySettingField).toEqual({ '/ds/organisme/libelle': ['X'] });
    expect(placement.general).toEqual([]);
  });

  it('keeps an error without a field, or with a field nothing shows, in the page-level list', () => {
    const placement = placeConfigurationErrors({
      errors: [
        { code: 'INCOMPATIBLE_PROFILE', fieldId: null },
        { code: 'INVALID_MAPPING_TARGET', fieldId: '/gone' },
      ],
      mappings,
      settingFieldIds: new Set(),
    });
    expect(placement.byMappingId).toEqual({});
    expect(placement.general).toEqual([
      { code: 'INCOMPATIBLE_PROFILE', fieldId: null },
      { code: 'INVALID_MAPPING_TARGET', fieldId: '/gone' },
    ]);
  });
});

describe('known codes', () => {
  it('lists the 21 codes of ValidateConfiguration', () => {
    expect(TRACFIN_CONFIGURATION_ERROR_CODES).toHaveLength(21);
    expect(isKnownConfigurationErrorCode('UNKNOWN_CURRENCY')).toBe(true);
    expect(isKnownConfigurationErrorCode('SOMETHING_ELSE')).toBe(false);
  });
});
