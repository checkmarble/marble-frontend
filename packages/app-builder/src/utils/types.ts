/**
 * Builds a list that must contain every member of union `U`.
 * Order is caller-defined: TypeScript 7 sorts unions, so a positional tuple type is not stable.
 */
export function exhaustiveUnionList<U>() {
  return <const T extends readonly U[]>(values: [U] extends [T[number]] ? T : never): T => values;
}
