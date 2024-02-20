import { isMarbleError, isUnauthorizedHttpError } from './http-errors';

const authErrors = ['NoAccount', 'Unknown'] as const;

export type AuthErrors = (typeof authErrors)[number];

export function adaptAuthErrors(error: unknown): AuthErrors {
  if (isUnauthorizedHttpError(error) && isMarbleError(error)) {
    const errorCode = error.data.error_code;
    if (errorCode === 'unknown_user') {
      return 'NoAccount';
    }
  }

  return 'Unknown';
}
