import { authenticator } from '@app-builder/services/auth/auth.server';
import { getClientAuth } from '@app-builder/services/auth/firebase.client';
import { type ActionArgs, redirect } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { GoogleLogo } from '@ui-icons';
import { useTranslation } from 'react-i18next';
import { useAuthenticityToken } from 'remix-utils';

export function loader() {
  return redirect('/login');
}

export async function action({ request }: ActionArgs) {
  return await authenticator.authenticate(request, {
    successRedirect: '/home',
    failureRedirect: '/login',
  });
}

export function SignInWithGoogle() {
  const { t, i18n } = useTranslation(['login']);
  const fetcher = useFetcher();
  const csrf = useAuthenticityToken();

  const handleGoogleSingIn = async () => {
    const { googleSignIn } = await getClientAuth(i18n.language);
    const idToken = await googleSignIn();
    if (!idToken) return;
    fetcher.submit(
      { idToken, csrf },
      { method: 'POST', action: '/ressources/auth/login' }
    );
  };

  return (
    <button
      className="flex h-10 w-full items-center rounded border-2 border-[#1a73e8] bg-[#1a73e8] transition hover:bg-[rgb(69,128,233)]"
      onClick={() => {
        void handleGoogleSingIn();
      }}
    >
      <div className="bg-grey-00 flex h-full w-10 items-center justify-center rounded-l-[3px]">
        <GoogleLogo height="24px" width="24px" />
      </div>
      <span className="text-s text-grey-00 w-full whitespace-nowrap text-center align-middle font-medium">
        {t('login:sign_in.google')}
      </span>
    </button>
  );
}
