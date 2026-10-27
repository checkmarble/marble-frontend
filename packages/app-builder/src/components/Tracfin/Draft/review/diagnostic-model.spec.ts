import type { TracfinBlock, TracfinDiagnostic } from '@app-builder/models/tracfin';
import { describe, expect, it } from 'vitest';
import { cloneDraft } from '../test-utils/draft-test-data';
import {
  diagnosticTarget,
  groupDiagnostics,
  isReviewDiagnosticCode,
  refusalTarget,
  unitOfBlock,
} from './diagnostic-model';

const ORGANISME = '115b9983-7211-5d7d-b415-a203798fc8c8';
const ADDRESS = '2ef53e64-ad05-50d2-bda5-69853b21efc3';
const GENERAL = '7614c618-84a3-515e-a8f3-b817576b523c';
const PP = '094a7dd8-6c3c-5e8a-bc17-54a3dd48d229';
const CIVIL = 'd6506c9b-94ef-5e7e-b9cd-7311e6587dcb';

const root = (): TracfinBlock => cloneDraft().document.root;

const diagnostic = (
  code: string,
  field: TracfinDiagnostic['field'],
  extra: Partial<TracfinDiagnostic> = {},
): TracfinDiagnostic => ({ code, layer: 'business', severity: 'error', message: `server ${code}`, field, ...extra });

describe('REVIEW_DIAGNOSTIC_CODES', () => {
  it('has a text for every code the brief names', () => {
    for (const code of [
      'XML_FORBIDDEN_CHARACTER',
      'DANGLING_REFERENCE_NOT_EXPORTED',
      'INACTIVE_BRANCH_DATA_NOT_EXPORTED',
      'UNRESOLVED_ALTERNATIVE_NOT_EXPORTED',
      'ATTACHMENT_MISSING',
      'CODE_CATALOG_UNAVAILABLE',
      'CONFIGURATION_UNAVAILABLE',
    ]) {
      expect(isReviewDiagnosticCode(code)).toBe(true);
    }
    expect(isReviewDiagnosticCode('SOMETHING_NEW')).toBe(false);
  });
});

describe('diagnosticTarget', () => {
  it('addresses block, field, value and parent value, and finds the section from the block', () => {
    expect(
      diagnosticTarget(
        diagnostic('INVALID_DATE', {
          block_id: ADDRESS,
          field_id: '/ds/organisme/adresse/pays/@type',
          value_id: 'v1',
          parent_value_id: 'p1',
        }),
        root(),
      ),
    ).toEqual({
      section: 'declaration',
      blockId: ADDRESS,
      fieldId: '/ds/organisme/adresse/pays/@type',
      valueId: 'v1',
      parentValueId: 'p1',
    });
    expect(
      diagnosticTarget(
        diagnostic('MISSING_REQUIRED_VALUE', { block_id: CIVIL, field_id: '/ds/personnes/pp/etatCivil/prenom' }),
        root(),
      ),
    ).toMatchObject({
      section: 'persons',
      blockId: CIVIL,
      valueId: null,
      parentValueId: null,
    });
    expect(
      diagnosticTarget(
        diagnostic('MISSING_REQUIRED_VALUE', { block_id: GENERAL, field_id: '/ds/context/general/refInterne' }),
        root(),
      )?.section,
    ).toBe('context');
  });

  it('puts the root analysis in the context section even though the root block belongs to none', () => {
    expect(
      diagnosticTarget(diagnostic('VALUE_TOO_LONG', { block_id: root().id, field_id: '/ds/analyse' }), root()),
    ).toMatchObject({ section: 'context', blockId: root().id, fieldId: '/ds/analyse' });
  });

  it('is null for a diagnostic without location (the zero field the server serialises) or in no section', () => {
    expect(diagnosticTarget(diagnostic('INCOMPATIBLE_PROFILE', { block_id: '', field_id: '' }), root())).toBeNull();
    expect(diagnosticTarget(diagnostic('CONFIGURATION_UNAVAILABLE', undefined), root())).toBeNull();
  });

  it('opens the section of a block that no longer exists, without pretending to reach it', () => {
    expect(
      diagnosticTarget(
        diagnostic('ATTACHMENT_MISSING', { block_id: 'gone', field_id: '/ds/pieceJointe/piece' }),
        root(),
      ),
    ).toEqual({
      section: 'pieces',
      blockId: null,
      fieldId: '/ds/pieceJointe/piece',
      valueId: null,
      parentValueId: null,
    });
  });

  it('routes the attachment codes to the pieces section through the piece block', () => {
    const tree = root();
    tree.children = [
      ...(tree.children ?? []),
      {
        id: 'pieces',
        catalog_id: '/ds/pieceJointe',
        children: [{ id: 'piece-1', catalog_id: '/ds/pieceJointe/piece' }],
      },
    ];
    expect(
      diagnosticTarget(
        diagnostic('ATTACHMENT_CHANGED', { block_id: 'piece-1', field_id: '/ds/pieceJointe/piece' }),
        tree,
      ),
    ).toMatchObject({ section: 'pieces', blockId: 'piece-1' });
  });
});

describe('refusalTarget', () => {
  it('links a refused export to the field it names, occurrence included', () => {
    expect(refusalTarget({ blockId: ORGANISME, fieldId: '/ds/organisme/libelle', valueId: 'v9' }, root())).toEqual({
      section: 'declaration',
      blockId: ORGANISME,
      fieldId: '/ds/organisme/libelle',
      valueId: 'v9',
      parentValueId: null,
    });
  });
});

describe('unitOfBlock', () => {
  it('names the person, the piece or the operation a block belongs to', () => {
    const tree = root();
    expect(unitOfBlock(tree, CIVIL)).toMatchObject({ kind: 'person', personKind: 'pp' });
    expect(unitOfBlock(tree, PP)).toMatchObject({ kind: 'person' });
    expect(unitOfBlock(tree, ORGANISME)).toBeNull();
    tree.children = [
      ...(tree.children ?? []),
      {
        id: 'ops',
        catalog_id: '/ds/operations',
        children: [
          { id: 'op-1', catalog_id: '/ds/operations/operation' },
          {
            id: 'op-2',
            catalog_id: '/ds/operations/operation',
            children: [{ id: 'op-2-sub', catalog_id: '/ds/operations/operation/x' }],
          },
          { id: 'cur-1', catalog_id: '/ds/operations/operationEnCours' },
        ],
      },
    ];
    expect(unitOfBlock(tree, 'op-2-sub')).toEqual({ kind: 'operation', position: 2, ongoing: false });
    expect(unitOfBlock(tree, 'cur-1')).toEqual({ kind: 'operation', position: 1, ongoing: true });
  });
});

describe('groupDiagnostics', () => {
  it('groups by section in navigation order, then by block in document order, errors first', () => {
    const groups = groupDiagnostics({
      root: root(),
      diagnostics: [
        diagnostic('MISSING_REQUIRED_VALUE', { block_id: CIVIL, field_id: '/ds/personnes/pp/etatCivil/prenom' }),
        diagnostic(
          'UNKNOWN_CODE',
          { block_id: ADDRESS, field_id: '/ds/organisme/adresse/pays' },
          { severity: 'warning' },
        ),
        diagnostic('INVALID_DATE', { block_id: ORGANISME, field_id: '/ds/organisme/libelle' }),
        diagnostic('MISSING_REQUIRED_VALUE', { block_id: ADDRESS, field_id: '/ds/organisme/adresse/ville' }),
        diagnostic('CONFIGURATION_UNAVAILABLE', undefined, { layer: 'sources', severity: 'warning' }),
      ],
    });
    expect(groups.sections.map((entry) => entry.section)).toEqual(['declaration', 'persons']);
    const declaration = groups.sections[0]!;
    // Organisme precedes its address in the document.
    expect(declaration.blocks.map((block) => block.blockId)).toEqual([ORGANISME, ADDRESS]);
    // Within a block the error precedes the warning.
    expect(declaration.blocks[1]!.items.map((item) => item.diagnostic.code)).toEqual([
      'MISSING_REQUIRED_VALUE',
      'UNKNOWN_CODE',
    ]);
    expect(groups.general.map((item) => item.diagnostic.code)).toEqual(['CONFIGURATION_UNAVAILABLE']);
    expect(groups.counts).toEqual({ errors: 3, warnings: 2 });
  });

  it('keeps a diagnostic with a target navigable and one without a plain entry', () => {
    const groups = groupDiagnostics({
      root: root(),
      diagnostics: [
        diagnostic('XML_FORBIDDEN_CHARACTER', {
          block_id: ORGANISME,
          field_id: '/ds/organisme/libelle',
          value_id: 'v1',
        }),
        diagnostic('INCOMPATIBLE_PROFILE', { block_id: '', field_id: '' }),
      ],
    });
    expect(groups.sections[0]!.blocks[0]!.items[0]!.target).toMatchObject({ valueId: 'v1' });
    expect(groups.general[0]!.target).toBeNull();
  });

  it('lists the same diagnostic once when the validation and the draft both report it', () => {
    const same = diagnostic('MISSING_REQUIRED_VALUE', { block_id: ORGANISME, field_id: '/ds/organisme/libelle' });
    const groups = groupDiagnostics({ root: root(), diagnostics: [same, { ...same, message: 'again' }] });
    expect(groups.sections[0]!.blocks[0]!.items).toHaveLength(1);
    expect(groups.counts.errors).toBe(1);
  });

  it('separates two occurrences of the same field', () => {
    const groups = groupDiagnostics({
      root: root(),
      diagnostics: [
        diagnostic('INVALID_DATE', { block_id: ORGANISME, field_id: '/ds/organisme/libelle', value_id: 'a' }),
        diagnostic('INVALID_DATE', { block_id: ORGANISME, field_id: '/ds/organisme/libelle', value_id: 'b' }),
      ],
    });
    expect(groups.sections[0]!.blocks[0]!.items).toHaveLength(2);
  });

  it('carries the stale flag through to the entries', () => {
    const groups = groupDiagnostics({
      root: root(),
      diagnostics: [
        { ...diagnostic('INVALID_DATE', { block_id: ORGANISME, field_id: '/ds/organisme/libelle' }), stale: true },
      ],
    });
    expect(groups.sections[0]!.blocks[0]!.items[0]!.diagnostic.stale).toBe(true);
  });
});
