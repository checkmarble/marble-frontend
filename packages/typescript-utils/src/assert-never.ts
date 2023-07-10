export function assertNever(
  prefix: string,
  x: never
): // @ts-expect-error assertNever
never {
  if (process.env['NODE_ENV'] !== 'production') {
    console.error(`[AssertNever]: ${prefix}`, x);
  }
}
