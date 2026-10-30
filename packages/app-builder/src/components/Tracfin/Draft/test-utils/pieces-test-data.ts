import type { CaseFile } from '@app-builder/models/cases';
import type { TracfinBlock, TracfinDiagnostic, TracfinDraft } from '@app-builder/models/tracfin';
import { tracfinExportFixture } from '@app-builder/models/tracfin/__fixtures__';
import { block, personsDraft } from './persons-test-data';

export const PIECE = '/ds/pieceJointe/piece';
export const PIECES_CONTAINER = '/ds/pieceJointe';

/** Canonical lowercase UUIDs, as the case listing serves them. */
export const FILE = {
  one: '0a1b2c3d-1111-4111-8111-000000000001',
  two: '0a1b2c3d-2222-4222-8222-000000000002',
  three: '0a1b2c3d-3333-4333-8333-000000000003',
  foreign: '0a1b2c3d-9999-4999-8999-000000000009',
} as const;

export const SHA = `${'ab12'.repeat(16)}`;

export function caseFile(id: string, fileName: string, createdAt = '2026-02-10T09:30:00.000Z'): CaseFile {
  return { id, caseId: 'case-1', fileName, createdAt };
}

export const FILES: CaseFile[] = [
  caseFile(FILE.one, 'passport.pdf'),
  caseFile(FILE.two, 'invoice-march.pdf'),
  caseFile(FILE.foreign, 'stranger.pdf'),
];

/** A piece holding a case file, as the server answers an `add_block` with `source_file_id`. */
export function piece(
  id: string,
  fileId: string | null,
  extra: Partial<TracfinBlock> = {},
  size = 2048,
  sha256 = SHA,
): TracfinBlock {
  return block(PIECE, { ...(fileId ? { attachment: { source_file_id: fileId, sha256, size } } : {}), ...extra }, id);
}

export const piecesDiagnostic = (code: string, blockId: string, message = 'server wording'): TracfinDiagnostic => ({
  code,
  layer: 'references',
  severity: 'error',
  message,
  field: { block_id: blockId, field_id: PIECE },
});

/**
 * The persons draft (pp-1 Jeanne Martin, civil status `civil-1`) with `pieces` under a
 * `/ds/pieceJointe` block (`pieces-1`); with no pieces the draft has no `/ds/pieceJointe` at all.
 */
export function piecesDraft({
  pieces = [],
  diagnostics,
  exportDiagnostics,
  mutate,
}: {
  pieces?: TracfinBlock[];
  diagnostics?: TracfinDraft['diagnostics'];
  /** Diagnostics of the report of the last export. */
  exportDiagnostics?: TracfinDiagnostic[];
  mutate?: (draft: TracfinDraft) => void;
} = {}): TracfinDraft {
  return personsDraft((draft) => {
    if (pieces.length > 0) {
      draft.document.root.children = [
        ...(draft.document.root.children ?? []),
        block(PIECES_CONTAINER, { children: pieces }, 'pieces-1'),
      ];
    }
    if (diagnostics) draft.diagnostics = diagnostics;
    if (exportDiagnostics) {
      draft.last_export = {
        ...structuredClone(tracfinExportFixture),
        draft_revision: draft.revision,
        validation: { ...structuredClone(tracfinExportFixture.validation), diagnostics: exportDiagnostics },
      };
    }
    mutate?.(draft);
  });
}
