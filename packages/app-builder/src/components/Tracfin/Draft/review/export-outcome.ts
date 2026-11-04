import type { TracfinDraft, TracfinExport } from '@app-builder/models/tracfin';

/**
 * What the draft says about an export whose answer never came (408, 5xx, network): the server may
 * have written it all the same. The only proof is `last_export` of a draft read afterwards.
 *
 * - `exported`: a new export of the requested revision exists (it is not the one that was there before the attempt).
 * - `unchanged`: the last export of that revision is the one that already existed: this attempt left nothing.
 * - `moved`: the draft is no longer at the revision that was requested; nothing says what became of the attempt.
 * - `not_exported`: there is no export of the requested revision.
 */
export type UncertainExportVerdict =
  | { kind: 'exported'; export: TracfinExport }
  | { kind: 'unchanged'; export: TracfinExport }
  | { kind: 'moved'; revision: number }
  | { kind: 'not_exported' };

export function judgeUncertainExport({
  requestedRevision,
  before,
  after,
}: {
  requestedRevision: number;
  /** `last_export` as it was when the attempt started. */
  before: TracfinExport | null;
  /** The draft read after the failure. */
  after: Pick<TracfinDraft, 'revision' | 'last_export'>;
}): UncertainExportVerdict {
  const last = after.last_export ?? null;
  if (last && last.draft_revision === requestedRevision) {
    return last.id === before?.id ? { kind: 'unchanged', export: last } : { kind: 'exported', export: last };
  }
  if (after.revision !== requestedRevision) return { kind: 'moved', revision: after.revision };
  return { kind: 'not_exported' };
}

/** How the last export stands against the draft being edited. */
export type LastExportRelation =
  /** The export is of the revision the draft is at. */
  | { kind: 'current'; revision: number }
  /** The draft moved on since: export again to publish the new changes. */
  | { kind: 'older'; exportRevision: number; draftRevision: number }
  /** An export of a revision beyond the draft held here (this view is behind): says both, offers nothing. */
  | { kind: 'ahead'; exportRevision: number; draftRevision: number };

export function lastExportRelation(
  lastExport: Pick<TracfinExport, 'draft_revision'>,
  draftRevision: number,
): LastExportRelation {
  if (lastExport.draft_revision === draftRevision) return { kind: 'current', revision: draftRevision };
  return lastExport.draft_revision < draftRevision
    ? { kind: 'older', exportRevision: lastExport.draft_revision, draftRevision }
    : { kind: 'ahead', exportRevision: lastExport.draft_revision, draftRevision };
}
