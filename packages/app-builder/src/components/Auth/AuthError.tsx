import { type AuthErrors } from '@app-builder/models';
import { type ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';
import { cn } from 'ui-design-system';
import { authI18n } from './auth-i18n';

const errorLabels: Record<AuthErrors, ParseKeys<typeof authI18n>> = {
  NoAccount: 'auth:errors.no_account',
  CSRFError: 'auth:errors.csrf_error',
  SsoRefused: 'auth:errors.sso_refused',
  InvalidAuthConfiguration: 'auth:errors.invalid_auth_configuration',
  Unknown: 'common:errors.unknown',
  BackendUnavailable: 'common:errors.backend_unvailable',
};

export function AuthError({ error, className }: { error: AuthErrors; className?: string }) {
  const { t } = useTranslation(authI18n);
  if (!error) return null;
  return (
    <p className={cn('text-m bg-red-background text-red-primary w-full rounded-xs p-sm font-normal', className)}>
      {t(errorLabels[error])}
    </p>
  );
}
