import type { TracfinValidation } from '@app-builder/models/tracfin';
import { tracfinExportFixture, tracfinValidationFixture } from '@app-builder/models/tracfin/__fixtures__';
import { describe, expect, it } from 'vitest';
import { internalChecksStatus, knownReasonKey, layerRows } from './review-layers';

const layers = (statuses: Record<string, TracfinValidation['layers'][string]['status']>): TracfinValidation => ({
  profile_version: 'p',
  diagnostics: null,
  layers: Object.fromEntries(Object.entries(statuses).map(([id, status]) => [id, { status }])),
});

describe('layerRows', () => {
  it('lists the five layers in a fixed order with official_xsd last, whatever the server order', () => {
    const rows = layerRows(tracfinValidationFixture);
    expect(rows.map((row) => row.id)).toEqual([
      'internal_structure',
      'references',
      'business',
      'xml_syntax',
      'official_xsd',
    ]);
    expect(rows.map((row) => row.status)).toEqual(['failed', 'incomplete', 'incomplete', 'unavailable', 'unavailable']);
  });

  it('shows official_xsd as unavailable even before any validation, and the others as not run', () => {
    const rows = layerRows(null);
    expect(rows.find((row) => row.id === 'official_xsd')?.status).toBe('unavailable');
    expect(rows.filter((row) => row.id !== 'official_xsd').every((row) => row.status === null)).toBe(true);
  });

  it('keeps a layer this version does not know after the known ones', () => {
    const rows = layerRows(layers({ business: 'passed', extra: 'failed' }));
    expect(rows.at(-1)).toMatchObject({ id: 'extra', status: 'failed' });
    expect(rows.map((row) => row.id).indexOf('official_xsd')).toBe(4);
  });
});

const allPassed = {
  internal_structure: 'passed',
  references: 'passed',
  business: 'passed',
  xml_syntax: 'passed',
} as const;

describe('internalChecksStatus', () => {
  it('takes the worst status of the internal layers and ignores the official XSD one', () => {
    expect(internalChecksStatus(layers({ ...allPassed, business: 'failed' }))).toBe('failed');
    expect(internalChecksStatus(layers({ ...allPassed, business: 'incomplete' }))).toBe('incomplete');
    expect(internalChecksStatus(layers({ ...allPassed, xml_syntax: 'unavailable' }))).toBe('unavailable');
    expect(internalChecksStatus(layers(allPassed))).toBe('passed');
    // official_xsd is always unavailable: it never degrades (nor improves) the internal verdict.
    expect(internalChecksStatus(layers({ ...allPassed, official_xsd: 'unavailable' }))).toBe('passed');
  });

  it('is passed only when all four internal layers are reported and passed', () => {
    // A layer the report does not mention was not seen to pass.
    expect(internalChecksStatus(layers({ internal_structure: 'passed', business: 'passed' }))).toBe('incomplete');
    const { xml_syntax: _omitted, ...threeOfFour } = allPassed;
    expect(internalChecksStatus(layers(threeOfFour))).toBe('incomplete');
    // Nor a status this version does not know.
    const unknown = layers(allPassed);
    unknown.layers['references'] = { status: 'skipped' as never };
    expect(internalChecksStatus(unknown)).toBe('incomplete');
    // Any other layer the server adds weighs in too.
    expect(internalChecksStatus(layers({ ...allPassed, extra: 'failed' }))).toBe('failed');
  });

  it('reads the export fixture as incomplete: the server rules are not all implemented', () => {
    expect(internalChecksStatus(tracfinExportFixture.validation)).toBe('incomplete');
  });

  it('is unavailable when there is nothing to read', () => {
    expect(internalChecksStatus({ layers: {} })).toBe('unavailable');
  });
});

describe('knownReasonKey', () => {
  it('recognises the three backend reasons and nothing else', () => {
    expect(knownReasonKey('Some registered source rules have not been implemented and tested; see coverage.json')).toBe(
      'rules_not_implemented',
    );
    expect(knownReasonKey('Draft validation does not read exported XML bytes')).toBe('draft_has_no_xml');
    expect(
      knownReasonKey('No compatible official XSD engine is integrated; internal checks are not certification'),
    ).toBe('no_xsd_engine');
    expect(knownReasonKey('something else')).toBeNull();
  });
});
