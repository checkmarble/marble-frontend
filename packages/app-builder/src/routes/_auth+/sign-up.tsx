import { Callout } from '@app-builder/components';
import { AuthError } from '@app-builder/components/Auth/AuthError';
import { authI18n } from '@app-builder/components/Auth/auth-i18n';
import {
  SignUpWithEmailAndPassword,
  StaticSignUpWithEmailAndPassword,
} from '@app-builder/components/Auth/SignUpWithEmailAndPassword';
import { type AuthErrors } from '@app-builder/models/auth-errors';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { tryit } from 'radash';
import { useTranslation } from 'react-i18next';
import { ClientOnly } from 'remix-utils/client-only';

export const handle = {
  i18n: authI18n,
};

export async function loader({ request }: LoaderFunctionArgs) {
  const {
    authService,
    authSessionService: { getSession },
    appConfigRepository: { getAppConfig },
  } = initServerServices(request);
  await authService.isAuthenticated(request, {
    successRedirect: getRoute('/app-router'),
  });
  const session = await getSession(request);
  const error = session.get('authError');

  const [_err, appConfig] = await tryit(() => getAppConfig())();

  if (!appConfig) {
    console.error('Error fetching app config API');
  }

  return {
    isSignupReady: appConfig
      ? appConfig.status.migrations && appConfig.status.hasOrg && appConfig.status.hasUser
      : false,
    didMigrationsRun: appConfig?.status.migrations ?? false,
    authError: appConfig ? error?.message : 'BackendUnavailable',
  };
}

export default function SignUp() {
  const { t } = useTranslation(handle.i18n);
  const { authError, isSignupReady, didMigrationsRun } = useLoaderData<typeof loader>();

  const navigate = useNavigate();
  const signUp = () => navigate(getRoute('/email-verification'));

  return (
    <div className="flex flex-col gap-10 w-full">
      <div className="flex flex-col gap-8">
        <h2 className="text-2xl text-center">{t('auth:sign_up')}</h2>
        {isSignupReady ? (
          <Callout variant="soft" className="mb-6 text-start">
            {t('auth:sign_up.description')}
          </Callout>
        ) : (
          <Callout variant="soft" color="red" className="mb-6 text-start">
            <div>
              {didMigrationsRun
                ? t('auth:sign_up.warning.instance_not_initialized')
                : t('auth:sign_up.warning.database_not_migrated')}
              <p>
                {t('auth:sign_up.read_more')}
                <a
                  href="https://github.com/checkmarble/marble/blob/main/installation/first_connection.md"
                  className="text-purple-65 px-[1ch] underline"
                >
                  {t('auth:sign_up.first_connection_guide')}
                </a>
              </p>
            </div>
          </Callout>
        )}
        <ClientOnly fallback={<StaticSignUpWithEmailAndPassword />}>
          {() => <SignUpWithEmailAndPassword signUp={signUp} />}
        </ClientOnly>
        {authError ? <AuthError error={authError as AuthErrors} className="mt-8" /> : null}
      </div>
    </div>
  );
}
