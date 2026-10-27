import type { TracfinConfiguration, TracfinMapping } from '@app-builder/models/tracfin';
import { tracfinConfigurationFixture } from '@app-builder/models/tracfin/__fixtures__';
import { catalogProfileFixture } from '@app-builder/models/tracfin/__fixtures__/catalog.fixture';
import { getTracfinCatalogIndex } from '@app-builder/models/tracfin/catalog-index';
import { describe, expect, it } from 'vitest';
import {
  buildConfigurationInput,
  buildSettingInputs,
  configurationToFormState,
  isEmptySetting,
  isFormStateEqual,
  readSettings,
  setSettingText,
  toMappingInput,
} from './form-state';

const catalogIndex = getTracfinCatalogIndex(catalogProfileFixture);

describe('readSettings', () => {
  it('walks every block and keeps the first value of each field with its kind', () => {
    const settings = readSettings(tracfinConfigurationFixture.settings.root);

    expect(settings['/ds/organisme/libelle']).toEqual({ kind: 'text', text: 'Banque Exemple SA' });
    expect(settings['/ds/organisme/adresse/codePostal']).toEqual({ kind: 'text', text: '75002' });
    expect(settings['/ds/organisme/adresse/pays/@type']).toBeDefined();
    // Server ids, origins and owners are not part of an input.
    for (const input of Object.values(settings)) {
      expect(Object.keys(input).sort()).toEqual(['kind', 'text']);
    }
  });

  it('keeps a stored decimal or boolean as such and ignores cleared values and references', () => {
    const settings = readSettings({
      id: 'root',
      catalog_id: '/ds',
      fields: {
        '/ds/a': [{ id: '1', kind: 'decimal', decimal: '12.50' }],
        '/ds/b': [{ id: '2', kind: 'boolean', boolean: false }],
        '/ds/c': [{ id: '3', kind: 'cleared' }],
        '/ds/d': [{ id: '4', kind: 'reference', reference: { block_id: 'x' } }],
        '/ds/e': [
          { id: '5', kind: 'cleared' },
          { id: '6', kind: 'text', text: 'second' },
        ],
      },
    });

    expect(settings).toEqual({
      '/ds/a': { kind: 'decimal', decimal: '12.50' },
      '/ds/b': { kind: 'boolean', boolean: false },
      '/ds/e': { kind: 'text', text: 'second' },
    });
  });

  it('is empty without a document', () => {
    expect(readSettings(undefined)).toEqual({});
  });
});

describe('configurationToFormState', () => {
  it('reads a missing configuration as an empty form', () => {
    expect(configurationToFormState(null)).toEqual({ settings: {}, mappings: [] });
  });

  it('reads a configuration whose mappings the server serialised as null', () => {
    const configuration: TracfinConfiguration = { ...tracfinConfigurationFixture, mappings: null };
    expect(configurationToFormState(configuration).mappings).toEqual([]);
  });

  it('keeps the mappings verbatim', () => {
    expect(configurationToFormState(tracfinConfigurationFixture).mappings).toEqual(
      tracfinConfigurationFixture.mappings,
    );
  });
});

describe('buildConfigurationInput', () => {
  const state = configurationToFormState(tracfinConfigurationFixture);

  it('round-trips a loaded configuration: same mappings, same settings, guarded by the revision read', () => {
    const input = buildConfigurationInput({ state, expectedRevision: 3, catalogIndex });

    expect(input.expected_revision).toBe(3);
    expect(input.mappings).toEqual(tracfinConfigurationFixture.mappings);
    const sent = Object.fromEntries(input.settings.map(({ field, value }) => [field.field_id, value]));
    expect(sent).toEqual(state.settings);
    for (const setting of input.settings) {
      expect(Object.keys(setting).sort()).toEqual(['field', 'value']);
      expect(Object.keys(setting.field)).toEqual(['field_id']);
    }
  });

  it('creates at revision 0 and sends empty lists for an empty form', () => {
    expect(
      buildConfigurationInput({ state: { settings: {}, mappings: [] }, expectedRevision: 0, catalogIndex }),
    ).toEqual({
      expected_revision: 0,
      settings: [],
      mappings: [],
    });
  });

  it('never sends an empty setting', () => {
    const settings = buildSettingInputs(
      {
        '/ds/organisme/libelle': { kind: 'text', text: '' },
        '/ds/organisme/numIdPro': { kind: 'text', text: '   ' },
        '/ds/organisme/profession': { kind: 'text', text: 'TPI9' },
      },
      catalogIndex,
    );

    expect(settings).toEqual([
      { field: { field_id: '/ds/organisme/profession' }, value: { kind: 'text', text: 'TPI9' } },
    ]);
  });

  it('omits an attribute whose scalar owner has no value, which the server would refuse', () => {
    const attribute = '/ds/organisme/adresse/pays/@type';
    const owner = '/ds/organisme/adresse/pays';

    expect(buildSettingInputs({ [attribute]: { kind: 'text', text: 'code' } }, catalogIndex)).toEqual([]);
    expect(
      buildSettingInputs(
        { [owner]: { kind: 'text', text: 'FR' }, [attribute]: { kind: 'text', text: 'code' } },
        catalogIndex,
      ).map(({ field }) => field.field_id),
    ).toEqual([owner, attribute]);
  });

  it('strips any member the contract does not name', () => {
    const polluted = {
      id: 'm1',
      target_field: '/ds/personnes/pp/etatCivil/prenom',
      uiKey: 'row-1',
      source: {
        kind: 'ingested',
        entity_type: 'Person',
        table: 'users',
        field: 'first_name',
        expanded: true,
        path: [
          { id: 'accounts', parent_id: 'root', link: 'user', direction: 'inverse', table: 'accounts', open: true },
        ],
      },
      codes: [{ source: 'a', target: 'b', key: 1 }],
      currency: { constant: 'EUR', note: 'x' },
      discriminator: { field: 'f', values: ['v'], collapsed: true },
    } as unknown as TracfinMapping;

    expect(toMappingInput(polluted)).toEqual({
      id: 'm1',
      target_field: '/ds/personnes/pp/etatCivil/prenom',
      source: {
        kind: 'ingested',
        entity_type: 'Person',
        table: 'users',
        field: 'first_name',
        path: [{ id: 'accounts', parent_id: 'root', link: 'user', direction: 'inverse', table: 'accounts' }],
      },
      codes: [{ source: 'a', target: 'b' }],
      currency: { constant: 'EUR' },
      discriminator: { field: 'f', values: ['v'] },
    });
  });
});

describe('setting edits', () => {
  it('sets a text and removes the field when it is emptied', () => {
    const set = setSettingText({}, '/ds/organisme/libelle', 'text', 'Banque');
    expect(set).toEqual({ '/ds/organisme/libelle': { kind: 'text', text: 'Banque' } });
    expect(setSettingText(set, '/ds/organisme/libelle', 'text', '')).toEqual({});
  });

  it('keeps a decimal as a decimal lexeme', () => {
    expect(setSettingText({}, '/ds/x', 'decimal', '10.50')).toEqual({ '/ds/x': { kind: 'decimal', decimal: '10.50' } });
  });

  it('tells blank inputs from filled ones', () => {
    expect(isEmptySetting({ kind: 'text', text: ' ' })).toBe(true);
    expect(isEmptySetting({ kind: 'text', text: 'a' })).toBe(false);
    expect(isEmptySetting({ kind: 'boolean', boolean: false })).toBe(false);
  });
});

describe('isFormStateEqual', () => {
  it('ignores the order of the settings keys and compares the mappings deeply', () => {
    const a = {
      settings: { x: { kind: 'text' as const, text: '1' }, y: { kind: 'text' as const, text: '2' } },
      mappings: [],
    };
    const b = {
      settings: { y: { kind: 'text' as const, text: '2' }, x: { kind: 'text' as const, text: '1' } },
      mappings: [],
    };
    expect(isFormStateEqual(a, b)).toBe(true);
    expect(isFormStateEqual(a, { ...b, settings: { ...b.settings, x: { kind: 'text', text: '3' } } })).toBe(false);
  });
});
