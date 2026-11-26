import { SendEmailVerification } from '@app-builder/components/Auth/SendEmailVerification';
import { isAuthenticated } from '@app-builder/server/auth';
import { useFirebaseAuthClient } from '@app-builder/services/auth/firebase-auth-client';
import { ClientOnly, createFileRoute, Link, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { useTranslation } from 'react-i18next';
import { Typo } from 'ui-design-system';
import { Icon } from 'ui-icons';

const emailVerificationLoader = createServerFn().handler(async function emailVerificationLoader() {
  const request = getRequest();
  if (await isAuthenticated(request)) throw redirect({ to: '/app-router' });
  return null;
});

export const Route = createFileRoute('/_app/_auth/email-verification')({
  staticData: {
    alignment: 'reverse',
  },
  loader: () => emailVerificationLoader(),
  component: SignUp,
});

const UserEmail = () => {
  const user = useFirebaseAuthClient().getCurrentUser();

  return <strong>{user?.email}</strong>;
};

function SignUp() {
  const { t } = useTranslation(['common', 'auth']);

  return (
    <div className="flex w-full flex-col gap-2xl items-center text-s">
      <Link className="absolute top-[60px] start-[60px] flex gap-sm text-s items-center" to="/sign-in-email">
        <Icon icon="arrow-left" className="size-4" />
        {t('common:back')}
      </Link>
      <Typo variant="title2" className="text-center">
        {t('auth:email-verification.title')}
      </Typo>

      <div className="flex flex-col gap-lg items-center">
        <p>{t('auth:email-verification.email_sent')}</p>
        <ClientOnly>
          <UserEmail />
        </ClientOnly>
        <p>{t('auth:email-verification.click_on_link')}</p>
      </div>

      <div className="flex flex-col gap-md items-center">
        <p>{t('auth:email-verification.not_received')}</p>
        <SendEmailVerification />
      </div>
    </div>
  );
}
