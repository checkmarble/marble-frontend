import {
  BAD_REQUEST,
  CONFLICT,
  FORBIDDEN,
  NOT_FOUND,
} from '@app-builder/utils/http/http-status-codes';
import { type HttpError } from 'oazapfts';

export function isHttpError(error: unknown): error is HttpError {
  return error instanceof Error && 'status' in error;
}

export function isStatusConflictHttpError(error: unknown): error is HttpError {
  return isHttpError(error) && error.status === CONFLICT;
}

export function isStatusBadRequestHttpError(
  error: unknown,
): error is HttpError {
  return isHttpError(error) && error.status === BAD_REQUEST;
}

export function isNotFoundHttpError(error: unknown): error is HttpError {
  return isHttpError(error) && error.status === NOT_FOUND;
}

export function isForbiddenHttpError(error: unknown): error is HttpError {
  return isHttpError(error) && error.status === FORBIDDEN;
}
