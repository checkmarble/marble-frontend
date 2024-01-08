import { useGoogleSignIn } from '@app-builder/services/auth/auth.client';
import { clientServices } from '@app-builder/services/init.client';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, redirect } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { ClientOnly } from 'remix-utils/client-only';
import { Logo } from 'ui-icons';

export function loader() {
  return redirect('/login');
}

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = serverServices;
  return await authService.authenticate(request, {
    successRedirect: '/home',
    failureRedirect: '/login',
  });
}

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

function ClientSignInWithGoogle() {
  const fetcher = useFetcher();

  const googleSignIn = useGoogleSignIn(
    clientServices.authenticationClientService,
  );

  const handleGoogleSignIn = async () => {
    const result = await googleSignIn();
    if (!result) return;
    const { idToken, csrf } = result;
    if (!idToken) return;
    fetcher.submit(
      { idToken, csrf },
      { method: 'POST', action: getRoute('/ressources/auth/login') },
    );
  };

  return (
    <SignInWithGoogleButton
      onClick={() => {
        void handleGoogleSignIn();
      }}
    />
  );
}

export function SignInWithGoogle() {
  return (
    <ClientOnly fallback={<SignInWithGoogleButton />}>
      {() => <ClientSignInWithGoogle />}
    </ClientOnly>
  );
}
