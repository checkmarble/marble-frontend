import type { TracfinDraft } from '@app-builder/models/tracfin';
import { normalizeAddress, resolveAddress } from './block-address';
import { type FieldValueState, stateOfValue } from './field-values';
import { isUnsaved, type PendingEdit, sameInput } from './pending-edits';

/**
 * One pending edit set against the draft the server holds now.
 * - `differs`: the server value is not the local one; re-applying overwrites it.
 * - `identical`: the server already has this value (an uncertain save that did go through, or the
 *   same edit made elsewhere); nothing to re-send.
 * - `orphan`: the block or the occurrence the edit targeted no longer exists. Never re-sent, never
 *   dropped silently.
 */
export type ConflictItem = {
  edit: PendingEdit;
  status: 'differs' | 'identical' | 'orphan';
  /** The server value of the occurrence (for a new occurrence: the first value the field holds), if any. */
  server: FieldValueState | null;
  local: FieldValueState;
};

export function localStateOfEdit(edit: PendingEdit): FieldValueState {
  if (edit.op.type !== 'set') return { kind: 'cleared' };
  const { input } = edit.op;
  switch (input.kind) {
    case 'text':
      return { kind: 'text', text: input.text ?? '' };
    case 'boolean':
      return input.boolean === undefined ? { kind: 'empty' } : { kind: 'boolean', boolean: input.boolean };
    case 'decimal':
      return { kind: 'decimal', decimal: input.decimal ?? '' };
    case 'reference':
      return input.reference ? { kind: 'reference', reference: input.reference } : { kind: 'empty' };
  }
}

export function compareWithServer(server: TracfinDraft, edits: readonly PendingEdit[]): ConflictItem[] {
  const root = server.document.root;
  return edits.filter(isUnsaved).map((edit): ConflictItem => {
    const local = localStateOfEdit(edit);
    const orphan: ConflictItem = { edit, status: 'orphan', server: null, local };
    if (!normalizeAddress(root, edit.block)) return orphan;
    const block = resolveAddress(root, edit.block);
    const owned = (block?.fields?.[edit.fieldId] ?? []).filter(
      (value) => (value.parent_value_id ?? null) === edit.parentValueId,
    );

    if (edit.parentValueId) {
      const owner = Object.values(block?.fields ?? {})
        .flat()
        .find((value) => value.id === edit.parentValueId);
      if (!owner || owner.kind === 'cleared') return orphan;
    }

    if (edit.valueId) {
      const value = owned.find((candidate) => candidate.id === edit.valueId);
      if (!value) return orphan;
      const identical =
        edit.op.type === 'clear'
          ? value.kind === 'cleared'
          : edit.op.type === 'set' && sameInput(value, edit.op.input) && !(edit.confirm && value.needs_review);
      return { edit, status: identical ? 'identical' : 'differs', server: stateOfValue(value), local };
    }

    const first = owned.find((value) => value.kind !== 'cleared');
    const input = edit.op.type === 'set' ? edit.op.input : null;
    const identical = input !== null && owned.some((value) => sameInput(value, input));
    return { edit, status: identical ? 'identical' : 'differs', server: first ? stateOfValue(first) : null, local };
  });
}
