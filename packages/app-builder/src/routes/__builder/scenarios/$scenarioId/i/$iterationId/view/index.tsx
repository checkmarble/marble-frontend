import { serverServices } from '@app-builder/services/init.server';
import { type LoaderArgs } from '@remix-run/node';

export async function loader({ request }: LoaderArgs) {
  return serverServices.authService.isAuthenticated(request, {
    successRedirect: './trigger',
    failureRedirect: '/login',
  });
}
