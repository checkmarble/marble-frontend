import { authI18n } from '@app-builder/components/Auth/auth-i18n';
import { SignInWithEmail } from '@app-builder/components/Auth/SignInWithEmail';
import { SignInWithGoogle } from '@app-builder/components/Auth/SignInWithGoogle';
import { type AuthErrors } from '@app-builder/models';
import { useSignIn } from '@app-builder/routes/ressources+/auth+/login';
import { serverServices } from '@app-builder/services/init.server';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { type ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';

export async function loader({ request }: LoaderFunctionArgs) {
  const {
    authService,
    authSessionService: { getSession },
  } = serverServices;
  await authService.isAuthenticated(request, {
    successRedirect: '/home',
  });
  const session = await getSession(request);
  const error = session.get('authError');

  return json({
    authError: error?.message,
  });
}

export const handle = {
  i18n: authI18n,
};

const errorLabels: Record<AuthErrors, ParseKeys<['login', 'common']>> = {
  NoAccount: 'login:errors.no_account',
  Unknown: 'common:errors.unknown',
};

export default function SignUp() {
  const { t } = useTranslation(handle.i18n);
  const { authError } = useLoaderData<typeof loader>();

  const signIn = useSignIn();

  return (
    <div className="flex w-full flex-col items-center">
      <div className="w-full">
        <SignInWithGoogle signIn={signIn} />
      </div>

      <div
        className="my-4 flex w-full flex-row items-center gap-1"
        role="separator"
      >
        <div className="bg-grey-10 h-px w-full" />
        or
        <div className="bg-grey-10 h-px w-full" />
      </div>

      <div className="w-full">
        <SignInWithEmail signIn={signIn} />
      </div>
      {authError ? (
        <p className="text-xs font-normal text-red-100">
          {t(errorLabels[authError])}
        </p>
      ) : null}
    </div>
  );
}
