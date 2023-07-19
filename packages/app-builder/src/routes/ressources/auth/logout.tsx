import { serverServices } from '@app-builder/services/init.server';
import { type ActionArgs, type LoaderArgs } from '@remix-run/node';

export async function loader({ request }: LoaderArgs) {
  await serverServices.authService.logout(request, { redirectTo: '/login' });
}

export async function action({ request }: ActionArgs) {
  await serverServices.authService.logout(request, { redirectTo: '/login' });
}
