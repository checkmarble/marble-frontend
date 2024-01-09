import { useGoogleSignIn } from '@app-builder/services/auth/auth.client';
import { type AuthPayload } from '@app-builder/services/auth/auth.server';
import { clientServices } from '@app-builder/services/init.client';
import { useTranslation } from 'react-i18next';
import { ClientOnly } from 'remix-utils/client-only';
import { Logo } from 'ui-icons';

function SignInWithGoogleButton({ onClick }: { onClick?: () => void }) {
  const { t } = useTranslation(['login']);

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
        {t('login:sign_in.google')}
      </span>
    </button>
  );
}

function ClientSignInWithGoogle({
  signIn,
}: {
  signIn: (authPayload: AuthPayload) => void;
}) {
  const googleSignIn = useGoogleSignIn(
    clientServices.authenticationClientService,
  );

  const handleGoogleSignIn = async () => {
    const result = await googleSignIn();
    if (!result) return;
    const { idToken, csrf } = result;
    if (!idToken) return;
    signIn({ idToken, csrf });
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
