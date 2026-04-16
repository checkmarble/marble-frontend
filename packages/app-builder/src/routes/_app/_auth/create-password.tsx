import { authI18n } from '@app-builder/components/Auth/auth-i18n';
import { ResetPassword, StaticResetPassword } from '@app-builder/components/Auth/ResetPassword';
import { servicesMiddleware } from '@app-builder/middlewares/services-middleware';
import { ClientOnly, createFileRoute, Link, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { Trans, useTranslation } from 'react-i18next';

const createPasswordLoader = createServerFn()
  .middleware([servicesMiddleware])
  .handler(async function createPasswordLoader({ context }) {
    const request = getRequest();
    const appConfig = context.appConfig;
    if (appConfig?.auth.provider === 'oidc') {
      throw redirect({ to: '/sign-in' });
    }

    const url = new URL(request.url);
    // Handle email parameter manually to preserve literal '+' characters
    const emailParam = url.searchParams.toString().match(/email=([^&]*)/)?.[1];
    const prefilledEmail = emailParam ? decodeURIComponent(emailParam.replace(/\+/g, '%2B')) : null;

    return { prefilledEmail };
  });

export const Route = createFileRoute('/_app/_auth/create-password')({
  staticData: {
    i18n: authI18n,
  },
  loader: () => createPasswordLoader(),
  component: ForgotPassword,
});

function ForgotPassword() {
  const { prefilledEmail } = Route.useLoaderData();
  const { t } = useTranslation(authI18n);

  return (
    <div className="flex flex-col gap-10 w-full">
      <h2 className="text-2xl text-center">{t('auth:reset-password.title')}</h2>
      <ClientOnly fallback={<StaticResetPassword prefilledEmail={prefilledEmail} />}>
        <ResetPassword prefilledEmail={prefilledEmail} />
      </ClientOnly>
      <p className="mt-2 text-xs">
        <Trans
          t={t}
          i18nKey="auth:reset-password.wrong_place"
          components={{
            SignIn: <Link className="text-purple-primary underline" to="/sign-in-email" />,
          }}
        />
      </p>
    </div>
  );
}
