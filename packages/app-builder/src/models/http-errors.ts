import { type HttpError } from 'oazapfts';

export function isHttpError(error: unknown): error is HttpError {
  return error instanceof Error && 'status' in error;
}

export function isStatusConflictHttpError(error: unknown): error is HttpError {
  return isHttpError(error) && error.status === 409;
}

export function isStatusBadRequestHttpError(
  error: unknown,
): error is HttpError {
  return isHttpError(error) && error.status === 400;
}

export function isNotFoundHttpError(error: unknown): error is HttpError {
  return isHttpError(error) && error.status === 404;
}

export function isForbiddenHttpError(error: unknown): error is HttpError {
  return isHttpError(error) && error.status === 403;
}
