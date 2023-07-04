import {
  authenticator,
  type AuthErrors,
} from '@marble-front/builder/services/auth/auth.server';
import { getSession } from '@marble-front/builder/services/auth/session.server';
import { LogoStandard } from '@marble-front/ui/icons';
import { json, type LoaderArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { type Namespace, type ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';

import { SignInWithGoogle } from './ressources/auth/login';
import { LanguagePicker } from './ressources/user/language';

export async function loader({ request }: LoaderArgs) {
  await authenticator.isAuthenticated(request, {
    successRedirect: '/home',
  });
  const session = await getSession(request.headers.get('cookie'));
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
          <LogoStandard
            className="w-auto"
            width={undefined}
            height="40px"
            preserveAspectRatio="xMinYMid meet"
          />
        </div>
        <div className="bg-grey-00 min-w-xs mb-10 flex flex-shrink-0 flex-col items-center rounded-2xl p-10 text-center shadow-md">
          <h1 className="text-l mb-12 font-semibold">{t('login:title')}</h1>

          <div className="mb-1 w-full">
            <SignInWithGoogle />
          </div>

          {authError && (
            <p className="text-xs font-normal text-red-100">
              {t(errorLabels[authError])}
            </p>
          )}

          <p className="text-s mt-12 font-medium">
            {t('login:help.no_account')} {t('login:help.contact_us')}
          </p>
        </div>
        <LanguagePicker />
      </div>
    </div>
  );
}
