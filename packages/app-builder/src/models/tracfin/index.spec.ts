import { HttpError } from '@oazapfts/runtime';
import { describe, expect, it } from 'vitest';
import { tracfinDraftFixture } from './__fixtures__';
import { catalogProfileFixture } from './__fixtures__/catalog.fixture';
import { getTracfinCatalogIndex } from './catalog-index';
import {
  adaptTracfinApiError,
  isCanonicalUuid,
  isTracfinRequestError,
  parseTracfinConfigurationErrors,
  TRACFIN_MAX_PIECES,
  TRACFIN_MAX_PRINCIPAL_OPERATIONS,
  TRACFIN_TEXT_OR_REFERENCE_FIELDS,
  type TracfinBlock,
  TracfinRequestError,
  type TracfinResult,
  type TracfinValue,
  toTracfinResult,
  unwrapTracfinResult,
  unwrapTracfinResultOrNull,
} from './index';

const httpError = (status: number, data?: unknown) => new HttpError(status, data, new Headers());

describe('adaptTracfinApiError', () => {
  it.each([
    [400, 'bad_request'],
    [403, 'forbidden'],
    [404, 'not_found'],
    [408, 'timeout'],
    [409, 'conflict'],
    [413, 'too_large'],
    [422, 'unprocessable'],
    [500, 'server'],
    [502, 'server'],
    [503, 'server'],
    [504, 'server'],
  ] as const)('classifies HTTP %i as %s and keeps the status', (status, kind) => {
    expect(adaptTracfinApiError(httpError(status, { message: 'm', error_code: '' }))).toMatchObject({ kind, status });
  });

  it('keeps the server message', () => {
    expect(adaptTracfinApiError(httpError(409, { message: 'revision conflict' }))).toEqual({
      kind: 'conflict',
      status: 409,
      message: 'revision conflict',
    });
  });

  it('exposes a non-empty error code and ignores the empty one the backend always writes', () => {
    expect(adaptTracfinApiError(httpError(501, { message: 'missing', error_code: 'MISSING_REQUIREMENT' }))).toEqual({
      kind: 'server',
      status: 501,
      message: 'missing',
      errorCode: 'MISSING_REQUIREMENT',
    });
    expect(adaptTracfinApiError(httpError(400, { message: 'bad', error_code: '' }))).not.toHaveProperty('errorCode');
  });

  it('has no message when the body is not an error object', () => {
    expect(adaptTracfinApiError(httpError(502, '<html>Bad gateway</html>'))).toEqual({
      kind: 'server',
      status: 502,
      message: null,
    });
    expect(adaptTracfinApiError(httpError(404, undefined))).toMatchObject({ kind: 'not_found', message: null });
  });

  it('treats a status outside the contract as a server failure instead of hiding it', () => {
    expect(adaptTracfinApiError(httpError(401, { message: 'expired' }))).toMatchObject({
      kind: 'server',
      status: 401,
    });
  });

  it('classifies anything that is not an HTTP error as a network error', () => {
    expect(adaptTracfinApiError(new TypeError('fetch failed'))).toEqual({
      kind: 'network',
      status: null,
      message: 'fetch failed',
    });
    expect(adaptTracfinApiError('boom')).toEqual({ kind: 'network', status: null, message: null });
  });
});

describe('parseTracfinConfigurationErrors', () => {
  it('reads several codes with their target field', () => {
    expect(
      parseTracfinConfigurationErrors(
        'invalid TRACFIN configuration: UNKNOWN_CATALOG_CODE /ds/personnes/pp/etatCivil/sexe; INVALID_MAPPING_TARGET /ds/personnes/pp/etatCivil/id; INVALID_MAPPING_PATH /ds/personnes/pp/activite/denominationSociale',
      ),
    ).toEqual([
      { code: 'UNKNOWN_CATALOG_CODE', fieldId: '/ds/personnes/pp/etatCivil/sexe' },
      { code: 'INVALID_MAPPING_TARGET', fieldId: '/ds/personnes/pp/etatCivil/id' },
      { code: 'INVALID_MAPPING_PATH', fieldId: '/ds/personnes/pp/activite/denominationSociale' },
    ]);
  });

  it('keeps a code that has no field', () => {
    expect(
      parseTracfinConfigurationErrors('invalid TRACFIN configuration: INCOMPATIBLE_PROFILE; INVALID_MAPPING_ID /ds/x'),
    ).toEqual([
      { code: 'INCOMPATIBLE_PROFILE', fieldId: null },
      { code: 'INVALID_MAPPING_ID', fieldId: '/ds/x' },
    ]);
  });

  it('strips the wrapping suffix after the last item', () => {
    expect(
      parseTracfinConfigurationErrors(
        'invalid TRACFIN configuration: MISSING_SOURCE_CODE /ds/personnes/pp/etatCivil/sexe; CONTRADICTORY_CODE_MAPPING /ds/personnes/pp/etatCivil/sexe: bad parameter',
      ),
    ).toEqual([
      { code: 'MISSING_SOURCE_CODE', fieldId: '/ds/personnes/pp/etatCivil/sexe' },
      { code: 'CONTRADICTORY_CODE_MAPPING', fieldId: '/ds/personnes/pp/etatCivil/sexe' },
    ]);
  });

  it('strips the suffix after a code without field, and a field that contains an attribute marker', () => {
    expect(
      parseTracfinConfigurationErrors('invalid TRACFIN configuration: INCOMPATIBLE_PROFILE: bad parameter'),
    ).toEqual([{ code: 'INCOMPATIBLE_PROFILE', fieldId: null }]);
    expect(
      parseTracfinConfigurationErrors(
        'invalid TRACFIN configuration: UNKNOWN_CATALOG_CODE /ds/organisme/adresse/pays/@type: bad parameter',
      ),
    ).toEqual([{ code: 'UNKNOWN_CATALOG_CODE', fieldId: '/ds/organisme/adresse/pays/@type' }]);
  });

  it('returns nothing when the message is not a configuration error', () => {
    expect(parseTracfinConfigurationErrors('bad parameter')).toEqual([]);
    expect(parseTracfinConfigurationErrors('')).toEqual([]);
    expect(parseTracfinConfigurationErrors('UNKNOWN_CATALOG_CODE /ds/x')).toEqual([]);
  });
});

describe('isCanonicalUuid', () => {
  it('accepts the lowercase hyphenated form', () => {
    expect(isCanonicalUuid('0b1c8a7e-5c1f-4d3a-9e2b-6f7a8b9c0d1e')).toBe(true);
  });

  it.each([
    ['uppercase', '0B1C8A7E-5C1F-4D3A-9E2B-6F7A8B9C0D1E'],
    ['without hyphens', '0b1c8a7e5c1f4d3a9e2b6f7a8b9c0d1e'],
    ['braced', '{0b1c8a7e-5c1f-4d3a-9e2b-6f7a8b9c0d1e}'],
    ['urn', 'urn:uuid:0b1c8a7e-5c1f-4d3a-9e2b-6f7a8b9c0d1e'],
    ['padded', ' 0b1c8a7e-5c1f-4d3a-9e2b-6f7a8b9c0d1e'],
    ['truncated', '0b1c8a7e-5c1f-4d3a-9e2b-6f7a8b9c0d1'],
    ['not hexadecimal', '0b1c8a7e-5c1f-4d3a-9e2b-6f7a8b9c0d1g'],
    ['empty', ''],
  ])('rejects %s', (_label, id) => {
    expect(isCanonicalUuid(id)).toBe(false);
  });
});

describe('profile constants', () => {
  const index = getTracfinCatalogIndex(catalogProfileFixture);

  it('lists exactly the catalog fields whose value kind is text_or_reference', () => {
    const fromCatalog = Object.values(catalogProfileFixture.fields)
      .filter((field) => field.value_kind === 'text_or_reference')
      .map((field) => field.id);
    expect([...TRACFIN_TEXT_OR_REFERENCE_FIELDS].sort()).toEqual(fromCatalog.sort());
  });

  it('match the cardinalities declared by the catalog', () => {
    expect(index.cardinality('/ds/pieceJointe/piece')?.max).toBe(TRACFIN_MAX_PIECES);
    expect(index.cardinality('/ds/operations/operation')?.max).toBe(TRACFIN_MAX_PRINCIPAL_OPERATIONS);
  });
});

describe('TracfinResult helpers', () => {
  it('unwraps a successful result', () => {
    const result: TracfinResult<number> = { ok: true, data: 42 };
    expect(unwrapTracfinResult(result)).toBe(42);
  });

  it('throws a request error that carries the API error of a failed result', () => {
    const result: TracfinResult<number> = {
      ok: false,
      error: { kind: 'conflict', status: 409, message: 'stale revision' },
    };
    let thrown: unknown;
    try {
      unwrapTracfinResult(result);
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBeInstanceOf(TracfinRequestError);
    expect(isTracfinRequestError(thrown)).toBe(true);
    expect((thrown as TracfinRequestError).error).toEqual({ kind: 'conflict', status: 409, message: 'stale revision' });
    expect((thrown as TracfinRequestError).message).toBe('stale revision');
  });
});

describe('unwrapTracfinResultOrNull', () => {
  it('reads an absent resource (404) as null and anything else as in unwrapTracfinResult', () => {
    expect(
      unwrapTracfinResultOrNull({ ok: false, error: { kind: 'not_found', status: 404, message: null } }),
    ).toBeNull();
    expect(unwrapTracfinResultOrNull({ ok: true, data: 'draft' })).toBe('draft');
    expect(() =>
      unwrapTracfinResultOrNull({ ok: false, error: { kind: 'forbidden', status: 403, message: null } }),
    ).toThrow(TracfinRequestError);
  });
});

describe('toTracfinResult', () => {
  it('wraps a successful call', async () => {
    await expect(toTracfinResult(async () => ({ revision: 2 }))).resolves.toEqual({ ok: true, data: { revision: 2 } });
  });

  it('describes a failed call instead of throwing it', async () => {
    const result = await toTracfinResult(async () => {
      throw httpError(409, { message: 'stale revision', error_code: '' });
    });
    expect(result).toEqual({ ok: false, error: { kind: 'conflict', status: 409, message: 'stale revision' } });
  });

  it('describes a failure that is not an HTTP error as a network error', async () => {
    const result = await toTracfinResult(async () => {
      throw new TypeError('fetch failed');
    });
    expect(result).toEqual({ ok: false, error: { kind: 'network', status: null, message: 'fetch failed' } });
  });

  it('re-throws a redirect', async () => {
    const redirect = new Response(null, { status: 302, headers: { Location: '/sign-in' } });
    await expect(
      toTracfinResult(async () => {
        throw redirect;
      }),
    ).rejects.toBe(redirect);
  });
});

describe('draft fixture', () => {
  const valuesOf = (block: TracfinBlock): TracfinValue[] => [
    ...Object.values(block.fields ?? {}).flat(),
    ...(block.children ?? []).flatMap(valuesOf),
  ];

  it('carries a value the backend moved to needs_review, flagged for review', () => {
    const flagged = valuesOf(tracfinDraftFixture.document.root).filter(
      (value) => value.origin?.resolution === 'needs_review',
    );
    expect(flagged).toHaveLength(1);
    expect(flagged[0]).toMatchObject({ needs_review: true, origin: { source: 'ingested' } });
  });

  it('only moves non-manual values to needs_review', () => {
    for (const value of valuesOf(tracfinDraftFixture.document.root)) {
      if (value.origin?.resolution === 'needs_review') expect(value.origin.source).not.toBe('manual');
    }
  });
});
