import { authI18n } from '@app-builder/components/Auth/auth-i18n';
import { AuthError } from '@app-builder/components/Auth/AuthError';
import { SignInWithEmail } from '@app-builder/components/Auth/SignInWithEmail';
import { SignInWithGoogle } from '@app-builder/components/Auth/SignInWithGoogle';
import { useSignIn } from '@app-builder/routes/ressources+/auth+/login';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { Trans, useTranslation } from 'react-i18next';

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

export default function Login() {
  const { t } = useTranslation(handle.i18n);
  const { authError } = useLoaderData<typeof loader>();

  const signIn = useSignIn();

  return (
    <div className="flex w-full flex-col items-center">
      <div className="flex w-full flex-col gap-2">
        <SignInWithGoogle signIn={signIn} />
      </div>

      <div
        className="my-4 flex w-full flex-row items-center gap-1"
        role="separator"
      >
        <div className="bg-grey-10 h-px w-full" />
        or
        <div className="bg-grey-10 h-px w-full" />
      </div>

      <div className="flex w-full flex-col gap-2">
        <SignInWithEmail signIn={signIn} />
        <p className="text-xs">
          <Trans
            t={t}
            i18nKey="login:sign_in_with_email.dont_have_an_account_sign_up"
            components={{
              SignUp: (
                <Link
                  className="text-purple-100 underline"
                  to={getRoute('/sign-up')}
                />
              ),
            }}
            values={{
              signUp: t('login:sign_in_with_email.sign_up'),
            }}
          />
        </p>
        <Link
          className="text-xs text-purple-100 underline"
          to={getRoute('/forgot-password')}
        >
          {t('login:sign_in_with_email.forgot_password')}
        </Link>
      </div>
      {authError ? <AuthError error={authError} className="mt-8" /> : null}
    </div>
  );
}
