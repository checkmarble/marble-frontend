import type { TracfinBlock, TracfinCatalog, TracfinCatalogField, TracfinDraft } from '@app-builder/models/tracfin';
import { tracfinCatalogFixture, tracfinDraftFixture } from '@app-builder/models/tracfin/__fixtures__';
import { getTracfinCatalogIndex } from '@app-builder/models/tracfin/catalog-index';

let order = 100;
function entry(
  id: string,
  parent: string,
  kind: 'block' | 'field',
  min: string,
  max: string,
  extra: Partial<TracfinCatalogField> = {},
): TracfinCatalogField {
  return {
    id,
    parent,
    name: id.split('/').pop() ?? id,
    xsd_type: 'inline',
    source_line: 1,
    order: order++,
    kind,
    min,
    max,
    attribute: false,
    coverage: kind === 'block' ? 'structural' : 'editable',
    model: kind === 'block' ? 'TracfinBlock' : 'TracfinValue',
    value_kind: 'text',
    base: '',
    documentation: '',
    type_documentation: '',
    constraints: [],
    catalogs: [],
    ...extra,
  };
}

const maxLength = (value: number) => ({ kind: 'maxLength', value: String(value), source_line: 1 });

const extra: TracfinCatalogField[] = [
  entry('/ds/analyse', '/ds', 'field', '1', '1', { constraints: [maxLength(23000)] }),
  entry('/ds/context', '/ds', 'block', '1', '1'),
  entry('/ds/context/general', '/ds/context', 'block', '1', '1'),
  entry('/ds/context/general/refInterne', '/ds/context/general', 'field', '1', '1', { constraints: [maxLength(50)] }),
  entry('/ds/context/general/estPrecisionSignalement', '/ds/context/general', 'field', '1', '1', {
    value_kind: 'boolean',
  }),
  entry('/ds/context/general/precisionSignalement', '/ds/context/general', 'field', '0', '1', {
    constraints: [maxLength(700)],
  }),
  entry('/ds/context/natureSoupcon', '/ds/context', 'block', '1', '1'),
  entry('/ds/context/natureSoupcon/cadreLegal', '/ds/context/natureSoupcon', 'field', '1', '5', {
    catalogs: ['naturessoupcons.csv'],
  }),
  entry('/ds/personnes/pm/id', '/ds/personnes/pm', 'field', '1', '1', { coverage: 'calculated' }),
  entry('/ds/personnes/pm/implication', '/ds/personnes/pm', 'field', '1', '1', { constraints: [maxLength(64)] }),
  entry('/ds/personnes/pm/natureRelation', '/ds/personnes/pm', 'field', '0', '1', { constraints: [maxLength(50)] }),
  entry('/ds/personnes/pnc', '/ds/personnes', 'block', '0', '30'),
  entry('/ds/personnes/pnc/id', '/ds/personnes/pnc', 'field', '1', '1', { coverage: 'calculated' }),
  entry('/ds/personnes/pnc/implication', '/ds/personnes/pnc', 'field', '0', '1', { constraints: [maxLength(64)] }),
  entry('/ds/personnes/pnc/elementsIdentification', '/ds/personnes/pnc', 'field', '0', '1', {
    constraints: [maxLength(700)],
  }),
];

/**
 * The fixture catalog (cut from the real manifest) plus a few nodes copied from it that the cut
 * lacks: the context, the analysis and the fields of a legal entity / non-customer person. A distinct
 * hash keeps its index apart from the plain fixture's.
 */
export const draftTestCatalog: TracfinCatalog = {
  ...tracfinCatalogFixture,
  profile: {
    ...tracfinCatalogFixture.profile,
    hash: 'draft-test-profile',
    fields: {
      ...tracfinCatalogFixture.profile.fields,
      ...Object.fromEntries(extra.map((field) => [field.id, field])),
    },
    codes: {
      ...tracfinCatalogFixture.profile.codes,
      'naturessoupcons.csv': [
        { value: 'CL01', label: 'Soupçon de blanchiment' },
        { value: 'CL02', label: 'Soupçon de financement du terrorisme' },
      ],
    },
  },
};

export const draftTestIndex = getTracfinCatalogIndex(draftTestCatalog.profile);

export function cloneDraft(draft: TracfinDraft = tracfinDraftFixture): TracfinDraft {
  return structuredClone(draft);
}

function dropChild(block: TracfinBlock, catalogId: string): void {
  block.children = (block.children ?? []).filter((child) => child.catalog_id !== catalogId);
  for (const child of block.children) dropChild(child, catalogId);
}

/** The fixture draft without the blocks of the given catalog ids (a draft starts without most of them). */
export function draftWithout(...catalogIds: string[]): TracfinDraft {
  const draft = cloneDraft();
  for (const id of catalogIds) dropChild(draft.document.root, id);
  return draft;
}

export function findByCatalogId(block: TracfinBlock, catalogId: string): TracfinBlock | undefined {
  if (block.catalog_id === catalogId) return block;
  for (const child of block.children ?? []) {
    const found = findByCatalogId(child, catalogId);
    if (found) return found;
  }
  return undefined;
}
