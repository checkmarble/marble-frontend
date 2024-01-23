/**
 * Used to assert that a value is never.
 * Particularly useful for exhaustiveness checks (ex: in switch statements default).
 */
export function assertNever(
  prefix: string,
  x: never,
): // @ts-expect-error assertNever
never {
  if (process.env['NODE_ENV'] !== 'production') {
    console.error(`[AssertNever]: ${prefix}`, x);
  }
}
