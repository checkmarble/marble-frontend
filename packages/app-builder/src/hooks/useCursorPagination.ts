import { useCallback, useState } from 'react';

export type PaginationAction = 'previous' | 'next';

export type CursorPaginationState = {
  cursor: string | null;
  previousCursors: string[];
  lastAction: PaginationAction;
  isPristine: boolean;
};

const INITIAL_STATE: CursorPaginationState = {
  cursor: null,
  previousCursors: [],
  lastAction: 'next',
  isPristine: true,
};

export const useCursorPagination = () => {
  const [state, setState] = useState<CursorPaginationState>(INITIAL_STATE);

  const next = useCallback((cursor: string) => {
    setState((currentState) => ({
      ...currentState,
      cursor,
      previousCursors: currentState.cursor
        ? [...currentState.previousCursors, currentState.cursor]
        : [],
      lastAction: 'next',
      isPristine: false,
    }));
  }, []);

  const previous = useCallback(() => {
    setState((currentState) => ({
      ...currentState,
      cursor: currentState.previousCursors.pop() ?? null,
      previousCursors: [...currentState.previousCursors],
      lastAction: 'previous',
      isPristine: false,
    }));
  }, []);

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return {
    state,
    next,
    previous,
    reset,
  };
};
