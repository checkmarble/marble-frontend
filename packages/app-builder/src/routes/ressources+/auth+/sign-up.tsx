import { type AuthPayload } from '@app-builder/services/auth/auth.server';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, redirect } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';

export function loader() {
  return redirect(getRoute('/login'));
}

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = serverServices;
  return await authService.authenticate(request, {
    successRedirect: getRoute('/scenarios/'),
    failureRedirect: getRoute('/sign-up'),
  });
}

export function useSignUp() {
  const fetcher = useFetcher();
  const signUp = (authPayload: AuthPayload) =>
    fetcher.submit(authPayload, {
      method: 'POST',
      action: getRoute('/ressources/auth/sign-up'),
    });

  return signUp;
}
