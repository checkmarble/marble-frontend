import { isMarbleError, isUnauthorizedHttpError } from './http-errors';

export type AuthErrors = 'NoAccount' | 'Unknown';

export function adaptAuthErrors(error: unknown): AuthErrors {
  if (isUnauthorizedHttpError(error) && isMarbleError(error)) {
    const errorCode = error.data.error_code;
    if (errorCode === 'unknown_user') {
      return 'NoAccount';
    }
  }

  return 'Unknown';
}
