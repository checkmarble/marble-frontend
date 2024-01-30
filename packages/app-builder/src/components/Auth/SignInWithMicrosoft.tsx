import {
  AccountExistsWithDifferentCredential,
  useMicrosoftSignIn,
} from '@app-builder/services/auth/auth.client';
import { type AuthPayload } from '@app-builder/services/auth/auth.server';
import { clientServices } from '@app-builder/services/init.client';
import * as Sentry from '@sentry/remix';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { ClientOnly } from 'remix-utils/client-only';
import { Logo } from 'ui-icons';

function SignInWithMicrosoftButton({ onClick }: { onClick?: () => void }) {
  const { t } = useTranslation(['auth']);

  return (
    <button
      className="bg-grey-00 hover:bg-grey-05 active:bg-grey-10 flex h-10 w-full items-center gap-3 border border-[#8C8C8C] p-px transition"
      onClick={() => {
        void onClick?.();
      }}
    >
      <div className="flex h-full w-10 items-center justify-center">
        <Logo logo="microsoft-logo" className="size-6" />
      </div>
      <span className="text-s w-full whitespace-nowrap text-center align-middle font-semibold text-[#5E5E5E]">
        {t('auth:sign_in.microsoft')}
      </span>
    </button>
  );
}

function ClientSignInWithMicrosoft({
  signIn,
}: {
  signIn: (authPayload: AuthPayload) => void;
}) {
  const { t } = useTranslation(['common']);
  const microsoftSignIn = useMicrosoftSignIn(
    clientServices.authenticationClientService,
  );

  const handleMicrosoftSignIn = async () => {
    try {
      const result = await microsoftSignIn();
      if (!result) return;
      const { idToken, csrf } = result;
      if (!idToken) return;
      signIn({ idToken, csrf });
    } catch (error) {
      if (error instanceof AccountExistsWithDifferentCredential) {
        toast.error(
          t('common:errors.account_exists_with_different_credential'),
        );
      } else {
        Sentry.captureException(error);
        toast.error(t('common:errors.unknown'));
      }
    }
  };

  return (
    <SignInWithMicrosoftButton
      onClick={() => {
        void handleMicrosoftSignIn();
      }}
    />
  );
}

export function SignInWithMicrosoft({
  signIn,
}: {
  signIn: (authPayload: AuthPayload) => void;
}) {
  return (
    <ClientOnly fallback={<SignInWithMicrosoftButton />}>
      {() => <ClientSignInWithMicrosoft signIn={signIn} />}
    </ClientOnly>
  );
}
