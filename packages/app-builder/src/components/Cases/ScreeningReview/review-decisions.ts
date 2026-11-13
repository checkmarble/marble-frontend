import {
  applyScreeningReviewSession,
  emptyScreeningReviewSession,
  groupScreeningReviewItems,
  isListedInScreeningReviewSession,
  nextPendingScreeningReviewItem,
  SCREENING_REVIEW_HIDE_DELAY_MS,
  type ScreeningReviewDecision,
  type ScreeningReviewItem,
  type ScreeningReviewSession,
} from '@app-builder/models/screening-review';
import { useScreeningReviewDecisionMutation } from '@app-builder/queries/cases/screening-review-decision';
import type {
  ScreeningReviewDecisionResult,
  ScreeningReviewRejection,
} from '@app-builder/services/screening-review-decision';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import type { ScreeningReviewDraft } from './ActionDock';
import { type BatchSelection, emptyBatchSelection, withRestored } from './batch-selection';
import { usePendingDecision } from './pending-decision';

export type ScreeningReviewNotice =
  | { reason: ScreeningReviewRejection | 'decision_failed' }
  | { reason: 'batch_failed'; count: number };

type ScreeningReviewWriteSuccess = Extract<ScreeningReviewDecisionResult, { ok: true }>;

const EMPTY_DRAFT: ScreeningReviewDraft = { comment: '' };

function withDecided(
  session: ScreeningReviewSession,
  entries: readonly (readonly [ScreeningReviewItem, string | undefined])[],
  decision: ScreeningReviewDecision,
): ScreeningReviewSession {
  const decided = { ...session.decided };
  for (const [item, comment] of entries) {
    decided[item.id] = { item, decision, ...(comment ? { comment } : {}), written: false };
  }
  return { ...session, decided };
}

function withoutDecided(session: ScreeningReviewSession, ids: readonly string[]): ScreeningReviewSession {
  const decided = { ...session.decided };
  for (const id of ids) delete decided[id];
  return { ...session, decided };
}

/**
 * The decisions made on this page. A decision shows at once, stays undoable for the undo delay, then
 * writes. Undo and failed writes bring back the hit with its draft, or the selected hits with their
 * comments, beside whatever changed since, so one restore never erases another.
 *
 * `onNavigate` moves the cursor to a hit: the next pending one after a decision, or back to a hit
 * that needs the analyst again.
 */
export function useReviewDecisions({
  serverItems,
  hasMore,
  onNavigate,
}: {
  serverItems: readonly ScreeningReviewItem[];
  hasMore: boolean;
  onNavigate: (itemId: string) => void;
}) {
  const { t } = useTranslation(['cases']);
  const queryClient = useQueryClient();
  const decisionMutation = useScreeningReviewDecisionMutation();
  const pendingDecision = usePendingDecision({ undoLabel: t('cases:screening_review.undo.action') });
  const [session, setSession] = useState<ScreeningReviewSession>(emptyScreeningReviewSession);
  const [drafts, setDrafts] = useState<Readonly<Record<string, ScreeningReviewDraft>>>({});
  const [selection, setSelection] = useState<BatchSelection>(emptyBatchSelection);
  const [notice, setNotice] = useState<ScreeningReviewNotice>();
  const sessionRef = useRef(session);
  const hideTimers = useRef<number[]>([]);
  // A write finishing after a page change or unmount must not touch the screen.
  const generationRef = useRef(0);
  // The latest values, read when a delayed write completes.
  const latest = useRef({ serverItems, hasMore, onNavigate });
  useEffect(() => {
    latest.current = { serverItems, hasMore, onNavigate };
  });
  useEffect(
    () => () => {
      hideTimers.current.forEach((timer) => window.clearTimeout(timer));
      generationRef.current += 1;
    },
    [],
  );

  const updateSession = (update: (current: ScreeningReviewSession) => ScreeningReviewSession) => {
    sessionRef.current = update(sessionRef.current);
    setSession(sessionRef.current);
    return sessionRef.current;
  };
  const setDraft = (itemId: string, draft: ScreeningReviewDraft | undefined) =>
    setDrafts(({ [itemId]: _, ...others }) => (draft ? { ...others, [itemId]: draft } : others));
  const isCurrentGeneration = () => {
    const generation = generationRef.current;
    return () => generation === generationRef.current;
  };
  const navigate = (itemId: string) => latest.current.onNavigate(itemId);
  const refreshPage = () => queryClient.invalidateQueries({ queryKey: ['cases', 'screening-review'] });

  /** After a decision, open the next pending hit, read from the latest server data. */
  const openNextPending = (fromId: string, next: ScreeningReviewSession) => {
    const nextGroups = groupScreeningReviewItems(
      applyScreeningReviewSession(latest.current.serverItems, next),
      latest.current.hasMore,
      (other) => isListedInScreeningReviewSession(other, next),
    );
    const nextItem = nextPendingScreeningReviewItem(nextGroups, fromId);
    if (nextItem) navigate(nextItem.id);
  };

  const writeDecision = async (
    item: ScreeningReviewItem,
    decision: ScreeningReviewDecision,
    comment: string | undefined,
    keepalive: boolean,
    isCurrent: () => boolean,
  ) => {
    const result = await decisionMutation.mutateAsync({
      input: {
        caseId: item.caseId,
        screeningId: item.screeningId,
        matchId: item.matchId,
        status: decision,
        ...(comment ? { comment } : {}),
      },
      keepalive,
    });
    // Apply the outcome before this case's next queued request starts. Waiting for an entire batch
    // could let a slower case make its older results overwrite a newer decision on another case.
    if (result?.ok && isCurrent()) markWritten([[item, result]]);
    return result;
  };

  /** Keeps written decisions, and starts hiding the cases they closed. */
  const markWritten = (written: readonly (readonly [ScreeningReviewItem, ScreeningReviewWriteSuccess])[]) => {
    if (!written.length) return;
    updateSession((current) => {
      const decided = { ...current.decided };
      const screenings = { ...current.screenings };
      for (const [item, result] of written) {
        const entry = decided[item.id];
        if (entry) decided[item.id] = { ...entry, written: true };
        screenings[item.screeningId] = {
          status: result.screeningStatus ?? item.screeningStatus,
          caseClosed: result.caseClosed,
        };
      }
      return { ...current, decided, screenings };
    });
    const closedCases = new Set(written.filter(([, result]) => result.caseClosed).map(([item]) => item.caseId));
    for (const caseId of closedCases) {
      hideTimers.current.push(
        window.setTimeout(
          () => updateSession((current) => ({ ...current, hiddenCases: [...current.hiddenCases, caseId] })),
          SCREENING_REVIEW_HIDE_DELAY_MS,
        ),
      );
    }
  };

  /** Records the drafted decision on `item`. */
  const submit = (item: ScreeningReviewItem) => {
    const draftBefore = drafts[item.id];
    const decision = draftBefore?.decision;
    if (!draftBefore || !decision) return;
    const comment = draftBefore.comment.trim() || undefined;
    const isCurrent = isCurrentGeneration();
    const restore = () => {
      updateSession((current) => withoutDecided(current, [item.id]));
      setDraft(item.id, draftBefore);
    };
    setNotice(undefined);
    setDraft(item.id, undefined);
    openNextPending(
      item.id,
      updateSession((current) => withDecided(current, [[item, comment]], decision)),
    );
    pendingDecision.schedule({
      message: t('cases:screening_review.undo.decided', {
        decision: t(`cases:screening_review.decision.${decision}`),
      }),
      undo: () => {
        if (!isCurrent()) return;
        restore();
        navigate(item.id);
      },
      write: async (writeItems) => {
        const outcome = (
          await writeItems([item], (_, { keepalive }) => writeDecision(item, decision, comment, keepalive, isCurrent))
        ).get(item)!;
        if (outcome.status === 'rejected') {
          if (!isCurrent()) {
            toast.error(t('cases:screening_review.decision_failed'));
            return;
          }
          // Back to the hit with its decision and comment, so the analyst can try again.
          restore();
          setNotice({ reason: 'decision_failed' });
          navigate(item.id);
          return;
        }
        const result = outcome.value;
        // A redirect already navigates away.
        if (!result) return;
        void refreshPage();
        if (!isCurrent()) {
          if (!result.ok) toast.error(t(`cases:screening_review.rejection.${result.reason}`));
          return;
        }
        if (!result.ok) {
          // Show what changed, then return to the server's state.
          updateSession((current) => withoutDecided(current, [item.id]));
          setNotice({ reason: result.reason });
          navigate(item.id);
          return;
        }
      },
    });
  };

  /** Records No hit on `items` with their selected comments. `activeId` moves on if it is one of them. */
  const submitBatch = (items: readonly ScreeningReviewItem[], activeId: string | undefined) => {
    if (!items.length) return;
    const comments: BatchSelection = new Map(items.map((item) => [item.id, selection.get(item.id) ?? '']));
    const commentOf = (item: ScreeningReviewItem) => comments.get(item.id)?.trim() || undefined;
    const selectionBefore = selection;
    const isCurrent = isCurrentGeneration();
    setNotice(undefined);
    setSelection(emptyBatchSelection);
    const next = updateSession((current) =>
      withDecided(
        current,
        items.map((item) => [item, commentOf(item)]),
        'no_hit',
      ),
    );
    if (activeId && items.some((item) => item.id === activeId)) openNextPending(activeId, next);
    pendingDecision.schedule({
      message: t('cases:screening_review.undo.batch_decided', { count: items.length }),
      undo: () => {
        if (!isCurrent()) return;
        updateSession((current) =>
          withoutDecided(
            current,
            items.map((item) => item.id),
          ),
        );
        setSelection((current) => withRestored(current, selectionBefore));
      },
      write: async (writeItems) => {
        const results = await writeItems(items, (item, { keepalive }) =>
          writeDecision(item, 'no_hit', commentOf(item), keepalive, isCurrent),
        );
        const failed: ScreeningReviewItem[] = [];
        for (const item of items) {
          const outcome = results.get(item);
          // A redirect already navigates away.
          if (outcome?.status === 'fulfilled' && !outcome.value) return;
          if (outcome?.status !== 'fulfilled' || !outcome.value?.ok) failed.push(item);
        }
        void refreshPage();
        if (!isCurrent()) {
          if (failed.length) toast.error(t('cases:screening_review.batch.failed', { count: failed.length }));
          return;
        }
        if (!failed.length) return;
        // Failed hits are selected again with their comment, so the analyst can try again.
        const failedIds = failed.map((item) => item.id);
        updateSession((current) => withoutDecided(current, failedIds));
        setSelection((current) =>
          withRestored(current, new Map(failedIds.map((id) => [id, comments.get(id) ?? ''] as const))),
        );
        setNotice({ reason: 'batch_failed', count: failed.length });
        navigate(failedIds[0]!);
      },
    });
  };

  /** Decisions belong to the page they were made on. A pending one is written first. */
  const reset = () => {
    void pendingDecision.flush();
    generationRef.current += 1;
    hideTimers.current.forEach((timer) => window.clearTimeout(timer));
    hideTimers.current = [];
    sessionRef.current = emptyScreeningReviewSession;
    setSession(emptyScreeningReviewSession);
    setDrafts({});
    setNotice(undefined);
    setSelection(emptyBatchSelection);
  };

  return {
    session,
    notice,
    clearNotice: () => setNotice(undefined),
    draftFor: (itemId: string | undefined) => (itemId ? drafts[itemId] : undefined) ?? EMPTY_DRAFT,
    changeDraft: (itemId: string, next: Partial<ScreeningReviewDraft>) =>
      setDrafts((current) => ({ ...current, [itemId]: { ...(current[itemId] ?? EMPTY_DRAFT), ...next } })),
    selection,
    setSelection,
    submit,
    submitBatch,
    reset,
    refreshPage,
    pendingDecision,
  };
}
