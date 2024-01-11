import { authI18n } from '@app-builder/components/Auth/auth-i18n';
import { Player } from '@lottiefiles/react-lottie-player';
import { Outlet } from '@remix-run/react';
import { Trans, useTranslation } from 'react-i18next';
import { Logo } from 'ui-icons';

export const handle = {
  i18n: authI18n,
};

export default function AuthLayout() {
  const { t } = useTranslation(handle.i18n);

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
          <div className="bg-grey-00 flex h-fit w-full flex-col items-center rounded-lg p-5 text-center sm:p-10">
            <Logo
              logo="logo-standard"
              className="text-grey-100 mb-6 h-full max-h-20 w-full max-w-60"
              preserveAspectRatio="xMinYMid meet"
              aria-labelledby="marble"
            />

            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
