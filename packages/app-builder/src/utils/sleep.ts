/**
 * Sleep for a given number of milliseconds.
 *
 * This is a useful utility function for testing.
 */
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
