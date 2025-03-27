import { Callout } from '@app-builder/components';
import { authI18n } from '@app-builder/components/Auth/auth-i18n';
import { AuthError } from '@app-builder/components/Auth/AuthError';
import {
  SignUpWithEmailAndPassword,
  StaticSignUpWithEmailAndPassword,
} from '@app-builder/components/Auth/SignUpWithEmailAndPassword';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type LoaderFunctionArgs } from '@remix-run/node';
import { Link, useLoaderData, useNavigate } from '@remix-run/react';
import { marblecoreApi } from 'marble-api';
import { Trans, useTranslation } from 'react-i18next';
import { ClientOnly } from 'remix-utils/client-only';

export const handle = {
  i18n: authI18n,
};

export async function loader({ request }: LoaderFunctionArgs) {
  const {
    authService,
    authSessionService: { getSession },
  } = initServerServices(request);
  await authService.isAuthenticated(request, {
    successRedirect: getRoute('/app-router'),
  });
  const session = await getSession(request);
  const error = session.get('authError');

  const { getSignupStatus } = marblecoreApi;

  const { has_an_organization, has_a_user } = await getSignupStatus();

  return Response.json({
    isSignupReady: has_an_organization && has_a_user,
    authError: error?.message,
  });
}

export default function SignUp() {
  const { t } = useTranslation(handle.i18n);
  const { authError, isSignupReady } = useLoaderData<typeof loader>();

  const navigate = useNavigate();
  const signUp = () => navigate(getRoute('/email-verification'));

  return (
    <div className="flex w-full flex-col items-center">
      {isSignupReady ? (
        <Callout variant="soft" className="mb-6 text-start">
          {t('auth:sign_up.description')}
        </Callout>
      ) : (
        <Callout variant="soft" color="red" className="mb-6 text-start">
          <div>
            {t('auth:sign_up.warning.instance_not_initialized')}
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
      <p className="mt-2 text-xs">
        <Trans
          t={t}
          i18nKey="auth:sign_up.already_have_an_account_sign_up"
          components={{
            SignIn: <Link className="text-purple-65 underline" to={getRoute('/sign-in')} />,
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
