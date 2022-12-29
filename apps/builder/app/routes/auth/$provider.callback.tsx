import { authenticator } from '@marble-front/builder/services/auth/auth.server';
import type { LoaderArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';

export async function loader({ request, params }: LoaderArgs) {
  const { provider } = params;
  if (!provider) {
    return redirect('/login');
  }

  return authenticator.authenticate(provider, request, {
    successRedirect: '/home',
    failureRedirect: '/login',
  });
}
