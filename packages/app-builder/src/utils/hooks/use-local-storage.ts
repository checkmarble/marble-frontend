import { useCallback, useMemo } from 'react';
import { getLocalStorageItem, setLocalStorageItem } from '../local-storage';

/**
 * A hook for reading and writing to localStorage with type safety.
 * Note: This hook does not trigger re-renders on value change.
 * Use for values that are read once on mount (like checking snooze state).
 */
export function useLocalStorage<T>(key: string) {
  const get = useCallback(() => getLocalStorageItem<T>(key), [key]);

  const set = useCallback((value: T) => setLocalStorageItem(key, value), [key]);

  return useMemo(() => ({ get, set }), [get, set]);
}
