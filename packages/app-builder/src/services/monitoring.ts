import { isForbiddenHttpError, isNotFoundHttpError, isUnauthorizedHttpError } from '@app-builder/models';
import * as Sentry from '@sentry/tanstackstart-react';

export function captureUnexpectedError(error: unknown, name: string, request: Request) {
  if (isUnauthorizedHttpError(error) || isForbiddenHttpError(error) || isNotFoundHttpError(error)) {
    return;
  }
  void Sentry.captureException(error);
}
