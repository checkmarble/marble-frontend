import { authI18n } from '@app-builder/components/Auth/auth-i18n';
import { ResetPassword } from '@app-builder/components/Auth/ResetPassword';
import { getRoute } from '@app-builder/utils/routes';
import { Link } from '@remix-run/react';
import { Trans, useTranslation } from 'react-i18next';

export const handle = {
  i18n: authI18n,
};

export default function ForgotPassword() {
  const { t } = useTranslation(handle.i18n);

  return (
    <div className="flex w-full flex-col items-center">
      <ResetPassword />
      <p className="mt-2 text-xs">
        <Trans
          t={t}
          i18nKey="auth:reset-password.wrong_place"
          components={{
            SignIn: (
              <Link
                className="text-purple-65 underline"
                to={getRoute('/sign-in')}
              />
            ),
          }}
          values={{
            signIn: t('auth:sign_in'),
          }}
        />
      </p>
    </div>
  );
}
