import type { CaseFile } from '@app-builder/models/cases';
import {
  isCanonicalUuid,
  TRACFIN_MAX_PIECES,
  type TracfinBlock,
  type TracfinDiagnostic,
  type TracfinDraft,
} from '@app-builder/models/tracfin';
import { childrenOfCatalogId } from '../model/block-address';
import type { StructuralOp } from '../model/build-patch';
import { declaredPieces, firstText, personContaining, walkBlocks } from '../persons/document';
import type { PersonKind } from '../persons/person-kinds';
import { PIECE_CATALOG_ID } from '../persons/person-kinds';
import { topLevelAddress } from '../sections/section-addresses';

export { PIECE_CATALOG_ID };

/** The container of the pieces (`/ds/pieceJointe`, optional, at most one under the root). */
export const PIECES_CONTAINER_ID = '/ds/pieceJointe';

const PIECE = PIECE_CATALOG_ID;
export const PIECE_IDENTITY_CATALOG_ID = `${PIECE}/infoPieceIdentite`;
export const PIECE_TYPE_FIELD_ID = `${PIECE}/type`;

/** Diagnostics the export writes for a piece whose file left the case or changed (backend `Export`, layer `references`). */
export const ATTACHMENT_MISSING_CODE = 'ATTACHMENT_MISSING';
export const ATTACHMENT_CHANGED_CODE = 'ATTACHMENT_CHANGED';

/** Types of document that require the identity details block (backend `validateBusinessRules`: TA2, TA3, TA5). */
const IDENTITY_DOCUMENT_TYPES: ReadonlySet<string> = new Set(['TA2', 'TA3', 'TA5']);

// ---- capacity ------------------------------------------------------------------------------------

export type PieceCapacity = {
  count: number;
  max: number;
  /** Pieces that can still be added: never negative. */
  remaining: number;
  full: boolean;
  /** The draft holds more pieces than the maximum (none is ever dropped). */
  overMaximum: boolean;
};

/**
 * The room left for pieces. The maximum is the catalog's (`/ds/pieceJointe/piece` max 15; the 16th
 * `add_block` is a 400 « block cardinality exceeded »): enforced here first, so that the analyst gets a
 * message and no request is sent.
 */
export function pieceCapacity(count: number, max: number = TRACFIN_MAX_PIECES): PieceCapacity {
  return { count, max, remaining: Math.max(0, max - count), full: count >= max, overMaximum: count > max };
}

// ---- display -------------------------------------------------------------------------------------

/** What the piece is called: its label, else its name; `null` when it has neither (the screen says « Pièce n° i »). */
export function pieceDisplayName(piece: TracfinBlock): string | null {
  return firstText(piece, `${PIECE}/libelle`) ?? firstText(piece, `${PIECE}/nom`);
}

const BINARY_UNITS = ['B', 'KiB', 'MiB', 'GiB'] as const;
export type FileSizeUnit = (typeof BINARY_UNITS)[number];

/** A size in bytes as a number and a binary unit (`1536` -> `1.5 KiB`); the value has at most one decimal. */
export function fileSizeParts(bytes: number): { value: number; unit: FileSizeUnit } {
  let value = Math.max(0, bytes);
  let index = 0;
  while (value >= 1024 && index < BINARY_UNITS.length - 1) {
    value /= 1024;
    index += 1;
  }
  return { value: index === 0 ? value : Math.round(value * 10) / 10, unit: BINARY_UNITS[index]! };
}

/** The start of a SHA-256, enough to recognise it; the whole hash stays available as a tooltip. */
export function shortHash(sha256: string, length = 12): string {
  return sha256.slice(0, length);
}

// ---- files ---------------------------------------------------------------------------------------

/** The case files already taken as a piece: file id -> position (1-based) and block of the piece. */
export function addedFiles(root: TracfinBlock): Map<string, { block: TracfinBlock; position: number }> {
  const added = new Map<string, { block: TracfinBlock; position: number }>();
  declaredPieces(root).forEach((block, index) => {
    const fileId = block.attachment?.source_file_id;
    if (fileId && !added.has(fileId)) added.set(fileId, { block, position: index + 1 });
  });
  return added;
}

export type AddPieceRefusal = 'capacity' | 'already_added' | 'invalid_file_id';

export type AddPiecePlan = { ok: true; ops: StructuralOp[] } | { ok: false; reason: AddPieceRefusal };

/**
 * The structural change that takes a case file as a piece: ONE `add_block` of `/ds/pieceJointe/piece`
 * under the container with `source_file_id` set to the file id exactly as the case listing gave it. When
 * the container does not exist yet it is created in the same PATCH (the editor gives both a temporary
 * alias). Refused before any request: the 16th piece (the server would answer 400), a file already
 * taken, and an id that is not in the canonical form the server compares byte for byte.
 */
export function planAddPiece({ draft, fileId }: { draft: TracfinDraft; fileId: string }): AddPiecePlan {
  const root = draft.document.root;
  if (!isCanonicalUuid(fileId)) return { ok: false, reason: 'invalid_file_id' };
  if (addedFiles(root).has(fileId)) return { ok: false, reason: 'already_added' };
  if (pieceCapacity(declaredPieces(root).length).full) return { ok: false, reason: 'capacity' };
  return {
    ok: true,
    ops: [
      {
        type: 'add_block',
        parent: topLevelAddress(draft, PIECES_CONTAINER_ID),
        catalogId: PIECE,
        sourceFileId: fileId,
      },
    ],
  };
}

// ---- who uses a piece ----------------------------------------------------------------------------

export type PieceUsage = {
  /** The block that holds the reference (a civil status, a financial section...). */
  holderBlockId: string;
  holderCatalogId: string;
  fieldId: string;
  /** The declared person the holder belongs to; `null` for a holder outside the persons. */
  person: { block: TracfinBlock; kind: PersonKind } | null;
};

/**
 * Every reference to the piece in the document (`idPieceJointe` and `idPieceJointeDonneesConnexion`
 * fields, which hold `reference.block_id`), with the declared person it sits under. Computed, never
 * stored: removing the reference elsewhere changes the answer.
 */
export function piecesReferencing(root: TracfinBlock, pieceId: string): PieceUsage[] {
  const usages: PieceUsage[] = [];
  walkBlocks(root, (block) => {
    for (const [fieldId, values] of Object.entries(block.fields ?? {})) {
      for (const value of values) {
        if (value.kind !== 'reference' || value.reference?.block_id !== pieceId) continue;
        usages.push({
          holderBlockId: block.id,
          holderCatalogId: block.catalog_id,
          fieldId,
          person: personContaining(root, block.id),
        });
      }
    }
  });
  return usages;
}

/** The usages of a piece grouped by declared person, in document order; usages outside any person come last. */
export function groupUsagesByPerson(usages: readonly PieceUsage[]): {
  person: PieceUsage['person'];
  usages: PieceUsage[];
}[] {
  const groups: { key: string; person: PieceUsage['person']; usages: PieceUsage[] }[] = [];
  for (const usage of usages) {
    const key = usage.person?.block.id ?? '';
    const group = groups.find((entry) => entry.key === key);
    if (group) group.usages.push(usage);
    else groups.push({ key, person: usage.person, usages: [usage] });
  }
  return groups.map(({ person, usages: list }) => ({ person, usages: list }));
}

// ---- file issues ---------------------------------------------------------------------------------

/**
 * Why the file of a piece cannot go into the export:
 * - `no_file`: the piece holds no case file at all (the export omits it: ATTACHMENT_MISSING);
 * - `missing`: the case file is gone;
 * - `changed`: its location or its bytes changed since it was taken.
 * The resolution is always the same: remove the piece and add the file again, then re-enter the
 * metadata and the references to it (a new piece is a new block).
 */
export type PieceFileIssueKind = 'no_file' | 'missing' | 'changed';

/** Where the evidence comes from: the export report of the server, or the files the case lists now. */
export type PieceIssueEvidence = 'export' | 'case_files';

export type PieceFileIssue = { kind: PieceFileIssueKind; evidence: PieceIssueEvidence[] };

const isAttachmentDiagnostic = (diagnostic: TracfinDiagnostic) =>
  diagnostic.code === ATTACHMENT_MISSING_CODE || diagnostic.code === ATTACHMENT_CHANGED_CODE;

/**
 * The attachment diagnostics located on a piece, from the draft's own diagnostics and from the report of
 * the last export. The backend produces them only at export time (it has to read the blobs), so they
 * describe the files as they were then.
 */
export function attachmentDiagnosticsOf(
  pieceId: string,
  sources: { fromDraft: readonly TracfinDiagnostic[]; fromLastExport: readonly TracfinDiagnostic[] },
): { diagnostic: TracfinDiagnostic; evidence: PieceIssueEvidence }[] {
  const located = (diagnostic: TracfinDiagnostic) =>
    isAttachmentDiagnostic(diagnostic) && diagnostic.field?.block_id === pieceId;
  return [
    ...sources.fromDraft.filter(located).map((diagnostic) => ({ diagnostic, evidence: 'export' as const })),
    ...sources.fromLastExport.filter(located).map((diagnostic) => ({ diagnostic, evidence: 'export' as const })),
  ];
}

/**
 * The problems of a piece's file. `files` is the case listing (`null` when it is not available: nothing is
 * then said about a file that may well be there). `diagnostics` are the attachment diagnostics located
 * on the piece. Several problems can hold at once; each appears once.
 */
export function pieceFileIssues({
  piece,
  files,
  diagnostics,
}: {
  piece: TracfinBlock;
  files: readonly Pick<CaseFile, 'id'>[] | null;
  diagnostics: readonly { diagnostic: TracfinDiagnostic; evidence: PieceIssueEvidence }[];
}): PieceFileIssue[] {
  const issues = new Map<PieceFileIssueKind, Set<PieceIssueEvidence>>();
  const note = (kind: PieceFileIssueKind, evidence: PieceIssueEvidence) => {
    const set = issues.get(kind) ?? new Set<PieceIssueEvidence>();
    set.add(evidence);
    issues.set(kind, set);
  };

  const fileId = piece.attachment?.source_file_id;
  if (!fileId) note('no_file', 'export');
  else if (files && !files.some((file) => file.id === fileId)) note('missing', 'case_files');
  for (const { diagnostic, evidence } of diagnostics) {
    note(diagnostic.code === ATTACHMENT_CHANGED_CODE ? 'changed' : 'missing', evidence);
  }
  return [...issues].map(([kind, evidence]) => ({ kind, evidence: [...evidence] }));
}

// ---- identity details ----------------------------------------------------------------------------

/**
 * True when the type of document is an identity document (TA2, TA3, TA5) and the identity details
 * block is still absent: the business check of the server will ask for it. An indication only.
 */
export function identityDetailsExpected(piece: TracfinBlock): boolean {
  const typeCode = firstText(piece, PIECE_TYPE_FIELD_ID);
  if (!typeCode || !IDENTITY_DOCUMENT_TYPES.has(typeCode)) return false;
  return childrenOfCatalogId(piece, PIECE_IDENTITY_CATALOG_ID).length === 0;
}
