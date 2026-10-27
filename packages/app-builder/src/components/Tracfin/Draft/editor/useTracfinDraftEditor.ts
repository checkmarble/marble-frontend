import type {
  TracfinApiError,
  TracfinBlock,
  TracfinDraft,
  TracfinFieldInput,
  TracfinResult,
  TracfinSelection,
} from '@app-builder/models/tracfin';
import type { TracfinCatalogIndex } from '@app-builder/models/tracfin/catalog-index';
import { useTracfinDraftQuery } from '@app-builder/queries/tracfin/get-draft';
import { tracfinKeys } from '@app-builder/queries/tracfin/keys';
import { useTracfinPatchDraftMutation } from '@app-builder/queries/tracfin/patch-draft';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { findBlock, normalizeAddress, resolveAddress, type TracfinBlockAddress } from '../model/block-address';
import { planPatch, reconcilePatch, type StructuralOp } from '../model/build-patch';
import { type ConflictItem, compareWithServer } from '../model/conflict';
import { type FieldOccurrence, occurrencesOf } from '../model/field-values';
import { countMissingExpected } from '../model/missing-fields';
import {
  type EditTarget,
  inputOfValue,
  isSendable,
  isUnsaved,
  type PendingEdit,
  PendingEditStore,
  PendingIndex,
  type PendingOp,
  pendingKey,
  planEdit,
} from '../model/pending-edits';
import { classifySaveFailure, type TracfinSaveFailure, toApiError } from '../model/save-failure';
import { type TracfinSectionId, tracfinSectionScopes } from '../model/sections';

export type TracfinSaveStatus = 'idle' | 'saving' | 'conflict' | 'failed';

/** The server draft set against the unsaved edits, after a conflict. */
export type TracfinComparison =
  | { status: 'loading' }
  | { status: 'failed' }
  | { status: 'ready'; server: TracfinDraft; items: ConflictItem[] };

export type ApplyStructuralOptions = {
  /**
   * The caller handles a refusal of the server itself (400 / 409, for instance a prefill choice that
   * went stale): the editor does not enter its `failed` / `conflict` state, keeps nothing for
   * `retry()`, and re-reads the draft so that its revision is current. Other failures (timeout, 5xx,
   * network) go through the normal path, whose outcome is uncertain.
   * 403 / 404 / 413 count as refusals too (a file that is not the case's, or is gone, or too big): the
   * transaction applied nothing, the pending edits that rode with the request stay pending, the draft
   * is not re-read (it did not change) and the error is returned for the caller to explain.
   */
  quiet?: boolean;
};

export type TracfinDraftEditor = {
  caseId: string;
  /** The draft as the server last returned it (unsaved edits are not applied to it). */
  draft: TracfinDraft;
  catalogIndex: TracfinCatalogIndex;

  // ---- save model -------------------------------------------------------------------------------
  /** Unsaved edits, including invalid and orphaned ones; open blank slots are not edits. */
  pendingEdits: readonly PendingEdit[];
  /** Number of unsaved edits (what the header shows). */
  pendingCount: number;
  hasPendingChanges: boolean;
  /**
   * `hasPendingChanges` read from the store at this very moment, not from the last render: after
   * `await flush()` the component may not have re-rendered yet, and an export must not trust the stale value.
   */
  hasUnsavedEdits: () => boolean;
  status: TracfinSaveStatus;
  failure: TracfinSaveFailure | null;
  comparison: TracfinComparison | null;
  /**
   * Sends every unsent field edit in one PATCH and resolves with the saved draft. Resolves at once
   * with the current draft when there is nothing to send, and with the error when the save failed
   * (the edits are kept). Edits that cannot be sent (an invalid decimal) stay pending: check
   * `hasPendingChanges` afterwards. Refused with a `conflict` error while a conflict is unresolved.
   */
  flush: () => Promise<TracfinResult<TracfinDraft>>;
  /** `flush` for blur and section changes: does nothing while a conflict or an error is displayed. */
  autoFlush: () => Promise<TracfinResult<TracfinDraft>>;
  /** Sends the pending edits again, together with the structural change that failed, if any. */
  retry: () => Promise<TracfinResult<TracfinDraft>>;

  // ---- reading ----------------------------------------------------------------------------------
  /** The server block an address designates (`null` for a block that does not exist yet). */
  blockAt: (address: TracfinBlockAddress) => TracfinBlock | null;
  /** The occurrences of a field of a block as shown (pending ?? saved), with a slot to type in when the field is single-valued. */
  occurrences: (args: {
    address: TracfinBlockAddress;
    fieldId: string;
    parentValueId?: string | null;
    single: boolean;
  }) => FieldOccurrence[];
  /** Fields the catalog expects (`min >= 1`) that are still empty in a section; an indication, never a blocker. */
  missingExpected: (section: TracfinSectionId) => number;

  // ---- editing ----------------------------------------------------------------------------------
  setField: (target: EditTarget, input: TracfinFieldInput) => void;
  /** Empties the occurrence on purpose (`clear_field`). */
  clearField: (target: EditTarget) => void;
  /** A decimal that is not a number: kept locally with its text, never sent. */
  setInvalidDecimal: (target: EditTarget, text: string) => void;
  /** Opens an empty slot for one more occurrence of a multi-valued field. */
  addOccurrence: (args: { address: TracfinBlockAddress; fieldId: string; parentValueId?: string | null }) => void;
  /** « Confirmer »: resends the saved value as a manual one and saves at once. */
  confirm: (occurrence: FieldOccurrence) => Promise<TracfinResult<TracfinDraft>> | null;
  discard: (key: string) => void;

  // ---- structural changes (saved at once, with the pending edits) -------------------------------
  addBlock: (parent: TracfinBlockAddress, catalogId: string) => Promise<TracfinResult<TracfinDraft>>;
  removeBlock: (blockId: string) => Promise<TracfinResult<TracfinDraft>>;
  /**
   * Several structural changes in ONE PATCH, after the pending field edits. A change can name a
   * block that an earlier `add_block` of the list creates (`ref` / `blockRef`), for instance a new
   * person, its civil status block and the selection on it. Queued like every other save.
   * `options.quiet`: see {@link ApplyStructuralOptions}.
   */
  applyStructural: (
    ops: readonly StructuralOp[],
    options?: ApplyStructuralOptions,
  ) => Promise<TracfinResult<TracfinDraft>>;
  /** `set_selection` on a block (a virtual address creates the block first). The server drops the bindings below a changed one. */
  setSelection: (block: TracfinBlockAddress, selection: TracfinSelection) => Promise<TracfinResult<TracfinDraft>>;
  refreshConfiguration: () => Promise<TracfinResult<TracfinDraft>>;

  // ---- conflicts --------------------------------------------------------------------------------
  /** « Recharger et comparer ». */
  reloadAndCompare: () => Promise<void>;
  /** « Réappliquer mes modifications ». */
  reapply: () => Promise<TracfinResult<TracfinDraft> | null>;
  /** « Abandonner mes modifications ». */
  discardAll: () => void;
};

const conflictError: TracfinApiError = { kind: 'conflict', status: 409, message: null };

const ok = (data: TracfinDraft): TracfinResult<TracfinDraft> => ({ ok: true, data });

/**
 * The state of the draft screen: what the analyst edited and has not saved, the save in flight, and
 * the way back from a failure. Mount it once, above the sections (see `TracfinDraftEditorProvider`):
 * the unsaved edits live in it, so they survive the sections that mount and unmount below.
 *
 * Rules (backend `applyChange`):
 * - one PATCH at a time; an edit made meanwhile waits for the next one, on the revision the server
 *   answered with;
 * - the PATCH is guarded by the revision the unsaved edits were made on, not by the latest one the
 *   cache holds: a draft that changed elsewhere meanwhile is a 409 and a comparison, never an
 *   overwrite;
 * - the answer is the whole draft; it replaces the cached one.
 */
export function useTracfinDraftEditor(
  caseId: string,
  { draft: currentDraft, catalogIndex }: { draft: TracfinDraft; catalogIndex: TracfinCatalogIndex },
): TracfinDraftEditor {
  const queryClient = useQueryClient();
  const draftQuery = useTracfinDraftQuery(caseId);
  const patch = useTracfinPatchDraftMutation(caseId);

  const [store] = useState(() => new PendingEditStore());
  const pendingEdits = useSyncExternalStore(store.subscribe, store.snapshot, store.snapshot);

  const [status, setStatusState] = useState<TracfinSaveStatus>('idle');
  const statusRef = useRef<TracfinSaveStatus>('idle');
  const [failure, setFailure] = useState<TracfinSaveFailure | null>(null);
  const failureRef = useRef<TracfinSaveFailure | null>(null);
  failureRef.current = failure;
  const [comparison, setComparison] = useState<TracfinComparison | null>(null);
  const failedStructural = useRef<StructuralOp[]>([]);
  const tail = useRef<Promise<unknown>>(Promise.resolve());

  const setStatus = useCallback((next: TracfinSaveStatus) => {
    statusRef.current = next;
    setStatusState(next);
  }, []);

  /** The freshest draft the cache holds (a save just finished may not have re-rendered us yet). */
  const latest = useCallback(
    (): TracfinDraft => queryClient.getQueryData<TracfinDraft | null>(tracfinKeys.draft(caseId)) ?? currentDraft,
    [queryClient, caseId, currentDraft],
  );

  const refetchRef = useRef(draftQuery.refetch);
  refetchRef.current = draftQuery.refetch;

  const markBase = () => {
    if (store.hasUnsaved()) {
      store.baseRevision ??= latest().revision;
    } else {
      store.baseRevision = null;
    }
  };

  // ---- edits -------------------------------------------------------------------------------------

  const applyOp = (target: EditTarget, op: PendingOp, options?: { invalid?: boolean; confirm?: boolean }) => {
    const root = latest().document.root;
    store.rebase(root);
    const block = normalizeAddress(root, target.block) ?? target.block;
    const resolved: EditTarget = { ...target, block };
    const serverBlock = resolveAddress(root, block);
    const serverValue = resolved.valueId
      ? ((serverBlock?.fields?.[resolved.fieldId] ?? []).find((value) => value.id === resolved.valueId) ?? null)
      : null;
    const planned = planEdit({ target: resolved, op, serverValue, ...options });
    if (planned) store.upsert(planned);
    else store.remove(pendingKey(resolved));
    // Emptying an owner drops the attribute edits that depended on it: the server deletes its attributes.
    const emptied = op.type === 'clear' || (op.type === 'set' && op.input.kind === 'text' && op.input.text === '');
    if (emptied && resolved.valueId) store.removeWhere((edit) => edit.parentValueId === resolved.valueId);
    markBase();
  };

  const discard = (key: string) => {
    store.remove(key);
    markBase();
    if (!store.hasUnsaved() && statusRef.current === 'failed' && failedStructural.current.length === 0) {
      setStatus('idle');
      setFailure(null);
    }
  };

  // ---- saving ------------------------------------------------------------------------------------

  const settle = (before: TracfinDraft, after: TracfinDraft, plan: NonNullable<ReturnType<typeof planPatch>>) => {
    const { valueIds } = reconcilePatch({ before, after, plan });
    const sentVersions = new Map(plan.sent.map((edit) => [edit.uid, edit.version]));
    const kept: PendingEdit[] = [];
    for (const entry of store.list()) {
      const sentVersion = sentVersions.get(entry.uid);
      const onRemoved =
        plan.removed.size > 0 &&
        (entry.block.kind === 'block' ? plan.removed.has(entry.block.id) : plan.removed.has(entry.block.anchorId));
      if (onRemoved) continue;
      if (sentVersion === undefined) {
        kept.push(entry);
        continue;
      }
      if (entry.version === sentVersion) continue; // saved
      // Edited while the PATCH was in flight: it now replaces the occurrence the server created.
      const createdId = valueIds.get(entry.key);
      const moved = createdId ? { ...entry, valueId: createdId, newKey: null } : entry;
      const block = normalizeAddress(after.document.root, moved.block) ?? moved.block;
      const target: EditTarget = { ...moved, block };
      const serverValue = target.valueId
        ? ((resolveAddress(after.document.root, block)?.fields?.[target.fieldId] ?? []).find(
            (value) => value.id === target.valueId,
          ) ?? null)
        : null;
      const replanned = planEdit({
        target,
        op: moved.op,
        serverValue,
        invalid: moved.invalid,
        confirm: moved.confirm,
      });
      if (replanned) kept.push({ ...replanned, uid: entry.uid, version: entry.version });
    }
    store.replaceAll(kept);
    store.rebase(after.document.root);
    store.baseRevision = store.hasUnsaved() ? after.revision : null;
  };

  const compare = async (): Promise<void> => {
    setComparison({ status: 'loading' });
    try {
      const result = await refetchRef.current();
      if (result.isError || !result.data) {
        setComparison({ status: 'failed' });
        return;
      }
      setComparison({ status: 'ready', server: result.data, items: compareWithServer(result.data, store.list()) });
    } catch {
      setComparison({ status: 'failed' });
    }
  };

  const fail = async (error: unknown, expected: number): Promise<TracfinResult<TracfinDraft>> => {
    const api = toApiError(error);
    const classified = classifySaveFailure(api);
    setFailure(classified);
    if (classified.kind === 'conflict') {
      setStatus('conflict');
      return { ok: false, error: api };
    }
    setStatus('failed');
    if (classified.kind === 'unavailable') {
      // The outcome is uncertain: the draft may have moved (or even have taken the PATCH).
      try {
        const reread = await refetchRef.current();
        if (!reread.isError && reread.data && reread.data.revision > expected) {
          setFailure({ kind: 'conflict' });
          setStatus('conflict');
          setComparison({
            status: 'ready',
            server: reread.data,
            items: compareWithServer(reread.data, store.list()),
          });
        }
      } catch {
        // The draft could not be read either: the retry stays on offer.
      }
    }
    return { ok: false, error: api };
  };

  const run = async (
    structural: StructuralOp[],
    auto: boolean,
    quiet: boolean,
  ): Promise<TracfinResult<TracfinDraft>> => {
    if (statusRef.current === 'conflict') return { ok: false, error: conflictError };
    // An automatic save does not repeat a request that just failed: the analyst decides (retry, discard).
    if (auto && statusRef.current === 'failed') return ok(latest());
    const before = latest();
    store.rebase(before.document.root);
    const plan = planPatch({ draft: before, pending: store.list().filter(isSendable), structural });
    if (!plan) return ok(before);
    const expected = store.baseRevision ?? before.revision;
    // What a quiet refusal gives back: an earlier failure (banner, retry) is not this request's to clear.
    const previous = { status: statusRef.current, failure: failureRef.current, structural: failedStructural.current };
    setStatus('saving');
    try {
      const after = await patch.mutateAsync({ expected_revision: expected, changes: plan.changes });
      settle(before, after, plan);
      failedStructural.current = [];
      setFailure(null);
      setStatus('idle');
      return ok(after);
    } catch (error) {
      if (quiet) {
        const api = toApiError(error);
        const refused = api.kind === 'bad_request' || api.kind === 'conflict';
        const appliedNothing = api.kind === 'forbidden' || api.kind === 'not_found' || api.kind === 'too_large';
        if (refused || appliedNothing) {
          failedStructural.current = previous.structural;
          setFailure(previous.failure);
          setStatus(previous.status);
          if (refused) {
            try {
              await refetchRef.current();
            } catch {
              // The caller re-reads what it needs; the draft query reports its own failure.
            }
          }
          return { ok: false, error: api };
        }
      }
      failedStructural.current = structural;
      return fail(error, expected);
    }
  };

  /** One PATCH at a time: a call waits for the one in flight and then looks at what is pending. */
  const enqueue = (structural: StructuralOp[], auto = false, quiet = false): Promise<TracfinResult<TracfinDraft>> => {
    const result = tail.current.then(() => run(structural, auto, quiet));
    tail.current = result.catch(() => undefined);
    return result;
  };

  const flush = () => enqueue([]);
  const autoFlush = () => enqueue([], true);

  // ---- reading -----------------------------------------------------------------------------------

  const pendingIndex = useMemo(
    () => new PendingIndex(pendingEdits, currentDraft.document.root),
    [pendingEdits, currentDraft],
  );

  const unsavedEdits = useMemo(() => pendingEdits.filter(isUnsaved), [pendingEdits]);

  return {
    caseId,
    draft: currentDraft,
    catalogIndex,
    pendingEdits: unsavedEdits,
    pendingCount: unsavedEdits.length,
    hasPendingChanges: unsavedEdits.length > 0,
    hasUnsavedEdits: () => store.hasUnsaved(),
    status,
    failure,
    comparison,
    flush,
    autoFlush,
    retry: () => enqueue(failedStructural.current),

    blockAt: (address) => resolveAddress(currentDraft.document.root, address),
    occurrences: ({ address, fieldId, parentValueId = null, single }) => {
      const normalized = normalizeAddress(currentDraft.document.root, address) ?? address;
      return occurrencesOf({
        block: normalized.kind === 'block' ? findBlock(currentDraft.document.root, normalized.id) : null,
        address: normalized,
        fieldId,
        parentValueId,
        pending: pendingIndex.forField(normalized, fieldId, parentValueId),
        single,
      });
    },
    /** Fields the catalog expects (`min >= 1`) that are still empty in a section; an indication, never a blocker. */
    missingExpected: (section) => {
      const scope = tracfinSectionScopes[section];
      return scope ? countMissingExpected({ catalogIndex, draft: currentDraft, pending: pendingIndex, scope }) : 0;
    },

    setField: (target, input) => applyOp(target, { type: 'set', input }),
    clearField: (target) => applyOp(target, { type: 'clear' }),
    setInvalidDecimal: (target, text) =>
      applyOp(target, { type: 'set', input: { kind: 'decimal', decimal: text } }, { invalid: true }),
    addOccurrence: ({ address, fieldId, parentValueId = null }) => {
      const target: EditTarget = {
        block: address,
        fieldId,
        parentValueId,
        valueId: null,
        newKey: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      };
      applyOp(target, { type: 'blank' });
    },
    confirm: (occurrence) => {
      const value = occurrence.server;
      if (!value) return null;
      const input = inputOfValue(value);
      applyOp(occurrence.target, input ? { type: 'set', input } : { type: 'clear' }, { confirm: true });
      return flush();
    },
    discard,

    addBlock: (parent, catalogId) => enqueue([{ type: 'add_block', parent, catalogId }]),
    removeBlock: (blockId) => enqueue([{ type: 'remove_block', blockId }]),
    applyStructural: (ops, options) => enqueue([...ops], false, options?.quiet ?? false),
    setSelection: (block, selection) => enqueue([{ type: 'set_selection', block, selection }]),
    refreshConfiguration: () => enqueue([{ type: 'refresh_configuration' }]),

    reloadAndCompare: compare,
    reapply: async () => {
      if (comparison?.status !== 'ready') return null;
      const server = comparison.server;
      const byUid = new Map(compareWithServer(server, store.list()).map((item) => [item.edit.uid, item.status]));
      const next: PendingEdit[] = [];
      for (const edit of store.list()) {
        const itemStatus = byUid.get(edit.uid);
        if (itemStatus === 'identical') continue; // the server already has it
        next.push(itemStatus === 'orphan' ? { ...edit, orphaned: true } : { ...edit, orphaned: false });
      }
      store.replaceAll(next);
      store.rebase(server.document.root);
      store.baseRevision = server.revision;
      setComparison(null);
      setFailure(null);
      setStatus('idle');
      return flush();
    },
    discardAll: () => {
      store.clear();
      failedStructural.current = [];
      setComparison(null);
      setFailure(null);
      setStatus('idle');
    },
  };
}
