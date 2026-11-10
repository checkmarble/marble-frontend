import { SCREENING_REVIEW_UNDO_DELAY_MS } from '@app-builder/models/screening-review';
import { useFormatLanguage } from '@app-builder/utils/format';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Button, Kbd } from 'ui-design-system';

export interface PendingDecisionWriteOptions {
  /** Set when the page is going away, so the request outlives it. */
  keepalive: boolean;
}

export interface PendingDecision {
  /** Shown in the undo toast. */
  message: string;
  /** Restores the screen as it was before the decision. Nothing was written yet. */
  undo: () => void;
  /** Writes the decision. Handles its own failures, so it never rejects. */
  write: (options: PendingDecisionWriteOptions) => Promise<void>;
}

const UNDO_TOAST_ID = 'screening-review-undo';

/**
 * Holds at most one decision for the undo delay, then writes it. A new decision, `flush`, the page
 * unmounting and `pagehide` write it early. `undo` drops it without writing.
 */
export function usePendingDecision({ undoLabel }: { undoLabel: string }) {
  const pendingRef = useRef<PendingDecision>(undefined);
  const timerRef = useRef<number>(undefined);
  const [pending, setPending] = useState(false);
  const language = useFormatLanguage();

  const take = useCallback(() => {
    window.clearTimeout(timerRef.current);
    const current = pendingRef.current;
    pendingRef.current = undefined;
    if (current) {
      setPending(false);
      toast.dismiss(UNDO_TOAST_ID);
    }
    return current;
  }, []);

  const flush = useCallback(
    (options: PendingDecisionWriteOptions = { keepalive: false }) => take()?.write(options) ?? Promise.resolve(),
    [take],
  );

  const undo = useCallback(() => take()?.undo(), [take]);

  const schedule = (decision: PendingDecision) => {
    void flush();
    pendingRef.current = decision;
    setPending(true);
    timerRef.current = window.setTimeout(() => void flush(), SCREENING_REVIEW_UNDO_DELAY_MS);
    const deadline = Date.now() + SCREENING_REVIEW_UNDO_DELAY_MS;
    // The timer above decides when the write happens, so the toast doesn't expire on its own.
    toast(
      <UndoToast
        message={decision.message}
        deadline={deadline}
        language={language}
        undoLabel={undoLabel}
        onUndo={undo}
      />,
      {
        id: UNDO_TOAST_ID,
        duration: Number.POSITIVE_INFINITY,
      },
    );
  };

  useEffect(() => {
    // `pagehide` rather than `visibilitychange`: switching tabs keeps the undo window open.
    const onPageHide = () => void flush({ keepalive: true });
    window.addEventListener('pagehide', onPageHide);
    return () => {
      window.removeEventListener('pagehide', onPageHide);
      void flush();
    };
  }, [flush]);

  return { pending, schedule, flush, undo };
}

function UndoToast({
  message,
  deadline,
  language,
  undoLabel,
  onUndo,
}: {
  message: string;
  deadline: number;
  language: string;
  undoLabel: string;
  onUndo: () => void;
}) {
  return (
    <span className="flex items-center gap-sm">
      <span>{message}</span>
      <Countdown deadline={deadline} language={language} />
      <Button variant="secondary" size="small" onClick={onUndo}>
        {undoLabel}
        <Kbd variant="small">U</Kbd>
      </Button>
    </span>
  );
}

/** Seconds left before the write. Hidden from screen readers, which would read it every second. */
function Countdown({ deadline, language }: { deadline: number; language: string }) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(interval);
  }, []);
  const seconds = Math.max(0, Math.ceil((deadline - now) / 1_000));
  return (
    <span aria-hidden className="text-grey-secondary tabular-nums" data-undo-countdown>
      {new Intl.NumberFormat(language, { style: 'unit', unit: 'second', unitDisplay: 'narrow' }).format(seconds)}
    </span>
  );
}

interface PendingDecisionContextValue {
  pending: boolean;
  flush: () => Promise<void>;
}

const PendingDecisionContext = createContext<PendingDecisionContextValue>({
  pending: false,
  flush: () => Promise.resolve(),
});

export const PendingDecisionProvider = PendingDecisionContext.Provider;

/** Writes the pending decision now. Call it before any other write on the page. */
export function useFlushPendingDecision() {
  return useContext(PendingDecisionContext).flush;
}

/**
 * Opens a page in a new tab once `write` is done, so the page isn't out of date. The tab opens right
 * away, while the click still allows popups.
 */
export function openInNewTabAfter(href: string, write: () => Promise<void>) {
  const tab = window.open('', '_blank');
  void write().then(() => {
    if (!tab) return;
    tab.opener = null;
    tab.location.href = href;
  });
}

/**
 * Opens a case in a new tab after writing the pending decision. Returns false when nothing is pending,
 * so a link can keep its default behavior.
 */
export function useOpenCaseInNewTab() {
  const { pending, flush } = useContext(PendingDecisionContext);
  return (href: string) => {
    if (!pending) return false;
    openInNewTabAfter(href, flush);
    return true;
  };
}

/** Runs `write` on every item: up to `limit` cases at once, and one item at a time within a case. */
export async function runByCase<T extends { caseId: string }, R>(
  items: readonly T[],
  write: (item: T) => Promise<R>,
  limit: number,
): Promise<Map<T, PromiseSettledResult<R>>> {
  const byCase = new Map<string, T[]>();
  for (const item of items) byCase.set(item.caseId, [...(byCase.get(item.caseId) ?? []), item]);
  const queues = [...byCase.values()];
  const results = new Map<T, PromiseSettledResult<R>>();
  const worker = async () => {
    for (let queue = queues.shift(); queue; queue = queues.shift()) {
      for (const item of queue) {
        try {
          results.set(item, { status: 'fulfilled', value: await write(item) });
        } catch (reason) {
          results.set(item, { status: 'rejected', reason });
        }
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, queues.length) }, worker));
  return results;
}
