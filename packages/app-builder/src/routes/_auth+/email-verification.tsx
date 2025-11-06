import { authI18n } from '@app-builder/components/Auth/auth-i18n';
import { SendEmailVerification } from '@app-builder/components/Auth/SendEmailVerification';
import { useClientServices } from '@app-builder/services/init.client';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type LoaderFunctionArgs } from '@remix-run/node';
import { Link } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { ClientOnly } from 'remix-utils/client-only';
import { Icon } from 'ui-icons';

export const handle = {
  i18n: authI18n,
  alignment: 'reverse',
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  await authService.isAuthenticated(request, {
    successRedirect: getRoute('/app-router'),
  });
  return null;
}

const UserEmail = () => {
  const { authenticationClientService } = useClientServices();
  const user = authenticationClientService.authenticationClientRepository.getCurrentUser();

  return <strong>{user?.email}</strong>;
};

export default function SignUp() {
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
        <ClientOnly>{() => <UserEmail />}</ClientOnly>
        <p>{t('auth:email-verification.click_on_link')}</p>
      </div>

      <div className="flex flex-col gap-4 items-center">
        <p>{t('auth:email-verification.not_received')}</p>
        <SendEmailVerification />
      </div>
    </div>
  );
}
