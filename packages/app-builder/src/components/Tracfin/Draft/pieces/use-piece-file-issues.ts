import type { TracfinBlock } from '@app-builder/models/tracfin';
import { useTracfinDraftEditorContext } from '../editor/TracfinDraftEditorContext';
import { useBlockDiagnostics } from '../fields/block-diagnostics';
import { useTracfinCaseFiles } from './case-files-context';
import { attachmentDiagnosticsOf, type PieceFileIssue, pieceFileIssues } from './pieces-model';

/**
 * The problems of the file of a piece: the attachment diagnostics located on it (the draft's own, the
 * shared store's, and the report of the last export, where the server writes them) and what the case
 * listing says now (a file that is no longer listed).
 */
export function usePieceFileIssues(piece: TracfinBlock): {
  issues: PieceFileIssue[];
  /** Revision of the export whose report named the piece, when there is one. */
  exportRevision: number | null;
} {
  const { draft } = useTracfinDraftEditorContext();
  const caseFiles = useTracfinCaseFiles();
  const located = useBlockDiagnostics(piece.id);
  const lastExport = draft.last_export ?? null;
  const diagnostics = attachmentDiagnosticsOf(piece.id, {
    fromDraft: located,
    fromLastExport: lastExport?.validation?.diagnostics ?? [],
  });
  return {
    issues: pieceFileIssues({ piece, files: caseFiles?.files ?? null, diagnostics }),
    exportRevision: lastExport?.draft_revision ?? null,
  };
}
