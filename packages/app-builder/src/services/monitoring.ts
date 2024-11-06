import {
  isForbiddenHttpError,
  isNotFoundHttpError,
  isUnauthorizedHttpError,
} from '@app-builder/models';
import * as Sentry from '@sentry/remix';

export function captureUnexpectedRemixError(
  error: unknown,
  name: string,
  request: Request,
) {
  if (
    isUnauthorizedHttpError(error) ||
    isForbiddenHttpError(error) ||
    isNotFoundHttpError(error)
  ) {
    return;
  }
  if (error instanceof Error) {
    void Sentry.captureRemixServerException(error, name, request);
  } else {
    // Optionally capture non-Error objects
    Sentry.captureException(error);
  }
}
