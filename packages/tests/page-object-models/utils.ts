import { test } from '@playwright/test';

/**
 * A decorator that wraps a method in a test.step call, with box: true.
 * More info at https://playwright.dev/docs/api/class-test#test-step
 */
export function boxedStep(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  target: Function,
  context: ClassMethodDecoratorContext,
) {
  return function replacementMethod(
    this: NonNullable<unknown>,
    ...args: unknown[]
  ) {
    const name = this.constructor.name + '.' + context.name.toString();
    return test.step(
      name,
      async () => {
        return await target.call(this, ...args);
      },
      { box: true },
    );
  };
}
