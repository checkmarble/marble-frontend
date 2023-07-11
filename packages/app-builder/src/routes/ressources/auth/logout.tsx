import { authenticator } from '@app-builder/services/auth/auth.server';
import { type ActionArgs, type LoaderArgs } from '@remix-run/node';

export async function loader({ request }: LoaderArgs) {
  await authenticator.logout(request, { redirectTo: '/login' });
}

export async function action({ request }: ActionArgs) {
  await authenticator.logout(request, { redirectTo: '/login' });
}
