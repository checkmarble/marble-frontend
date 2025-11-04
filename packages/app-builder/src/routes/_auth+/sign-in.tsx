import { authI18n } from '@app-builder/components/Auth/auth-i18n';
import { SignInFirstConnection } from '@app-builder/components/Auth/SignInFirstConnection';
import { SignInWithGoogle } from '@app-builder/components/Auth/SignInWithGoogle';
import { SignInWithMicrosoft } from '@app-builder/components/Auth/SignInWithMicrosoft';
import { UnreadyCallout } from '@app-builder/components/Auth/UnreadyCallout';
import { Spinner } from '@app-builder/components/Spinner';
import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { type AuthErrors } from '@app-builder/models/auth-errors';
import { type AuthPayload } from '@app-builder/services/auth/auth.server';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { Link, useFetcher, useLoaderData, useSearchParams } from '@remix-run/react';
import { tryit } from 'radash';
import { useTranslation } from 'react-i18next';
import { safeRedirect } from 'remix-utils/safe-redirect';
import { CtaClassName } from 'ui-design-system';

export const handle = {
  i18n: authI18n,
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService, authSessionService, appConfigRepository } = initServerServices(request);
  await authService.isAuthenticated(request, {
    successRedirect: getRoute('/app-router'),
  });
  const session = await authSessionService.getSession(request);

  const [err, appConfig] = await tryit(() => appConfigRepository.getAppConfig())();

  if (err) {
    console.error('Error fetching app config API', err);
  }

  const url = new URL(request.url);

  const authProvider = (appConfig && appConfig.auth.provider) ?? 'firebase';
  const isSsoEnabled = appConfig && appConfig.features.sso;
  // Handle email parameter manually to preserve literal '+' characters
  const emailParam = url.searchParams.toString().match(/email=([^&]*)/)?.[1];
  const prefilledEmail = emailParam ? decodeURIComponent(emailParam.replace(/\+/g, '%2B')) : '';

  if (!isSsoEnabled || prefilledEmail) {
    return redirect(getRoute('/sign-in-email') + `?email=${encodeURIComponent(prefilledEmail)}`);
  }

  return {
    isSignupReady: appConfig
      ? appConfig.status.migrations && appConfig.status.hasOrg && appConfig.status.hasUser
      : false,
    authProvider,
    didMigrationsRun: appConfig?.status.migrations ?? false,
    authError: !appConfig
      ? 'BackendUnavailable'
      : (session.get('authError')?.message as AuthErrors),
    isManagedMarble: appConfig?.isManagedMarble ?? false,
  };
}

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);

  const { searchParams } = new URL(request.url);
  const redirectTo = searchParams.get('redirectTo');
  const successRedirect = safeRedirect(redirectTo, getRoute('/app-router'));

  return await authService.authenticate(request, {
    successRedirect,
    failureRedirect: getRoute('/sign-in'),
  });
}

export default function Login() {
  const { t } = useTranslation(['auth', 'common']);
  const { isSignupReady, authProvider, didMigrationsRun, isManagedMarble } =
    useLoaderData<typeof loader>();

  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');
  const fetcher = useFetcher();
  const signIn = (authPayload: AuthPayload) =>
    fetcher.submit(authPayload, {
      method: 'POST',
      action: getRoute('/sign-in') + (redirectTo ? `?redirectTo=${redirectTo}` : ''),
    });

  const loading = fetcher.state === 'loading';
  const type = fetcher.formData?.get('type');

  const navigate = useAgnosticNavigation();

  return (
    <div className="flex flex-col gap-10 w-full">
      <div className="flex flex-col gap-8">
        <h2 className="text-2xl text-center">{t('auth:sign_in')}</h2>
        {!isSignupReady ? <UnreadyCallout didMigrationsRun={didMigrationsRun} /> : null}
        <div className="flex flex-col gap-2">
          {authProvider == 'oidc' ? (
            <button
              className="relative flex h-10 w-full items-center rounded border-2 border-[#1a73e8] bg-[#1a73e8] transition hover:bg-[rgb(69,128,233)] disabled:cursor-wait"
              onClick={() => navigate(getRoute('/oidc/auth'))}
              disabled={loading}
            >
              <span className="text-s text-grey-100 w-full whitespace-nowrap text-center align-middle font-medium">
                Sign in with OpenID Connect
              </span>
              <span className="absolute end-0 mx-2 size-4">
                {loading ? <Spinner className="size-4" /> : null}
              </span>
            </button>
          ) : (
            <>
              <SignInWithGoogle
                signIn={signIn}
                // eslint-disable-next-line react/jsx-no-leaked-render
                loading={loading && type === 'google'}
              />
              <SignInWithMicrosoft
                signIn={signIn}
                // eslint-disable-next-line react/jsx-no-leaked-render
                loading={loading && type === 'microsoft'}
              />
              <Link
                className={CtaClassName({
                  variant: 'primary',
                  color: 'purple',
                  className: 'text-s',
                })}
                to="/sign-in-email"
              >
                {t('auth:sign_in.with_email')}
              </Link>
            </>
          )}
        </div>
      </div>
      {authProvider == 'firebase' ? (
        <>
          <div className="flex items-center gap-4 self-stretch">
            <div className="h-px bg-grey-90 grow" />
            <span>{t('common:or')}</span>
            <div className="h-px bg-grey-90 grow" />
          </div>
          <div className="flex flex-col gap-8">
            <h2 className="text-2xl text-center">{t('auth:sign_in.first_connection')}</h2>
            <div className="flex flex-col gap-2">
              <SignInFirstConnection isSignInHomepage showAskDemoButton={isManagedMarble} />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
