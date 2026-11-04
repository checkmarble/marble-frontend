import type {
  TracfinBlock,
  TracfinDiagnostic,
  TracfinDraft,
  TracfinPrefillProposal,
  TracfinPrefillResult,
} from '@app-builder/models/tracfin';
import type { TracfinCatalogIndex } from '@app-builder/models/tracfin/catalog-index';
import type { BlockDiagnostic } from '../fields/block-diagnostics';
import { type StructuralOp } from '../model/build-patch';
import { sectionOfCatalogId, type TracfinSectionId, tracfinSectionIds } from '../model/sections';
import { walkBlocks } from '../persons/document';

/** A prefill result with the nullable lists of the wire format turned into arrays. */
export type PrefillResultView = {
  draftRevision: number;
  mappingVersion: string;
  proposals: TracfinPrefillProposal[];
  diagnostics: TracfinDiagnostic[];
};

export function normalizePrefill(result: TracfinPrefillResult): PrefillResultView {
  return {
    draftRevision: result.draft_revision,
    mappingVersion: result.mapping_version,
    proposals: (result.proposals ?? []).map((proposal) => ({ ...proposal, candidates: proposal.candidates ?? [] })),
    diagnostics: result.diagnostics ?? [],
  };
}

/**
 * The result was computed on a revision the draft has left: its proposals would be refused by the
 * server and its diagnostics describe a draft that no longer exists.
 */
export const isPrefillStale = (result: { draftRevision: number } | null, draftRevision: number): boolean =>
  result !== null && result.draftRevision !== draftRevision;

/** The shared diagnostics, flagged `stale` when the draft moved past their revision. */
export function tagDiagnostics(result: PrefillResultView | null, draftRevision: number): readonly BlockDiagnostic[] {
  if (!result) return [];
  const stale = isPrefillStale(result, draftRevision);
  return result.diagnostics.map((diagnostic) => ({ ...diagnostic, stale }));
}

export type ProposalKind = 'clean' | 'conflict';

/**
 * `clean`: one candidate, resolved or partial (applied without a decision). `conflict`: several
 * candidates (or a proposal the server marked as one): the analyst picks. Anything else is not shown.
 */
export function classifyProposal(proposal: TracfinPrefillProposal): ProposalKind | null {
  if (proposal.candidates.length === 0) return null;
  if (proposal.candidates.length > 1 || proposal.resolution === 'conflict') return 'conflict';
  return proposal.resolution === 'resolved' || proposal.resolution === 'partial' ? 'clean' : null;
}

/**
 * A field the analyst corrected or cleared, or any value without origin, is never overwritten by a
 * proposal. The server does not propose for it; this is the client-side guard that no `apply_prefill`
 * is ever sent for such a field.
 */
export function isProtectedField(block: TracfinBlock | null, fieldId: string): boolean {
  return (block?.fields?.[fieldId] ?? []).some(
    (value) => value.kind === 'cleared' || value.origin === undefined || value.origin.source === 'manual',
  );
}

export function findBlockById(root: TracfinBlock, blockId: string): TracfinBlock | null {
  let found: TracfinBlock | null = null;
  walkBlocks(root, (block) => {
    if (block.id === blockId) found = block;
  });
  return found;
}

export type PlacedProposal = {
  proposal: TracfinPrefillProposal;
  kind: ProposalKind;
  fieldId: string;
};

export type BlockGroup = {
  blockId: string;
  catalogId: string;
  clean: PlacedProposal[];
  conflicts: PlacedProposal[];
  diagnostics: TracfinDiagnostic[];
};

export type SectionGroup = { section: TracfinSectionId; blocks: BlockGroup[] };

export type PrefillGroups = {
  sections: SectionGroup[];
  /** Diagnostics that locate no block of the document (catalog or profile problems, a block that is gone). */
  general: TracfinDiagnostic[];
  counts: { clean: number; conflicts: number; diagnostics: number };
};

/**
 * Proposals and diagnostics grouped by section, then by block (document order), proposals in catalog
 * order. A proposal for a block that is not in the document, or for a protected field, is dropped.
 */
export function groupPrefill({
  result,
  root,
  catalogIndex,
}: {
  result: PrefillResultView;
  root: TracfinBlock;
  catalogIndex: TracfinCatalogIndex;
}): PrefillGroups {
  const blocks = new Map<string, { block: TracfinBlock; position: number }>();
  walkBlocks(root, (block) => blocks.set(block.id, { block, position: blocks.size }));

  const groups = new Map<string, BlockGroup>();
  const groupOf = (block: TracfinBlock): BlockGroup => {
    let group = groups.get(block.id);
    if (!group) {
      group = { blockId: block.id, catalogId: block.catalog_id, clean: [], conflicts: [], diagnostics: [] };
      groups.set(block.id, group);
    }
    return group;
  };

  for (const proposal of result.proposals) {
    const kind = classifyProposal(proposal);
    const entry = blocks.get(proposal.field.block_id);
    if (!kind || !entry || isProtectedField(entry.block, proposal.field.field_id)) continue;
    const group = groupOf(entry.block);
    (kind === 'clean' ? group.clean : group.conflicts).push({ proposal, kind, fieldId: proposal.field.field_id });
  }

  const general: TracfinDiagnostic[] = [];
  for (const diagnostic of result.diagnostics) {
    const entry = diagnostic.field?.block_id ? blocks.get(diagnostic.field.block_id) : undefined;
    if (entry) groupOf(entry.block).diagnostics.push(diagnostic);
    else general.push(diagnostic);
  }

  const order = (fieldId: string) => catalogIndex.field(fieldId)?.order ?? Number.MAX_SAFE_INTEGER;
  const bySection = new Map<TracfinSectionId, BlockGroup[]>();
  for (const group of groups.values()) {
    const entry = blocks.get(group.blockId)!;
    const firstField = group.clean[0]?.fieldId ?? group.conflicts[0]?.fieldId ?? group.diagnostics[0]?.field?.field_id;
    const section =
      (firstField ? sectionOfCatalogId(firstField) : null) ??
      sectionOfCatalogId(entry.block.catalog_id) ??
      'declaration';
    group.clean.sort((a, b) => order(a.fieldId) - order(b.fieldId));
    group.conflicts.sort((a, b) => order(a.fieldId) - order(b.fieldId));
    bySection.set(section, [...(bySection.get(section) ?? []), group]);
  }

  const sections = tracfinSectionIds.flatMap((section): SectionGroup[] => {
    const list = bySection.get(section);
    if (!list) return [];
    return [
      { section, blocks: list.sort((a, b) => blocks.get(a.blockId)!.position - blocks.get(b.blockId)!.position) },
    ];
  });

  const all = sections.flatMap((entry) => entry.blocks);
  return {
    sections,
    general,
    counts: {
      clean: all.reduce((sum, group) => sum + group.clean.length, 0),
      conflicts: all.reduce((sum, group) => sum + group.conflicts.length, 0),
      diagnostics: result.diagnostics.length,
    },
  };
}

/** The part of the groups a section shows (the general diagnostics belong to the whole panel). */
export function scopeGroups(groups: PrefillGroups, scope: TracfinSectionId | null): PrefillGroups {
  if (scope === null) return groups;
  const sections = groups.sections.filter((entry) => entry.section === scope);
  const blocks = sections.flatMap((entry) => entry.blocks);
  return {
    sections,
    general: [],
    counts: {
      clean: blocks.reduce((sum, group) => sum + group.clean.length, 0),
      conflicts: blocks.reduce((sum, group) => sum + group.conflicts.length, 0),
      diagnostics: blocks.reduce((sum, group) => sum + group.diagnostics.length, 0),
    },
  };
}

export type PrefillChoice = { proposalId: string; candidateId: string };

/** One `apply_prefill` per choice, all with the mapping version of the result: that is one PATCH. */
export function buildApplyOps(choices: readonly PrefillChoice[], mappingVersion: string): StructuralOp[] {
  return choices.map(({ proposalId, candidateId }) => ({
    type: 'apply_prefill' as const,
    proposalId,
    candidateId,
    mappingVersion,
  }));
}

/** The choices of the non-conflicting proposals that are still checked (the only candidate of each). */
export function cleanChoices(groups: PrefillGroups, excluded: ReadonlySet<string>): PrefillChoice[] {
  return groups.sections.flatMap((entry) =>
    entry.blocks.flatMap((group) =>
      group.clean
        .filter(({ proposal }) => !excluded.has(proposal.id))
        .map(({ proposal }) => ({ proposalId: proposal.id, candidateId: proposal.candidates[0]!.id })),
    ),
  );
}

/** The draft has no organisation configuration to prefill from, or one without any mapping. */
export type PrefillAvailability = 'available' | 'no_configuration' | 'no_mappings';

export function prefillAvailability(draft: TracfinDraft): PrefillAvailability {
  const missing =
    draft.configuration.revision === 0 ||
    (draft.diagnostics ?? []).some((diagnostic) => diagnostic.code === 'CONFIGURATION_UNAVAILABLE');
  if (missing) return 'no_configuration';
  return (draft.configuration.mappings ?? []).length === 0 ? 'no_mappings' : 'available';
}
