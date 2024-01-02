import { serverServices } from '@app-builder/services/init.server';
import { type LoaderFunctionArgs } from '@remix-run/node';

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  return authService.isAuthenticated(request, {
    successRedirect: './trigger',
    failureRedirect: '/login',
  });
}
