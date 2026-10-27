import type {
  TracfinBlock,
  TracfinDiagnostic,
  TracfinDraft,
  TracfinPrefillProposal,
  TracfinPrefillResult,
  TracfinSourceRef,
  TracfinValue,
} from '@app-builder/models/tracfin';

/** What the client base (or a decision) would give for a field: one value per source. */
export type ScriptedProposal = {
  blockId: string;
  fieldId: string;
  /** One entry per distinct value; several make a conflict. */
  candidates: { text: string; source: TracfinSourceRef; needsReview?: boolean; origin?: 'ingested' | 'calculated' }[];
  partial?: boolean;
};

export const MAPPING_VERSION = 'mapping-version-1';

function find(block: TracfinBlock, id: string): TracfinBlock | null {
  if (block.id === id) return block;
  for (const child of block.children ?? []) {
    const found = find(child, id);
    if (found) return found;
  }
  return null;
}

/**
 * A stand-in for `ResolvePrefill` (backend `usecases/tracfin/mapping.go`): ids derive from the draft
 * revision, a field holding a cleared value, a manual value or a value without origin is never
 * proposed, and a field whose resolved value already carries the same source fingerprint is not
 * proposed again.
 */
export function scriptedPrefill(
  script: readonly ScriptedProposal[],
  diagnostics: readonly TracfinDiagnostic[] = [],
): (draft: TracfinDraft) => TracfinPrefillResult {
  return (draft) => {
    const proposals: TracfinPrefillProposal[] = [];
    for (const entry of script) {
      const block = find(draft.document.root, entry.blockId);
      if (!block) continue;
      const existing = block.fields?.[entry.fieldId] ?? [];
      if (existing.some((value) => value.kind === 'cleared' || !value.origin || value.origin.source === 'manual')) {
        continue;
      }
      const id = `proposal:${draft.revision}:${entry.blockId}:${entry.fieldId}`;
      const fingerprint = `fingerprint:${entry.candidates.map((candidate) => candidate.text).join('|')}`;
      const conflict = entry.candidates.length > 1;
      const candidates: TracfinValue[] = entry.candidates.map((candidate, index) => ({
        id: `${id}:candidate:${index}`,
        kind: 'text',
        text: candidate.text,
        ...(candidate.needsReview || entry.partial ? { needs_review: true } : {}),
        origin: {
          source_fingerprint: fingerprint,
          source: candidate.origin ?? 'ingested',
          mapping_version: MAPPING_VERSION,
          sources: [candidate.source],
          resolution: conflict ? 'conflict' : entry.partial ? 'partial' : 'resolved',
        },
      }));
      if (
        existing.some(
          (value) =>
            value.origin?.resolution === 'resolved' &&
            !value.needs_review &&
            value.origin.source_fingerprint === fingerprint,
        )
      ) {
        continue;
      }
      proposals.push({
        id,
        field: {
          block_id: entry.blockId,
          field_id: entry.fieldId,
          ...(existing.length === 1 ? { value_id: existing[0]!.id } : {}),
        },
        candidates,
        resolution: conflict ? 'conflict' : entry.partial ? 'partial' : 'resolved',
      });
    }
    return {
      draft_revision: draft.revision,
      mapping_version: MAPPING_VERSION,
      proposals,
      diagnostics: [...diagnostics],
    };
  };
}
