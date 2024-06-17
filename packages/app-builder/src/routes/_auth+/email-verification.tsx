import { authI18n } from '@app-builder/components/Auth/auth-i18n';
import {
  SendEmailVerification,
  SendEmailVerificationDescription,
} from '@app-builder/components/Auth/SendEmailVerification';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type LoaderFunctionArgs } from '@remix-run/node';
import { Link } from '@remix-run/react';
import { Trans, useTranslation } from 'react-i18next';

export const handle = {
  i18n: authI18n,
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  await authService.isAuthenticated(request, {
    successRedirect: getRoute('/app-router'),
  });
  return null;
}

export default function SignUp() {
  const { t } = useTranslation(handle.i18n);

  return (
    <div className="flex w-full flex-col items-center">
      <p className="text-m text-grey-100 mb-4">
        <SendEmailVerificationDescription />
      </p>
      <SendEmailVerification />
      <p className="mt-2 text-xs">
        <Trans
          t={t}
          i18nKey="auth:email-verification.wrong_place"
          components={{
            SignIn: (
              <Link
                className="text-purple-100 underline"
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
