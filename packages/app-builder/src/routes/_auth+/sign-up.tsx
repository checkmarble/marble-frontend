import { Callout } from '@app-builder/components';
import { authI18n } from '@app-builder/components/Auth/auth-i18n';
import { AuthError } from '@app-builder/components/Auth/AuthError';
import { SignUpWithEmailAndPassword } from '@app-builder/components/Auth/SignUpWithEmailAndPassword';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { Link, useLoaderData, useNavigate } from '@remix-run/react';
import { Trans, useTranslation } from 'react-i18next';

export const handle = {
  i18n: authI18n,
};

export async function loader({ request }: LoaderFunctionArgs) {
  const {
    authService,
    authSessionService: { getSession },
  } = serverServices;
  await authService.isAuthenticated(request, {
    successRedirect: getRoute('/app-router'),
  });
  const session = await getSession(request);
  const error = session.get('authError');

  return json({
    authError: error?.message,
  });
}

export default function SignUp() {
  const { t } = useTranslation(handle.i18n);
  const { authError } = useLoaderData<typeof loader>();

  const navigate = useNavigate();
  const signUp = () => navigate(getRoute('/email-verification'));

  return (
    <div className="flex w-full flex-col items-center">
      <Callout variant="soft" className="mb-6 text-left">
        {t('auth:sign_up.description')}
      </Callout>
      <SignUpWithEmailAndPassword signUp={signUp} />
      <p className="mt-2 text-xs">
        <Trans
          t={t}
          i18nKey="auth:sign_up.already_have_an_account_sign_up"
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
      {authError ? <AuthError error={authError} className="mt-8" /> : null}
    </div>
  );
}
