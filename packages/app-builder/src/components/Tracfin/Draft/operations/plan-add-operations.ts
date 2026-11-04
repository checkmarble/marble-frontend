import type { TracfinDraft } from '@app-builder/models/tracfin';
import { blockRef, type StructuralOp } from '../model/build-patch';
import { topLevelAddress } from '../sections/section-addresses';
import {
  OPERATION_CATALOG_ID,
  OPERATIONS_CATALOG_ID,
  operationCapacity,
  selectedDecisionIds,
} from './operations-model';
import { buildSnapshotSelection, snapshotMappingFor } from './snapshot-selection';

/** What the plan needs of a decision of the case: its id and the historical type of its trigger object. */
export type DecisionToAdd = { id: string; triggerObjectType: string };

export type AddOperationsPlan = {
  /** One PATCH: for each accepted decision an `add_block` (alias) then its `set_selection`. */
  ops: StructuralOp[];
  /** The decisions that get a line, with whether the line is linked to the decision (a snapshot mapping exists). */
  added: { decisionId: string; historicalType: string; linked: boolean }[];
  /** Decisions left out: the draft is full, or the decision already has a line. */
  refused: { decisionId: string; reason: 'capacity' | 'already_selected' }[];
};

/**
 * The structural changes that add one principal operation line per decision (one decision = one
 * line). A decision whose historical type has no `decision_snapshot` mapping still gets a line, without
 * selection: there is nothing to link it to, the analyst fills the line by hand. Decisions beyond the
 * remaining capacity and decisions already selected (or listed twice) are refused here, before any
 * request: the server would answer 400 « maximum 30 principal operations » / « decision already
 * selected ».
 */
export function planAddOperations({
  draft,
  decisions,
}: {
  draft: TracfinDraft;
  decisions: readonly DecisionToAdd[];
}): AddOperationsPlan {
  const root = draft.document.root;
  const taken = selectedDecisionIds(root);
  let remaining = operationCapacity(root).remaining;
  const parent = topLevelAddress(draft, OPERATIONS_CATALOG_ID);
  const mappings = draft.configuration.mappings ?? [];

  const plan: AddOperationsPlan = { ops: [], added: [], refused: [] };
  decisions.forEach((decision) => {
    if (taken.has(decision.id)) {
      plan.refused.push({ decisionId: decision.id, reason: 'already_selected' });
      return;
    }
    if (remaining <= 0) {
      plan.refused.push({ decisionId: decision.id, reason: 'capacity' });
      return;
    }
    remaining -= 1;
    taken.add(decision.id);
    const ref = `operation-${plan.added.length}`;
    plan.ops.push({ type: 'add_block', parent, catalogId: OPERATION_CATALOG_ID, ref });
    const mapping = snapshotMappingFor(mappings, decision.triggerObjectType);
    if (mapping) {
      plan.ops.push({
        type: 'set_selection',
        block: blockRef(ref),
        selection: buildSnapshotSelection({
          mappingId: mapping.id,
          decisionId: decision.id,
          historicalType: decision.triggerObjectType,
        }),
      });
    }
    plan.added.push({ decisionId: decision.id, historicalType: decision.triggerObjectType, linked: mapping !== null });
  });
  return plan;
}
