import { useCallback, useState } from 'react';

/**
 * State that a parent may take over. Pass `value` + `onChange` to control it
 * (so it survives remounts of the owning component); pass neither and the hook
 * keeps its own state, seeded with `defaultValue`.
 */
export function useControllableState<T>(
  defaultValue: T,
  value?: T,
  onChange?: (next: T) => void,
): [T, (next: T) => void] {
  const [uncontrolled, setUncontrolled] = useState<T>(defaultValue);
  const isControlled = value !== undefined;

  const set = useCallback(
    (next: T) => {
      onChange?.(next);
      if (!isControlled) setUncontrolled(next);
    },
    [isControlled, onChange],
  );

  return [isControlled ? value : uncontrolled, set];
}
