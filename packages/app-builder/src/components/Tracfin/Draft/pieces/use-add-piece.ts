import type { CaseFile } from '@app-builder/models/cases';
import type { TracfinApiError } from '@app-builder/models/tracfin';
import { useRef, useState } from 'react';
import { useTracfinDraftEditorContext } from '../editor/TracfinDraftEditorContext';
import { type AddPieceRefusal, planAddPiece } from './pieces-model';

/** Why a file did not become a piece, as the section explains it. */
export type AddPieceError = {
  file: Pick<CaseFile, 'id' | 'fileName'>;
  reason:
    | AddPieceRefusal
    /** 403: the file is not this case's. */
    | 'forbidden'
    /** 404: the file no longer exists. */
    | 'not_found'
    /** 413: the technical size limit of the attachments (64 MiB). */
    | 'too_large'
    /** 409: the draft changed elsewhere; the editor re-read it. */
    | 'conflict'
    /** 400: any other refusal; the server's message is shown. */
    | 'invalid';
  message?: string | null;
};

function reasonOf(error: TracfinApiError): AddPieceError['reason'] | null {
  switch (error.kind) {
    case 'forbidden':
      return 'forbidden';
    case 'not_found':
      return 'not_found';
    case 'too_large':
      return 'too_large';
    case 'conflict':
      return 'conflict';
    case 'bad_request':
      return 'invalid';
    default:
      // 408 / 5xx / network: the editor reports it (banner, retry); nothing more to say here.
      return null;
  }
}

/**
 * Takes a case file as a piece. The change is a quiet `applyStructural`: when the server refuses it
 * (a file of another case, a file that is gone, a size limit) nothing was applied, the unsent field
 * edits that rode with the request stay pending, and the editor does not enter its failed state — the
 * reason is returned here for the section to show. One request at a time: the file in flight is `busyFileId`.
 */
export function useAddPiece() {
  const editor = useTracfinDraftEditorContext();
  const [busyFileId, setBusyFileId] = useState<string | null>(null);
  const busy = useRef(false);
  const [error, setError] = useState<AddPieceError | null>(null);

  const add = async (file: Pick<CaseFile, 'id' | 'fileName'>): Promise<boolean> => {
    if (busy.current) return false;
    setError(null);
    const plan = planAddPiece({ draft: editor.draft, fileId: file.id });
    if (!plan.ok) {
      setError({ file, reason: plan.reason });
      return false;
    }
    busy.current = true;
    setBusyFileId(file.id);
    try {
      const result = await editor.applyStructural(plan.ops, { quiet: true });
      if (result.ok) return true;
      const reason = reasonOf(result.error);
      if (reason) setError({ file, reason, message: result.error.message });
      return false;
    } finally {
      busy.current = false;
      setBusyFileId(null);
    }
  };

  return { add, busyFileId, error, clearError: () => setError(null) };
}
