import { authI18n } from '@app-builder/components/Auth/auth-i18n';
import { AuthError } from '@app-builder/components/Auth/AuthError';
import { SignInWithEmailAndPassword } from '@app-builder/components/Auth/SignInWithEmailAndPassword';
import { SignInWithGoogle } from '@app-builder/components/Auth/SignInWithGoogle';
import { SignInWithMicrosoft } from '@app-builder/components/Auth/SignInWithMicrosoft';
import { type AuthPayload } from '@app-builder/services/auth/auth.server';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
} from '@remix-run/node';
import {
  Link,
  useFetcher,
  useLoaderData,
  useSearchParams,
} from '@remix-run/react';
import { Trans, useTranslation } from 'react-i18next';
import { safeRedirect } from 'remix-utils/safe-redirect';

export const handle = {
  i18n: authI18n,
};

export async function loader({ request }: LoaderFunctionArgs) {
  const {
    authService,
    authSessionService: { getSession },
    featureAccessService,
  } = serverServices;
  await authService.isAuthenticated(request, {
    successRedirect: getRoute('/app-router'),
  });
  const session = await getSession(request);
  const error = session.get('authError');

  return json({
    authError: error?.message,
    isSSOAvailable: await featureAccessService.isSSOAvailable(),
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = serverServices;

  const { searchParams } = new URL(request.url);
  const redirectTo = searchParams.get('redirectTo');
  const successRedirect = safeRedirect(redirectTo, getRoute('/app-router'));

  return await authService.authenticate(request, {
    successRedirect,
    failureRedirect: getRoute('/sign-in'),
  });
}

export default function Login() {
  const { t } = useTranslation(handle.i18n);
  const { authError, isSSOAvailable } = useLoaderData<typeof loader>();

  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');
  const fetcher = useFetcher();
  const signIn = (authPayload: AuthPayload) =>
    fetcher.submit(authPayload, {
      method: 'POST',
      action:
        getRoute('/sign-in') + (redirectTo ? `?redirectTo=${redirectTo}` : ''),
    });

  return (
    <div className="flex w-full flex-col items-center">
      {isSSOAvailable ? (
        <>
          <div className="flex w-full flex-col gap-2">
            <SignInWithGoogle signIn={signIn} />
            <SignInWithMicrosoft signIn={signIn} />
          </div>

          <div
            className="my-4 flex w-full flex-row items-center gap-1"
            role="separator"
          >
            <div className="bg-grey-10 h-px w-full" />
            or
            <div className="bg-grey-10 h-px w-full" />
          </div>
        </>
      ) : null}

      <div className="flex w-full flex-col items-center gap-2">
        <SignInWithEmailAndPassword signIn={signIn} />
        <p className="w-fit text-xs">
          <Trans
            t={t}
            i18nKey="auth:sign_in.dont_have_an_account"
            components={{
              SignUp: (
                <Link
                  className="text-purple-100 underline"
                  to={getRoute('/sign-up')}
                />
              ),
            }}
            values={{
              signUp: t('auth:sign_up'),
            }}
          />
        </p>
        <Link
          className="w-fit text-xs text-purple-100 underline"
          to={getRoute('/forgot-password')}
        >
          {t('auth:sign_in.forgot_password')}
        </Link>
      </div>
      {authError ? <AuthError error={authError} className="mt-8" /> : null}
    </div>
  );
}
