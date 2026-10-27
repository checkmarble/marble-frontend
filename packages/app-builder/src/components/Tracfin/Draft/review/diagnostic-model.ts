import type { TracfinBlock, TracfinDiagnostic } from '@app-builder/models/tracfin';
import { findBlock } from '../model/block-address';
import { sectionOfCatalogId, type TracfinSectionId, tracfinSectionIds } from '../model/sections';
import { declaredPieces, pathTo, walkBlocks } from '../persons/document';
import { type PersonKind, personKindOf } from '../persons/person-kinds';
import type { TracfinFocusTarget } from './focus-target';

/** A diagnostic as the review lists it: `stale` once the draft moved past the revision it was computed on. */
export type ReviewDiagnostic = TracfinDiagnostic & { stale?: boolean };

/**
 * The codes of the validation (`usecases/tracfin/validation.go`), of the export report
 * (`tracfin_export_usecase.go`) and of the draft (`CONFIGURATION_UNAVAILABLE`) that have a French text
 * under `draft.review.diagnostics.*`. Anything else falls back to the server's message.
 */
export const REVIEW_DIAGNOSTIC_CODES = [
  'INCOMPATIBLE_PROFILE',
  'MISSING_REQUIRED_VALUE',
  'CARDINALITY_EXCEEDED',
  'INACTIVE_BRANCH_DATA_NOT_EXPORTED',
  'UNRESOLVED_ALTERNATIVE_NOT_EXPORTED',
  'UNRESOLVED_CONFLICT_NOT_EXPORTED',
  'DANGLING_REFERENCE_NOT_EXPORTED',
  'REFERENCE_REQUIRED',
  'XML_FORBIDDEN_CHARACTER',
  'UNKNOWN_CODE',
  'CODE_CATALOG_UNAVAILABLE',
  'INVALID_DATE',
  'INVALID_INTEGER',
  'INVALID_DECIMAL',
  'INVALID_BOOLEAN',
  'INVALID_ENUMERATION',
  'VALUE_TOO_SHORT',
  'VALUE_TOO_LONG',
  'PATTERN_MISMATCH',
  'PATTERN_UNAVAILABLE',
  'TOTAL_DIGITS_EXCEEDED',
  'IDENTITY_PIECE_DETAILS_REQUIRED',
  'FINANCIAL_REFERENCE_LIMIT',
  'OTHER_OPERATION_DESCRIPTION_REQUIRED',
  'ATTACHMENT_MISSING',
  'ATTACHMENT_CHANGED',
  'CONFIGURATION_UNAVAILABLE',
] as const;

export const isReviewDiagnosticCode = (code: string): boolean =>
  (REVIEW_DIAGNOSTIC_CODES as readonly string[]).includes(code);

export const isAttachmentDiagnosticCode = (code: string): boolean =>
  code === 'ATTACHMENT_MISSING' || code === 'ATTACHMENT_CHANGED';

/** `error` or anything else (`warning`): errors come first. */
export const isErrorSeverity = (severity: string): boolean => severity === 'error';

const nonEmpty = (value: string | undefined | null): string | null => (value ? value : null);

/**
 * Where a diagnostic points in the draft. The block comes from `field.block_id` (a diagnostic with no
 * location serialises an empty field); the section from the block's catalog id, else from the field's.
 * `null` when no section edits it: the diagnostic goes to the general group.
 */
export function diagnosticTarget(diagnostic: TracfinDiagnostic, root: TracfinBlock): TracfinFocusTarget | null {
  const ref = diagnostic.field;
  const blockId = nonEmpty(ref?.block_id);
  const fieldId = nonEmpty(ref?.field_id);
  const block = blockId ? findBlock(root, blockId) : null;
  const section =
    (block ? sectionOfCatalogId(block.catalog_id) : null) ?? (fieldId ? sectionOfCatalogId(fieldId) : null);
  if (!section) return null;
  return {
    section,
    // A block that is gone cannot be reached: the section opens, nothing is highlighted.
    blockId: block ? block.id : null,
    fieldId,
    valueId: nonEmpty(ref?.value_id),
    parentValueId: nonEmpty(ref?.parent_value_id),
  };
}

/** The target of a refused export, from the field it names. */
export function refusalTarget(
  refusal: { blockId: string; fieldId: string; valueId: string | null },
  root: TracfinBlock,
): TracfinFocusTarget | null {
  return diagnosticTarget(
    {
      code: 'XML_FORBIDDEN_CHARACTER',
      layer: 'internal_structure',
      severity: 'error',
      message: '',
      field: {
        block_id: refusal.blockId,
        field_id: refusal.fieldId,
        ...(refusal.valueId ? { value_id: refusal.valueId } : {}),
      },
    },
    root,
  );
}

/** The thing a block belongs to, to title its group: « Jean Dupont », « Pièce n° 2 », « Opération n° 1 ». */
export type BlockUnit =
  | { kind: 'person'; block: TracfinBlock; personKind: PersonKind }
  | { kind: 'piece'; position: number }
  | { kind: 'operation'; position: number; ongoing: boolean };

export function unitOfBlock(root: TracfinBlock, blockId: string): BlockUnit | null {
  const path = pathTo(root, blockId);
  for (let index = path.length - 1; index >= 0; index--) {
    const block = path[index]!;
    const personKind = personKindOf(block.catalog_id);
    if (personKind) return { kind: 'person', block, personKind };
    if (block.catalog_id === '/ds/pieceJointe/piece') {
      return { kind: 'piece', position: declaredPieces(root).findIndex((piece) => piece.id === block.id) + 1 };
    }
    const operation =
      block.catalog_id === '/ds/operations/operation'
        ? false
        : block.catalog_id === '/ds/operations/operationEnCours'
          ? true
          : null;
    if (operation !== null) {
      const parent = path[index - 1];
      const siblings = (parent?.children ?? []).filter((child) => child.catalog_id === block.catalog_id);
      return {
        kind: 'operation',
        position: siblings.findIndex((sibling) => sibling.id === block.id) + 1,
        ongoing: operation,
      };
    }
  }
  return null;
}

export type ReviewItem = { diagnostic: ReviewDiagnostic; target: TracfinFocusTarget | null };

export type ReviewBlockGroup = {
  /** The block id, or `catalog:<id>` for a block the document no longer holds. */
  key: string;
  blockId: string | null;
  /** Catalog id of the block (or of the field when the block is gone). */
  catalogId: string | null;
  unit: BlockUnit | null;
  items: ReviewItem[];
};

export type ReviewSectionGroup = { section: TracfinSectionId; blocks: ReviewBlockGroup[] };

export type ReviewGroups = {
  sections: ReviewSectionGroup[];
  /** No block or no section to go to. */
  general: ReviewItem[];
  counts: { errors: number; warnings: number };
};

function diagnosticKey(diagnostic: TracfinDiagnostic): string {
  const ref = diagnostic.field;
  return [
    diagnostic.code,
    diagnostic.layer,
    ref?.block_id ?? '',
    ref?.field_id ?? '',
    ref?.value_id ?? '',
    ref?.parent_value_id ?? '',
  ].join('|');
}

/** Errors before warnings, otherwise the order in which the server reported them. */
const bySeverity = (a: ReviewItem, b: ReviewItem) =>
  Number(isErrorSeverity(b.diagnostic.severity)) - Number(isErrorSeverity(a.diagnostic.severity));

/**
 * Diagnostics by section, then by block (in document order), errors first; those that name no block
 * or no section are the general group. The same diagnostic reported twice (by the validation and by
 * the draft) appears once.
 */
export function groupDiagnostics({
  diagnostics,
  root,
}: {
  diagnostics: readonly ReviewDiagnostic[];
  root: TracfinBlock;
}): ReviewGroups {
  const order = new Map<string, number>();
  walkBlocks(root, (block) => order.set(block.id, order.size));

  const seen = new Set<string>();
  const general: ReviewItem[] = [];
  const bySection = new Map<TracfinSectionId, Map<string, ReviewBlockGroup>>();
  let errors = 0;
  let warnings = 0;

  for (const diagnostic of diagnostics) {
    const key = diagnosticKey(diagnostic);
    if (seen.has(key)) continue;
    seen.add(key);
    if (isErrorSeverity(diagnostic.severity)) errors += 1;
    else warnings += 1;

    const target = diagnosticTarget(diagnostic, root);
    const item: ReviewItem = { diagnostic, target };
    if (!target) {
      general.push(item);
      continue;
    }
    const groups = bySection.get(target.section) ?? new Map<string, ReviewBlockGroup>();
    bySection.set(target.section, groups);
    const groupKey = target.blockId ?? `catalog:${target.fieldId ?? ''}`;
    const group = groups.get(groupKey) ?? {
      key: groupKey,
      blockId: target.blockId,
      catalogId: target.blockId ? (findBlock(root, target.blockId)?.catalog_id ?? null) : target.fieldId,
      unit: target.blockId ? unitOfBlock(root, target.blockId) : null,
      items: [],
    };
    group.items.push(item);
    groups.set(groupKey, group);
  }

  const position = (group: ReviewBlockGroup) => (group.blockId ? (order.get(group.blockId) ?? Infinity) : Infinity);
  return {
    sections: tracfinSectionIds.flatMap((section) => {
      const groups = bySection.get(section);
      if (!groups) return [];
      const blocks = [...groups.values()]
        .map((group) => ({ ...group, items: [...group.items].sort(bySeverity) }))
        .sort((a, b) => position(a) - position(b));
      return [{ section, blocks }];
    }),
    general: [...general].sort(bySeverity),
    counts: { errors, warnings },
  };
}
