import { SCREENING_REVIEW_UNDO_DELAY_MS } from '@app-builder/models/screening-review';
import { useFormatLanguage } from '@app-builder/utils/format';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Button, Kbd } from 'ui-design-system';

export interface WriteOptions {
  /** Set when the request starts while the page goes away, so it can outlive the page. */
  keepalive: boolean;
}

/** Writes every item through the page's write queue. Settles every item and never rejects. */
export type WriteItems = <T extends { caseId: string }, R>(
  items: readonly T[],
  write: (item: T, options: WriteOptions) => Promise<R>,
) => Promise<Map<T, PromiseSettledResult<R>>>;

export interface PendingDecision {
  /** Shown in the undo toast. */
  message: string;
  /** Restores the screen as it was before the decision. Nothing was written yet. */
  undo: () => void;
  /** Writes the decision with `writeItems`, then applies the outcome. Handles its own failures. */
  write: (writeItems: WriteItems) => Promise<void>;
}

/** Cases written at once. */
const WRITE_CASE_CONCURRENCY = 3;

/**
 * Writes up to `limit` cases at once and the items of one case one at a time, in the order they
 * were queued, across every `run`: a single decision never overtakes an earlier batch on its case.
 *
 * `unload` starts every queued item at once with keepalive, since a queued request would never start
 * once the page is gone. That gives up the order within a case. Items already running can't be
 * switched to keepalive: they finish or not with the page.
 */
export function createCaseWriteQueue(limit: number) {
  interface Task {
    caseId: string;
    start: (options: WriteOptions) => Promise<void>;
  }
  const waiting: Task[] = [];
  const running = new Map<string, number>();
  let unloading = false;

  const startTask = (task: Task) => {
    running.set(task.caseId, (running.get(task.caseId) ?? 0) + 1);
    void task.start({ keepalive: unloading }).then(() => {
      const count = (running.get(task.caseId) ?? 1) - 1;
      if (count) running.set(task.caseId, count);
      else running.delete(task.caseId);
      pump();
    });
  };

  const pump = () => {
    const blocked = new Set<string>();
    for (const task of [...waiting]) {
      const ready = unloading || (running.size < limit && !running.has(task.caseId) && !blocked.has(task.caseId));
      if (!ready) {
        // Later items of this case wait behind this one.
        blocked.add(task.caseId);
        continue;
      }
      waiting.splice(waiting.indexOf(task), 1);
      startTask(task);
    }
  };

  const run = async <T extends { caseId: string }, R>(
    items: readonly T[],
    write: (item: T, options: WriteOptions) => Promise<R>,
  ) => {
    const settled = items.map(
      (item) =>
        new Promise<PromiseSettledResult<R>>((resolve) => {
          waiting.push({
            caseId: item.caseId,
            start: async (options) => {
              try {
                resolve({ status: 'fulfilled', value: await write(item, options) });
              } catch (reason) {
                resolve({ status: 'rejected', reason });
              }
            },
          });
        }),
    );
    pump();
    const results = await Promise.all(settled);
    return new Map(items.map((item, index) => [item, results[index]!]));
  };

  return {
    run: run satisfies WriteItems,
    unload: () => {
      unloading = true;
      pump();
    },
    /** The page is back from the back-forward cache. */
    resume: () => {
      unloading = false;
      pump();
    },
  };
}

const UNDO_TOAST_ID = 'screening-review-undo';

/**
 * Holds at most one undoable decision for the undo delay, then writes it. A new decision, `flush`,
 * the page unmounting and `pagehide` write it early. `undo` drops it without writing.
 *
 * Writes outlive the undo window: `flush` resolves once the undoable decision and every write
 * already started have settled, outcome included.
 */
export function usePendingDecision({ undoLabel }: { undoLabel: string }) {
  const undoableRef = useRef<PendingDecision>(undefined);
  const timerRef = useRef<number>(undefined);
  const outstandingRef = useRef(new Set<Promise<void>>());
  const [queue] = useState(() => createCaseWriteQueue(WRITE_CASE_CONCURRENCY));
  const [undoable, setUndoable] = useState(false);
  const language = useFormatLanguage();

  const take = useCallback(() => {
    window.clearTimeout(timerRef.current);
    const current = undoableRef.current;
    undoableRef.current = undefined;
    if (current) {
      setUndoable(false);
      toast.dismiss(UNDO_TOAST_ID);
    }
    return current;
  }, []);

  const flush = useCallback(async () => {
    const decision = take();
    if (decision) {
      const outstanding = outstandingRef.current;
      const write = decision.write(queue.run).finally(() => outstanding.delete(write));
      outstanding.add(write);
    }
    await Promise.allSettled([...outstandingRef.current]);
  }, [take, queue]);

  const undo = useCallback(() => take()?.undo(), [take]);

  /** True while a decision can be undone or is still being written. */
  const hasUnsaved = useCallback(() => !!undoableRef.current || outstandingRef.current.size > 0, []);

  const schedule = (decision: PendingDecision) => {
    void flush();
    undoableRef.current = decision;
    setUndoable(true);
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
    const onPageHide = () => {
      queue.unload();
      void flush();
    };
    window.addEventListener('pagehide', onPageHide);
    window.addEventListener('pageshow', queue.resume);
    return () => {
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('pageshow', queue.resume);
      void flush();
    };
  }, [flush, queue]);

  return { undoable, schedule, flush, undo, hasUnsaved };
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
  hasUnsaved: () => boolean;
  flush: () => Promise<void>;
}

const PendingDecisionContext = createContext<PendingDecisionContextValue>({
  hasUnsaved: () => false,
  flush: () => Promise.resolve(),
});

export function PendingDecisionProvider({
  hasUnsaved,
  flush,
  children,
}: PendingDecisionContextValue & { children: React.ReactNode }) {
  const value = useMemo(() => ({ hasUnsaved, flush }), [hasUnsaved, flush]);
  return <PendingDecisionContext.Provider value={value}>{children}</PendingDecisionContext.Provider>;
}

/** Writes the pending decision and waits for every write in flight. Call it before any other write. */
export function useFlushPendingDecision() {
  return useContext(PendingDecisionContext).flush;
}

/**
 * Opens a page in a new tab once `write` is done, so the page isn't out of date. The tab opens right
 * away, while the click still allows popups.
 */
export function openInNewTabAfter(href: string, write: () => Promise<void>) {
  const tab = window.open('', '_blank');
  const go = () => {
    if (!tab) return;
    tab.opener = null;
    tab.location.href = href;
  };
  void write().then(go, go);
}

/**
 * Opens a case in a new tab after the decisions on screen are written. Returns false when everything
 * is written, so a link can keep its default behavior.
 */
export function useOpenCaseInNewTab() {
  const { hasUnsaved, flush } = useContext(PendingDecisionContext);
  return (href: string) => {
    if (!hasUnsaved()) return false;
    openInNewTabAfter(href, flush);
    return true;
  };
}
