import { type AuthPayload } from '@app-builder/services/auth/auth.server';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, redirect } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';

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

export function useSignIn() {
  const fetcher = useFetcher();
  const signIn = (authPayload: AuthPayload) =>
    fetcher.submit(authPayload, {
      method: 'POST',
      action: getRoute('/ressources/auth/login'),
    });

  return signIn;
}
