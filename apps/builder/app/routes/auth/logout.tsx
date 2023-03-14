import { redirect, type ActionArgs } from '@remix-run/node';
import { authenticator } from '@marble-front/builder/services/auth/auth.server';

export async function loader() {
  return redirect('/login');
}

export async function action({ request }: ActionArgs) {
  await authenticator.logout(request, { redirectTo: '/login' });
}
