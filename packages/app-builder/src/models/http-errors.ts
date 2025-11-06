import { BAD_REQUEST, CONFLICT, FORBIDDEN, NOT_FOUND, UNAUTHORIZED } from '@app-builder/utils/http/http-status-codes';
import type * as Oazapfts from '@oazapfts/runtime';
import * as z from 'zod/v4';

export function isHttpError(error: unknown): error is Oazapfts.HttpError {
  return error instanceof Error && 'status' in error;
}

export function isStatusConflictHttpError(error: unknown): error is Oazapfts.HttpError {
  return isHttpError(error) && error.status === CONFLICT;
}

export function isStatusBadRequestHttpError(error: unknown): error is Oazapfts.HttpError {
  return isHttpError(error) && error.status === BAD_REQUEST;
}

export function isNotFoundHttpError(error: unknown): error is Oazapfts.HttpError {
  return isHttpError(error) && error.status === NOT_FOUND;
}

export function isUnauthorizedHttpError(error: unknown): error is Oazapfts.HttpError {
  return isHttpError(error) && error.status === UNAUTHORIZED;
}

export function isForbiddenHttpError(error: unknown): error is Oazapfts.HttpError {
  return isHttpError(error) && error.status === FORBIDDEN;
}

const marbleErrorSchema = z.object({
  error_code: z.string().optional(),
  message: z.string(),
});
export function isMarbleError(error: Oazapfts.HttpError): error is Omit<Oazapfts.HttpError, 'data'> & {
  data: z.infer<typeof marbleErrorSchema>;
} {
  const result = marbleErrorSchema.safeParse(error.data);
  return result.success;
}
