import { type HttpError } from 'oazapfts';

export function isHttpError(error: unknown): error is HttpError {
  return error instanceof Error && 'status' in error;
}

export function isStatusConflictHttpError(error: unknown): error is HttpError {
  return isHttpError(error) && error.status === 409;
}
