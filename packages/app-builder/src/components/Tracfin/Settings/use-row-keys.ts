import { useState } from 'react';

let nextKey = 0;
const newKey = () => `row-${nextKey++}`;

/**
 * Stable React keys for rows that are plain data (code pairs, accepted values): a key follows its
 * row when another one is removed, so inputs keep their focus and value. The keys are local to the
 * component and never part of the mapping, so nothing needs stripping before the PUT.
 */
export function useRowKeys(length: number) {
  const [keys, setKeys] = useState<string[]>(() => Array.from({ length }, newKey));
  // A row count changed from outside (a new target dropped the codes): fall back to positional keys.
  const current = keys.length === length ? keys : Array.from({ length }, (_, i) => keys[i] ?? `pending-${i}`);
  return {
    keys: current,
    add: () => setKeys([...current, newKey()]),
    remove: (index: number) => setKeys(current.filter((_, i) => i !== index)),
  };
}
