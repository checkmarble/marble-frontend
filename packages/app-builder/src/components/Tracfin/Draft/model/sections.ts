export const tracfinSectionIds = ['declaration', 'context', 'persons', 'operations', 'pieces', 'review'] as const;

export type TracfinSectionId = (typeof tracfinSectionIds)[number];

export const DEFAULT_TRACFIN_SECTION: TracfinSectionId = 'declaration';

export function isTracfinSectionId(value: unknown): value is TracfinSectionId {
  return typeof value === 'string' && (tracfinSectionIds as readonly string[]).includes(value);
}

/**
 * The part of the catalog a section edits: whole blocks under the root, and fields of the root
 * itself (`/ds/analyse`). It drives the « attendus manquants » count of the navigation.
 */
export type TracfinSectionScope = {
  blocks: readonly string[];
  rootFields?: readonly string[];
};

export const tracfinSectionScopes: Record<TracfinSectionId, TracfinSectionScope | null> = {
  declaration: { blocks: ['/ds/organisme', '/ds/declarant', '/ds/contact'] },
  context: { blocks: ['/ds/context'], rootFields: ['/ds/analyse'] },
  persons: { blocks: ['/ds/personnes'] },
  operations: { blocks: ['/ds/operations'] },
  pieces: { blocks: ['/ds/pieceJointe'] },
  review: null,
};

/** The section that owns a catalog id (block or field), or `null` for ids no section edits. */
export function sectionOfCatalogId(catalogId: string): TracfinSectionId | null {
  for (const id of tracfinSectionIds) {
    const scope = tracfinSectionScopes[id];
    if (!scope) continue;
    const owns = (prefix: string) => catalogId === prefix || catalogId.startsWith(`${prefix}/`);
    if (scope.blocks.some(owns) || scope.rootFields?.some(owns)) return id;
  }
  return null;
}
