import type { TracfinDiagnostic } from '@app-builder/models/tracfin';
import { createContext, useContext } from 'react';
import { useTracfinDraftEditorContext } from '../editor/TracfinDraftEditorContext';

/**
 * Diagnostics a block should show beyond those of `draft.diagnostics`: the prefill result, kept by
 * the prefill panel. A section that holds them provides them here; blocks read them with
 * {@link useBlockDiagnostics}.
 */
export const TracfinBlockDiagnosticsContext = createContext<readonly TracfinDiagnostic[]>([]);

/** Diagnostics located on a block (`field.block_id`), from the draft and from the shared store. */
export function useBlockDiagnostics(blockId: string | null | undefined): TracfinDiagnostic[] {
  const { draft } = useTracfinDraftEditorContext();
  const shared = useContext(TracfinBlockDiagnosticsContext);
  if (!blockId) return [];
  return [...(draft.diagnostics ?? []), ...shared].filter((diagnostic) => diagnostic.field?.block_id === blockId);
}
