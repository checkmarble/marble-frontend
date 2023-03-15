import { authenticator } from '@marble-front/builder/services/auth/auth.server';
import { type ActionArgs, redirect } from '@remix-run/node';

export async function loader() {
  return redirect('/login');
}

export async function action({ request, params }: ActionArgs) {
  const { provider } = params;
  if (!provider) {
    return redirect('/login');
  }

  return authenticator.authenticate(provider, request);
}
