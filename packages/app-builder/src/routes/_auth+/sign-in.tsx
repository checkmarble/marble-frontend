import { authI18n } from '@app-builder/components/Auth/auth-i18n';
import { SignInFirstConnection } from '@app-builder/components/Auth/SignInFirstConnection';
import { SignInWithGoogle } from '@app-builder/components/Auth/SignInWithGoogle';
import { SignInWithMicrosoft } from '@app-builder/components/Auth/SignInWithMicrosoft';
import { UnreadyCallout } from '@app-builder/components/Auth/UnreadyCallout';
import { type AuthErrors } from '@app-builder/models/auth-errors';
import { type AuthPayload } from '@app-builder/services/auth/auth.server';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node';
import { Link, redirect, useFetcher, useLoaderData, useSearchParams } from '@remix-run/react';
import { tryit } from 'radash';
import { safeRedirect } from 'remix-utils/safe-redirect';
import { CtaClassName } from 'ui-design-system';

export const handle = {
  i18n: authI18n,
  // MainComponent: () => ,
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

  const isSsoEnabled = appConfig && appConfig.features.sso;
  if (!isSsoEnabled) {
    return redirect(getRoute('/sign-in-email'));
  }

  return {
    isSignupReady: appConfig
      ? appConfig.status.migrations && appConfig.status.hasOrg && appConfig.status.hasUser
      : false,
    didMigrationsRun: appConfig?.status.migrations ?? false,
    authError: !appConfig
      ? 'BackendUnavailable'
      : (session.get('authError')?.message as AuthErrors),
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
  const { isSignupReady, didMigrationsRun } = useLoaderData<typeof loader>();

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

  return (
    <div className="flex flex-col gap-10 w-full">
      <div className="flex flex-col gap-8">
        <h2 className="text-2xl text-center">Sign in</h2>
        {!isSignupReady ? <UnreadyCallout didMigrationsRun={didMigrationsRun} /> : null}
        <div className="flex flex-col gap-2">
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
            className={CtaClassName({ variant: 'primary', color: 'purple', className: 'text-s' })}
            to="/sign-in-email"
          >
            Sign in with email
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-4 self-stretch">
        <div className="h-px bg-grey-90 grow" />
        <span>or</span>
        <div className="h-px bg-grey-90 grow" />
      </div>
      <div className="flex flex-col gap-8">
        <h2 className="text-2xl text-center">First connection</h2>
        <div className="flex flex-col gap-2">
          <SignInFirstConnection showAskDemoButton />
        </div>
      </div>
    </div>
  );

  // return (
  //   <div className="flex w-full flex-col items-center">
  //     {!isSignupReady ? (
  //       <Callout variant="soft" color="red" className="mb-6 text-start">
  //         <div>
  //           {didMigrationsRun
  //             ? t('auth:sign_up.warning.instance_not_initialized')
  //             : t('auth:sign_up.warning.database_not_migrated')}
  //           <p>
  //             {t('auth:sign_up.read_more')}
  //             <a
  //               href="https://github.com/checkmarble/marble/blob/main/installation/first_connection.md"
  //               className="text-purple-65 px-[1ch] underline"
  //             >
  //               {t('auth:sign_up.first_connection_guide')}
  //             </a>
  //           </p>
  //         </div>
  //       </Callout>
  //     ) : null}
  //     {isSsoEnabled ? (
  //       <>
  //         <div className="flex w-full flex-col gap-2">
  //           <SignInWithGoogle
  //             signIn={signIn}
  //             // eslint-disable-next-line react/jsx-no-leaked-render
  //             loading={loading && type === 'google'}
  //           />
  //           <SignInWithMicrosoft
  //             signIn={signIn}
  //             // eslint-disable-next-line react/jsx-no-leaked-render
  //             loading={loading && type === 'microsoft'}
  //           />
  //         </div>

  //         <div className="my-4 flex w-full flex-row items-center gap-1" role="separator">
  //           <div className="bg-grey-90 h-px w-full" />
  //           or
  //           <div className="bg-grey-90 h-px w-full" />
  //         </div>
  //       </>
  //     ) : null}
  //     <div className="flex w-full flex-col items-center gap-2">
  //       <ClientOnly fallback={<StaticSignInWithEmailAndPassword />}>
  //         {() => (
  //           <SignInWithEmailAndPassword
  //             signIn={signIn}
  //             // eslint-disable-next-line react/jsx-no-leaked-render
  //             loading={loading && type === 'email'}
  //           />
  //         )}
  //       </ClientOnly>
  //       <p className="w-fit text-xs">
  //         <Trans
  //           t={t}
  //           i18nKey="auth:sign_in.dont_have_an_account"
  //           components={{
  //             SignUp: <Link className="text-purple-65 underline" to={getRoute('/sign-up')} />,
  //           }}
  //           values={{
  //             signUp: t('auth:sign_up'),
  //           }}
  //         />
  //       </p>
  //       <Link className="text-purple-65 w-fit text-xs underline" to={getRoute('/forgot-password')}>
  //         {t('auth:sign_in.forgot_password')}
  //       </Link>
  //     </div>
  //     {authError ? <AuthError error={authError as AuthErrors} className="mt-8" /> : null}
  //   </div>
  // );
}
