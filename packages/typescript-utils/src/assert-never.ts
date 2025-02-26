import { isomorphicGetEnv } from './isomorphic-env';

/**
 * Used to assert that a value is never.
 * Particularly useful for exhaustiveness checks (ex: in switch statements default).
 */
export function assertNever(
  prefix: string,
  x: never,
): // @ts-expect-error assertNever
never {
  const env = isomorphicGetEnv('NODE_ENV') ?? isomorphicGetEnv('ENV') ?? 'development';
  if (env !== 'production') {
    console.error(`[AssertNever]: ${prefix}`, x);
  }
}
