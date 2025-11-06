import { hasHeader } from '@app-builder/utils/http/response';
import { isForbiddenHttpError } from './http-errors';

type BackendGlobalError = 'DisallowedNetwork';

export function adaptGlobalError(error: unknown): BackendGlobalError | null {
  if (isForbiddenHttpError(error) && hasHeader(error.headers, 'x-marble-global-error') === 'disallowed-network') {
    return 'DisallowedNetwork';
  }

  return null;
}
