import { Form } from '@remix-run/react';
import type { LoaderArgs } from '@remix-run/node';
import { authenticator } from '@marble-front/builder/services/auth/auth.server';
import { GoogleLogo, LogoStandard } from '@marble-front/ui/icons';
import { useTranslation } from 'react-i18next';

export async function loader({ request }: LoaderArgs) {
  const user = await authenticator.isAuthenticated(request, {
    successRedirect: '/home',
  });

  return user;
}

export const handle = {
  i18n: ['login'],
};

export default function Login() {
  const { t } = useTranslation(['login']);

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
        <div className="bg-grey-00 flex w-full max-w-xs flex-shrink-0 flex-col items-center gap-12 rounded-2xl p-10 shadow-md">
          <h1 className="text-display-l-semibold">{t('login:title')}</h1>

          <Form action={`/auth/google`} method="post" className="w-full">
            <button className="flex h-10 w-full items-center rounded border-2 border-[#1a73e8] bg-[#1a73e8] transition hover:bg-[rgb(69,128,233)]">
              <div className="bg-grey-00 flex h-full w-10 items-center justify-center rounded-l-[3px]">
                <GoogleLogo height="24px" width="24px" />
              </div>
              <span className="text-text-s-medium text-grey-00 w-full text-center align-middle">
                {t('login:sign_in.google')}
              </span>
            </button>
          </Form>

          <p className="text-text-s-medium">
            {t('login:help.no_account')} {t('login:help.contact_us')}
          </p>
        </div>
      </div>
    </div>
  );
}
