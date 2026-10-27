import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { TracfinSectionId } from '../model/sections';
import { findFocusElement, focusFirstControl, highlight, type TracfinFocusTarget } from './focus-target';

type FocusApi = {
  /**
   * Opens the section of a target (saving what was edited, like any section change) and, once it is on
   * screen, scrolls to the block / field / occurrence, gives it the keyboard focus and highlights it.
   */
  goTo: (target: TracfinFocusTarget) => void;
};

const TracfinFocusContext = createContext<FocusApi | null>(null);

export function useTracfinFocus(): FocusApi {
  const api = useContext(TracfinFocusContext);
  if (!api) throw new Error('useTracfinFocus must be used inside TracfinFocusProvider');
  return api;
}

const MAX_ATTEMPTS = 12;
const RETRY_MS = 60;

type Request = { target: TracfinFocusTarget; nonce: number };

/**
 * Carries a « go to this field » request across a section change: the target section is not mounted
 * when the request is made, so the lookup runs after it is (a few retries cover content that renders
 * a tick later). A target that is not found leaves the section open, at the top.
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
  const [request, setRequest] = useState<Request | null>(null);
  const counter = useRef(0);
  const sectionRef = useRef(section);
  sectionRef.current = section;
  const changeRef = useRef(onSectionChange);
  changeRef.current = onSectionChange;

  const goTo = useCallback((target: TracfinFocusTarget) => {
    counter.current += 1;
    setRequest({ target, nonce: counter.current });
    if (target.section !== sectionRef.current) changeRef.current(target.section);
  }, []);

  useEffect(() => {
    if (!request || request.target.section !== section) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;
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
      if (attempts >= MAX_ATTEMPTS) {
        setRequest(null);
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

  const api = useMemo<FocusApi>(() => ({ goTo }), [goTo]);
  return <TracfinFocusContext.Provider value={api}>{children}</TracfinFocusContext.Provider>;
}
