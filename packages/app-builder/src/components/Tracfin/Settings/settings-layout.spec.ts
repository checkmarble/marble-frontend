import { catalogProfileFixture } from '@app-builder/models/tracfin/__fixtures__/catalog.fixture';
import { createTracfinCatalogIndex, getTracfinCatalogIndex } from '@app-builder/models/tracfin/catalog-index';
import { describe, expect, it } from 'vitest';
import { getTracfinSettingsLayout, listSettingsFieldIds } from './settings-layout';

const index = getTracfinCatalogIndex(catalogProfileFixture);
const layout = getTracfinSettingsLayout(index);

describe('getTracfinSettingsLayout', () => {
  it('covers organisme, its address and the contact, and never the declarant', () => {
    expect(layout.map((section) => section.blockId)).toEqual([
      '/ds/organisme',
      '/ds/organisme/adresse',
      '/ds/contact/coordonnees',
    ]);
    const ids = listSettingsFieldIds(layout);
    expect(ids.every((id) => id.startsWith('/ds/organisme/') || id.startsWith('/ds/contact/'))).toBe(true);
    expect(ids.some((id) => id.startsWith('/ds/declarant'))).toBe(false);
  });

  it('lists the editable fields of each block in catalog order', () => {
    const address = layout.find((section) => section.blockId === '/ds/organisme/adresse');
    expect(address?.fields.map(({ field }) => field.name)).toEqual([
      'type',
      'typeVoie',
      'numero',
      'complementNumero',
      'nomVoie',
      'batiment',
      'codePostal',
      'ville',
      'pays',
      'tel',
      'fax',
      'courriel',
    ]);
  });

  it('shows the attribute of a scalar field under its owner, not among the block fields', () => {
    const address = layout.find((section) => section.blockId === '/ds/organisme/adresse');
    const country = address?.fields.find(({ field }) => field.name === 'pays');
    expect(country?.attributes.map(({ field }) => field.id)).toEqual(['/ds/organisme/adresse/pays/@type']);
    expect(listSettingsFieldIds(layout).filter((id) => id === '/ds/organisme/adresse/pays/@type')).toHaveLength(1);
    expect(address?.fields.map(({ field }) => field.id)).not.toContain('/ds/organisme/adresse/pays/@type');
  });

  it('marks the fields TRACFIN expects (catalog min >= 1) without otherwise changing them', () => {
    const expected = (id: string) =>
      layout.flatMap((section) => section.fields).find(({ field }) => field.id === id)?.expectedByTracfin;
    expect(expected('/ds/organisme/libelle')).toBe(true);
    expect(expected('/ds/organisme/adresse/ville')).toBe(true);
    expect(expected('/ds/organisme/adresse/fax')).toBe(false);
    expect(expected('/ds/contact/coordonnees/autrenumero')).toBe(false);
  });

  it('carries the code list of a coded field and its enumeration attribute', () => {
    const profession = layout[0]?.fields.find(({ field }) => field.name === 'profession');
    expect(Array.isArray(profession?.codes)).toBe(true);
    const country = layout[1]?.fields.find(({ field }) => field.name === 'pays');
    expect(country?.attributes[0]?.codes).toEqual([
      { value: 'code', label: 'code' },
      { value: 'other', label: 'other' },
    ]);
    expect(layout[0]?.fields.find(({ field }) => field.name === 'libelle')?.codes).toBeNull();
  });

  it('only offers singleton fields', () => {
    const profile = {
      ...catalogProfileFixture,
      hash: 'multiple',
      fields: {
        ...catalogProfileFixture.fields,
        '/ds/organisme/adresse/tel': {
          ...catalogProfileFixture.fields['/ds/organisme/adresse/tel']!,
          max: 'unbounded',
        },
        '/ds/organisme/adresse/fax': { ...catalogProfileFixture.fields['/ds/organisme/adresse/fax']!, max: '2' },
      },
    };
    const ids = listSettingsFieldIds(getTracfinSettingsLayout(createTracfinCatalogIndex(profile)));
    expect(ids).not.toContain('/ds/organisme/adresse/tel');
    expect(ids).not.toContain('/ds/organisme/adresse/fax');
    expect(ids).toContain('/ds/organisme/adresse/ville');
  });

  it('hides calculated fields', () => {
    const profile = {
      ...catalogProfileFixture,
      hash: 'calculated',
      fields: {
        ...catalogProfileFixture.fields,
        '/ds/organisme/libelle': {
          ...catalogProfileFixture.fields['/ds/organisme/libelle']!,
          coverage: 'calculated' as const,
        },
      },
    };
    expect(listSettingsFieldIds(getTracfinSettingsLayout(createTracfinCatalogIndex(profile)))).not.toContain(
      '/ds/organisme/libelle',
    );
  });
});
