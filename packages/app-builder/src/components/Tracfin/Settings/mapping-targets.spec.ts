import { tracfinConfigurationFixture } from '@app-builder/models/tracfin/__fixtures__';
import { catalogProfileFixture } from '@app-builder/models/tracfin/__fixtures__/catalog.fixture';
import { getTracfinCatalogIndex } from '@app-builder/models/tracfin/catalog-index';
import { describe, expect, it } from 'vitest';
import { groupMappingsByTargetBlock, listMappingTargetFields } from './mapping-targets';

const index = getTracfinCatalogIndex(catalogProfileFixture);

describe('listMappingTargetFields', () => {
  const ids = listMappingTargetFields(index).map((field) => field.id);

  it('lists editable fields only: no block, no calculated, no excluded node', () => {
    expect(ids).toContain('/ds/personnes/pp/etatCivil/prenom');
    expect(ids).toContain(
      '/ds/personnes/pp/referencesFinancieres/referenceFinanciereNumeroCarteBancaire/@numeroCarteBancaire',
    );
    expect(ids).not.toContain('/ds/personnes/pp');
    expect(ids).not.toContain('/ds/pieceJointe/piece/contenu');
    expect(ids).not.toContain('/ds/personnes/pp/referencesFinancieres/referenceFinanciereNumeroCarteBancaire/@id');
    expect(ids.some((id) => id.startsWith('/ds/operationstdf'))).toBe(false);
  });

  it('is in document order, not in the order among siblings', () => {
    const positions = listMappingTargetFields(index).map((field) =>
      catalogProfileFixture.ordered_fields.indexOf(field.id),
    );
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });
});

describe('groupMappingsByTargetBlock', () => {
  it('groups by the block that owns the target field, in catalog order, unknown targets last', () => {
    const [first, ...rest] = tracfinConfigurationFixture.mappings ?? [];
    const unknown = { ...first!, id: 'unknown', target_field: '/ds/not/in/the/catalog' };
    const groups = groupMappingsByTargetBlock([unknown, first!, ...rest], index);

    expect(groups.at(-1)).toEqual({ blockId: null, mappings: [unknown] });
    const blocks = groups.map((group) => group.blockId);
    expect(blocks.slice(0, -1)).toEqual([
      '/ds/personnes/pp/etatCivil',
      '/ds/personnes/pp/activite',
      '/ds/personnes/pp/referencesFinancieres/referenceFinanciereNumeroCarteBancaire',
      '/ds/personnes/pp/lienAutrePm',
      '/ds/operations/operation',
    ]);
    // Several mappings may share a target field; they stay together.
    const activity = groups.find((group) => group.blockId === '/ds/personnes/pp/activite');
    expect(activity?.mappings.map((mapping) => mapping.id)).toEqual(['map-employer-name', 'map-user-employer-name']);
  });
});
