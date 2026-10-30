import { describe, expect, it } from 'vitest';
import { isTracfinSectionId, sectionOfCatalogId, tracfinSectionIds } from './sections';

describe('sections', () => {
  it('knows the six sections and rejects anything else (an unknown URL value falls back)', () => {
    expect(tracfinSectionIds).toEqual(['declaration', 'context', 'persons', 'operations', 'pieces', 'review']);
    expect(isTracfinSectionId('persons')).toBe(true);
    expect(isTracfinSectionId('nope')).toBe(false);
    expect(isTracfinSectionId(undefined)).toBe(false);
  });

  it('places a catalog id in the section that edits it', () => {
    expect(sectionOfCatalogId('/ds/organisme/adresse/ville')).toBe('declaration');
    expect(sectionOfCatalogId('/ds/contact')).toBe('declaration');
    expect(sectionOfCatalogId('/ds/context/general/refInterne')).toBe('context');
    expect(sectionOfCatalogId('/ds/analyse')).toBe('context');
    expect(sectionOfCatalogId('/ds/personnes/pp')).toBe('persons');
    expect(sectionOfCatalogId('/ds/operations/montantTotal')).toBe('operations');
    expect(sectionOfCatalogId('/ds/pieceJointe/piece')).toBe('pieces');
    expect(sectionOfCatalogId('/ds/personnesX')).toBeNull();
  });
});
