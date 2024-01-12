import { SignInWithEmail } from '@app-builder/components/Auth/SignInWithEmail';
import { SignInWithGoogle } from '@app-builder/components/Auth/SignInWithGoogle';
import { type AuthErrors } from '@app-builder/models';
import { serverServices } from '@app-builder/services/init.server';
import { Player } from '@lottiefiles/react-lottie-player';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { type Namespace, type ParseKeys } from 'i18next';
import { Trans, useTranslation } from 'react-i18next';
import { Logo } from 'ui-icons';

import { useSignIn } from './ressources+/auth+/login';

export async function loader({ request }: LoaderFunctionArgs) {
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

  const signIn = useSignIn();

  return (
    <div className="flex h-full w-full justify-center bg-gradient-to-r from-[#0b0a51] to-[#160524]">
      <div className="flex h-full w-full max-w-screen-xl flex-row justify-center gap-20 md:p-20">
        <div className="hidden flex-col justify-center gap-6 py-6 md:flex">
          <div className="flex h-fit flex-col justify-end gap-6">
            <h1 className="text-grey-00 text-balance text-[30px] font-medium leading-tight lg:text-[44px]">
              <Trans
                t={t}
                i18nKey="login:great_rules_right_tools"
                components={{
                  RightTools: <span className="capitalize text-[#ada7fd]" />,
                }}
              />
            </h1>
            <p className="text-m lg:text-l text-grey-00 text-balance">
              {t('login:marble_description')}
            </p>
          </div>
          <div className="relative flex flex-1 flex-col justify-start [&>*]:absolute [&>*]:h-full">
            <Player
              src="/img/lottie/login_hero.json"
              loop
              direction={1}
              autoplay
              renderer="svg"
              className="h-full w-full"
            />
          </div>
        </div>
        <div className="flex w-full max-w-96 flex-col items-center justify-center">
          <div className="bg-grey-00 mb-10 flex h-fit w-full flex-col items-center rounded-lg p-5 text-center shadow-md sm:p-10">
            <Logo
              logo="logo-standard"
              className="text-grey-100 mb-6 h-full max-h-20 w-full max-w-60"
              preserveAspectRatio="xMinYMid meet"
              aria-labelledby="marble"
            />

            <div className="w-full">
              <SignInWithGoogle signIn={signIn} />
            </div>

            <div
              className="my-4 flex w-full flex-row items-center gap-1"
              role="separator"
            >
              <div className="bg-grey-10 h-px w-full" />
              or
              <div className="bg-grey-10 h-px w-full" />
            </div>

            <div className="w-full">
              <SignInWithEmail signIn={signIn} />
            </div>
            {authError ? (
              <p className="text-xs font-normal text-red-100">
                {t(errorLabels[authError])}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
