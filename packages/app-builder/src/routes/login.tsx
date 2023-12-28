import { type AuthErrors } from '@app-builder/models';
import { serverServices } from '@app-builder/services/init.server';
import { json, type LoaderArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { type Namespace, type ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Logo } from 'ui-icons';

import { SignInWithGoogle } from './ressources/auth/login';
import { LanguagePicker } from './ressources/user/language';

export async function loader({ request }: LoaderArgs) {
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
  i18n: ['login', 'common'] satisfies Namespace,
};

const errorLabels: Record<AuthErrors, ParseKeys<['login', 'common']>> = {
  NoAccount: 'login:errors.no_account',
  Unknown: 'common:errors.unknown',
};

export default function Login() {
  const { t } = useTranslation(handle.i18n);
  const { authError } = useLoaderData<typeof loader>();

  return (
    <div className="from-purple-10 to-grey-02 flex h-full w-full flex-col items-center bg-gradient-to-r">
      <div className="flex h-full w-full flex-col items-center bg-[url('/img/login_background.svg')] bg-no-repeat">
        <div className="flex h-full max-h-80 flex-col justify-center">
          <Logo
            logo="logo-standard"
            className="h-10 w-auto"
            preserveAspectRatio="xMinYMid meet"
            aria-labelledby="marble"
          />
        </div>
        <div className="bg-grey-00 mb-10 flex shrink-0 flex-col items-center rounded-2xl p-10 text-center shadow-md">
          <h1 className="text-l mb-12 font-semibold">{t('login:title')}</h1>

          <div className="mb-1 w-full">
            <SignInWithGoogle />
          </div>

          {authError ? (
            <p className="text-xs font-normal text-red-100">
              {t(errorLabels[authError])}
            </p>
          ) : null}

          <p className="text-s mt-12 font-medium">
            {t('login:help.no_account')} {t('login:help.contact_us')}
          </p>
        </div>
        <LanguagePicker />
      </div>
    </div>
  );
}
