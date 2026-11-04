import type { TracfinDraft } from '@app-builder/models/tracfin';
import type { TracfinCatalogIndex } from '@app-builder/models/tracfin/catalog-index';
import { createContext, type ReactNode, useContext } from 'react';
import { type TracfinDraftEditor, useTracfinDraftEditor } from './useTracfinDraftEditor';

const TracfinDraftEditorContext = createContext<TracfinDraftEditor | null>(null);

/**
 * Mounts the editor once for the draft page. Every section reads it with
 * {@link useTracfinDraftEditorContext}: the unsaved edits live here, not in the sections.
 */
export function TracfinDraftEditorProvider({
  caseId,
  draft,
  catalogIndex,
  children,
}: {
  caseId: string;
  draft: TracfinDraft;
  catalogIndex: TracfinCatalogIndex;
  children: ReactNode;
}) {
  const editor = useTracfinDraftEditor(caseId, { draft, catalogIndex });
  return <TracfinDraftEditorContext.Provider value={editor}>{children}</TracfinDraftEditorContext.Provider>;
}

/** The editor of the draft page: `flush()`, `hasPendingChanges`, the draft... Only usable under the provider. */
export function useTracfinDraftEditorContext(): TracfinDraftEditor {
  const editor = useContext(TracfinDraftEditorContext);
  if (!editor) throw new Error('useTracfinDraftEditorContext must be used inside TracfinDraftEditorProvider');
  return editor;
}
