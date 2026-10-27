import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TracfinSectionId } from '../model/sections';
import { findFocusElement, focusFirstControl, highlight, type TracfinFocusTarget } from './focus-target';

type FocusApi = {
  /**
   * Opens the section of a target (saving what was edited, like any section change) and, once it is on
   * screen, scrolls to the block / field / occurrence, gives it the keyboard focus and highlights it.
   */
  goTo: (target: TracfinFocusTarget) => void;
};

/** What a « go to this field » request asks the collapsible containers to reveal. */
export type RevealRequest = { blockId: string | null; fieldId: string | null };

type FocusContextValue = FocusApi & { reveal: (RevealRequest & { nonce: number }) | null };

const TracfinFocusContext = createContext<FocusContextValue | null>(null);

export function useTracfinFocus(): FocusApi {
  const api = useContext(TracfinFocusContext);
  if (!api) throw new Error('useTracfinFocus must be used inside TracfinFocusProvider');
  return api;
}

/**
 * For a container that can hide a block or a field (a collapsed card, an inactive alternative, an
 * optional block): `onReveal` runs when a « go to » request is pending, on mount too since the
 * request is made before the section it points to is on screen. The container opens itself when it
 * holds the target. Does nothing outside a focus provider.
 */
export function useRevealOnFocus(onReveal: (request: RevealRequest) => void): void {
  const reveal = useContext(TracfinFocusContext)?.reveal ?? null;
  const handler = useRef(onReveal);
  handler.current = onReveal;
  useEffect(() => {
    if (reveal) handler.current(reveal);
  }, [reveal]);
}

const NOTICE_MS = 6000;

const MAX_ATTEMPTS = 12;
const RETRY_MS = 60;

type Request = { target: TracfinFocusTarget; nonce: number };

/**
 * Carries a « go to this field » request across a section change: the target section is not mounted
 * when the request is made, so the lookup runs after it is (a few retries cover content that renders
 * a tick later). The request is also published to the collapsible containers (`useRevealOnFocus`), which
 * open when they hold the target. A target that is still not found leaves the section open, at the top,
 * with a short notice.
 */
export function TracfinFocusProvider({
  section,
  onSectionChange,
  children,
}: {
  section: TracfinSectionId;
  onSectionChange: (section: TracfinSectionId) => void;
  children: ReactNode;
}) {
  const { t } = useTranslation(['tracfin']);
  const [request, setRequest] = useState<Request | null>(null);
  const [missing, setMissing] = useState(false);
  const counter = useRef(0);
  const sectionRef = useRef(section);
  sectionRef.current = section;
  const changeRef = useRef(onSectionChange);
  changeRef.current = onSectionChange;

  const goTo = useCallback((target: TracfinFocusTarget) => {
    counter.current += 1;
    setMissing(false);
    setRequest({ target, nonce: counter.current });
    if (target.section !== sectionRef.current) changeRef.current(target.section);
  }, []);

  useEffect(() => {
    if (!request || request.target.section !== section) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;
    const giveUp = () => {
      setMissing(true);
      setRequest(null);
    };
    const attempt = () => {
      const match = findFocusElement(document, request.target);
      if (match) {
        match.element.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
        focusFirstControl(match.element);
        highlight(match.element);
        setRequest(null);
        return;
      }
      attempts += 1;
      // A target with no block (the block is gone) has nothing to wait for.
      if (attempts >= MAX_ATTEMPTS || !request.target.blockId) {
        giveUp();
        return;
      }
      timer = setTimeout(attempt, RETRY_MS);
    };
    attempt();
    // The highlight outlives the effect on purpose (it clears itself); only a pending lookup is cancelled.
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [request, section]);

  useEffect(() => {
    if (!missing) return;
    const timer = setTimeout(() => setMissing(false), NOTICE_MS);
    return () => clearTimeout(timer);
  }, [missing]);

  const reveal = useMemo(
    () => (request ? { blockId: request.target.blockId, fieldId: request.target.fieldId, nonce: request.nonce } : null),
    [request],
  );
  const api = useMemo<FocusContextValue>(() => ({ goTo, reveal }), [goTo, reveal]);
  return (
    <TracfinFocusContext.Provider value={api}>
      {children}
      {missing ? (
        <div
          role="status"
          className="border-grey-border bg-surface-card text-s fixed inset-x-md bottom-md z-50 mx-auto flex max-w-md items-start justify-between gap-sm rounded-lg border p-md shadow-lg"
        >
          <span>{t('tracfin:draft.review.target_not_found')}</span>
          <button
            type="button"
            className="text-grey-secondary shrink-0 text-xs underline"
            onClick={() => setMissing(false)}
          >
            {t('tracfin:draft.review.target_not_found_close')}
          </button>
        </div>
      ) : null}
    </TracfinFocusContext.Provider>
  );
}
