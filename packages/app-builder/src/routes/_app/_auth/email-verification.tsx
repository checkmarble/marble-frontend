import { authI18n } from '@app-builder/components/Auth/auth-i18n';
import { SendEmailVerification } from '@app-builder/components/Auth/SendEmailVerification';
import { servicesMiddleware } from '@app-builder/middlewares/services-middleware';
import { useClientServices } from '@app-builder/services/init-client';
import { ClientOnly, createFileRoute, Link, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

const emailVerificationLoader = createServerFn()
  .middleware([servicesMiddleware])
  .handler(async function emailVerificationLoader({ context }) {
    const request = getRequest();
    try {
      await context.services.authService.isAuthenticated(request, {
        successRedirect: '/app-router',
      });
    } catch (error) {
      if (error instanceof Response && error.status >= 300 && error.status < 400) {
        throw redirect({ href: error.headers.get('Location')!, statusCode: error.status });
      }
      throw error;
    }
    return null;
  });

export const Route = createFileRoute('/_app/_auth/email-verification')({
  staticData: {
    i18n: authI18n,
    alignment: 'reverse',
  },
  loader: () => emailVerificationLoader(),
  component: SignUp,
});

const UserEmail = () => {
  const { authenticationClientService } = useClientServices();
  const user = authenticationClientService.authenticationClientRepository.getCurrentUser();

  return <strong>{user?.email}</strong>;
};

function SignUp() {
  const { t } = useTranslation(['common', 'auth']);

  return (
    <div className="flex w-full flex-col gap-10 items-center text-s">
      <Link className="absolute top-[60px] left-[60px] flex gap-2 text-s items-center" to="/sign-in-email">
        <Icon icon="arrow-left" className="size-4" />
        {t('common:back')}
      </Link>
      <h2 className="text-2xl text-center">{t('auth:email-verification.title')}</h2>

      <div className="flex flex-col gap-6 items-center">
        <p>{t('auth:email-verification.email_sent')}</p>
        <ClientOnly>
          <UserEmail />
        </ClientOnly>
        <p>{t('auth:email-verification.click_on_link')}</p>
      </div>

      <div className="flex flex-col gap-4 items-center">
        <p>{t('auth:email-verification.not_received')}</p>
        <SendEmailVerification />
      </div>
    </div>
  );
}
