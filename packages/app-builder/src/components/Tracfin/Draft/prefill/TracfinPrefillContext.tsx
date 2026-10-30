import { useTracfinPrefillMutation } from '@app-builder/queries/tracfin/prefill-draft';
import { createContext, type ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useTracfinDraftEditorContext } from '../editor/TracfinDraftEditorContext';
import { TracfinBlockDiagnosticsContext } from '../fields/block-diagnostics';
import { toApiError } from '../model/save-failure';
import type { TracfinSectionId } from '../model/sections';
import {
  buildApplyOps,
  groupPrefill,
  isPrefillStale,
  normalizePrefill,
  type PrefillAvailability,
  type PrefillChoice,
  type PrefillGroups,
  type PrefillResultView,
  prefillAvailability,
  tagDiagnostics,
} from './prefill-model';

export type PrefillStatus = 'idle' | 'running' | 'applying';

/** What the last action leaves the analyst to read. */
export type PrefillNotice =
  | { kind: 'applied'; count: number }
  /** The server refused the choices (400 / 409): the proposals were recomputed. */
  | { kind: 'refused'; message: string | null }
  /** The draft moved after the proposals were computed: nothing was sent. */
  | { kind: 'moved' }
  | { kind: 'save_failed'; message: string | null }
  | { kind: 'failed'; message: string | null };

export type TracfinPrefill = {
  open: boolean;
  /** The section the panel was opened from; `null` for the whole draft. */
  scope: TracfinSectionId | null;
  /** « Proposer des valeurs »: opens the panel and computes the proposals of the saved draft. */
  propose: (scope?: TracfinSectionId | null) => void;
  openPanel: (scope?: TracfinSectionId | null) => void;
  closePanel: () => void;
  status: PrefillStatus;
  notice: PrefillNotice | null;
  availability: PrefillAvailability;
  /** The last result (kept until the next one), with its revision. */
  result: PrefillResultView | null;
  /** The draft has moved past `result.draftRevision`: « à recalculer ». */
  stale: boolean;
  groups: PrefillGroups | null;
  /** Non-conflicting proposals the analyst unchecked. */
  excluded: ReadonlySet<string>;
  toggleExcluded: (proposalId: string) => void;
  /** Recomputes the proposals: pending edits are saved first, the prefill runs on the saved revision. */
  run: () => Promise<void>;
  /** Applies choices in ONE PATCH of `apply_prefill` changes, on the revision the proposals were computed for. */
  apply: (choices: readonly PrefillChoice[]) => Promise<void>;
};

const TracfinPrefillContext = createContext<TracfinPrefill | null>(null);

export function useTracfinPrefill(): TracfinPrefill {
  const prefill = useContext(TracfinPrefillContext);
  if (!prefill) throw new Error('useTracfinPrefill must be used inside TracfinPrefillProvider');
  return prefill;
}

/**
 * Keeps the prefill of the draft page: the last result with the revision it was computed on, the
 * panel state and the shared diagnostics the blocks display (flagged stale once the draft moves on).
 * Prefill never writes by itself: values only change through `apply`, which the analyst triggers.
 */
export function TracfinPrefillProvider({ children }: { children: ReactNode }) {
  const editor = useTracfinDraftEditorContext();
  const prefillMutation = useTracfinPrefillMutation(editor.caseId);

  const [open, setOpen] = useState(false);
  const [scope, setScope] = useState<TracfinSectionId | null>(null);
  const [status, setStatus] = useState<PrefillStatus>('idle');
  const [notice, setNotice] = useState<PrefillNotice | null>(null);
  const [result, setResult] = useState<PrefillResultView | null>(null);
  const [excluded, setExcluded] = useState<ReadonlySet<string>>(new Set());

  const editorRef = useRef(editor);
  editorRef.current = editor;
  const resultRef = useRef(result);
  resultRef.current = result;
  const sequence = useRef(0);

  const availability = prefillAvailability(editor.draft);
  const stale = isPrefillStale(result, editor.draft.revision);

  const groups = useMemo(
    () =>
      result ? groupPrefill({ result, root: editor.draft.document.root, catalogIndex: editor.catalogIndex }) : null,
    [result, editor.draft.document.root, editor.catalogIndex],
  );
  const diagnostics = useMemo(() => tagDiagnostics(result, editor.draft.revision), [result, editor.draft.revision]);

  const compute = useCallback(
    async (keepNotice: boolean) => {
      const mine = ++sequence.current;
      setStatus('running');
      if (!keepNotice) setNotice(null);
      // The prefill reads the SAVED draft: unsent edits go first, and it runs on the revision that results.
      const saved = await editorRef.current.flush();
      if (!saved.ok) {
        setNotice({ kind: 'save_failed', message: saved.error.message });
        setStatus('idle');
        return;
      }
      try {
        const raw = await prefillMutation.mutateAsync({ expected_revision: saved.data.revision });
        if (mine === sequence.current) {
          setResult(normalizePrefill(raw));
          setExcluded(new Set());
        }
      } catch (error) {
        if (mine === sequence.current) setNotice({ kind: 'failed', message: toApiError(error).message });
      }
      if (mine === sequence.current) setStatus('idle');
    },
    [prefillMutation],
  );

  const run = useCallback(() => compute(false), [compute]);

  const apply = useCallback(
    async (choices: readonly PrefillChoice[]) => {
      const current = resultRef.current;
      if (!current || choices.length === 0) return;
      setStatus('applying');
      setNotice(null);
      // Edits made since the proposals were computed are saved first; if that moves the revision the
      // server would refuse the choices, so nothing is sent and the proposals are to be recomputed.
      const saved = await editorRef.current.flush();
      if (!saved.ok) {
        setNotice({ kind: 'save_failed', message: saved.error.message });
        setStatus('idle');
        return;
      }
      if (saved.data.revision !== current.draftRevision) {
        setNotice({ kind: 'moved' });
        setStatus('idle');
        return;
      }
      const applied = await editorRef.current.applyStructural(buildApplyOps(choices, current.mappingVersion), {
        quiet: true,
      });
      if (applied.ok) {
        setNotice({ kind: 'applied', count: choices.length });
        await compute(true);
        return;
      }
      if (applied.error.kind === 'bad_request' || applied.error.kind === 'conflict') {
        // A stale or forged choice: the server recomputed the proposals and found it wrong.
        setNotice({ kind: 'refused', message: applied.error.message });
        await compute(true);
        return;
      }
      setNotice({ kind: 'failed', message: applied.error.message });
      setStatus('idle');
    },
    [compute],
  );

  const openPanel = useCallback((next: TracfinSectionId | null = null) => {
    setScope(next);
    setOpen(true);
  }, []);

  const propose = useCallback(
    (next: TracfinSectionId | null = null) => {
      openPanel(next);
      // Without a configuration there is nothing to compute: the panel says so.
      if (prefillAvailability(editorRef.current.draft) === 'available') void compute(false);
    },
    [openPanel, compute],
  );

  const value: TracfinPrefill = {
    open,
    scope,
    propose,
    openPanel,
    closePanel: () => setOpen(false),
    status,
    notice,
    availability,
    result,
    stale,
    groups,
    excluded,
    toggleExcluded: (proposalId) =>
      setExcluded((previous) => {
        const next = new Set(previous);
        if (!next.delete(proposalId)) next.add(proposalId);
        return next;
      }),
    run,
    apply,
  };

  return (
    <TracfinPrefillContext.Provider value={value}>
      <TracfinBlockDiagnosticsContext.Provider value={diagnostics}>{children}</TracfinBlockDiagnosticsContext.Provider>
    </TracfinPrefillContext.Provider>
  );
}
