import { AuthError } from '@app-builder/components/Auth/AuthError';
import { authI18n } from '@app-builder/components/Auth/auth-i18n';
import { SignInFirstConnection } from '@app-builder/components/Auth/SignInFirstConnection';
import {
  SignInWithEmailAndPassword,
  StaticSignInWithEmailAndPassword,
} from '@app-builder/components/Auth/SignInWithEmailAndPassword';
import { UnreadyCallout } from '@app-builder/components/Auth/UnreadyCallout';
import { type AuthErrors } from '@app-builder/models/auth-errors';
import { type AuthPayload } from '@app-builder/services/auth/auth.server';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node';
import { Link, useFetcher, useLoaderData, useSearchParams } from '@remix-run/react';
import { tryit } from 'radash';
import { useTranslation } from 'react-i18next';
import { ClientOnly } from 'remix-utils/client-only';
import { safeRedirect } from 'remix-utils/safe-redirect';
import { Icon } from 'ui-icons';

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
    console.error('Error fetching app config API');
  }

  const authError = !appConfig
    ? 'BackendUnavailable'
    : (session.get('authError')?.message as AuthErrors);

  const url = new URL(request.url);
  const prefilledEmail = url.searchParams.get('email');

  return Response.json(
    {
      isSignupReady: appConfig
        ? appConfig.status.migrations && appConfig.status.hasOrg && appConfig.status.hasUser
        : false,
      didMigrationsRun: appConfig?.status.migrations ?? false,
      authError,
      isSsoEnabled: appConfig && appConfig.features.sso,
      isManagedMarble: appConfig?.isManagedMarble ?? false,
      prefilledEmail,
    },
    {
      headers: {
        'Set-Cookie': await authSessionService.commitSession(session),
      },
    },
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);

  const { searchParams } = new URL(request.url);
  const redirectTo = searchParams.get('redirectTo');
  const successRedirect = safeRedirect(redirectTo, getRoute('/app-router'));

  return await authService.authenticate(request, {
    successRedirect,
    failureRedirect: getRoute('/sign-in-email'),
  });
}

export default function LoginWithEmail() {
  const { t } = useTranslation(['common', 'auth']);
  const {
    authError,
    isSsoEnabled,
    isSignupReady,
    didMigrationsRun,
    isManagedMarble,
    prefilledEmail,
  } = useLoaderData<typeof loader>();

  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');
  const fetcher = useFetcher();
  const signIn = (authPayload: AuthPayload) =>
    fetcher.submit(authPayload, {
      method: 'POST',
      action: getRoute('/sign-in-email') + (redirectTo ? `?redirectTo=${redirectTo}` : ''),
    });

  const loading = fetcher.state === 'loading';
  const type = fetcher.formData?.get('type');

  return (
    <div className="flex flex-col gap-10 w-full">
      {isSsoEnabled ? (
        <Link
          className="absolute top-[60px] left-[60px] flex gap-2 text-s items-center"
          to="/sign-in"
        >
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
              additionalContent={
                isSsoEnabled ? <SignInFirstConnection isSignInHomepage={false} /> : null
              }
              prefilledEmail={prefilledEmail}
            />
          }
        >
          {() => (
            <SignInWithEmailAndPassword
              signIn={signIn}
              // eslint-disable-next-line react/jsx-no-leaked-render
              loading={loading && type === 'email'}
              additionalContent={
                isSsoEnabled ? <SignInFirstConnection isSignInHomepage={false} /> : null
              }
              prefilledEmail={prefilledEmail}
            />
          )}
        </ClientOnly>
        {!isSsoEnabled ? (
          <>
            <div className="flex items-center gap-4 self-stretch">
              <div className="h-px bg-grey-90 grow" />
              <span>{t('common:or')}</span>
              <div className="h-px bg-grey-90 grow" />
            </div>
            <div className="flex flex-col gap-8">
              <h2 className="text-2xl text-center">{t('auth:sign_in.first_connection')}</h2>
              <div className="flex flex-col gap-2">
                <SignInFirstConnection
                  isSignInHomepage={false}
                  showAskDemoButton={!isSsoEnabled && isManagedMarble}
                />
              </div>
            </div>
          </>
        ) : null}
      </div>
      {authError ? <AuthError error={authError as AuthErrors} className="mt-8" /> : null}
    </div>
  );
}
