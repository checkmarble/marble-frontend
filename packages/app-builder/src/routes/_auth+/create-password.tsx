import { authI18n } from '@app-builder/components/Auth/auth-i18n';
import { ResetPassword, StaticResetPassword } from '@app-builder/components/Auth/ResetPassword';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { LoaderFunctionArgs } from '@remix-run/node';
import { Link, redirect, useLoaderData } from '@remix-run/react';
import { tryit } from 'radash';
import { Trans, useTranslation } from 'react-i18next';
import { ClientOnly } from 'remix-utils/client-only';

export const handle = {
  i18n: authI18n,
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { appConfigRepository } = initServerServices(request);
  const [_, appConfig] = await tryit(() => appConfigRepository.getAppConfig())();
  if (appConfig?.auth.provider === 'oidc') {
    throw redirect(getRoute('/sign-in'));
  }

  const url = new URL(request.url);
  // Handle email parameter manually to preserve literal '+' characters
  const emailParam = url.searchParams.toString().match(/email=([^&]*)/)?.[1];
  const prefilledEmail = emailParam ? decodeURIComponent(emailParam.replace(/\+/g, '%2B')) : null;

  return { prefilledEmail };
}

export default function ForgotPassword() {
  const { prefilledEmail } = useLoaderData<typeof loader>();
  const { t } = useTranslation(handle.i18n);

  return (
    <div className="flex flex-col gap-10 w-full">
      <h2 className="text-2xl text-center">{t('auth:reset-password.title')}</h2>
      <ClientOnly fallback={<StaticResetPassword prefilledEmail={prefilledEmail} />}>
        {() => <ResetPassword prefilledEmail={prefilledEmail} />}
      </ClientOnly>
      <p className="mt-2 text-xs">
        <Trans
          t={t}
          i18nKey="auth:reset-password.wrong_place"
          components={{
            SignIn: <Link className="text-purple-65 underline" to={getRoute('/sign-in-email')} />,
          }}
        />
      </p>
    </div>
  );
}
