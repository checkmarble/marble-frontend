import { authenticator } from '@marble-front/builder/services/auth/auth.server';
import { type LoaderArgs } from '@remix-run/node';

export async function loader({ request }: LoaderArgs) {
  return authenticator.isAuthenticated(request, {
    successRedirect: './trigger',
    failureRedirect: '/login',
  });
}
