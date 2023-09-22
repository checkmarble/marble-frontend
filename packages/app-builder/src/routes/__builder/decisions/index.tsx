import { serverServices } from '@app-builder/services/init.server';
import { type LoaderArgs } from '@remix-run/node';

export async function loader({ request }: LoaderArgs) {
  const { authService } = serverServices;
  return authService.isAuthenticated(request, {
    successRedirect: '/decisions/last-decisions',
    failureRedirect: '/login',
  });
}
