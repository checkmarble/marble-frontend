import { authenticator } from '@marble-front/builder/services/auth/auth.server';
import {
  commitSession,
  getSession,
} from '@marble-front/builder/services/auth/session.server';
import { type LoaderArgs, redirect } from '@remix-run/node';

export async function loader({ request, params }: LoaderArgs) {
  const { provider } = params;
  if (!provider) {
    return redirect('/login');
  }

  const user = await authenticator.authenticate(provider, request, {
    failureRedirect: '/login',
  });

  const session = await getSession(request.headers.get('cookie'));
  session.set(authenticator.sessionKey, user);

  //TODO(user): retrieve the logged in user locale
  // const { preferredLanguage } = await usersApi.getUsersByUserEmail({
  //   userEmail: user.email,
  // });
  // if (preferredLanguage) setLanguage(session, preferredLanguage);

  return redirect('/home', {
    headers: { 'Set-Cookie': await commitSession(session) },
  });
}
