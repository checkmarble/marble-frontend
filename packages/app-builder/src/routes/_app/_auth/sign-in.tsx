import { AuthError } from '@app-builder/components/Auth/AuthError';
import { authI18n } from '@app-builder/components/Auth/auth-i18n';
import { SignInFirstConnection } from '@app-builder/components/Auth/SignInFirstConnection';
import { SignInWithGoogle } from '@app-builder/components/Auth/SignInWithGoogle';
import { SignInWithMicrosoft } from '@app-builder/components/Auth/SignInWithMicrosoft';
import { UnreadyCallout } from '@app-builder/components/Auth/UnreadyCallout';
import { Spinner } from '@app-builder/components/Spinner';
import { servicesMiddleware } from '@app-builder/middlewares/services-middleware';
import { type AuthErrors } from '@app-builder/models/auth-errors';
import { signInFn } from '@app-builder/server-fns/auth';
import { type AuthPayload } from '@app-builder/services/auth/auth.server';
import { useAuthSession } from '@app-builder/services/auth/auth-session.server';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, ErrorComponent, Link, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { useTranslation } from 'react-i18next';
import { CtaClassName } from 'ui-design-system';

const signInLoader = createServerFn()
  .middleware([servicesMiddleware])
  .handler(async function signInLoader({ context }) {
    const request = getRequest();
    try {
      await context.services.authService.isAuthenticated(request, {
        successRedirect: '/app-router',
      });
    } catch (error) {
      if (error instanceof Response && error.status >= 300 && error.status < 400) {
        throw redirect({ href: error.headers.get('Location')!, statusCode: error.status });
      }
      throw error;
    }
    const appConfig = context.appConfig;
    const url = new URL(request.url);

    const authProvider = (appConfig && appConfig.auth.provider) ?? 'firebase';
    const isSsoEnabled = appConfig && appConfig.features.sso;
    // Handle email parameter manually to preserve literal '+' characters
    const emailParam = url.searchParams.toString().match(/email=([^&]*)/)?.[1];
    const prefilledEmail = emailParam ? decodeURIComponent(emailParam.replace(/\+/g, '%2B')) : '';

    if (!isSsoEnabled || prefilledEmail) {
      throw redirect({ href: `/sign-in-email?email=${encodeURIComponent(prefilledEmail)}` });
    }

    const redirectTo = url.searchParams.get('redirectTo');

    let authError: AuthErrors | undefined;
    if (appConfig) {
      const authSession = await useAuthSession();
      const sessionError = authSession.data.authError;
      if (sessionError) {
        authError = sessionError.message;
        await authSession.update({ authError: undefined });
      }
    }

    return {
      isSignupReady: appConfig
        ? appConfig.status.migrations && appConfig.status.hasOrg && appConfig.status.hasUser
        : false,
      authProvider,
      didMigrationsRun: appConfig?.status.migrations ?? false,
      authError: authError ?? (!appConfig ? ('BackendUnavailable' as AuthErrors) : undefined),
      isManagedMarble: appConfig?.isManagedMarble ?? false,
      redirectTo,
    };
  });

export const Route = createFileRoute('/_app/_auth/sign-in')({
  staticData: {
    i18n: authI18n,
  },
  loader: () => signInLoader(),
  component: Login,
  errorComponent: ErrorComponent,
});

function Login() {
  const { t } = useTranslation(['auth', 'common']);
  const { isSignupReady, authProvider, didMigrationsRun, isManagedMarble, authError, redirectTo } =
    Route.useLoaderData();

  const signInMutation = useMutation({
    mutationFn: async (authPayload: AuthPayload) =>
      signInFn({
        data: { idToken: authPayload.idToken, csrf: authPayload.csrf, redirectTo: redirectTo ?? undefined },
      }).then((r) => r.redirectTo),
    onSuccess: (destination) => {
      window.location.href = destination;
    },
  });

  const signIn = (authPayload: AuthPayload) => signInMutation.mutate(authPayload);
  const loading = signInMutation.isPending;
  const type = signInMutation.variables?.type;

  return (
    <div className="flex flex-col gap-10 w-full">
      <div className="flex flex-col gap-8">
        <h2 className="text-2xl text-center">{t('auth:sign_in')}</h2>
        {!isSignupReady ? <UnreadyCallout didMigrationsRun={didMigrationsRun} /> : null}
        <div className="flex flex-col gap-2">
          {authProvider == 'oidc' ? (
            <>
              <button
                className="relative flex h-10 w-full items-center rounded border-2 border-[#1a73e8] bg-[#1a73e8] transition hover:bg-[rgb(69,128,233)] disabled:cursor-wait"
                onClick={() => {
                  window.location.href = '/oidc/auth';
                }}
                disabled={loading}
              >
                <span className="text-s text-grey-white w-full whitespace-nowrap text-center align-middle font-medium">
                  Sign in with OpenID Connect
                </span>
                <span className="absolute end-0 mx-2 size-4">{loading ? <Spinner className="size-4" /> : null}</span>
              </button>
              <AuthError error={authError as AuthErrors} className="mt-8" />
            </>
          ) : (
            <>
              <SignInWithGoogle signIn={signIn} loading={loading && type === 'google'} />
              <SignInWithMicrosoft signIn={signIn} loading={loading && type === 'microsoft'} />
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
            <div className="h-px bg-grey-border grow" />
            <span>{t('common:or')}</span>
            <div className="h-px bg-grey-border grow" />
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
