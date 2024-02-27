import {
  AccountExistsWithDifferentCredential,
  NetworkRequestFailed,
  PopupBlockedByClient,
  useGoogleSignIn,
} from '@app-builder/services/auth/auth.client';
import { type AuthPayload } from '@app-builder/services/auth/auth.server';
import { clientServices } from '@app-builder/services/init.client';
import * as Sentry from '@sentry/remix';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { ClientOnly } from 'remix-utils/client-only';
import { Logo } from 'ui-icons';

import { PopupBlockedError } from './PopupBlockedError';

function SignInWithGoogleButton({ onClick }: { onClick?: () => void }) {
  const { t } = useTranslation(['auth']);

  return (
    <button
      className="flex h-10 w-full items-center rounded border-2 border-[#1a73e8] bg-[#1a73e8] transition hover:bg-[rgb(69,128,233)]"
      onClick={() => {
        void onClick?.();
      }}
    >
      <div className="bg-grey-00 flex h-full w-10 items-center justify-center rounded-l-[3px]">
        <Logo logo="google-logo" className="size-6" />
      </div>
      <span className="text-s text-grey-00 w-full whitespace-nowrap text-center align-middle font-medium">
        {t('auth:sign_in.google')}
      </span>
    </button>
  );
}

function ClientSignInWithGoogle({
  signIn,
}: {
  signIn: (authPayload: AuthPayload) => void;
}) {
  const { t } = useTranslation(['common']);
  const googleSignIn = useGoogleSignIn(
    clientServices.authenticationClientService,
  );

  const handleGoogleSignIn = async () => {
    try {
      const result = await googleSignIn();
      if (!result) return;
      const { idToken, csrf } = result;
      if (!idToken) return;
      signIn({ idToken, csrf });
    } catch (error) {
      if (error instanceof AccountExistsWithDifferentCredential) {
        toast.error(
          t('common:errors.account_exists_with_different_credential'),
        );
      } else if (error instanceof PopupBlockedByClient) {
        toast.error(<PopupBlockedError />);
      } else if (error instanceof NetworkRequestFailed) {
        toast.error(t('common:errors.firebase_network_error'));
      } else {
        Sentry.captureException(error);
        toast.error(t('common:errors.unknown'));
      }
    }
  };

  return (
    <SignInWithGoogleButton
      onClick={() => {
        void handleGoogleSignIn();
      }}
    />
  );
}

export function SignInWithGoogle({
  signIn,
}: {
  signIn: (authPayload: AuthPayload) => void;
}) {
  return (
    <ClientOnly fallback={<SignInWithGoogleButton />}>
      {() => <ClientSignInWithGoogle signIn={signIn} />}
    </ClientOnly>
  );
}
