type Ok<T> = { ok: true; value: T };
type Err<E> = { ok: false; error: E };
type Result<T, E = Error> = Ok<T> | Err<E>;

export function tryCatch<T>(fn: () => T): Result<T>;
export function tryCatch<T>(promise: Promise<T>): Promise<Result<T>>;
export function tryCatch<T>(input: (() => T) | Promise<T>): Result<T> | Promise<Result<T>> {
  if (input instanceof Promise) {
    return input.then(
      (value): Ok<T> => ({ ok: true, value }),
      (error): Err<Error> => ({ ok: false, error: toError(error) }),
    );
  }

  try {
    return { ok: true, value: input() };
  } catch (error) {
    return { ok: false, error: toError(error) };
  }
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}
