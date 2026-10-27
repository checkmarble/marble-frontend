import type { TracfinDiagnostic } from '@app-builder/models/tracfin';
import { createContext, useContext } from 'react';
import { useTracfinDraftEditorContext } from '../editor/TracfinDraftEditorContext';

/** A diagnostic as a block shows it: `stale` when the revision it was computed on is behind the draft's. */
export type BlockDiagnostic = TracfinDiagnostic & { stale?: boolean };

/**
 * Diagnostics a block should show beyond those of `draft.diagnostics`: the prefill result, kept by
 * the prefill store (`prefill/TracfinPrefillContext`), which flags them `stale` once the draft has
 * moved past the revision they were computed on. Blocks read them with {@link useBlockDiagnostics}.
 */
export const TracfinBlockDiagnosticsContext = createContext<readonly BlockDiagnostic[]>([]);

/** Diagnostics located on a block (`field.block_id`), from the draft and from the shared store. */
export function useBlockDiagnostics(blockId: string | null | undefined): BlockDiagnostic[] {
  const { draft } = useTracfinDraftEditorContext();
  const shared = useContext(TracfinBlockDiagnosticsContext);
  if (!blockId) return [];
  return [...(draft.diagnostics ?? []), ...shared].filter((diagnostic) => diagnostic.field?.block_id === blockId);
}
