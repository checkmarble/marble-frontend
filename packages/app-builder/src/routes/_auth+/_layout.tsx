import { authI18n } from '@app-builder/components/Auth/auth-i18n';
import { LottiePlayer } from '@app-builder/components/LottiePlayer.client';
import { Outlet } from '@remix-run/react';
import { Trans, useTranslation } from 'react-i18next';
import { ClientOnly } from 'remix-utils/client-only';
import { Logo } from 'ui-icons';

import { LanguagePicker } from '../ressources+/user+/language';

export const handle = {
  i18n: authI18n,
};

export default function AuthLayout() {
  const { t } = useTranslation(handle.i18n);

  return (
    <div className="flex size-full justify-center bg-gradient-to-r from-[#0b0a51] to-[#160524]">
      <div className="flex size-full max-w-screen-xl flex-row justify-center gap-20 md:p-20">
        <div className="hidden flex-col justify-center gap-6 py-6 md:flex">
          <div className="flex h-fit flex-col justify-end gap-6">
            <h1 className="text-grey-100 text-balance text-[30px] font-medium leading-tight lg:text-[44px]">
              <Trans
                t={t}
                i18nKey="auth:great_rules_right_tools"
                components={{
                  RightTools: <span className="capitalize text-[#ada7fd]" />,
                }}
              />
            </h1>
            <p className="text-m lg:text-l text-grey-100 text-balance">
              {t('auth:marble_description')}
            </p>
          </div>
          <div className="relative flex flex-1 flex-col justify-start [&>*]:absolute [&>*]:h-full">
            <ClientOnly>
              {() => (
                <LottiePlayer
                  src="/img/lottie/login_hero.json"
                  loop
                  direction={1}
                  autoplay
                  renderer="svg"
                  className="size-full"
                />
              )}
            </ClientOnly>
          </div>
        </div>
        <div className="flex w-full max-w-96 flex-col items-center justify-center">
          <div className="bg-grey-100 relative flex h-fit w-full flex-col items-center rounded-lg px-5 text-center sm:px-10">
            <Logo
              logo="logo-standard"
              className="text-grey-00 mb-6 mt-5 size-full max-h-20 max-w-60 sm:mt-10"
              preserveAspectRatio="xMinYMid meet"
              aria-labelledby="marble"
            />

            <Outlet />
            <div className="my-5">
              <LanguagePicker />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
