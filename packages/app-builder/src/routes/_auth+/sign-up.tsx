import { authI18n } from '@app-builder/components/Auth/auth-i18n';
import { AuthError } from '@app-builder/components/Auth/AuthError';
import { SignUpWithEmail } from '@app-builder/components/Auth/SignUpWithEmail copy';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { Trans, useTranslation } from 'react-i18next';

import { useSignUp } from '../ressources+/auth+/sign-up';

export async function loader({ request }: LoaderFunctionArgs) {
  const {
    authService,
    authSessionService: { getSession },
  } = serverServices;
  await authService.isAuthenticated(request, {
    successRedirect: '/home',
  });
  const session = await getSession(request);
  const error = session.get('authError');

  return json({
    authError: error?.message,
  });
}

export const handle = {
  i18n: authI18n,
};

export default function SignUp() {
  const { t } = useTranslation(handle.i18n);
  const { authError } = useLoaderData<typeof loader>();

  //TODO: check if we can use the same hook as login
  const signUp = useSignUp();

  return (
    <div className="flex w-full flex-col items-center">
      <SignUpWithEmail signUp={signUp} />
      <p className="mt-2 text-xs">
        <Trans
          t={t}
          i18nKey="login:sign_in_with_email.already_have_an_account_sign_up"
          components={{
            SignIn: (
              <Link
                className="text-purple-100 underline"
                to={getRoute('/login')}
              />
            ),
          }}
          values={{
            signIn: t('login:sign_in_with_email.sign_in'),
          }}
        />
      </p>
      {authError ? <AuthError error={authError} className="mt-8" /> : null}
    </div>
  );
}
