import type {
  TracfinBlock,
  TracfinChangeInput,
  TracfinDraft,
  TracfinFieldInput,
  TracfinReference,
  TracfinSelection,
} from '@app-builder/models/tracfin';
import { collectBlockIds, findBlock, normalizeAddress, type TracfinBlockAddress } from './block-address';
import { isSendable, type PendingEdit } from './pending-edits';

/** A block that an earlier `add_block` of the same list creates, designated by the `ref` it was given. */
export type BlockRef = { readonly kind: 'ref'; readonly ref: string };

/** A block named by a structural change: an address (virtual ones are created first), or a `BlockRef`. */
export type OpBlock = TracfinBlockAddress | BlockRef;

export const blockRef = (ref: string): BlockRef => ({ kind: 'ref', ref });

/**
 * A structural change, sent at once together with the field edits that were pending. A list of them
 * is one PATCH: a later change can name a block that an earlier `add_block` creates (`ref`), the
 * server replaces the temporary alias of the PATCH with a real id.
 */
export type StructuralOp =
  | { type: 'add_block'; parent: OpBlock; catalogId: string; ref?: string }
  | { type: 'remove_block'; blockId: string }
  | { type: 'refresh_configuration' }
  | { type: 'set_selection'; block: OpBlock; selection: TracfinSelection }
  | { type: 'set_field'; block: OpBlock; fieldId: string; input: TracfinFieldInput; valueId?: string }
  | { type: 'set_relation'; block: OpBlock; fieldId: string; relation: TracfinReference; valueId?: string }
  /** A prefill choice: the server recomputes the proposals and refuses a stale or forged `proposal_id` / `candidate_id`. */
  | { type: 'apply_prefill'; proposalId: string; candidateId: string; mappingVersion: string };

type AddedBlock = { alias: string; parent: string; catalogId: string };

export type PatchPlan = {
  changes: TracfinChangeInput[];
  /** The pending edits the PATCH carries, in order. */
  sent: PendingEdit[];
  /** Blocks created by the PATCH under a temporary alias, in order. */
  added: AddedBlock[];
  /** Blocks removed by the PATCH (with their descendants): pending edits on them are dropped. */
  removed: Set<string>;
};

const ALIAS_PREFIX = 'tracfin-new-block-';

/**
 * The change list of the next PATCH. Field edits come first (in the order they were made), the
 * structural changes after them. A block that does not exist yet is created with `add_block` and a
 * temporary alias, which the following changes of the same PATCH use; the server replaces the alias
 * with a real id. Returns `null` when there is nothing to send.
 */
export function planPatch({
  draft,
  pending,
  structural = [],
}: {
  draft: TracfinDraft;
  pending: readonly PendingEdit[];
  structural?: readonly StructuralOp[];
}): PatchPlan | null {
  const root = draft.document.root;
  const changes: TracfinChangeInput[] = [];
  const added: AddedBlock[] = [];
  const aliases = new Map<string, string>();
  let aliasCount = 0;
  const newAlias = () => `${ALIAS_PREFIX}${++aliasCount}`;
  const removed = new Set<string>();

  for (const op of structural) {
    if (op.type !== 'remove_block') continue;
    const block = findBlock(root, op.blockId);
    if (block) collectBlockIds(block, removed);
  }

  /** The id (or alias) that designates the block in this PATCH, creating missing levels first. */
  const materialize = (address: TracfinBlockAddress): string | null => {
    const normalized = normalizeAddress(root, address);
    if (!normalized) return null;
    if (normalized.kind === 'block') return normalized.id;
    let parent = normalized.anchorId;
    for (let depth = 0; depth < normalized.path.length; depth++) {
      const catalogId = normalized.path[depth]!;
      const levelKey = `${normalized.anchorId}>${normalized.path.slice(0, depth + 1).join('>')}`;
      let alias = aliases.get(levelKey);
      if (!alias) {
        alias = newAlias();
        aliases.set(levelKey, alias);
        added.push({ alias, parent, catalogId });
        changes.push({ action: 'add_block', parent_block_id: parent, catalog_id: catalogId, block_id: alias });
      }
      parent = alias;
    }
    return parent;
  };

  const sent: PendingEdit[] = [];
  for (const edit of pending) {
    if (!isSendable(edit)) continue;
    const normalized = normalizeAddress(root, edit.block);
    if (normalized?.kind === 'block' && removed.has(normalized.id)) continue;
    const blockId = materialize(edit.block);
    if (blockId === null) continue;
    const field = { block_id: blockId, field_id: edit.fieldId, ...(edit.valueId ? { value_id: edit.valueId } : {}) };
    if (edit.op.type === 'clear') {
      // Only an existing occurrence is ever cleared; the server keeps its owner.
      changes.push({ action: 'clear_field', field });
    } else if (edit.op.type === 'set') {
      changes.push({
        action: 'set_field',
        field,
        value: { ...edit.op.input, ...(edit.parentValueId ? { parent_value_id: edit.parentValueId } : {}) },
      });
    }
    sent.push(edit);
  }

  const refs = new Map<string, string>();
  const resolve = (block: OpBlock): string | null =>
    block.kind === 'ref' ? (refs.get(block.ref) ?? null) : materialize(block);

  for (const op of structural) {
    switch (op.type) {
      case 'refresh_configuration':
        changes.push({ action: 'refresh_configuration' });
        break;
      case 'remove_block':
        changes.push({ action: 'remove_block', block_id: op.blockId });
        break;
      case 'add_block': {
        const parent = resolve(op.parent);
        if (parent === null) break;
        const alias = newAlias();
        added.push({ alias, parent, catalogId: op.catalogId });
        if (op.ref) refs.set(op.ref, alias);
        changes.push({ action: 'add_block', parent_block_id: parent, catalog_id: op.catalogId, block_id: alias });
        break;
      }
      case 'set_selection': {
        const blockId = resolve(op.block);
        if (blockId !== null) changes.push({ action: 'set_selection', block_id: blockId, selection: op.selection });
        break;
      }
      case 'set_field': {
        const blockId = resolve(op.block);
        if (blockId === null) break;
        const field = { block_id: blockId, field_id: op.fieldId, ...(op.valueId ? { value_id: op.valueId } : {}) };
        changes.push({ action: 'set_field', field, value: op.input });
        break;
      }
      case 'set_relation': {
        const blockId = resolve(op.block);
        if (blockId === null) break;
        const field = { block_id: blockId, field_id: op.fieldId, ...(op.valueId ? { value_id: op.valueId } : {}) };
        changes.push({ action: 'set_relation', field, relation: op.relation });
        break;
      }
      case 'apply_prefill':
        // Only the keys the action needs: the server finds the field through the proposal.
        changes.push({
          action: 'apply_prefill',
          proposal_id: op.proposalId,
          candidate_id: op.candidateId,
          mapping_version: op.mappingVersion,
        });
        break;
    }
  }

  return changes.length === 0 ? null : { changes, sent, added, removed };
}

/**
 * How the response answers the PATCH: the server ids that replaced the aliases, and the ids it gave
 * to the occurrences that were new. The response is the whole draft with no alias table, so both are
 * read by comparing it with the draft before: new blocks and new values are appended in the order of
 * the changes.
 */
export function reconcilePatch({
  before,
  after,
  plan,
}: {
  before: TracfinDraft;
  after: TracfinDraft;
  plan: PatchPlan;
}): { blockIds: Map<string, string>; valueIds: Map<string, string> } {
  const beforeBlockIds = collectBlockIds(before.document.root);
  const claimed = new Set<string>();
  const blockIds = new Map<string, string>();

  for (const added of plan.added) {
    const parentId = blockIds.get(added.parent) ?? added.parent;
    const parent = findBlock(after.document.root, parentId);
    const created = (parent?.children ?? []).find(
      (child) => child.catalog_id === added.catalogId && !beforeBlockIds.has(child.id) && !claimed.has(child.id),
    );
    if (!created) continue;
    claimed.add(created.id);
    blockIds.set(added.alias, created.id);
  }

  const valueIds = new Map<string, string>();
  const knownValueIds = new Set<string>();
  const visit = (block: TracfinBlock) => {
    for (const values of Object.values(block.fields ?? {})) for (const value of values) knownValueIds.add(value.id);
    for (const child of block.children ?? []) visit(child);
  };
  visit(before.document.root);

  const taken = new Set<string>();
  for (const edit of plan.sent) {
    if (edit.valueId || edit.op.type !== 'set') continue;
    const normalized = normalizeAddress(before.document.root, edit.block);
    // A block created by this PATCH: find it through the alias chain the plan used.
    const blockId = normalized?.kind === 'block' ? normalized.id : createdBlockOf(edit, plan, before, blockIds);
    if (!blockId) continue;
    const block = findBlock(after.document.root, blockId);
    const fresh = (block?.fields?.[edit.fieldId] ?? []).find(
      (value) =>
        (value.parent_value_id ?? null) === edit.parentValueId && !knownValueIds.has(value.id) && !taken.has(value.id),
    );
    if (!fresh) continue;
    taken.add(fresh.id);
    valueIds.set(edit.key, fresh.id);
  }
  return { blockIds, valueIds };
}

/** The real id of the (virtual) block an edit targeted, once the PATCH has created it. */
function createdBlockOf(
  edit: PendingEdit,
  plan: PatchPlan,
  before: TracfinDraft,
  blockIds: Map<string, string>,
): string | null {
  const normalized = normalizeAddress(before.document.root, edit.block);
  if (normalized?.kind !== 'virtual') return null;
  let parentRef = normalized.anchorId;
  for (const catalogId of normalized.path) {
    const level = plan.added.find((added) => added.parent === parentRef && added.catalogId === catalogId);
    if (!level) return null;
    parentRef = level.alias;
  }
  return blockIds.get(parentRef) ?? null;
}
