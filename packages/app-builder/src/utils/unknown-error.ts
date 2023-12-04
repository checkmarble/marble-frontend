export class UnknownError extends Error {
  constructor(error: unknown) {
    super(
      `Internal error:  ${
        error instanceof Error ? error.message : 'unknown error'
      }`,
    );
  }
}
