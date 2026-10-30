import type { TracfinApiError, TracfinExport } from '@app-builder/models/tracfin';
import { useTracfinExportMutation } from '@app-builder/queries/tracfin/export-draft';
import { useTracfinDraftQuery } from '@app-builder/queries/tracfin/get-draft';
import { tracfinKeys } from '@app-builder/queries/tracfin/keys';
import { useTracfinValidateMutation } from '@app-builder/queries/tracfin/validate-draft';
import { useQueryClient } from '@tanstack/react-query';
import { createContext, type ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useTracfinDraftEditorContext } from '../editor/TracfinDraftEditorContext';
import { type BlockDiagnostic, TracfinBlockDiagnosticsContext } from '../fields/block-diagnostics';
import { toApiError } from '../model/save-failure';
import { judgeUncertainExport } from './export-outcome';
import { parseExportRefusal } from './export-refusal';
import {
  type ExportOutcome,
  type ExportStatus,
  isValidationStale,
  tagValidationDiagnostics,
  type ValidationFailure,
  type ValidationRun,
} from './review-state';

export type TracfinReview = {
  /** The last « Contrôler » of this visit, with the revision it ran on. */
  validation: ValidationRun | null;
  validationStale: boolean;
  validating: boolean;
  validationFailure: ValidationFailure | null;
  /** Saves the unsent edits, then validates the saved revision. */
  validate: () => Promise<void>;

  exportStatus: ExportStatus;
  exportOutcome: ExportOutcome | null;
  /** Saves the unsent edits, then exports the saved revision (never retried blindly after a lost answer). */
  exportDraft: () => Promise<void>;
  dismissExportOutcome: () => void;
  /** After an `unknown` outcome: reads the draft again and judges the lost answer; the outcome stays `unknown` until it can. */
  recheckExport: () => Promise<void>;
  /** Whether either of the two is running: the actions wait for each other. */
  busy: boolean;
};

const TracfinReviewContext = createContext<TracfinReview | null>(null);

export function useTracfinReview(): TracfinReview {
  const review = useContext(TracfinReviewContext);
  if (!review) throw new Error('useTracfinReview must be used inside TracfinReviewProvider');
  return review;
}

const isUncertain = (error: TracfinApiError) =>
  error.kind === 'timeout' || error.kind === 'server' || error.kind === 'network';

/**
 * Keeps the review of the draft page: the last validation (with its revision) and the export in
 * progress. The state lives above the sections so that an export started here keeps its outcome when
 * the analyst opens another section meanwhile. The diagnostics of the validation join the shared
 * store the blocks read (`TracfinBlockDiagnosticsContext`), flagged stale once the draft moves on.
 *
 * Both actions work on a SAVED revision: unsent edits are saved first and, for the export, any edit
 * that cannot be saved stops it. Nothing here touches the case, its status or the manual SAR.
 */
export function TracfinReviewProvider({ children }: { children: ReactNode }) {
  const editor = useTracfinDraftEditorContext();
  const queryClient = useQueryClient();
  const draftQuery = useTracfinDraftQuery(editor.caseId);
  const validateMutation = useTracfinValidateMutation(editor.caseId);
  const exportMutation = useTracfinExportMutation(editor.caseId);
  const outer = useContext(TracfinBlockDiagnosticsContext);

  const [validation, setValidation] = useState<ValidationRun | null>(null);
  const [validating, setValidating] = useState(false);
  const [validationFailure, setValidationFailure] = useState<ValidationFailure | null>(null);
  const [exportStatus, setExportStatus] = useState<ExportStatus>('idle');
  const [exportOutcome, setExportOutcome] = useState<ExportOutcome | null>(null);

  const editorRef = useRef(editor);
  editorRef.current = editor;
  const refetchRef = useRef(draftQuery.refetch);
  refetchRef.current = draftQuery.refetch;
  const running = useRef(false);

  const invalidateDraft = useCallback(
    () => queryClient.invalidateQueries({ queryKey: tracfinKeys.draft(editor.caseId) }),
    [queryClient, editor.caseId],
  );

  const validate = useCallback(async () => {
    if (running.current) return;
    running.current = true;
    setValidating(true);
    setValidationFailure(null);
    try {
      const saved = await editorRef.current.flush();
      if (!saved.ok) {
        setValidationFailure({ kind: 'save_failed', error: saved.error });
        return;
      }
      // Unsent edits that cannot be sent (an invalid decimal) are not part of the saved revision: it is
      // validated as it is, and the screen says that they are not covered.
      const revision = saved.data.revision;
      try {
        const result = await validateMutation.mutateAsync({ expected_revision: revision });
        setValidation({ revision, validation: result });
      } catch (error) {
        const api = toApiError(error);
        if (api.kind === 'conflict') {
          void invalidateDraft();
          setValidationFailure({ kind: 'conflict' });
        } else {
          setValidationFailure({ kind: 'failed', error: api });
        }
      }
    } finally {
      running.current = false;
      setValidating(false);
    }
  }, [validateMutation, invalidateDraft]);

  /** After a lost answer: re-read the draft and let `last_export` say whether the export happened. */
  const settleUncertain = useCallback(
    async (cause: TracfinApiError, revision: number, before: TracfinExport | null): Promise<ExportOutcome> => {
      setExportStatus('checking');
      try {
        const reread = await refetchRef.current();
        if (reread.isError || !reread.data) return { kind: 'unknown', cause, revision, before };
        const verdict = judgeUncertainExport({ requestedRevision: revision, before, after: reread.data });
        switch (verdict.kind) {
          case 'exported':
            return { kind: 'confirmed', export: verdict.export, cause };
          case 'unchanged':
            return { kind: 'not_confirmed', cause, previous: verdict.export };
          case 'moved':
            return { kind: 'moved', cause, revision: verdict.revision };
          case 'not_exported':
            return { kind: 'not_confirmed', cause, previous: reread.data.last_export ?? null };
        }
      } catch {
        return { kind: 'unknown', cause, revision, before };
      }
    },
    [],
  );

  const exportDraft = useCallback(async () => {
    if (running.current) return;
    running.current = true;
    setExportOutcome(null);
    setExportStatus('saving');
    try {
      const saved = await editorRef.current.flush();
      if (!saved.ok) {
        setExportOutcome({ kind: 'save_failed', error: saved.error });
        return;
      }
      // `flush` leaves an edit that cannot be sent (an invalid decimal) pending: exporting now would
      // silently drop it, so the export waits for the analyst.
      if (editorRef.current.hasUnsavedEdits()) {
        setExportOutcome({ kind: 'unsent_edits' });
        return;
      }
      const revision = saved.data.revision;
      const before = saved.data.last_export ?? null;
      setExportStatus('exporting');
      try {
        const exported = await exportMutation.mutateAsync({ expected_revision: revision });
        setExportOutcome({ kind: 'exported', export: exported });
      } catch (error) {
        const api = toApiError(error);
        if (api.kind === 'unprocessable') {
          setExportOutcome({ kind: 'refused', refusal: parseExportRefusal(api.message), message: api.message });
        } else if (api.kind === 'conflict') {
          void invalidateDraft();
          setExportOutcome({ kind: 'conflict' });
        } else if (api.kind === 'too_large') {
          setExportOutcome({ kind: 'too_large', message: api.message });
        } else if (isUncertain(api)) {
          setExportOutcome(await settleUncertain(api, revision, before));
        } else {
          setExportOutcome({ kind: 'rejected', error: api });
        }
      }
    } finally {
      running.current = false;
      setExportStatus('idle');
    }
  }, [exportMutation, invalidateDraft, settleUncertain]);

  const outcomeRef = useRef(exportOutcome);
  outcomeRef.current = exportOutcome;
  const recheckExport = useCallback(async () => {
    const current = outcomeRef.current;
    if (running.current || current?.kind !== 'unknown') return;
    running.current = true;
    try {
      setExportOutcome(await settleUncertain(current.cause, current.revision, current.before));
    } finally {
      running.current = false;
      setExportStatus('idle');
    }
  }, [settleUncertain]);

  const revision = editor.draft.revision;
  const diagnostics = useMemo<readonly BlockDiagnostic[]>(
    () => [...outer, ...tagValidationDiagnostics(validation, revision)],
    [outer, validation, revision],
  );

  const value: TracfinReview = {
    validation,
    validationStale: isValidationStale(validation, revision),
    validating,
    validationFailure,
    validate,
    exportStatus,
    exportOutcome,
    exportDraft,
    dismissExportOutcome: () => setExportOutcome(null),
    recheckExport,
    busy: validating || exportStatus !== 'idle',
  };

  return (
    <TracfinReviewContext.Provider value={value}>
      <TracfinBlockDiagnosticsContext.Provider value={diagnostics}>{children}</TracfinBlockDiagnosticsContext.Provider>
    </TracfinReviewContext.Provider>
  );
}
