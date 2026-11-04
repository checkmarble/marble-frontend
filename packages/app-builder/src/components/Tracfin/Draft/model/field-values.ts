import type { TracfinBlock, TracfinOrigin, TracfinReference, TracfinValue } from '@app-builder/models/tracfin';
import type { TracfinBlockAddress } from './block-address';
import { type EditTarget, type PendingEdit, SINGLE_NEW_KEY, valueRefKey } from './pending-edits';

/** What an occurrence shows: the pending edit if there is one, else the saved value. */
export type FieldValueState =
  | { kind: 'empty' }
  | { kind: 'cleared' }
  | { kind: 'text'; text: string }
  | { kind: 'boolean'; boolean: boolean }
  | { kind: 'decimal'; decimal: string }
  | { kind: 'reference'; reference: TracfinReference };

export type FieldOccurrence = {
  /** Where an edit of this occurrence goes. */
  target: EditTarget;
  server: TracfinValue | null;
  pending: PendingEdit | null;
  /** Displayed value: pending ?? server. */
  state: FieldValueState;
  /** Origin of the saved value; an unsaved edit shows no origin until it is saved. */
  origin: TracfinOrigin | null;
  /** The saved value is flagged « à revoir » and nothing pending replaces it. */
  needsReview: boolean;
  /** Text typed in a decimal field that is not a number (never sent). */
  invalidText: string | null;
};

export function stateOfValue(value: TracfinValue): FieldValueState {
  switch (value.kind) {
    case 'text':
      return { kind: 'text', text: value.text ?? '' };
    case 'boolean':
      return value.boolean === undefined ? { kind: 'empty' } : { kind: 'boolean', boolean: value.boolean };
    case 'decimal':
      return { kind: 'decimal', decimal: value.decimal ?? '' };
    case 'reference':
      return value.reference ? { kind: 'reference', reference: value.reference } : { kind: 'empty' };
    case 'cleared':
      return { kind: 'cleared' };
  }
}

function stateOfEdit(edit: PendingEdit): FieldValueState {
  if (edit.op.type === 'blank') return { kind: 'empty' };
  if (edit.op.type === 'clear') return { kind: 'cleared' };
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

/** True when the state holds something to export (a cleared or empty occurrence holds nothing). */
export const hasContent = (state: FieldValueState): boolean => state.kind !== 'empty' && state.kind !== 'cleared';

/** The text a text-like control shows. */
export function textOf(occurrence: FieldOccurrence): string {
  if (occurrence.invalidText !== null) return occurrence.invalidText;
  const { state } = occurrence;
  if (state.kind === 'text') return state.text;
  if (state.kind === 'decimal') return state.decimal;
  return '';
}

/**
 * The occurrences of a field in a block, as the analyst sees them: the saved ones in server order
 * (an unsaved edit on top of each), then the occurrences added locally. A single-valued field with
 * nothing yet gets one empty slot, so that there is always a place to type.
 *
 * `parentValueId` selects the occurrences of an attribute of simple content under its owner.
 */
export function occurrencesOf({
  block,
  address,
  fieldId,
  parentValueId = null,
  pending,
  single,
}: {
  block: TracfinBlock | null;
  address: TracfinBlockAddress;
  fieldId: string;
  parentValueId?: string | null;
  pending: readonly PendingEdit[];
  /** Single-valued field: ensure one slot even when empty. */
  single: boolean;
}): FieldOccurrence[] {
  const saved = (block?.fields?.[fieldId] ?? []).filter((value) => (value.parent_value_id ?? null) === parentValueId);
  const byRef = new Map(pending.map((edit) => [valueRefKey(edit), edit]));
  const occurrences: FieldOccurrence[] = [];

  for (const server of saved) {
    const target: EditTarget = { block: address, fieldId, parentValueId, valueId: server.id, newKey: null };
    const edit = byRef.get(valueRefKey(target)) ?? null;
    occurrences.push(makeOccurrence(target, server, edit));
  }
  for (const edit of pending) {
    if (edit.valueId) continue;
    const target: EditTarget = { block: address, fieldId, parentValueId, valueId: null, newKey: edit.newKey };
    occurrences.push(makeOccurrence(target, null, edit));
  }
  if (single && occurrences.length === 0) {
    const target: EditTarget = { block: address, fieldId, parentValueId, valueId: null, newKey: SINGLE_NEW_KEY };
    occurrences.push(makeOccurrence(target, null, null));
  }
  return occurrences;
}

function makeOccurrence(target: EditTarget, server: TracfinValue | null, edit: PendingEdit | null): FieldOccurrence {
  const base = server ? stateOfValue(server) : ({ kind: 'empty' } as FieldValueState);
  const showsEdit = edit !== null && edit.op.type !== 'blank';
  const invalid = edit !== null && edit.invalid && edit.op.type === 'set' && edit.op.input.kind === 'decimal';
  return {
    target,
    server,
    pending: edit,
    state: showsEdit ? stateOfEdit(edit) : base,
    origin: server?.origin ?? null,
    needsReview: Boolean(server?.needs_review) && !showsEdit,
    invalidText: invalid && edit?.op.type === 'set' ? (edit.op.input.decimal ?? '') : null,
  };
}

/** Saved occurrences of a field (cleared ones included): they all count against the catalog maximum. */
export function savedCount(block: TracfinBlock | null, fieldId: string, parentValueId: string | null): number {
  return (block?.fields?.[fieldId] ?? []).filter((value) => (value.parent_value_id ?? null) === parentValueId).length;
}
