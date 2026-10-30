import type { TracfinDraft } from '@app-builder/models/tracfin';
import type { QueryClient } from '@tanstack/react-query';
import { tracfinKeys } from './keys';

type CachedDraft = TracfinDraft | null | undefined;

function exportedAt(draft: TracfinDraft): number {
  return draft.last_export ? Date.parse(draft.last_export.created_at) : Number.NEGATIVE_INFINITY;
}

/**
 * Whether `candidate` is behind what the cache already holds. A draft only moves forward: its
 * revision grows, and at an equal revision only `last_export` can change, towards a later export.
 * A cached draft is never replaced by "no draft" either, since drafts are not deleted.
 */
function isBehind(candidate: TracfinDraft | null, cached: CachedDraft): cached is TracfinDraft {
  if (!cached) return false;
  if (candidate === null) return true;
  if (candidate.revision !== cached.revision) return candidate.revision < cached.revision;
  return exportedAt(candidate) < exportedAt(cached);
}

/**
 * The draft a read should leave in the cache. A read that started before a write finished can come
 * back with the state from before it: it must not replace the newer draft.
 */
export function newerTracfinDraft(fetched: TracfinDraft | null, cached: CachedDraft): TracfinDraft | null {
  return isBehind(fetched, cached) ? cached : fetched;
}

/** Writes the draft returned by a mutation, unless the cache already holds a newer one. */
export function writeTracfinDraft(queryClient: QueryClient, caseId: string, draft: TracfinDraft): void {
  queryClient.setQueryData<TracfinDraft | null>(tracfinKeys.draft(caseId), (cached) =>
    isBehind(draft, cached) ? cached : draft,
  );
}

/**
 * To call when a mutation starts: it stops a read in flight, whose answer could otherwise land after
 * the mutation result and overwrite it with the draft from before.
 */
export async function cancelTracfinDraftReads(queryClient: QueryClient, caseId: string): Promise<void> {
  await queryClient.cancelQueries({ queryKey: tracfinKeys.draft(caseId) });
}
