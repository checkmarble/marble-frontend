import { AuthError } from '@app-builder/components/Auth/AuthError';
import { authI18n } from '@app-builder/components/Auth/auth-i18n';
import { SignInFirstConnection } from '@app-builder/components/Auth/SignInFirstConnection';
import {
  SignInWithEmailAndPassword,
  StaticSignInWithEmailAndPassword,
} from '@app-builder/components/Auth/SignInWithEmailAndPassword';
import { UnreadyCallout } from '@app-builder/components/Auth/UnreadyCallout';
import { servicesMiddleware } from '@app-builder/middlewares/services-middleware';
import { type AuthErrors } from '@app-builder/models/auth-errors';
import { signInEmailFn } from '@app-builder/server-fns/auth';
import { type AuthPayload } from '@app-builder/services/auth/auth.server';
import { useAuthSession } from '@app-builder/services/auth/auth-session.server';
import { useMutation } from '@tanstack/react-query';
import { ClientOnly, createFileRoute, Link, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

const signInEmailLoader = createServerFn()
  .middleware([servicesMiddleware])
  .handler(async function signInEmailLoader({ context }) {
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

    if (appConfig?.auth.provider === 'oidc') {
      throw redirect({ to: '/sign-in' });
    }

    let authError: AuthErrors | undefined;
    if (appConfig) {
      const authSession = await useAuthSession();
      const sessionError = authSession.data.authError;
      if (sessionError) {
        authError = sessionError.message;
        await authSession.update({ authError: undefined });
      }
    }

    const url = new URL(request.url);
    // Handle email parameter manually to preserve literal '+' characters
    const emailParam = url.searchParams.toString().match(/email=([^&]*)/)?.[1];
    const prefilledEmail = emailParam ? decodeURIComponent(emailParam.replace(/\+/g, '%2B')) : null;
    const redirectTo = url.searchParams.get('redirectTo');

    return {
      isSignupReady: appConfig
        ? appConfig.status.migrations && appConfig.status.hasOrg && appConfig.status.hasUser
        : false,
      didMigrationsRun: appConfig?.status.migrations ?? false,
      authError: authError ?? (!appConfig ? ('BackendUnavailable' as AuthErrors) : undefined),
      isSsoEnabled: appConfig && appConfig.features.sso,
      isManagedMarble: appConfig?.isManagedMarble ?? false,
      prefilledEmail,
      redirectTo,
    };
  });

export const Route = createFileRoute('/_app/_auth/sign-in-email')({
  staticData: {
    i18n: authI18n,
  },
  loader: () => signInEmailLoader(),
  component: LoginWithEmail,
});

function LoginWithEmail() {
  const { t } = useTranslation(['common', 'auth']);
  const { authError, isSsoEnabled, isSignupReady, didMigrationsRun, isManagedMarble, prefilledEmail, redirectTo } =
    Route.useLoaderData();

  const signInMutation = useMutation({
    mutationFn: async (authPayload: AuthPayload) =>
      signInEmailFn({
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
      {isSsoEnabled ? (
        <Link className="absolute top-[60px] left-[60px] flex gap-2 text-s items-center" to="/sign-in">
          <Icon icon="arrow-left" className="size-4" />
          {t('common:back')}
        </Link>
      ) : null}
      <div className="flex flex-col gap-8">
        <h2 className="text-2xl text-center">{t('auth:sign_in')}</h2>
        {!isSignupReady ? <UnreadyCallout didMigrationsRun={didMigrationsRun} /> : null}
        <ClientOnly
          fallback={
            <StaticSignInWithEmailAndPassword
              additionalContent={isSsoEnabled ? <SignInFirstConnection isSignInHomepage={false} /> : null}
              prefilledEmail={prefilledEmail}
            />
          }
        >
          <SignInWithEmailAndPassword
            signIn={signIn}
            loading={loading && type === 'email'}
            additionalContent={isSsoEnabled ? <SignInFirstConnection isSignInHomepage={false} /> : null}
            prefilledEmail={prefilledEmail}
          />
        </ClientOnly>
        {!isSsoEnabled ? (
          <>
            <div className="flex items-center gap-4 self-stretch">
              <div className="h-px bg-grey-border grow" />
              <span>{t('common:or')}</span>
              <div className="h-px bg-grey-border grow" />
            </div>
            <div className="flex flex-col gap-8">
              <h2 className="text-2xl text-center">{t('auth:sign_in.first_connection')}</h2>
              <div className="flex flex-col gap-2">
                <SignInFirstConnection isSignInHomepage={false} showAskDemoButton={!isSsoEnabled && isManagedMarble} />
              </div>
            </div>
          </>
        ) : null}
      </div>
      {authError ? <AuthError error={authError as AuthErrors} className="mt-8" /> : null}
    </div>
  );
}
