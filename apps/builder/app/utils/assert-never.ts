export function assertNever(
  prefix: string,
  x: never
): // @ts-expect-error assertNever
never {
  console.error(`[AssertNever]: ${prefix} ${x}`);
}
