import { type AuthErrors } from '@app-builder/models';
import { TranslationObject } from '@app-builder/types/i18n';
import clsx from 'clsx';
import { ParseKeys } from 'i18next';
import { authI18n } from './auth-i18n';

const errorLabels = {
  NoAccount: { namespace: 'auth', key: 'errors.no_account' },
  CSRFError: { namespace: 'auth', key: 'errors.csrf_error' },
  Unknown: { namespace: 'common', key: 'errors.unknown' },
  BackendUnavailable: { namespace: 'common', key: 'errors.backend_unvailable' },
} as const satisfies Record<
  AuthErrors,
  { namespace: 'auth'; key: ParseKeys<'auth'> } | { namespace: 'common'; key: ParseKeys<'common'> }
>;

export function AuthError({
  error,
  className,
  translationObject,
}: {
  error: AuthErrors;
  className?: string;
  translationObject: TranslationObject<typeof authI18n>;
}) {
  const { tAuth, tCommon } = translationObject;
  const { namespace, key } = errorLabels[error];

  return (
    <p
      className={clsx('text-m bg-red-95 text-red-47 w-full rounded-sm p-2 font-normal', className)}
    >
      {namespace === 'auth' ? tAuth(key) : tCommon(key)}
    </p>
  );
}
