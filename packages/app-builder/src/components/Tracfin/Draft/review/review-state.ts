import type { TracfinApiError, TracfinDiagnostic, TracfinExport, TracfinValidation } from '@app-builder/models/tracfin';
import type { ExportRefusal } from './export-refusal';

/** The result of « Contrôler »: what the server said of the saved revision, and which revision that was. */
export type ValidationRun = { revision: number; validation: TracfinValidation };

/** The result is for an older revision than the draft's: it is kept, flagged « à recalculer ». */
export const isValidationStale = (run: ValidationRun | null, draftRevision: number): boolean =>
  run !== null && run.revision !== draftRevision;

/**
 * The diagnostics of a validation run as the blocks display them (the shared diagnostics store of the
 * draft page), flagged `stale` once the draft has moved past the run's revision.
 */
export function tagValidationDiagnostics(
  run: ValidationRun | null,
  draftRevision: number,
): (TracfinDiagnostic & { stale?: boolean })[] {
  if (!run) return [];
  const stale = isValidationStale(run, draftRevision);
  return (run.validation.diagnostics ?? []).map((diagnostic) => (stale ? { ...diagnostic, stale: true } : diagnostic));
}

/** Why a validation did not produce a result. */
export type ValidationFailure =
  /** The unsent edits could not be saved first (conflict, refusal, network...). */
  | { kind: 'save_failed'; error: TracfinApiError }
  /** 409: the draft is no longer at the revision that was sent. */
  | { kind: 'conflict' }
  | { kind: 'failed'; error: TracfinApiError };

/** What an export attempt came to. Only `exported` and `confirmed` mean an XML exists for the revision. */
export type ExportOutcome =
  | { kind: 'exported'; export: TracfinExport }
  /** The answer was lost (timeout, 5xx, network) but the draft read afterwards shows the export. */
  | { kind: 'confirmed'; export: TracfinExport; cause: TracfinApiError }
  /** The answer was lost and the draft shows no new export of that revision: the retry is the analyst's call. */
  | { kind: 'not_confirmed'; cause: TracfinApiError; previous: TracfinExport | null }
  /** The answer was lost and the draft moved to another revision since. */
  | { kind: 'moved'; cause: TracfinApiError; revision: number }
  /** The answer was lost and the draft could not be read either: nothing is known. */
  | { kind: 'unknown'; cause: TracfinApiError }
  /** 422: the draft holds text XML cannot carry. */
  | { kind: 'refused'; refusal: ExportRefusal | null; message: string | null }
  /** 409: the revision changed under the export. */
  | { kind: 'conflict' }
  /** 413: a technical size limit. */
  | { kind: 'too_large'; message: string | null }
  /** 400 / 403 / 404: the server refused the request. */
  | { kind: 'rejected'; error: TracfinApiError }
  /** The unsent edits could not be saved first. */
  | { kind: 'save_failed'; error: TracfinApiError }
  /** Edits that cannot be sent (an invalid decimal) are still pending: nothing is exported. */
  | { kind: 'unsent_edits' };

export type ExportStatus = 'idle' | 'saving' | 'exporting' | 'checking';
