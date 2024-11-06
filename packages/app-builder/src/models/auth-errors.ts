import { CSRFError } from 'remix-utils/csrf/server';

import { isMarbleError, isUnauthorizedHttpError } from './http-errors';

export type AuthErrors = 'NoAccount' | 'CSRFError' | 'Unknown';

export function adaptAuthErrors(error: unknown): AuthErrors {
  if (error instanceof CSRFError) {
    return 'CSRFError';
  }
  if (isUnauthorizedHttpError(error) && isMarbleError(error)) {
    const errorCode = error.data.error_code;
    if (errorCode === 'unknown_user') {
      return 'NoAccount';
    }
  }

  return 'Unknown';
}
