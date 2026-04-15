import { CsrfError } from '@app-builder/utils/csrf';

import { isMarbleError, isUnauthorizedHttpError } from './http-errors';

export type AuthErrors = 'NoAccount' | 'CSRFError' | 'BackendUnavailable' | 'Unknown';

export function adaptAuthErrors(error: unknown): AuthErrors {
  if (error instanceof CsrfError) {
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
