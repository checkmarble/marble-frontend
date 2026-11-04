import type { TracfinBlock, TracfinFieldInput, TracfinValue } from '@app-builder/models/tracfin';
import { addressKey, normalizeAddress, type TracfinBlockAddress } from './block-address';

/**
 * What the analyst did to one occurrence of a field, not yet saved.
 * - `set`: the occurrence takes this value (a new occurrence when `valueId` is `null`).
 * - `clear`: the occurrence is emptied on purpose (`clear_field`: the server keeps an explicit
 *   "cleared" value so that no automatic refill brings the old one back).
 * - `blank`: an empty slot the analyst opened with « Ajouter ». Never saved, never counted.
 */
export type PendingOp = { type: 'set'; input: TracfinFieldInput } | { type: 'clear' } | { type: 'blank' };

export type PendingEdit = {
  /** `(block, field, owner, occurrence)`: one entry per occurrence, so a later edit replaces an earlier one. */
  key: string;
  block: TracfinBlockAddress;
  fieldId: string;
  /** Owner occurrence of an attribute of simple content. */
  parentValueId: string | null;
  /** The saved occurrence this edit replaces. `null` for a new occurrence. */
  valueId: string | null;
  /** Local identity of a new occurrence until the server gives it an id. */
  newKey: string | null;
  op: PendingOp;
  /** A decimal that is not a well-formed number: kept so the analyst does not lose it, never sent. */
  invalid: boolean;
  /** « Confirmer »: sent even though the value is the same as the saved one. */
  confirm: boolean;
  /** After a conflict: the block or occurrence the edit targeted no longer exists. Never sent. */
  orphaned: boolean;
  /** Identity of the entry across re-addressing; `version` grows with every edit of it (set by the store). */
  uid: number;
  version: number;
};

export type EditTarget = {
  block: TracfinBlockAddress;
  fieldId: string;
  parentValueId: string | null;
  valueId: string | null;
  newKey: string | null;
};

export const SINGLE_NEW_KEY = 'single';

export function valueRefKey(target: Pick<EditTarget, 'valueId' | 'newKey'>): string {
  return target.valueId ? `v:${target.valueId}` : `n:${target.newKey ?? SINGLE_NEW_KEY}`;
}

export function pendingKey(target: EditTarget): string {
  return [addressKey(target.block), target.fieldId, target.parentValueId ?? '', valueRefKey(target)].join('|');
}

/**
 * Sent by the next PATCH. Emptying an occurrence that was never saved has nothing to clear on the
 * server (`clear_field` without a `value_id` would be ambiguous): such an entry only lives while the
 * PATCH that creates the occurrence is in flight, and `settle` re-addresses it to the created one.
 */
export const isSendable = (edit: PendingEdit): boolean =>
  edit.op.type !== 'blank' && !edit.invalid && !edit.orphaned && !(edit.op.type === 'clear' && !edit.valueId);

/** An unsaved change of the analyst: an open blank slot is not one. */
export const isUnsaved = (edit: PendingEdit): boolean => edit.op.type !== 'blank';

/** The input that carries the same typed value as a saved value (so that a « Confirmer » can resend it). */
export function inputOfValue(value: TracfinValue): TracfinFieldInput | null {
  switch (value.kind) {
    case 'text':
      return value.text === undefined ? null : { kind: 'text', text: value.text };
    case 'boolean':
      return value.boolean === undefined ? null : { kind: 'boolean', boolean: value.boolean };
    case 'decimal':
      return value.decimal === undefined ? null : { kind: 'decimal', decimal: value.decimal };
    case 'reference':
      return value.reference ? { kind: 'reference', reference: value.reference } : null;
    case 'cleared':
      return null;
  }
}

export function sameInput(value: TracfinValue, input: TracfinFieldInput): boolean {
  if (value.kind !== input.kind) return false;
  switch (input.kind) {
    case 'text':
      return value.text === input.text;
    case 'boolean':
      return value.boolean === input.boolean;
    case 'decimal':
      return value.decimal === input.decimal;
    case 'reference':
      return (
        value.reference?.block_id === input.reference?.block_id &&
        (value.reference?.person_block_id ?? '') === (input.reference?.person_block_id ?? '')
      );
  }
}

/**
 * The entry that records `op` on `target`, or `null` when nothing has to be kept: the edit gives the
 * saved value back, empties what is already empty, or clears an occurrence that was never saved.
 * An empty text is an emptied field, not a value.
 */
export function planEdit({
  target,
  op,
  serverValue,
  invalid = false,
  confirm = false,
  keep = false,
}: {
  target: EditTarget;
  op: PendingOp;
  serverValue: TracfinValue | null;
  invalid?: boolean;
  confirm?: boolean;
  /**
   * The occurrence is part of the PATCH in flight, whose answer is not known yet: giving the saved value
   * back (or emptying a new occurrence) is then a real change to send after it, not a no-op.
   */
  keep?: boolean;
}): PendingEdit | null {
  const effectiveOp: PendingOp =
    op.type === 'set' && op.input.kind === 'text' && op.input.text === '' ? { type: 'clear' } : op;
  const edit: PendingEdit = {
    ...target,
    key: pendingKey(target),
    op: effectiveOp,
    invalid,
    confirm,
    orphaned: false,
    uid: 0,
    version: 0,
  };
  switch (effectiveOp.type) {
    case 'blank':
      return target.valueId ? null : edit;
    case 'clear':
      if (keep) return edit;
      if (!target.valueId) return null;
      if (serverValue?.kind === 'cleared' && !confirm) return null;
      return edit;
    case 'set':
      if (!keep && !invalid && !confirm && serverValue && sameInput(serverValue, effectiveOp.input)) return null;
      return edit;
  }
}

type Listener = () => void;

/**
 * The unsaved edits. It lives outside React state so that a flush triggered by a blur sees the
 * keystroke that came just before it, and so that it survives a section change (the sections unmount,
 * the store does not). `subscribe`/`snapshot` are shaped for `useSyncExternalStore`.
 */
export class PendingEditStore {
  private entries = new Map<string, PendingEdit>();
  private listeners = new Set<Listener>();
  private cached: readonly PendingEdit[] = [];
  /** Revision the unsaved edits were made on: the revision a PATCH is guarded by. */
  baseRevision: number | null = null;

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  snapshot = (): readonly PendingEdit[] => this.cached;

  get(key: string): PendingEdit | undefined {
    return this.entries.get(key);
  }

  list(): readonly PendingEdit[] {
    return this.cached;
  }

  hasUnsaved(): boolean {
    return this.cached.some(isUnsaved);
  }

  private lastUid = 0;

  upsert(edit: PendingEdit): void {
    // Re-inserting keeps the original position: the order of the edits is the order they were first made.
    const previous = this.entries.get(edit.key);
    this.entries.set(
      edit.key,
      previous
        ? { ...edit, uid: previous.uid, version: previous.version + 1 }
        : { ...edit, uid: ++this.lastUid, version: 0 },
    );
    this.publish();
  }

  remove(key: string): void {
    if (this.entries.delete(key)) this.publish();
  }

  removeWhere(predicate: (edit: PendingEdit) => boolean): void {
    let changed = false;
    for (const [key, edit] of this.entries) {
      if (predicate(edit)) {
        this.entries.delete(key);
        changed = true;
      }
    }
    if (changed) this.publish();
  }

  clear(): void {
    this.entries.clear();
    this.baseRevision = null;
    this.publish();
  }

  /** Replaces every entry (keeps the given order). */
  replaceAll(edits: readonly PendingEdit[]): void {
    this.entries = new Map(edits.map((edit) => [edit.key, edit]));
    this.publish();
  }

  /**
   * Re-addresses the entries against the document: a virtual block that now exists becomes the real
   * one. An entry whose anchor block is gone is flagged `orphaned`.
   */
  rebase(root: TracfinBlock): void {
    const rebased: PendingEdit[] = [];
    for (const edit of this.entries.values()) {
      const block = normalizeAddress(root, edit.block);
      const next = block ? { ...edit, block } : { ...edit, orphaned: true };
      rebased.push({ ...next, key: pendingKey(next) });
    }
    this.replaceAll(rebased);
  }

  private publish(): void {
    this.cached = [...this.entries.values()];
    for (const listener of this.listeners) listener();
  }
}

/** The edits that concern one `(block, field, owner)`, with the blocks addressed as the document has them now. */
export class PendingIndex {
  private byField = new Map<string, PendingEdit[]>();

  constructor(edits: readonly PendingEdit[], root: TracfinBlock) {
    for (const edit of edits) {
      const block = normalizeAddress(root, edit.block) ?? edit.block;
      const key = fieldSlotKey(block, edit.fieldId, edit.parentValueId);
      const list = this.byField.get(key);
      if (list) list.push(edit);
      else this.byField.set(key, [edit]);
    }
  }

  forField(block: TracfinBlockAddress, fieldId: string, parentValueId: string | null): readonly PendingEdit[] {
    return this.byField.get(fieldSlotKey(block, fieldId, parentValueId)) ?? [];
  }
}

function fieldSlotKey(block: TracfinBlockAddress, fieldId: string, parentValueId: string | null): string {
  return `${addressKey(block)}|${fieldId}|${parentValueId ?? ''}`;
}
