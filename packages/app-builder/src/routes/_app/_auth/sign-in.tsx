import { AuthError } from '@app-builder/components/Auth/AuthError';
import { authI18n } from '@app-builder/components/Auth/auth-i18n';
import { MfaChallenge } from '@app-builder/components/Auth/MfaChallenge';
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
import { type MultiFactorResolver } from 'firebase/auth';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CtaV2ClassName, Typo } from 'ui-design-system';

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
        data: {
          idToken: authPayload.idToken,
          refreshToken: authPayload.refreshToken,
          csrf: authPayload.csrf,
          redirectTo: redirectTo ?? undefined,
        },
      }).then((r) => r.redirectTo),
    onSuccess: (destination) => {
      window.location.href = destination;
    },
  });

  const signIn = (authPayload: AuthPayload) => signInMutation.mutate(authPayload);
  const loading = signInMutation.isPending;
  const type = signInMutation.variables?.type;

  const [mfaChallenge, setMfaChallenge] = useState<{
    resolver: MultiFactorResolver;
    type: AuthPayload['type'];
  } | null>(null);

  if (mfaChallenge) {
    return (
      <div className="flex flex-col gap-2xl w-full">
        <MfaChallenge
          resolver={mfaChallenge.resolver}
          authType={mfaChallenge.type}
          signIn={signIn}
          loading={loading}
          onCancel={() => setMfaChallenge(null)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2xl w-full">
      <div className="flex flex-col gap-xl">
        <Typo variant="title2" className="text-center">
          {t('auth:sign_in')}
        </Typo>
        {!isSignupReady ? <UnreadyCallout didMigrationsRun={didMigrationsRun} /> : null}
        <div className="flex flex-col gap-sm">
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
                <span className="absolute end-0 mx-sm size-4">{loading ? <Spinner className="size-4" /> : null}</span>
              </button>
              <AuthError error={authError as AuthErrors} className="mt-xl" />
            </>
          ) : (
            <>
              <SignInWithGoogle
                signIn={signIn}
                onMfaRequired={(resolver) => setMfaChallenge({ resolver, type: 'google' })}
                loading={loading && type === 'google'}
              />
              <SignInWithMicrosoft
                signIn={signIn}
                onMfaRequired={(resolver) => setMfaChallenge({ resolver, type: 'microsoft' })}
                loading={loading && type === 'microsoft'}
              />
              <Link
                className={CtaV2ClassName({
                  variant: 'primary',
                  color: 'primary',
                  size: 'large',
                  className: 'w-full justify-center',
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
          <div className="flex items-center gap-md self-stretch">
            <div className="h-px bg-grey-border grow" />
            <span>{t('common:or')}</span>
            <div className="h-px bg-grey-border grow" />
          </div>
          <div className="flex flex-col gap-xl">
            <Typo variant="title2" className="text-center">
              {t('auth:sign_in.first_connection')}
            </Typo>
            <div className="flex flex-col gap-sm">
              <SignInFirstConnection isSignInHomepage showAskDemoButton={isManagedMarble} />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
