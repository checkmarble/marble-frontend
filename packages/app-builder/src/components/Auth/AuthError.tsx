import type { AuthErrors } from '@app-builder/models';
import clsx from 'clsx';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';

import { authI18n } from './auth-i18n';

const errorLabels: Record<AuthErrors, ParseKeys<typeof authI18n>> = {
  NoAccount: 'auth:errors.no_account',
  CSRFError: 'auth:errors.csrf_error',
  Unknown: 'common:errors.unknown',
  BackendUnavailable: 'common:errors.backend_unvailable',
};

export function AuthError({ error, className }: { error: AuthErrors; className?: string }) {
  const { t } = useTranslation(authI18n);
  return (
    <p
      className={clsx('text-m bg-red-95 text-red-47 w-full rounded-sm p-2 font-normal', className)}
    >
      {t(errorLabels[error])}
    </p>
  );
}
