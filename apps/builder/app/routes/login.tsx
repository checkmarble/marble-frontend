import {
  authenticator,
  type AuthErrors,
  isAuthErrors,
} from '@marble-front/builder/services/auth/auth.server';
import { getSession } from '@marble-front/builder/services/auth/session.server';
import { GoogleLogo, LogoStandard } from '@marble-front/ui/icons';
import { json, type LoaderArgs } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { type Namespace, type TFuncKey } from 'i18next';
import { useTranslation } from 'react-i18next';

import { LanguagePicker } from './ressources/user/language';

export async function loader({ request }: LoaderArgs) {
  await authenticator.isAuthenticated(request, {
    successRedirect: '/dashboard',
  });
  const session = await getSession(request.headers.get('cookie'));
  const error = session.get(authenticator.sessionErrorKey) as
    | { message?: string }
    | undefined;

  return json({
    authError:
      error && error.message
        ? isAuthErrors(error.message)
          ? error.message
          : 'Unknown'
        : undefined,
  });
}

export const handle = {
  i18n: ['login', 'common'] satisfies Namespace,
};

const errorLabels: Record<AuthErrors, TFuncKey<['login', 'common']>> = {
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

          <Form action={`/auth/google`} method="post" className="mb-1 w-full">
            <button className="flex h-10 w-full items-center rounded border-2 border-[#1a73e8] bg-[#1a73e8] transition hover:bg-[rgb(69,128,233)]">
              <div className="bg-grey-00 flex h-full w-10 items-center justify-center rounded-l-[3px]">
                <GoogleLogo height="24px" width="24px" />
              </div>
              <span className="text-s text-grey-00 w-full whitespace-nowrap text-center align-middle font-medium">
                {t('login:sign_in.google')}
              </span>
            </button>
          </Form>

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
